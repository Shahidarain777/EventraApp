import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Event } from '../redux/slices/eventSlice';

interface DueDateProps {
  event: Event;
  styles: any;
}


const DueDate: React.FC<DueDateProps> = ({ event, styles }) => {
  const eventStartDateString = event.dateTime?.start;
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, mins: number, secs: number} | null>(null);

  useEffect(() => {
    if (!eventStartDateString) return;
    const interval = setInterval(() => {
      const now = new Date();
      const startDate = new Date(eventStartDateString);
      let diff = startDate.getTime() - now.getTime();
      if (diff < 0) diff = 0;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, mins, secs });
    }, 1000);
    return () => clearInterval(interval);
  }, [eventStartDateString]);

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
    return (
      <View style={{ alignItems: 'center', marginVertical: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 4 }}>
          <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#232c4b' }}>{timeLeft ? String(timeLeft.days).padStart(2, '0') : '--'}</Text>
            <Text style={{ fontSize: 10, color: '#232c4b', marginTop: 2 }}>DAYS</Text>
          </View>
          <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#232c4b' }}>{timeLeft ? String(timeLeft.hours).padStart(2, '0') : '--'}</Text>
            <Text style={{ fontSize: 10, color: '#232c4b', marginTop: 2 }}>HOURS</Text>
          </View>
          <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#232c4b' }}>{timeLeft ? String(timeLeft.mins).padStart(2, '0') : '--'}</Text>
            <Text style={{ fontSize: 10, color: '#232c4b', marginTop: 2 }}>MINS</Text>
          </View>
          <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#232c4b' }}>{timeLeft ? String(timeLeft.secs).padStart(2, '0') : '--'}</Text>
            <Text style={{ fontSize: 10, color: '#232c4b', marginTop: 2 }}>SECS</Text>
          </View>
        </View>
      </View>
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
