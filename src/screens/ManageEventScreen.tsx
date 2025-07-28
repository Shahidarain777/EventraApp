import React from 'react';
//import { fetchEvents, Event } from '../redux/slices/eventSlice';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Image, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../api/axios';

const ManageEventScreen = () => {
  const navigation = require('@react-navigation/native').useNavigation();
  const route = require('@react-navigation/native').useRoute();
  const { event } = route.params || {};
  const token = require('react-redux').useSelector((state: any) => state.auth.token);
  // joinedMembers is a property of event
  const members = event && event.joinedMembers ? event.joinedMembers : [];
  const [modalVisible, setModalVisible] = React.useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = React.useState(false);
  const [pendingMembers, setPendingMembers] = React.useState([]);

  const handleCancelEvent = () => {
    if (!event?.eventId) return Alert.alert('Error', 'No eventId found');
    Alert.alert(
      'Cancel Event',
      'Are you sure you want to cancel this event? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.delete('/events', {
                headers: { Authorization: `Bearer ${token}` },
                data: { eventId: Number(event.eventId) },
              });
              Alert.alert('Success', 'Event deleted successfully');
              navigation.goBack();
            } catch (err) {
              const errorAny = err as any;
              const errorMsg = errorAny && errorAny.response && errorAny.response.data && errorAny.response.data.message
                ? errorAny.response.data.message
                : 'Failed to delete event';
              Alert.alert('Error', errorMsg);
            }
          },
        },
      ]
    );
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
    // Alert.alert(members.length.toString(), `Total Members: ${members.length}`);
    if (!pending || pending.length === 0) {
      Alert.alert('No Pending Approvals', 'No members are pending approval.');
      return;
    }
    setPendingMembers(pending);
    setApprovalModalVisible(true);
  };

  const handleApproveMember = async (member: any) => {
    try {
      let newStatus = 'member';
      if (event.price && event.price > 0) {
        newStatus = 'payment_pending';
      }
      await api.put('/event_members', {
        eventId: Number(event.eventId),
        userId: member.userId,
        status: newStatus,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', `${member.name || 'Member'} status set to ${newStatus}.`);
      // Optionally update local state
      setPendingMembers((prev: any) => prev.filter((m: any) => m.userId !== member.userId));
    } catch (err) {
      Alert.alert('Error', 'Failed to approve member.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="settings-outline" size={28} color="#ffffffff" style={{ marginRight: 8, }} />
        <Text style={styles.headerText}>Manage Event</Text>
      </View>
      {/* <Text style={styles.title}>Manage Event</Text> */}

      <View style={styles.buttonGroup}>
        <View style={styles.row}>
          <Button
            style={styles.editButton}
            text="Edit Event"
            icon="create-outline"
            onPress={() => navigation.navigate('EditEventScreen', { event })}
          />
        </View>
        <View style={styles.row}>
          <Button style={styles.memberButton} text="Member List" icon="people-outline" onPress={handleMemberList} />
        </View>
        <View style={styles.row}>
          <Button style={styles.paymentButton} text="Payment Verification Pending" icon="card-outline" />
        </View>
        <View style={styles.row}>
          <Button style={styles.approvalButton} text="Approval Pending" icon="time-outline" onPress={handleApprovalPending} />
        </View>
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
                    source={member.profileImage ? { uri: member.profileImage } : require('../../assets/EventraLogo.png')}
                    style={styles.profileImage}
                  />
                  <Text style={styles.memberName}>{member.name || 'No Name'}</Text>
                  <View style={styles.iconGroup}>
                    <Pressable style={styles.iconBtn} onPress={() => handleApproveMember(member)}>
                      <Ionicons name="checkmark-circle-outline" size={26} color="#43a047" />
                    </Pressable>
                    <Pressable style={styles.iconBtn}>
                      <Ionicons name="close-circle-outline" size={26} color="#ed6462" />
                    </Pressable>
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
        <View style={styles.row}>
          <Button style={styles.cancelButton} text="Cancel Event" icon="trash-outline" onPress={handleCancelEvent} />
        </View>
      </View>

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
              {members.filter((member: any) => member.status === 'member').map((member: any, idx: number) => (
                <View key={member.id || idx} style={styles.memberRow}>
                  <Image
                    source={member.profileImage ? { uri: member.profileImage } : require('../../assets/EventraLogo.png')}
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
  );
};

const Button = ({ style, text, icon, onPress }: { style: any; text: string; icon: string; onPress?: () => void }) => (
  <TouchableOpacity style={[styles.button, style]} activeOpacity={0.85} onPress={onPress}>
    <Ionicons name={icon} size={22} color={style.color || '#fff'} style={{ marginRight: 10 }} />
    <Text style={[styles.buttonText, { color: style.color || '#fff' }]}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#005effff',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 240,
    backgroundColor: 'transparent',
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffffff',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 32,
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 132,
  },
  row: {
    width: '100%',
    marginBottom: 18,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  editButton: {
    backgroundColor: '#df6be3ff',
    color: '#fff',
  },
  memberButton: {
    backgroundColor: '#43a047',
    color: '#fff',
  },
  paymentButton: {
    backgroundColor: '#ffb300',
    color: '#fff',
  },
  approvalButton: {
    backgroundColor: '#5ad8ebff',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#ed6462ff',
    color: '#fff',
  },
});

export default ManageEventScreen;
