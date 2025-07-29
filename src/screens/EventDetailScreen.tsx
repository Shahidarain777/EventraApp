import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import EventCard from '../components/EventCard';
import { Event } from '../redux/slices/eventSlice';
import { RouteProp } from '@react-navigation/native';
import DueDate from '../components/DueDate';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type EventDetailScreenProps = {
  route: RouteProp<{ params: { event: Event } }, 'params'>;
};

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ route }) => {
  const { event } = route.params;
  
  // State for user's join status
  const [userStatus, setUserStatus] = useState<string>('not_joined');
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // State for sub-event selection and fee calculation
  const [selectedSubEvents, setSelectedSubEvents] = useState<Set<string>>(new Set());
  const [totalFee, setTotalFee] = useState<number>(0);
  
  // Define restricted statuses for sub-event selection
  const restrictedStatuses = ['member', 'approval_pending', 'payment_pending', 'payment_verification_pending'];
  
  // Get current user ID from AsyncStorage
  const getCurrentUserId = async () => {
    try {
      const userStr = await AsyncStorage.getItem('userData');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Try to get the user ID from common fields
        const userIdRaw = user._id || user.id || user.userId || user.userid || user.ID;
        const userId = userIdRaw ? userIdRaw.toString() : null;
        //Alert.alert('Extracted userId', userId ? userId : 'null');
        return userId;
      }
      Alert.alert('No user found in AsyncStorage');
      return null;
    } catch (error) {
      console.log('Failed to get current user ID:', error);
      Alert.alert('Error', 'Failed to get current user ID');
      return null;
    }
  };
  
  // Initialize current user ID
  useEffect(() => {
    const initializeUserId = async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
    };
    initializeUserId();
  }, []);

  // Calculate total fee whenever selected sub-events change or user status changes
  useEffect(() => {
    const mainEventFee = event.price && event.price !== 'Free' ? Number(event.price) : 0;
    let subEventsFee = 0;
    
    // Check if user has restricted status (already joined)
    const isRestricted = restrictedStatuses.includes(userStatus);
    
    if (isRestricted && event.joinedMembers && currentUserId) {
      // For restricted users, try to get their committed total amount first
      const currentUserMember = event.joinedMembers.find(
        (member: any) => member.userId?.toString() === currentUserId?.toString()
      );
      
      // If user has a committed totalAmount, use that
      if (currentUserMember && (currentUserMember as any).totalAmount !== undefined) {
        const committedTotal = Number((currentUserMember as any).totalAmount);
        if (!isNaN(committedTotal)) {
          setTotalFee(committedTotal);
          return; // Use committed amount, skip calculation
        }
      }
    }
    
    // Calculate fee based on selected sub-events (for new users or fallback)
    if (event.subEvents) {
      if (isRestricted) {
        // For restricted users without committed total, calculate from previously selected sub-events
        if ((event as any).userSelectedSubEvents) {
          (event as any).userSelectedSubEvents.forEach((userSubEvent: any) => {
            const matchingSubEvent = event.subEvents?.find((subEvent) => {
              const subEventId = String(subEvent.subEventId || subEvent._id || subEvent.itemName);
              const userSubEventId = String(userSubEvent.subEventId || userSubEvent._id || userSubEvent.itemName);
              return subEventId === userSubEventId;
            });
            
            if (matchingSubEvent && matchingSubEvent.isPaid) {
              subEventsFee += Number(matchingSubEvent.fee) || 0;
            }
          });
        } else {
          // Fallback: use current selectedSubEvents for restricted users
          event.subEvents.forEach((subEvent) => {
            const subEventId = String(subEvent.subEventId || subEvent._id || subEvent.itemName);
            if (selectedSubEvents.has(subEventId) && subEvent.isPaid) {
              subEventsFee += Number(subEvent.fee) || 0;
            }
          });
        }
      } else {
        // For new users (not_joined), calculate based on current selection
        event.subEvents.forEach((subEvent) => {
          const subEventId = String(subEvent.subEventId || subEvent._id || subEvent.itemName);
          if (selectedSubEvents.has(subEventId) && subEvent.isPaid) {
            subEventsFee += Number(subEvent.fee) || 0;
          }
        });
      }
    }
    
    setTotalFee(mainEventFee + subEventsFee);
  }, [selectedSubEvents, event.price, event.subEvents, userStatus, restrictedStatuses, event.joinedMembers, currentUserId]);

  // Handle sub-event selection
  const toggleSubEventSelection = (subEventId: string) => {
    // Prevent selection changes if user has already joined
    const restrictedStatuses = ['member', 'approval_pending', 'payment_pending', 'payment_verification_pending'];
    
    if (restrictedStatuses.includes(userStatus)) {
      // Show alert that they cannot change selections
      // Alert.alert(
      //   'Cannot Modify Selection',
      //   'You have already joined this event. Sub-event selections cannot be changed.',
      //   [{ text: 'OK' }]
      // );
      return;
    }

    // Original selection logic for new users
    setSelectedSubEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subEventId)) {
        newSet.delete(subEventId);
      } else {
        newSet.add(subEventId);
      }
      return newSet;
    });
  };

  // Load user's previously selected sub-events when status changes
  useEffect(() => {
    // If user has already joined (any of the restricted statuses), load their previous selections
    const restrictedStatuses = ['member', 'approval_pending', 'payment_pending', 'payment_verification_pending'];
    
    if (restrictedStatuses.includes(userStatus) && event.subEvents) {
      // For restricted users, we need to get their previously committed selections
      // This could come from the backend API or from joinedMembers data
      
      // Option 1: If backend provides userSelectedSubEvents in event data
      if ((event as any).userSelectedSubEvents) {
        const userSubEventIds = (event as any).userSelectedSubEvents.map((subEvent: any) => 
          String(subEvent.subEventId || subEvent._id || subEvent.itemName)
        );
        setSelectedSubEvents(new Set(userSubEventIds));
      }
      // Option 2: Get from joinedMembers data if available
      else if (event.joinedMembers && currentUserId) {
        const currentUserMember = event.joinedMembers.find(
          (member: any) => member.userId?.toString() === currentUserId?.toString()
        );
        
        if (currentUserMember && (currentUserMember as any).selectedSubEvents) {
          const memberSubEventIds = (currentUserMember as any).selectedSubEvents.map((subEventId: any) => 
            String(subEventId)
          );
          setSelectedSubEvents(new Set(memberSubEventIds));
        }
        // Option 3: If sub-events are stored as part of member data with different structure
        else if (currentUserMember && (currentUserMember as any).subEvents) {
          const memberSubEventIds = (currentUserMember as any).subEvents.map((subEvent: any) => 
            String(subEvent.subEventId || subEvent._id || subEvent.itemName || subEvent)
          );
          setSelectedSubEvents(new Set(memberSubEventIds));
        }
        // Option 4: If the member has a totalAmount, try to reverse-engineer selections
        else if (currentUserMember && (currentUserMember as any).totalAmount) {
          // This is a fallback - try to match the committed total with possible sub-event combinations
          console.log('User has committed total:', (currentUserMember as any).totalAmount);
          // For now, we'll let the fee calculation handle this
        }
      }
      
      // If no stored selections found but user has restricted status, make API call to get selections
      // You can uncomment this if you have a dedicated API endpoint
      // else {
      //   fetchUserSelectedSubEvents();
      // }
    } else if (userStatus === 'not_joined') {
      // Clear selections for new users
      setSelectedSubEvents(new Set());
    }
  }, [userStatus, event.subEvents, event.joinedMembers, currentUserId]);
 
  // Get user status from event.joinedMembers (from eventSlice)
  useEffect(() => {
    if (!currentUserId) return;
    setIsLoading(true);
    const currentUserMember = event.joinedMembers?.find(
      (member: any) => member.userId?.toString() === currentUserId?.toString()
    );
    //Alert.alert('Debug', `currentUserId: ${currentUserId}\ncurrentUserMember: ${JSON.stringify(currentUserMember)}`);
    setUserStatus(currentUserMember ? currentUserMember.status : 'not_joined');
    setIsLoading(false);
  }, [event.eventId, event.joinedMembers, currentUserId]);
  
  
  // Handle join event
  const handleJoinEvent = async () => {
    if (isJoining) return;
    // If user already has a status, do not allow join again
    if (userStatus !== 'not_joined') return;
    setIsJoining(true);
    try {
      let status = 'member';
      if (getApprovalRequired()) {
        status = 'approval_pending';
      } else if (totalFee > 0) {
        status = 'payment_pending';
      }
      
      // Include selected sub-events in the request
      const selectedSubEventIds = Array.from(selectedSubEvents);
      
      await api.post('/event_members', {
        eventId: event.eventId,
        status: status,
        selectedSubEvents: selectedSubEventIds,
        totalAmount: totalFee
      });
      setUserStatus(status);
      let message = '';
      switch (status) {
        case 'member':
          message = 'Successfully joined the event!';
          break;
        case 'approval_pending':
          message = 'Your join request has been submitted and is awaiting approval.';
          break;
        case 'payment_pending':
          message = `Join request submitted! Please complete payment of $${totalFee.toFixed(2)} to confirm your membership.`;
          break;
      }
      Alert.alert('Success', message);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to join event. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };
  
  // Helper functions for better field mapping
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
  
  // Get button text based on status
  const getButtonText = () => {
    // Alert.alert('Debug Info', `userStatus: ${userStatus}`);
    switch (userStatus) {
      case 'member':
        return 'You are a member';
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
  
  // Check if button should be disabled
  const isButtonDisabled = () => {
    return userStatus === 'member' || 
           userStatus === 'approval_pending' || 
           userStatus === 'payment_verification_pending' ||
           isJoining;
  };
  
  // Get button style based on status
  const getButtonStyle = () => {
    if (isButtonDisabled()) {
      return [styles.joinButton, styles.joinButtonDisabled];
    }
    return styles.joinButton;
  };
  return (
    <View style={styles.screenContainer}>
      <ScrollView 
        contentContainerStyle={styles.container}
        style={styles.scrollView}
      >
        <EventCard event={event} showJoin={false} />
        
        {/* Location Section - Full Width */}
        <View style={styles.locationCard}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="location-outline" size={18} color="#2788ff" /> Location
          </Text>
          <Text style={styles.detailText}>
            {event.location && (event.location.city || event.location.state || event.location.country || event.location.address || event.location.link || event.location.platform || event.location.type || event.location.venueName) ?

              [event.location.city, event.location.state, event.location.country, event.location.address, event.location.link]

                .filter(Boolean)
                .join(', ')
              : 'N/A'}
          </Text>
        </View>

        {/* Main Details Row - Fee, Host, Type */}
        <View style={styles.mainDetailsRow}>
          <View style={styles.detailCard}>
            <Ionicons name="pricetag-outline" size={20} color="#2788ff" />
            <Text style={styles.detailCardTitle}>Fee</Text>
            <Text style={styles.detailCardValue}>
              {event.price && event.price !== 'Free' ? String(event.price) : 'Free'}
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

        {/* Additional Details Grid */}
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
          
          <View style={styles.additionalDetailsRow}>
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
          </View>
        </View>

        {/* Due Date Section */}
        <View style={styles.dueDateCard}>
          <DueDate event={event} styles={styles} />
        </View>

        {/* Sub Events Section */}
        {event.subEvents && event.subEvents.length > 0 && (
          <View style={styles.subEventsContainer}>
            <Text style={styles.subEventsTitle}>
              <Ionicons name="list-outline" size={20} color="#2788ff" /> Sub Events
              {restrictedStatuses.includes(userStatus) && (
                <Text style={styles.lockedIndicator}> (Locked)</Text>
              )}
            </Text>
            
            {event.subEvents.map((subEvent, index) => {
              const subEventId = String(subEvent.subEventId || subEvent._id || subEvent.itemName || index);
              const isSelected = selectedSubEvents.has(subEventId);
              
              return (
                <TouchableOpacity 
                  key={subEventId} 
                  style={[
                    styles.subEventCard, 
                    isSelected && styles.subEventCardSelected,
                    restrictedStatuses.includes(userStatus) && styles.disabledSubEventCard
                  ]}
                  onPress={() => toggleSubEventSelection(subEventId)}
                  activeOpacity={0.7}
                  disabled={restrictedStatuses.includes(userStatus)}
                >
                  <View style={styles.subEventHeader}>
                    <View style={styles.subEventTitleRow}>
                      <View style={styles.subEventCheckbox}>
                        {restrictedStatuses.includes((event as any).user_status) ? (
                          <Ionicons 
                            name="lock-closed" 
                            size={20} 
                            color="#999" 
                          />
                        ) : (
                          <Ionicons 
                            name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                            size={20} 
                            color={isSelected ? "#2788ff" : "#ccc"} 
                          />
                        )}
                      </View>
                      <Text style={[
                        styles.subEventName, 
                        isSelected && styles.subEventNameSelected,
                        restrictedStatuses.includes((event as any).user_status) && styles.disabledSubEventName
                      ]}>
                        {subEvent.itemName || `Sub Event ${index + 1}`}
                      </Text>
                    </View>
                    <View style={[styles.subEventBadge, subEvent.isPaid ? styles.paidBadge : styles.freeBadge]}>
                      <Text style={styles.subEventBadgeText}>
                        {subEvent.isPaid ? `$${Number(subEvent.fee || 0)}` : 'Free'}
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
              );
            })}
          </View>
        )}
      </ScrollView>
      
      {/* Fixed Join Button at Bottom */}
      <View style={styles.fixedButtonContainer}>
        {/* Total Fee Display */}
        <View style={styles.totalFeeContainer}>
          <View style={styles.totalFeeLabelContainer}>
            <Text style={styles.totalFeeLabel}>Total Amount:</Text>
            {restrictedStatuses.includes(userStatus) && (
              <Text style={styles.committedFeeIndicator}>(Committed)</Text>
            )}
          </View>
          <Text style={styles.totalFeeAmount}>
            ${totalFee > 0 ? `${totalFee.toFixed(2)}` : '0.00'}
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
            onPress={handleJoinEvent}
            disabled={isButtonDisabled()}
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
    paddingBottom: 100, // Add padding to prevent content from being hidden behind fixed button
  },
  
  // Location Card - Full Width
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
  
  // Main Details Row - Fee, Host, Type
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
  
  // Additional Details Grid
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
  
  // Due Date Card
  dueDateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  
  // Sub Events Section
  subEventsContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
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
  
  // Legacy styles for backward compatibility
  detailsBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
    marginBottom: 30,
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
  
  // Fixed button styles
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  totalFeeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
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
    borderRadius: 12,
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
});

export default EventDetailScreen;
