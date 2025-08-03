import React from 'react';
import { fetchEvents, Event } from '../redux/slices/eventSlice';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../api/axios';
import EventCard from '../components/EventCard'; // <-- Import your EventCard

const TabButton = ({
  icon,
  text,
  countLabel,
  count,
  onPress,
  style,
  iconColor,
  countColor,
  textColor,
  countLabelColor,
  disabled,
}: {
  icon: string;
  text: string;
  countLabel?: string;
  count?: number | string;
  onPress?: () => void;
  style?: any;
  iconColor?: string;
  countColor?: string;
  textColor?: string;
  countLabelColor?: string;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    style={[
      styles.tabButton,
      style,
      disabled && { opacity: 0.55 },
    ]}
    onPress={onPress}
    activeOpacity={disabled ? 1 : 0.8}
    disabled={disabled}
  >
    <Ionicons
      name={icon}
      size={32}
      color={iconColor || '#00a2ff'}
      style={{ marginBottom: 10 }}
    />
    <Text
      style={[
        styles.tabButtonText,
        { color: textColor || '#222' },
      ]}
    >
      {text}
    </Text>
    {!!count && (
      <View style={[styles.countBubble, { backgroundColor: countColor || '#e6f6ff' }]}>
        <Text
          style={[
            styles.countText,
            { color: countLabelColor || '#00a2ff' },
            countLabel && { fontWeight: '400', fontSize: 13 },
          ]}
        >
          {count}
        </Text>
        {!!countLabel && (
          <Text style={[styles.countLabel, { color: countLabelColor || '#00a2ff' }]}>
            {' '}
            {countLabel}
          </Text>
        )}
      </View>
    )}
  </TouchableOpacity>
);

const ManageEventScreen = () => {
  const navigation = require('@react-navigation/native').useNavigation();
  const route = require('@react-navigation/native').useRoute();
  const { event } = route.params || {};
  const token = require('react-redux').useSelector((state: any) => state.auth.token);

  // joinedMembers is a property of event
  const members = event && event.joinedMembers ? event.joinedMembers : [];
  const paymentMembers = event && event.payments ? event.payments : [];

  // Pending counts for tab notification
  const membersCount = members.filter((m: any) => m.status === 'member').length;
  const approvalPendingCount = members.filter((m: any) => m.status === 'approval_pending').length;
  const paymentVerificationCount = paymentMembers.filter(
    (p: any) => p.paymentStatus === 'pending' || p.paymentStatus === 'payment_verification_pending'
  ).length;

  const [modalVisible, setModalVisible] = React.useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = React.useState(false);
  const [pendingMembers, setPendingMembers] = React.useState([]);
  const [paymentModalVisible, setPaymentModalVisible] = React.useState(false);
  const [paymentPendingMembers, setPaymentPendingMembers] = React.useState([]);
  const [rejectReason, setRejectReason] = React.useState('');
const [selectedPayment, setSelectedPayment] = React.useState<any>(null);
// Or, if you have a type for payment/member:
// const [selectedPayment, setSelectedPayment] = React.useState<MemberType | null>(null);

  // New states for loading indicators
  const [paymentActionLoading, setPaymentActionLoading] = React.useState(false);
  const [approvalActionLoading, setApprovalActionLoading] = React.useState(false);
  const [selectedMemberId, setSelectedMemberId] = React.useState(null);

  // Add the following counts for chart
  const confirmedCount = members.filter((m: any) => m.status === 'member').length;
  const declinedCount = paymentMembers.filter((p: any) => p.paymentStatus === 'rejected').length;
  const pendingCount =
    members.filter((m: any) => m.status === 'approval_pending' || m.status === 'payment_verification_pending').length;
  const totalCount = members.length;

  // Calculate percentages (avoid division by zero)
  const confirmedPercent = totalCount ? Math.round((confirmedCount / totalCount) * 100) : 0;
  const declinedPercent = totalCount ? Math.round((declinedCount / totalCount) * 100) : 0;
  const pendingPercent = totalCount ? 100 - confirmedPercent - declinedPercent : 0;

  // PieChart data
  const attendeeChartData = [
    {
      value: confirmedCount,
      color: '#00a2ff',
      label: 'Confirmed',
      text: `${confirmedPercent}%`,
    },
    {
      value: declinedCount,
      color: '#888',
      label: 'Declined',
      text: `${declinedPercent}%`,
    },
    {
      value: pendingCount,
      color: '#5cec1eff',
      label: 'Pending',
      text: `${pendingPercent}%`,
    },
  ];

  const handlePaymentVerificationPending = () => {
    const pendingPayments = paymentMembers.filter(
      (p: any) => p.paymentStatus === 'pending' || p.paymentStatus === 'payment_verification_pending'
    );
    if (!pendingPayments || pendingPayments.length === 0) {
      Alert.alert('No Pending Payments', 'No members are pending payment verification.');
      return;
    }
    setPaymentPendingMembers(pendingPayments);
    setPaymentModalVisible(true);
  };

  // Approve payment
  const handleApprovePayment = async (member: any) => {
    setPaymentActionLoading(true);
    setSelectedPayment(member); // For loading indicator
    try {
      // 1. Update payment status
      await api.put(
        '/payments',
        {
          eventId: Number(event.eventId),
          userId: member.userId,
          paymentStatus: 'completed',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // 2. Update event member status
      await api.put(
        '/event_members',
        {
          eventId: Number(event.eventId),
          userId: member.userId,
          status: 'member',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert(
        'Success',
        `${member.name || 'Member'} payment marked as completed and status set to member.`
      );
      setPaymentPendingMembers((prev: any) => prev.filter((m: any) => m.userId !== member.userId));
    } catch (err) {
      Alert.alert('Error', 'Failed to approve payment.');
    }
    setSelectedPayment(null);
    setPaymentActionLoading(false);
  };

  // Reject payment (with reason)
  const handleRejectPayment = async (member: any, reason: string) => {
    setPaymentActionLoading(true);
    setSelectedPayment(member); // For loading indicator
    try {
      await api.put(
        '/payments',
        {
          eventId: Number(event.eventId),
          userId: member.userId,
          paymentStatus: 'rejected',
          rejectionReason: reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('Rejected', `${member.name || 'Member'} payment rejected.`);
      setPaymentPendingMembers((prev: any) => prev.filter((m: any) => m.userId !== member.userId));
      setRejectReason('');
      setSelectedPayment(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to reject payment.');
      setSelectedPayment(null);
    }
    setPaymentActionLoading(false);
  };

  const handleCancelEvent = () => {
    if (!event?.eventId) return Alert.alert('Error', 'No eventId found');
    Alert.alert('Cancel Event', 'Are you sure you want to cancel this event? This action cannot be undone.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete('/events', {
              headers: { Authorization: `Bearer ${token}` },
              data: { eventId: Number(event.eventId) },
            });
            Alert.alert('Success', 'Event deleted successfully');
            navigation.goBack();
          } catch (err) {
            const errorAny = err as any;
            const errorMsg =
              errorAny && errorAny.response && errorAny.response.data && errorAny.response.data.message
                ? errorAny.response.data.message
                : 'Failed to delete event';
            Alert.alert('Error', errorMsg);
          }
        },
      },
    ]);
  };

  const handleMemberList = () => {
    if (!members || members.length === 0) {
      Alert.alert('No Members', 'No members have joined this event yet.');
      return;
    }
    setModalVisible(true);
  };

  // Approval Pending logic
  const handleApprovalPending = () => {
    const pending = members.filter((m: any) => m.status === 'approval_pending');
    if (!pending || pending.length === 0) {
      Alert.alert('No Pending Approvals', 'No members are pending approval.');
      return;
    }
    setPendingMembers(pending);
    setApprovalModalVisible(true);
  };

  const handleApproveMember = async (member: any) => {
    setApprovalActionLoading(true);
    setSelectedMemberId(member.userId);
    try {
      let newStatus = 'member';
      if (event.totalAmount !== 0) {
        newStatus = 'payment_pending';
      }
      await api.put(
        '/event_members',
        {
          eventId: Number(event.eventId),
          userId: member.userId,
          status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('Success', `${member.name || 'Member'} status set to ${newStatus}.`);
      setPendingMembers((prev: any) => prev.filter((m: any) => m.userId !== member.userId));
    } catch (err) {
      Alert.alert('Error', 'Failed to approve member.');
    }
    setSelectedMemberId(null);
    setApprovalActionLoading(false);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        {/* <View style={styles.eventCardWrapper}>
          <EventCard event={event} />
        </View> */}

        <Text style={styles.sectionTitle}>Event Management Actions</Text>

        {/* New Tab Button Grid */}
        <View style={styles.tabGrid}>
          <TabButton
            icon="create-outline"
            text="Edit Event"
            onPress={() => navigation.navigate('EditEventScreen', { event })}
            style={{}}
            iconColor="#00a2ff"
          />

          <TabButton
            icon="people-outline"
            text="Member List"
            count={membersCount}
            countColor="#e6f6ff"
            countLabelColor="#00a2ff"
            onPress={handleMemberList}
            style={{}}
          />

          <TabButton
            icon="card-outline"
            text="Payment Verification"
            count={paymentVerificationCount > 0 ? `${paymentVerificationCount} Pending` : undefined}
            countColor="#e6f6ff"
            countLabelColor="#00a2ff"
            onPress={handlePaymentVerificationPending}
            style={{}}
          />

          <TabButton
            icon="shield-checkmark-outline"
            text="Approval Pending"
            count={approvalPendingCount > 0 ? `${approvalPendingCount} Requests` : undefined}
            countColor="#e6f6ff"
            countLabelColor="#00a2ff"
            onPress={handleApprovalPending}
            style={{}}
          />

          {/* Cancel Event (unique style for red & one column) */}
          <TabButton
            icon="close-circle-outline"
            text="Cancel Event"
            onPress={handleCancelEvent}
            style={styles.cancelTab}
            iconColor="#ed6462"
            textColor="#ed6462"
            countColor="#fbeaea"
            disabled={false}
          />
        </View>
        <Text style={styles.sectionTitleAttendees}>Attendee Status</Text>

         {/* --- ADD THIS BLOCK: Attendee Status Chart --- */}
        <View style={styles.attendeeStatusCard}>
          {/* <Text style={styles.attendeeStatusTitle}>Attendee Status</Text> */}
          <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <PieChart
              data={attendeeChartData}
              donut
              radius={55}
              innerRadius={38}
              focusOnPress={false}
              showText={false}
              strokeColor="#fff"
              strokeWidth={4}
            />
            {/* Legend/labels */}
            <View style={styles.chartLabelsRow}>
              <Text style={[styles.chartLegend, { color: '#00a2ff' }]}>
                Confirmed ({confirmedPercent}%)
              </Text>
              <Text style={[styles.chartLegend, { color: '#888' }]}>
                Declined ({declinedPercent}%)
              </Text>
              <Text style={[styles.chartLegend, { color: '#bbb', opacity: 0.5 }]}>
                Pending ({pendingPercent}%)
              </Text>
            </View>
          </View>
          {/* Footer stats */}
          <View style={styles.statsRow}>
            <View style={styles.statsCol}>
              <Text style={styles.statsNumber}>{totalCount}</Text>
              <Text style={styles.statsLabel}>Total</Text>
            </View>
            <View style={styles.statsCol}>
              <Text style={[styles.statsNumber, { color: '#00a2ff' }]}>{confirmedCount}</Text>
              <Text style={styles.statsLabel}>Confirmed</Text>
            </View>
            <View style={styles.statsCol}>
              <Text style={[styles.statsNumber, { color: '#bbb' }]}>{pendingCount}</Text>
              <Text style={styles.statsLabel}>Pending</Text>
            </View>
          </View>
        </View>
        {/* --- END: Attendee Status Chart --- */}

        {/* Payment Verification Pending Modal */}
        <Modal
          visible={paymentModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setPaymentModalVisible(false);
            setRejectReason('');
            setSelectedPayment(null);
            setPaymentActionLoading(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Payment Verification Pending</Text>
              <View style={styles.memberList}>
                {paymentPendingMembers.map((member: any, idx: number) => (
                  <View key={member.id || idx} style={styles.memberRow}>
                    <Image
                      source={
                        member.profileImage
                          ? { uri: member.profileImage }
                          : require('../../assets/EventraLogo.png')
                      }
                      style={styles.profileImage}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{member.name || 'No Name'}</Text>
                      <Text style={{ fontSize: 12, color: '#444' }}>Amount: {member.amount}</Text>
                      <Text style={{ fontSize: 12, color: '#444' }}>Payment Method: {member.paymentMethod}</Text>
                    </View>
                    <View style={styles.iconGroup}>
                      {paymentActionLoading && selectedPayment?.userId === member.userId ? (
                        <ActivityIndicator size="small" color="#00a2ff" style={{ marginHorizontal: 10 }} />
                      ) : (
                        <>
                          <Pressable
                            style={styles.iconBtn}
                            onPress={() => handleApprovePayment(member)}
                            disabled={paymentActionLoading}
                          >
                            <Ionicons name="checkmark-circle-outline" size={26} color="#43a047" />
                          </Pressable>
                          <Pressable
                            style={styles.iconBtn}
                            onPress={() => setSelectedPayment(member)}
                            disabled={paymentActionLoading}
                          >
                            <Ionicons name="close-circle-outline" size={26} color="#ed6462" />
                          </Pressable>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => {
                  setPaymentModalVisible(false);
                  setRejectReason('');
                  setSelectedPayment(null);
                  setPaymentActionLoading(false);
                }}
              >
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Rejection Reason Modal */}
        <Modal
          visible={!!selectedPayment && !paymentActionLoading}
          animationType="fade"
          transparent={true}
          onRequestClose={() => {
            setSelectedPayment(null);
            setRejectReason('');
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reject Payment</Text>
              <Text style={{ marginBottom: 10 }}>Please enter a reason for rejection:</Text>
              <View style={{ width: '100%', marginBottom: 16 }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    padding: 8,
                    minHeight: 40,
                  }}
                  placeholder="Enter reason..."
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <TouchableOpacity
                  style={[styles.closeModalBtn, { backgroundColor: '#ed6462', flex: 1, marginRight: 8 }]}
                  onPress={() => {
                    if (!rejectReason.trim()) {
                      Alert.alert('Error', 'Please enter a reason for rejection.');
                      return;
                    }
                    handleRejectPayment(selectedPayment, rejectReason);
                    setRejectReason('');
                    // setSelectedPayment(null); // handled in API
                  }}
                  disabled={paymentActionLoading}
                >
                  {paymentActionLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.closeModalText}>Reject</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.closeModalBtn, { backgroundColor: '#ccc', flex: 1, marginLeft: 8 }]}
                  onPress={() => {
                    setSelectedPayment(null);
                    setRejectReason('');
                  }}
                  disabled={paymentActionLoading}
                >
                  <Text style={[styles.closeModalText, { color: '#333' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Approval Pending Modal */}
        <Modal
          visible={approvalModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setApprovalModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Approval Pending Members</Text>
              <View style={styles.memberList}>
                {pendingMembers.map((member: any, idx: number) => (
                  <View key={member.id || idx} style={styles.memberRow}>
                    <Image
                      source={
                        member.profileImage
                          ? { uri: member.profileImage }
                          : require('../../assets/EventraLogo.png')
                      }
                      style={styles.profileImage}
                    />
                    <Text style={styles.memberName}>{member.name || 'No Name'}</Text>
                    <View style={styles.iconGroup}>
                      {approvalActionLoading && selectedMemberId === member.userId ? (
                        <ActivityIndicator size="small" color="#00a2ff" style={{ marginHorizontal: 10 }} />
                      ) : (
                        <>
                          <Pressable
                            style={styles.iconBtn}
                            onPress={() => handleApproveMember(member)}
                            disabled={approvalActionLoading}
                          >
                            <Ionicons name="checkmark-circle-outline" size={26} color="#43a047" />
                          </Pressable>
                          <Pressable style={styles.iconBtn} disabled={approvalActionLoading}>
                            <Ionicons name="close-circle-outline" size={26} color="#ed6462" />
                          </Pressable>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setApprovalModalVisible(false)}>
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Member List Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Event Members</Text>
              <View style={styles.memberList}>
                {members
                  .filter((member: any) => member.status === 'member')
                  .map((member: any, idx: number) => (
                    <View key={member.id || idx} style={styles.memberRow}>
                      <Image
                        source={
                          member.profileImage
                            ? { uri: member.profileImage }
                            : require('../../assets/EventraLogo.png')
                        }
                        style={styles.profileImage}
                      />
                      <Text style={styles.memberName}>{member.name || 'No Name'}</Text>
                      <View style={styles.iconGroup}>
                        <Pressable style={styles.iconBtn}>
                          <Ionicons name="checkmark-circle-outline" size={26} color="#43a047" />
                        </Pressable>
                        <Pressable style={styles.iconBtn}>
                          <Ionicons name="close-circle-outline" size={26} color="#ed6462" />
                        </Pressable>
                      </View>
                    </View>
                  ))}
              </View>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  eventCardWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f7faff',
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  tabGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 36,
    paddingTop: 8,
  },
  tabButton: {
    width: '47%',
    aspectRatio: 1.08,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E2C5C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.1,
    borderColor: 'rgba(0,162,255,0.05)',
    padding: 8,
  },
  cancelTab: {
    width: '100%',
    backgroundColor: '#fbeaea',
    borderColor: '#fbeaea',
    marginBottom: 0,
    marginTop: 0,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 4.5,
    shadowColor: '#ed6462',
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    width: '100%',
    marginBottom: 10,
    marginTop: 20,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
    letterSpacing: 0.1,
  },
  sectionTitleAttendees: {
    width: '100%',
    marginBottom: 10,
    marginTop: -50,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
    letterSpacing: 0.1,
  },
  countBubble: {
    marginTop: 2,
    alignSelf: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 22,
    minWidth: 36,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00a2ff',
  },
  countLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#00a2ff',
    marginLeft: 2,
  },


  attendeeStatusCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.1,
    borderColor: 'rgba(0,162,255,0.05)',
  },
  attendeeStatusTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  chartLabelsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  chartLegend: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f2',
    paddingTop: 11,
  },
  statsCol: {
    alignItems: 'center',
    flex: 1,
  },
  statsNumber: {
    fontSize: 19,
    fontWeight: '700',
    color: '#222',
  },
  statsLabel: {
    fontSize: 13,
    color: '#777',
    fontWeight: '500',
    marginTop: 1,
  },
  // ...rest of your styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#005eff',
    marginBottom: 18,
  },
  memberList: {
    width: '100%',
    marginBottom: 18,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: '#f7faff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    backgroundColor: '#e0e7ef',
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  iconBtn: {
    marginHorizontal: 2,
    padding: 2,
  },
  closeModalBtn: {
    marginTop: 8,
    backgroundColor: '#005eff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 22,
  },
  closeModalText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ManageEventScreen;