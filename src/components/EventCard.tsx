import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';

export type EventType = {
  title: string;
  description: string;
  price?: string;
  organizer?: string;
  date?: string;
  endDate?: string;
  category?: string;
  country?: string;
  state?: string;
  city?: string;
  latitude?: string;
  longitude?: string;
  visibility?: string;
  approvalRequired?: string;
  capacity?: string;
  subLeader?: string;
  financeManager?: string;
  images?: string[];
  // New format fields
  location?: {
    city?: string;
    state?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
  };
  dateTime?: {
    start?: string;
    end?: string;
  };
};

export type EventCardProps = {
  event: EventType;
  onJoin?: () => void;
  showJoin?: boolean;
};


const EventCard = ({ event, onJoin, showJoin = true }: EventCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = event.description && event.description.length > 100;
  return (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.organizerName}>{event.organizer || 'Host'}</Text>
        <View style={styles.categoryPrice}>
          <Text style={styles.categoryText}>{event.category}</Text>
          <Text style={styles.priceText}>{event.price ? ` · ${event.price}` : ''}</Text>
        </View>
      </View>
      <View style={{ position: 'relative' }}>
        <Image 
          source={{ uri: event.images && event.images.length > 0 ? event.images[0] : '' }} 
          style={styles.eventImage} 
          resizeMode="cover" 
          defaultSource={require('../../assets/EventraLogo.png')} 
        />
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={1} ellipsizeMode="tail">{event.title}</Text>
        <View>
          <Text style={styles.eventDescription} numberOfLines={expanded ? undefined : 2}>
            {event.description}
          </Text>
          {isLong && (
            <TouchableOpacity onPress={() => setExpanded(e => !e)}>
              <Text style={styles.seeMoreText}>{expanded ? 'see less' : 'see more'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {showJoin && onJoin && (
          <TouchableOpacity style={styles.joinButton} onPress={onJoin}>
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 10,
    marginTop: -8,
    marginHorizontal: 2,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  organizerName: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  categoryPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007BFF',
  },
  eventImage: {
    width: '100%',
    height: 160,
    marginTop: 10,
    marginBottom: 40,
    backgroundColor: '#f0f0f0', // Placeholder color before image loads
  },
  eventContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  seeMoreText: {
    color: '#007BFF',
    fontSize: 14,
  },
  joinButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 7,
    paddingHorizontal: 32,
    borderRadius: 18,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default EventCard;
