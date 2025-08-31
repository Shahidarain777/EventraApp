import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import EventCard from '../components/EventCard';
import { useNavigation } from '@react-navigation/native';
import { Event } from '../redux/slices/eventSlice';
import DueDate from '../components/DueDate';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type EventDetailScreenProps = {
  route: { params: { event: Event } };
};

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ route }) => {
  const { event } = route.params;
  const navigation = useNavigation();
  
  const [userStatus, setUserStatus] = useState<string>('not_joined');
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedSubEvents, setSelectedSubEvents] = useState<Set<string>>(new Set());
  const [totalFee, setTotalFee] = useState<number>(0);
  const [mainEventTickets, setMainEventTickets] = useState<number>(1);
  const [subEventTickets, setSubEventTickets] = useState<{ [key: string]: number }>({});
  const restrictedStatuses = ['member', 'approval_pending', 'payment_pending', 'payment_verification_pending'];

  const getCurrentUserId = async () => {
    try {
      const userStr = await AsyncStorage.getItem('userData');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userIdRaw = user._id || user.id || user.userId || user.userid || user.ID;
        return userIdRaw ? userIdRaw.toString() : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const initializeUserId = async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
    };
    initializeUserId();
  }, []);

  useEffect(() => {
    const mainEventFee = event.price && event.price !== 'Free' ? Number(event.price) : 0;
    let subEventsFee = 0;
    const isRestricted = restrictedStatuses.includes(userStatus);

    if (isRestricted && event.joinedMembers && currentUserId) {
      const currentUserMember = event.joinedMembers.find(
        (member: any) => member.userId?.toString() === currentUserId?.toString()
      );
      if (currentUserMember && (currentUserMember as any).totalAmount !== undefined) {
        const committedTotal = Number((currentUserMember as any).totalAmount);
        if (!isNaN(committedTotal)) {
          setTotalFee(committedTotal);
          return;
        }
      }
    }
    if (event.subEvents) {
      if (isRestricted) {
        if ((event as any).userSelectedSubEvents) {
          (event as any).userSelectedSubEvents.forEach((userSubEvent: any) => {
            const matchingSubEvent = event.subEvents?.find((subEvent) => {
              const subEventId = String(subEvent.subEventId || subEvent._id || subEvent.itemName);
              const userSubEventId = String(userSubEvent.subEventId || userSubEvent._id || userSubEvent.itemName);
              return subEventId === userSubEventId;
            });
            if (matchingSubEvent && matchingSubEvent.isPaid) {
              const ticketQuantity = (userSubEvent as any).ticketQuantity || 1;
              subEventsFee += (Number(matchingSubEvent.fee) || 0) * ticketQuantity;
            }
          });
        } else {
          event.subEvents.forEach((subEvent) => {
            const subEventId = String(subEvent.subEventId);
            if (selectedSubEvents.has(subEventId) && subEvent.isPaid) {
              const ticketQuantity = subEventTickets[subEventId] || 1;
              subEventsFee += (Number(subEvent.fee) || 0) * ticketQuantity;
            }
          });
        }
      } else {
        event.subEvents.forEach((subEvent) => {
          const subEventId = String(subEvent.subEventId);
          if (selectedSubEvents.has(subEventId) && subEvent.isPaid) {
            const ticketQuantity = subEventTickets[subEventId] || 1;
            subEventsFee += (Number(subEvent.fee) || 0) * ticketQuantity;
          }
        });
      }
    }
    const mainEventTotalFee = mainEventFee * mainEventTickets;
    setTotalFee(mainEventTotalFee + subEventsFee);
  }, [selectedSubEvents, event.price, event.subEvents, userStatus, restrictedStatuses, event.joinedMembers, currentUserId, mainEventTickets, subEventTickets]);

  const toggleSubEventSelection = (subEventId: string) => {
    if (restrictedStatuses.includes(userStatus)) return;
    setSelectedSubEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subEventId)) {
        newSet.delete(subEventId);
        setSubEventTickets(prev => {
          const newTickets = { ...prev };
          delete newTickets[subEventId];
          return newTickets;
        });
      } else {
        newSet.add(subEventId);
        setSubEventTickets(prev => ({
          ...prev,
          [subEventId]: 1
        }));
      }
      return newSet;
    });
  };

  // const handleMainEventTicketChange = (value: string) => {
  //   const numValue = parseInt(value) || 0;
  //   if (numValue < 1) {
  //     setMainEventTickets(1);
  //   } else {
  //     setMainEventTickets(numValue);
  //   }
  // };

  const handleSubEventTicketChange = (subEventId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const subEvent = event.subEvents?.find(se => String(se.subEventId) === subEventId);
    const maxCapacity = subEvent?.maxAttendees || Infinity;
    if (numValue < 0) {
      setSubEventTickets(prev => ({ ...prev, [subEventId]: 0 }));
    } else if (numValue > maxCapacity) {
      setSubEventTickets(prev => ({ ...prev, [subEventId]: maxCapacity }));
      Alert.alert('Capacity Limit', `Maximum ${maxCapacity} tickets allowed for this sub-event.`);
    } else {
      setSubEventTickets(prev => ({ ...prev, [subEventId]: numValue }));
    }
  };

  const validateTicketQuantities = (): boolean => {
    for (const [subEventId, quantity] of Object.entries(subEventTickets)) {
      const subEvent = event.subEvents?.find(se => String(se.subEventId) === subEventId);
      if (subEvent && quantity > (subEvent.maxAttendees || Infinity)) {
        Alert.alert('Invalid Quantity', `Maximum ${subEvent.maxAttendees} tickets allowed for "${subEvent.itemName}".`);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (restrictedStatuses.includes(userStatus) && event.subEvents) {
      let mainEventQty = 1;
      let subEventQtyObj: { [key: string]: number } = {};
      let selectedSubEventIds: string[] = [];
      if ((event as any).ticketQuantities) {
        mainEventQty = (event as any).ticketQuantities.mainEvent || 1;
        subEventQtyObj = (event as any).ticketQuantities.subEvents || {};
        selectedSubEventIds = Object.keys(subEventQtyObj);
      } else if (Array.isArray(event.joinedMembers) && currentUserId) {
        const currentUserMember = event.joinedMembers.find(
          (member: any) => member.userId?.toString() === currentUserId?.toString()
        );
        if (currentUserMember && currentUserMember.ticketQuantities) {
          subEventQtyObj = currentUserMember.ticketQuantities.subEvents || {};
          selectedSubEventIds = Object.keys(subEventQtyObj);
        }
      }
      setMainEventTickets(mainEventQty);
      setSubEventTickets(subEventQtyObj);
      setSelectedSubEvents(new Set(selectedSubEventIds));
    } else if (userStatus === 'not_joined') {
      setSelectedSubEvents(new Set());
      setSubEventTickets({});
      setMainEventTickets(1);
    }
  }, [userStatus, event.subEvents, event.joinedMembers, currentUserId]);
 
  useEffect(() => {
    if (!currentUserId) return;
    setIsLoading(true);
    const currentUserMember = event.joinedMembers?.find(
      (member: any) => member.userId?.toString() === currentUserId?.toString()
    );
    setUserStatus(currentUserMember ? currentUserMember.status : 'not_joined');
    setIsLoading(false);
  }, [event.eventId, event.joinedMembers, currentUserId]);
  
  const handleJoinEvent = async () => {
    if (isJoining) return;
    if (userStatus !== 'not_joined') return;
    if (!validateTicketQuantities()) {
      return;
    }
    setIsJoining(true);
    try {
      let status = 'member';
      if (getApprovalRequired()) {
        status = 'approval_pending';
      } else if (totalFee > 0) {
        status = 'payment_pending';
      }
      const selectedSubEventIds = Array.from(selectedSubEvents).map(id => {
        const numericId = parseInt(id, 10);
        return isNaN(numericId) ? id : numericId;
      });
      const ticketQuantities = {
        mainEvent: mainEventTickets,
        subEvents: subEventTickets
      };
      // Only send payment/account info if joining paid sub-events
      const paidSubEventIds = event.subEvents?.filter(se => se.isPaid).map(se => String(se.subEventId));
      const isJoiningPaidSubEvent = selectedSubEventIds.some(id => paidSubEventIds?.includes(String(id)));
      const payload: any = {
        eventId: event.eventId,
        status: status,
        selectedSubEvents: selectedSubEventIds,
        totalAmount: totalFee,
        ticketQuantities: ticketQuantities
      };
      if (isJoiningPaidSubEvent) {
        payload.accountHolderName = event.accountHolderName || '';
        payload.accountNumber = event.accountNumber || '';
        payload.bankName = event.bankName || '';
        payload.currency = event.currency || 'PKR';
      }
      await api.post('/event_members', payload);
      setUserStatus(status);
      let message = '';
      switch (status) {
        case 'member':
          message = 'Successfully joined the event!';
          Alert.alert('Success', message);
          break;
        case 'approval_pending':
          message = 'Your join request has been submitted and is awaiting approval.';
          Alert.alert('Success', message);
          break;
        case 'payment_pending':
          message = `Join request submitted! Please complete payment of $${totalFee.toFixed(2)} to confirm your membership.`;
          Alert.alert('Success', message, [
            {
              text: 'OK',
              onPress: () => (navigation as any).navigate('InvoiceScreen'),
            },
          ]);
          break;
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to join event. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };
  
  const getApprovalRequired = () => {
    if (typeof event.approvalRequired === 'boolean') {
      return event.approvalRequired;
    }
    return event.approvalRequired === 'yes';
  };
  
  const getVisibilityText = () => {
    switch (event.visibility) {
      case 'private':
        return 'Private';
      case 'public':
        return 'Public';
      case 'host_only':
        return 'Host Only (pending approval)';
      default:
        return 'Public';
    }
  };
  
  const getJoinedCount = () => {
    const count = Number(event.joinedCount);
    return !isNaN(count) ? count : 0;
  };
  
  const getCapacity = () => {
    const capacity = Number(event.maxAttendees);
    return !isNaN(capacity) ? capacity : 'Unlimited';
  };
  
  const getButtonText = () => {
    switch (userStatus) {
      case 'member':
        return 'Generate Ticket';
      case 'approval_pending':
        return 'Awaiting Approval';
      case 'payment_pending':
        return 'Payment Required';
      case 'payment_verification_pending':
        return 'Payment Verification Pending';
      case 'canceled':
        return 'Join Event';
      default:
        return 'Join Event';
    }
  };
  
  const isButtonDisabled = () => {
    return userStatus === 'member' || 
           userStatus === 'approval_pending' || 
           userStatus === 'payment_verification_pending' ||
           isJoining;
  };
  
  const getButtonStyle = () => {
    if (userStatus === 'member') {
      return [styles.joinButton, { backgroundColor: '#28a745' }]; // Green for Generate Ticket
    }
    if (isButtonDisabled()) {
      return [styles.joinButton, styles.joinButtonDisabled];
    }
    return styles.joinButton;
  };

  const formatCurrency = (amount: number) => {
    if (event.currency && event.currency.toLowerCase() === 'pkr') {
      return `PKR ${amount.toFixed(2)}`;
    } else if (event.currency && event.currency.toLowerCase() === 'usd') {
      return `$${amount.toFixed(2)}`;
    } else {
      return `${amount.toFixed(2)}`;
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView 
        contentContainerStyle={styles.container}
        style={styles.scrollView}
      >
        <EventCard event={event} showJoin={false} />
        <View style={styles.locationCard}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="location-outline" size={18} color="#2788ff" /> Location
          </Text>
          {event.location?.type === 'online' ? (
            <Text style={styles.detailText}>
              Online{event.location?.platform ? ` on ${event.location.platform}` : ''}
            </Text>
          ) : (
            <Text style={styles.detailText}>
              {event.location && (event.location.city || event.location.state || event.location.country || event.location.address || event.location.venueName) ?
                [event.location.city, event.location.state, event.location.country, event.location.address]
                  .filter(Boolean)
                  .join(', ')
                : 'N/A'}
            </Text>
          )}
        </View>
        <View style={styles.mainDetailsRow}>
          <View style={styles.detailCard}>
            <Ionicons name="pricetag-outline" size={20} color="#2788ff" />
            <Text style={styles.detailCardTitle}>Fee</Text>
            <Text style={styles.detailCardValue}>
              {event.price && event.price !== 'Free'
                ? formatCurrency(Number(event.price))
                : 'Free'}
            </Text>
          </View>
          <View style={styles.detailCard}>
            <Ionicons name="person-outline" size={20} color="#2788ff" />
            <Text style={styles.detailCardTitle}>Host</Text>
            <Text style={styles.detailCardValue}>{event.hostName || 'N/A'}</Text>
          </View>
          <View style={styles.detailCard}>
            <Ionicons name="bookmark-outline" size={20} color="#2788ff" />
            <Text style={styles.detailCardTitle}>Type</Text>
            <Text style={styles.detailCardValue}>
              {event.categoryInfo && event.categoryInfo.name ? String(event.categoryInfo.name) : 'N/A'}
            </Text>
          </View>
        </View>
        <View style={styles.additionalDetailsContainer}>
          <View style={styles.additionalDetailsRow}>
            <View style={styles.additionalDetailCard}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#2788ff" />
              <Text style={styles.additionalDetailTitle}>Approval Required</Text>
              <Text style={styles.additionalDetailValue}>
                {getApprovalRequired() ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.additionalDetailCard}>
              <Ionicons name="eye-outline" size={18} color="#2788ff" />
              <Text style={styles.additionalDetailTitle}>Visibility</Text>
              <Text style={styles.additionalDetailValue}>{getVisibilityText()}</Text>
            </View>
          </View>
          {/* <View style={styles.additionalDetailsRow}>
            <View style={styles.additionalDetailCard}>
              <Ionicons name="people-outline" size={18} color="#2788ff" />
              <Text style={styles.additionalDetailTitle}>Capacity</Text>
              <Text style={styles.additionalDetailValue}>{String(getCapacity())}</Text>
            </View>
            <View style={styles.additionalDetailCard}>
              <Ionicons name="person-add-outline" size={18} color="#2788ff" />
              <Text style={styles.additionalDetailTitle}>Joined</Text>
              <Text style={styles.additionalDetailValue}>{String(getJoinedCount())}</Text>
            </View>
          </View> */}

        </View>
        <View style={styles.dueDateCard}>
          <DueDate event={event} styles={styles} />
        </View>
        {event.subEvents && event.subEvents.length > 0 && (
          <View style={styles.subEventsContainer}>
            <Text style={styles.subEventsTitle}>
              <Ionicons name="list-outline" size={20} color="#2788ff" /> Sub Events
              {restrictedStatuses.includes(userStatus) && (
                <Text style={styles.lockedIndicator}> 🔒 (Your Selections)</Text>
              )}
            </Text>
            {event.subEvents.map((subEvent, index) => {
              const subEventId = String(subEvent.subEventId);
              const isSelected = selectedSubEvents.has(subEventId);
              const ticketQuantity = subEventTickets[subEventId] || 0;
              const isRestricted = restrictedStatuses.includes(userStatus);
              return (
                <View key={subEventId} style={styles.subEventCardContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.subEventCard, 
                      isSelected && styles.subEventCardSelected,
                      isRestricted && styles.disabledSubEventCard
                    ]}
                    onPress={() => toggleSubEventSelection(subEventId)}
                    activeOpacity={0.7}
                    disabled={isRestricted}
                  >
                    <View style={styles.subEventHeader}>
                      <View style={styles.subEventTitleRow}>
                        <View style={styles.subEventCheckbox}>
                          <Ionicons 
                            name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                            size={20} 
                            color={isSelected ? "#2788ff" : "#ccc"} 
                          />
                        </View>
                        <Text style={[
                          styles.subEventName, 
                          isSelected && styles.subEventNameSelected,
                          isRestricted && styles.disabledSubEventName
                        ]}>
                          {subEvent.itemName || `Sub Event ${index + 1}`}
                        </Text>
                      </View>
                      <View style={[styles.subEventBadge, subEvent.isPaid ? styles.paidBadge : styles.freeBadge]}>
                        <Text style={styles.subEventBadgeText}>
                          {subEvent.isPaid
                            ? formatCurrency(Number(subEvent.fee || 0))
                            : 'Free'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.subEventDetails}>
                      <View style={styles.subEventDetailItem}>
                        <Ionicons name="people" size={16} color="#666" />
                        <Text style={styles.subEventDetailText}>
                          Capacity: {String(subEvent.maxAttendees || 'Unlimited')}
                        </Text>
                      </View>
                      {subEvent.joinedCount !== undefined && (
                        <View style={styles.subEventDetailItem}>
                          <Ionicons name="person-add" size={16} color="#666" />
                          <Text style={styles.subEventDetailText}>
                            Joined: {String(subEvent.joinedCount || 0)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                  {isSelected && userStatus === 'not_joined' && (
                    <View style={styles.modernSubEventTicketContainer}>
                      <View style={styles.modernTicketHeader}>
                        <Ionicons name="person-outline" size={16} color="#666" />
                        <Text style={styles.modernTicketLabel}>Tickets</Text>
                      </View>
                      <View style={styles.modernTicketStepper}>
                        <TouchableOpacity
                          style={[styles.modernStepperButton, ticketQuantity <= 0 && styles.modernStepperButtonDisabled]}
                          onPress={() => handleSubEventTicketChange(subEventId, String(Math.max(0, ticketQuantity - 1)))}
                          disabled={ticketQuantity <= 0}
                        >
                          <Ionicons name="remove" size={14} color={ticketQuantity <= 0 ? "#ccc" : "#2788ff"} />
                        </TouchableOpacity>
                        <Text style={styles.modernTicketValue}>{ticketQuantity}</Text>
                        <TouchableOpacity
                          style={[styles.modernStepperButton, ticketQuantity >= (typeof subEvent.maxAttendees === 'number' ? subEvent.maxAttendees : Number(subEvent.maxAttendees) || 999) && styles.modernStepperButtonDisabled]}
                          onPress={() => {
                            const maxCap = typeof subEvent.maxAttendees === 'number' ? subEvent.maxAttendees : Number(subEvent.maxAttendees) || 999;
                            handleSubEventTicketChange(subEventId, String(Math.min(maxCap, ticketQuantity + 1)));
                          }}
                          disabled={ticketQuantity >= (typeof subEvent.maxAttendees === 'number' ? subEvent.maxAttendees : Number(subEvent.maxAttendees) || 999)}
                        >
                          <Ionicons name="add" size={14} color={ticketQuantity >= (Number(subEvent.maxAttendees) || 999) ? "#ccc" : "#2788ff"} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  {isSelected && isRestricted && ticketQuantity > 0 && (
                    <View style={styles.committedTicketContainer}>
                      <Text style={styles.committedTicketText}>
                        Committed: {ticketQuantity} ticket{ticketQuantity !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
        <View style={styles.fixedButtonContainer}>
          <View style={styles.totalFeeContainer}>
            <View style={styles.totalFeeLabelContainer}>
              <Text style={styles.totalFeeLabel}>Total Amount:</Text>
              {restrictedStatuses.includes(userStatus) && (
                <Text style={styles.committedFeeIndicator}>(Committed)</Text>
              )}
            </View>
            <Text style={styles.totalFeeAmount}>
              {formatCurrency(totalFee)}
            </Text>
          </View>
          {isLoading ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator color="#2788ff" size="small" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={getButtonStyle()}
              onPress={userStatus === 'member'
                ? () => (navigation as any).navigate('GenerateTicketScreen', { event })
                : handleJoinEvent}
              disabled={isButtonDisabled() && userStatus !== 'member'}
            >
              {isJoining ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.joinButtonText}>
                  {getButtonText()}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f7faff',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 16,
    backgroundColor: '#f7faff',
    flexGrow: 1,
    paddingBottom: 140,
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  mainDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  detailCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 90,
  },
  detailCardTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    marginBottom: 4,
    textAlign: 'center',
  },
  detailCardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  additionalDetailsContainer: {
    marginBottom: 16,
  },
  additionalDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  additionalDetailCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    minHeight: 70,
  },
  additionalDetailTitle: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'center',
  },
  additionalDetailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  dueDateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginTop: -10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  subEventsContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 50,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  subEventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2788ff',
    marginBottom: 16,
    textAlign: 'left',
  },
  lockedIndicator: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#999',
    fontStyle: 'italic',
  },
  subEventCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  subEventCardSelected: {
    backgroundColor: '#e8f4fd',
    borderColor: '#2788ff',
    borderWidth: 2,
  },
  disabledSubEventCard: {
    opacity: 0.5,
    backgroundColor: '#f1f1f1',
    borderColor: '#ddd',
  },
  subEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subEventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  subEventCheckbox: {
    marginRight: 10,
  },
  subEventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  disabledSubEventName: {
    color: '#999',
    opacity: 0.7,
  },
  subEventNameSelected: {
    color: '#2788ff',
    fontWeight: '700',
  },
  subEventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: '#2788ff',
  },
  freeBadge: {
    backgroundColor: '#28a745',
  },
  subEventBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  subEventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subEventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '30%',
  },
  subEventDetailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  detailsBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 2,
    color: '#2788ff',
  },
  detailText: {
    fontSize: 15,
    color: '#222',
    marginBottom: 6,
  },
  
  fixedButtonContainer: {
  backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: -130,
    marginTop: -38,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 50,
  },
  totalFeeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,

     borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  totalFeeLabelContainer: {
    flexDirection: 'column',
  },
  totalFeeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  committedFeeIndicator: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  totalFeeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2788ff',
  },
  joinButton: {
    backgroundColor: '#2788ff',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  joinButtonDisabled: {
    backgroundColor: '#ccc',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    flexDirection: 'row',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginLeft: 8,
  },
  ticketSelectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  ticketSelectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2788ff',
    marginBottom: 12,
    textAlign: 'left',
  },
  ticketQuantityContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  ticketQuantityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  ticketQuantityInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  ticketQuantityInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  ticketQuantityInputDisabled: {
    backgroundColor: '#e0e0e0',
    color: '#888',
  },
  ticketQuantityButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderColor: '#ccc',
  },
  ticketQuantityButtonDisabled: {
    opacity: 0.5,
  },
  ticketQuantityMax: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  committedTicketContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  committedTicketText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  subEventCardContainer: {
    marginBottom: 12,
  },
  subEventTicketContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modernMainEventTicketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  modernMainEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  modernMainEventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2788ff',
    marginLeft: 6,
  },
  modernMainEventStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modernMainEventButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modernMainEventButtonDisabled: {
    opacity: 0.5,
  },
  modernMainEventValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    minWidth: 40,
  },
  modernMainEventMax: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  modernSubEventTicketContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modernTicketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modernTicketLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  modernTicketStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modernStepperButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modernStepperButtonDisabled: {
    opacity: 0.5,
  },
  modernTicketValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    minWidth: 50,
  },
});

export default EventDetailScreen;
