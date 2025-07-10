import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import eventService from '../api/eventService';

// Define Event type here or import from eventService if exported
interface Event {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  organizer: string;
  date: string;
  likes: number;
  comments: number;
  category: string;
}

// Mock data for testing or when API fails
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Summer Tech Conference 2024',
    description: 'Join us for an evening of tech talks and networking. Explore the latest trends in AI and web development.',
    price: '$99',
    image: '../../assets/intro_card1.jpg',
    organizer: 'Shahid Arain',
    date: '2024-07-15',
    likes: 124,
    comments: 23,
    category: 'Conference'
  },
  {
    id: '2',
    title: 'Design Workshop',
    description: 'Hands-on workshop on UI/UX design principles and tools.',
    price: '$75',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3',
    organizer: 'Hasnain',
    date: '2024-07-22',
    likes: 89,
    comments: 12,
    category: 'Workshop'
  },
  {
    id: '3',
    title: 'Networking Mixer',
    description: 'Connect with professionals in tech and digital industries.',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3',
    organizer: 'Asad Raza',
    date: '2024-07-30',
    likes: 67,
    comments: 8,
    category: 'Networking'
  }
];

const HomeScreen = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Try to get events from API
      try {
        const eventsData = await eventService.getAllEvents();
        
        // Check if we got valid data
        if (eventsData && Array.isArray(eventsData) && eventsData.length > 0) {
          setEvents(eventsData);
          setError(null);
          setLoading(false);
          return;
        } else {
          console.log('No events returned from API, using mock data');
        }
      } catch (apiErr) {
        console.log('API error:', apiErr);
      }
      
      // If we reach here, use mock data
      console.log('Using mock events data:', mockEvents);
      setEvents(mockEvents);
      setError('Failed to load events, showing sample data');
      setLoading(false);
    } catch (err) {
      console.log('Unexpected error in fetchEvents:', err);
      setError('Failed to load events, showing sample data');
      setEvents(mockEvents); // Use mock data as fallback
      setLoading(false);
    }
  };

  const renderEventCard = ({ item }: { item: Event }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.organizerName}>{item.organizer}</Text>
        <View style={styles.categoryPrice}>
          <Text style={styles.categoryText}>{item.category}</Text>
          <Text style={styles.priceText}> · {item.price}</Text>
        </View>
      </View>
      <Image source={{ uri: item.image }} style={styles.eventImage} resizeMode="cover" />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {item.description} <Text style={styles.seeMoreText}>see more</Text>
        </Text>
        <View style={styles.eventActions}>
          <View style={styles.socialActions}>
            <View style={styles.actionButton}>
              <Icon name="heart-outline" size={20} color="#666" />
              <Text style={styles.actionCount}>{item.likes}</Text>
            </View>
            <View style={styles.actionButton}>
              <Icon name="comment-outline" size={20} color="#666" />
              <Text style={styles.actionCount}>{item.comments}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.homeText}>Home</Text>
        <TouchableOpacity>
          <Text style={styles.createEventText}>Create Event</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
        <>
          {error && (
            <Text style={styles.errorBanner}>{error}</Text>
          )}
          <FlatList
            data={events}
            renderItem={renderEventCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No events found</Text>
              </View>
            }
          />
        </>
      )}

    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  homeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  createEventText: {
    fontSize: 15,
    color: '#007BFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#d9534f',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
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
    height: 140,
    marginTop: 8,
    marginBottom: 8,
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
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  socialActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 7,
    paddingHorizontal: 32,
    borderRadius: 18,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  errorBanner: {
    backgroundColor: '#ffeeee',
    padding: 10,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#d9534f',
    color: '#d9534f',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
  }
});
