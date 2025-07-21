import React from 'react';
import { Text } from 'react-native';
import { Event } from '../redux/slices/eventSlice';

interface DueDateProps {
  event: Event;
  styles: any;
}

const DueDate: React.FC<DueDateProps> = ({ event, styles }) => {
  const eventStartDateString = event.dateTime?.start;
  
  if (!eventStartDateString) {
    return (
      <>
        <Text style={styles.sectionTitle}>Due Date</Text>
        <Text style={styles.detailText}>No date set</Text>
      </>
    );
  }

  const startDate = new Date(eventStartDateString);
  const endOfStartDate = new Date(startDate);
  endOfStartDate.setHours(23, 59, 59, 999);

  const now = new Date();

  if (now < startDate) {
    const diffMs = startDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return (
      <>
        <Text style={styles.sectionTitle}>Due Date</Text>
        {diffDays > 0 ? (
          <Text style={styles.detailText}>{diffDays} day{diffDays > 1 ? 's' : ''} left</Text>
        ) : (
          <Text style={styles.detailText}>{diffHours} hour{diffHours !== 1 ? 's' : ''} left</Text>
        )}
      </>
    );
  } else if (now <= endOfStartDate) {
    return (
      <>
        <Text style={styles.sectionTitle}>Due Date</Text>
        <Text style={styles.detailText}>Event in progress</Text>
      </>
    );
  } else {
    return (
      <>
        <Text style={styles.sectionTitle}>Due Date</Text>
        <Text style={styles.detailText}>Event ended</Text>
      </>
    );
  }
};

export default DueDate;
