import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import EventCard from '../components/EventCard';
import { Event } from '../redux/slices/eventSlice';
import { RouteProp } from '@react-navigation/native';
import DueDate from '../components/DueDate';

type EventDetailScreenProps = {
  route: RouteProp<{ params: { event: Event } }, 'params'>;
};

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ route }) => {
  const { event } = route.params;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <EventCard event={event} showJoin={false} />
      <View style={styles.detailsBox}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.detailText}>
          {event.location && (event.location.city || event.location.state || event.location.country || event.location.address) ?
            [event.location.city, event.location.state, event.location.country, event.location.address]
              .filter(Boolean)
              .join(', ')
            : 'N/A'}
        </Text>
        <Text style={styles.sectionTitle}>Fee</Text>
        <Text style={styles.detailText}>{event.price && event.price !== 'Free' ? `${event.price}` : 'Free'}</Text>
        <Text style={styles.sectionTitle}>Host</Text>
        <Text style={styles.detailText}>{event.hostName || 'N/A'}</Text>
        <Text style={styles.sectionTitle}>Type</Text>
        <Text style={styles.detailText}>{event.categoryInfo.name || 'N/A'}</Text>

        {/* New fields below existing info */}
        <Text style={styles.sectionTitle}>Approval Required</Text>
        <Text style={styles.detailText}>{event.approvalRequired === 'yes' ? 'Yes' : 'No'}</Text>
        <Text style={styles.sectionTitle}>Visibility</Text>
        <Text style={styles.detailText}>{event.visibility === 'private' ? 'Private' : 'Public'}</Text>
        <Text style={styles.sectionTitle}>Capacity</Text>
        <Text style={styles.detailText}>
          {event.maxAttendees && !isNaN(Number(event.maxAttendees)) ? Number(event.maxAttendees) : 'N/A'}
        </Text>
        <Text style={styles.sectionTitle}>Joined Count</Text>
        <Text style={styles.detailText}>
          {event.joinedCount && !isNaN(Number(event.joinedCount)) ? Number(event.joinedCount) : 'N/A'}
        </Text>
        {/* Days/Hours left/status logic using reusable component */}
        <DueDate event={event} styles={styles} />
      </View>
    </ScrollView>
  );
};



const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f7faff',
    flexGrow: 1,
  },
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
});

export default EventDetailScreen;
