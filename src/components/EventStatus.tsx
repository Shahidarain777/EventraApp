import React from 'react';
import { Text } from 'react-native';
import { EventType } from './EventCard';

interface EventStatusProps {
  event: EventType;
  styles: any;
}

const EventStatus: React.FC<EventStatusProps> = ({ event, styles }) => {
  // Support both flat and nested date fields
  const hasFlatDates = event.date && event.endDate;
  const hasNestedDates = event.dateTime && event.dateTime.start && event.dateTime.end;
  if (!hasFlatDates && !hasNestedDates) {
    return (
      <>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.detailText}>No date set</Text>
      </>
    );
  }
  const startDate = new Date(event.dateTime?.start ?? event.date ?? '');
  const endDate = new Date(event.dateTime?.end ?? event.endDate ?? '');
  const now = new Date();
  if (now < startDate) {
    // Event not started yet
    const diffMs = startDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (diffDays > 0) {
      return (
        <>
          <Text style={styles.sectionTitle}>Days Left</Text>
          <Text style={styles.detailText}>{diffDays} day{diffDays > 1 ? 's' : ''} left</Text>
        </>
      );
    } else {
      return (
        <>
          <Text style={styles.sectionTitle}>Hours Left</Text>
          <Text style={styles.detailText}>{diffHours} hour{diffHours !== 1 ? 's' : ''} left</Text>
        </>
      );
    }
  } else if (now >= startDate && now <= endDate) {
    // Event in progress
    return (
      <>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.detailText}>Event in progress</Text>
      </>
    );
  } else {
    // Event ended
    return (
      <>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.detailText}>Event ended</Text>
      </>
    );
  }
};

export default EventStatus;
