import React, { useEffect } from 'react';
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
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchEvents, likeEvent, Event } from '../redux/slices/eventSlice';

const HomeScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const events = useSelector((state: RootState) => state.events.events);
  const loading = useSelector((state: RootState) => state.events.loading);
  const error = useSelector((state: RootState) => state.events.error);

  useEffect(() => {
    // Fetch events when component mounts
    dispatch(fetchEvents());
  }, [dispatch]);

  const handleLikeEvent = (eventId: string) => {
    // Dispatch the like action
    dispatch(likeEvent(eventId));
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
      <Image 
        source={{ uri: item.image }} 
        style={styles.eventImage} 
        resizeMode="cover" 
        defaultSource={require('../../assets/EventraLogo.png')} 
      />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {item.description} <Text style={styles.seeMoreText}>see more</Text>
        </Text>
        <View style={styles.eventActions}>
          <View style={styles.socialActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleLikeEvent(item.id)}
            >
              <Icon 
                name={item.isLiked ? "heart" : "heart-outline"} 
                size={22} 
                color={item.isLiked ? "#FF4A6D" : "#666"} 
              />
              <Text style={styles.actionCount}>{item.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="comment-text-outline" size={22} color="#666" />
              <Text style={styles.actionCount}>{item.comments}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const handleRefresh = () => {
    dispatch(fetchEvents());
  };

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
            <View style={styles.errorContainer}>
              <Text style={styles.errorBanner}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={events}
            renderItem={renderEventCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={handleRefresh}
            style={{width: '100%', flex: 1}}
            windowSize={3}
            maxToRenderPerBatch={5}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No events found</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                  <Text style={styles.retryText}>Refresh</Text>
                </TouchableOpacity>
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
    backgroundColor: '#4F8CFF',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: '2%',
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
  errorContainer: {
    backgroundColor: '#ffeeee',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#d9534f',
    fontSize: 16,
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    width: '100%',
    flexGrow: 1,
  },
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
    marginTop: 0,
    marginBottom: 4,
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
    marginRight: 20,
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
  actionCount: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
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
    color: '#d9534f',
    fontSize: 14,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '500',
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
    marginBottom: 10,
  }
});
