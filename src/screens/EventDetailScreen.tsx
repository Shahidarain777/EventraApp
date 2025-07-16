import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import EventCard, { EventType } from '../components/EventCard';
import { RouteProp } from '@react-navigation/native';
import DueDate from '../components/DueDate';

type EventDetailScreenProps = {
  route: RouteProp<{ params: { event: EventType } }, 'params'>;
};

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ route }) => {
  const { event } = route.params;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <EventCard event={event} showJoin={false} />
      <View style={styles.detailsBox}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.detailText}>{event.city || event.location?.city || 'N/A'}</Text>
        <Text style={styles.sectionTitle}>Fee</Text>
        <Text style={styles.detailText}>{event.price && event.price !== 'Free' ? `$${event.price}` : 'Free'}</Text>
        <Text style={styles.sectionTitle}>Host</Text>
        <Text style={styles.detailText}>{event.organizer || 'N/A'}</Text>
        <Text style={styles.sectionTitle}>Type</Text>
        <Text style={styles.detailText}>{event.category || 'N/A'}</Text>

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
