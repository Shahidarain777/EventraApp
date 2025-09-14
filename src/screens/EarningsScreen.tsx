import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import api from '../api/axios';

interface EarningEvent {
  eventId: string;
  title: string;
  totalAttendees: number;
  totalEarnings: number;
  joinedMembers: any[];
}

const EarningsScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const events = useSelector((state: any) => state.events.events);

  const [earningsData, setEarningsData] = useState<EarningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [currency, setCurrency] = useState('USD'); // Default currency

  useEffect(() => {
    calculateEarnings();
  }, [events, user]);

  const calculateEarnings = () => {
    if (!events || !user?._id) {
      setLoading(false);
      return;
    }

    try {
      // Filter events hosted by current user
      const hostedEvents = events.filter(
        (event: any) => event.hostId?.toString() === user._id?.toString()
      );

      const earningsArray: EarningEvent[] = [];
      let totalEarningsSum = 0;
      let totalAttendeesSum = 0;
      let detectedCurrency = 'USD'; // Default to USD

      hostedEvents.forEach((event: any) => {
        // Detect currency from the first event that has currency info
        if (event.currency && !detectedCurrency) {
          detectedCurrency = event.currency;
        } else if (event.subEvents && Array.isArray(event.subEvents) && event.subEvents.length > 0) {
          const firstSubEventWithCurrency = event.subEvents.find((sub: any) => sub.currency);
          if (firstSubEventWithCurrency && !detectedCurrency) {
            detectedCurrency = firstSubEventWithCurrency.currency;
          }
        }

        if (!event.joinedMembers || !Array.isArray(event.joinedMembers)) {
          return;
        }

        // Get confirmed members only
        const confirmedMembers = event.joinedMembers.filter(
          (member: any) => member.status === 'member'
        );

        let eventEarnings = 0;
        let eventAttendees = 0;

        // Calculate earnings from payments array (for completed payments)
        if (event.payments && Array.isArray(event.payments)) {
          const completedPayments = event.payments.filter(
            (payment: any) => payment.paymentStatus === 'completed'
          );
          
          completedPayments.forEach((payment: any) => {
            eventEarnings += payment.amount || 0;
          });
        }

        // Calculate attendees from confirmed members
        confirmedMembers.forEach((member: any) => {
          // Calculate tickets from ticketQuantities
          if (member.ticketQuantities && member.ticketQuantities.subEvents) {
            const subEventTickets = member.ticketQuantities.subEvents;
            
            // Count total tickets for attendees
            Object.values(subEventTickets).forEach((ticketCount: any) => {
              eventAttendees += Number(ticketCount) || 0;
            });
          } else {
            // Fallback to numberOfPeople if ticketQuantities not available
            const attendeeCount = member.numberOfPeople || 1;
            eventAttendees += attendeeCount;
          }
        });

        if (confirmedMembers.length > 0) {
          earningsArray.push({
            eventId: event.eventId || event._id,
            title: event.title || 'Unnamed Event',
            totalAttendees: eventAttendees,
            totalEarnings: eventEarnings,
            joinedMembers: confirmedMembers,
          });

          totalEarningsSum += eventEarnings;
          totalAttendeesSum += eventAttendees;
        }
      });

      setEarningsData(earningsArray);
      setTotalEarnings(totalEarningsSum);
      setTotalAttendees(totalAttendeesSum);
      setCurrency(detectedCurrency); // Set the detected currency
    } catch (error) {
      console.error('Error calculating earnings:', error);
      Alert.alert('Error', 'Failed to calculate earnings');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const formattedAmount = amount.toFixed(2);
    
    switch (currency.toUpperCase()) {
      case 'PKR':
        return `₨${formattedAmount}`;
      case 'USD':
        return `$${formattedAmount}`;
      case 'EUR':
        return `€${formattedAmount}`;
      case 'GBP':
        return `£${formattedAmount}`;
      case 'INR':
        return `₹${formattedAmount}`;
      case 'JPY':
        return `¥${Math.round(amount)}`; // JPY doesn't use decimals
      case 'CAD':
        return `C$${formattedAmount}`;
      case 'AUD':
        return `A$${formattedAmount}`;
      case 'SAR':
        return `﷼${formattedAmount}`;
      case 'AED':
        return `د.إ${formattedAmount}`;
      default:
        return `${currency} ${formattedAmount}`;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#075cf8" />
        <Text style={styles.loadingText}>Calculating earnings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#075cf8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Earnings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Ionicons name="cash-outline" size={28} color="#075cf8" />
            <Text style={styles.summaryTitle}>Total Earnings</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalEarnings)}</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Ionicons name="people-outline" size={28} color="#075cf8" />
            <Text style={styles.summaryTitle}>Total Attendees</Text>
            <Text style={styles.summaryValue}>{totalAttendees}</Text>
          </View>
        </View>

        {/* Events List */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Events ({earningsData.length})</Text>
          
          {earningsData.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={60} color="#ccc" />
              <Text style={styles.emptyTitle}>No Events Found</Text>
              <Text style={styles.emptySubtitle}>
                You haven't hosted any events with attendees yet.
              </Text>
            </View>
          ) : (
            earningsData.map((event, index) => (
              <View key={event.eventId || index} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventName} numberOfLines={2}>
                    {event.title}
                  </Text>
                  <Text style={styles.eventEarnings}>
                    {formatCurrency(event.totalEarnings)}
                  </Text>
                </View>
                
                <View style={styles.eventStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="people" size={16} color="#666" />
                    <Text style={styles.statText}>
                      {event.joinedMembers.length} members
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Ionicons name="ticket" size={16} color="#666" />
                    <Text style={styles.statText}>
                      {event.totalAttendees} tickets
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#075cf8',
  },
  eventsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginRight: 16,
  },
  eventEarnings: {
    fontSize: 18,
    fontWeight: '700',
    color: '#075cf8',
  },
  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
});

export default EarningsScreen;