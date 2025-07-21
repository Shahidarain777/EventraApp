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
  ActivityIndicator,
  TouchableWithoutFeedback,
  Animated,
  Modal,
  TextInput,
  Alert,
  Share
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, TabParamList } from '../types/navigations';
import { fetchEvents, likeEvent, addComment, Event } from '../redux/slices/eventSlice';

const HomeScreen = () => {
  const navigation = useNavigation<
    CompositeNavigationProp<
      BottomTabNavigationProp<TabParamList, 'Home'>,
      StackNavigationProp<RootStackParamList>
    >
  >();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const events = useSelector((state: RootState) => state.events.events);
  const loading = useSelector((state: RootState) => state.events.loading);
  const error = useSelector((state: RootState) => state.events.error);
  
  // State to track which event descriptions are expanded
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  
  // State for double tap functionality - track last tap time per event
  const [lastTapTimes, setLastTapTimes] = useState<{[key: string]: number}>({});
  const DOUBLE_TAP_DELAY = 300; // milliseconds
  
  // State for heart animation
  const [showHeartAnimation, setShowHeartAnimation] = useState<{[key: string]: boolean}>({});
  const [heartAnimations, setHeartAnimations] = useState<{[key: string]: Animated.Value}>({});
  
  // State for comment modal
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    // Fetch events when component mounts
    dispatch(fetchEvents());
  }, [dispatch]);

  const handleLikeEvent = (eventId: string) => {
    // Dispatch the like action
    dispatch(likeEvent(eventId));
  };

  const handleDoubleTap = (eventId: string) => {
    const now = Date.now();
    const lastTap = lastTapTimes[eventId];
    
    if (lastTap && (now - lastTap) < DOUBLE_TAP_DELAY) {
      // Double tap detected
      handleLikeEvent(eventId);
      
      // Trigger heart animation
      if (!heartAnimations[eventId]) {
        setHeartAnimations(prev => ({
          ...prev,
          [eventId]: new Animated.Value(0)
        }));
      }
      
      setShowHeartAnimation(prev => ({
        ...prev,
        [eventId]: true
      }));
      
      // Animate the heart
      const animation = heartAnimations[eventId] || new Animated.Value(0);
      animation.setValue(0);
      
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowHeartAnimation(prev => ({
          ...prev,
          [eventId]: false
        }));
      });
    }
    
    setLastTapTimes(prev => ({
      ...prev,
      [eventId]: now
    }));
  };

  const toggleDescription = (eventId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const handleCommentPress = (eventId: string) => {
    setSelectedEventId(eventId);
    setCommentModalVisible(true);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      await dispatch(addComment({
        eventId: selectedEventId,
        comment: commentText.trim()
      })).unwrap();
      
      setCommentText('');
      setCommentModalVisible(false);
      Alert.alert('Success', 'Comment added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
  };

  const handleCommentCancel = () => {
    setCommentText('');
    setCommentModalVisible(false);
  };

  const handleShareEvent = async (event: Event) => {
    try {
      const shareMessage = `🎉 Check out this event: ${event.title}\n\n📝 ${event.description}\n\n📅 Date: ${event.dateTime.start} - ${event.dateTime.end}\n💰 Price: ${event.price}\n👨‍💼 Organizer: ${event.organizer}\n\nJoin us for an amazing experience!`;

      const result = await Share.share({
        message: shareMessage,
        title: event.title,
      });

      if (result.action === Share.sharedAction) {
        // Successfully shared
        console.log('Event shared successfully');
      }
    } catch (error) {
      console.error('Error sharing event:', error);
      Alert.alert('Error', 'Failed to share event. Please try again.');
    }
  };

  const renderImageGrid = (images: string[]) => {
    if (!images || images.length === 0) {
      return (
        <Image 
          source={require('../../assets/EventraLogo.png')} 
          style={styles.eventImage} 
          resizeMode="cover" 
        />
      );
    }

    if (images.length === 1) {
      return (
        <Image 
          source={{ uri: images[0] }} 
          style={styles.eventImage} 
          resizeMode="cover" 
          defaultSource={require('../../assets/EventraLogo.png')} 
        />
      );
    }

    if (images.length === 2) {
      return (
        <View style={styles.imageGrid}>
          <Image 
            source={{ uri: images[0] }} 
            style={styles.imageGridHalf} 
            resizeMode="cover" 
            defaultSource={require('../../assets/EventraLogo.png')} 
          />
          <Image 
            source={{ uri: images[1] }} 
            style={styles.imageGridHalf} 
            resizeMode="cover" 
            defaultSource={require('../../assets/EventraLogo.png')} 
          />
        </View>
      );
    }

    if (images.length === 3) {
      return (
        <View style={styles.imageGrid}>
          <Image 
            source={{ uri: images[0] }} 
            style={styles.imageGridHalf} 
            resizeMode="cover" 
            defaultSource={require('../../assets/EventraLogo.png')} 
          />
          <View style={styles.imageGridColumn}>
            <Image 
              source={{ uri: images[1] }} 
              style={styles.imageGridQuarter} 
              resizeMode="cover" 
              defaultSource={require('../../assets/EventraLogo.png')} 
            />
            <Image 
              source={{ uri: images[2] }} 
              style={styles.imageGridQuarter} 
              resizeMode="cover" 
              defaultSource={require('../../assets/EventraLogo.png')} 
            />
          </View>
        </View>
      );
    }

    // For 4 or more images
    return (
      <View style={styles.imageGrid}>
        <Image 
          source={{ uri: images[0] }} 
          style={styles.imageGridHalf} 
          resizeMode="cover" 
          defaultSource={require('../../assets/EventraLogo.png')} 
        />
        <View style={styles.imageGridColumn}>
          <Image 
            source={{ uri: images[1] }} 
            style={styles.imageGridQuarter} 
            resizeMode="cover" 
            defaultSource={require('../../assets/EventraLogo.png')} 
          />
          <View style={styles.imageGridQuarterContainer}>
            <Image 
              source={{ uri: images[2] }} 
              style={styles.imageGridQuarter} 
              resizeMode="cover" 
              defaultSource={require('../../assets/EventraLogo.png')} 
            />
            {images.length > 3 && (
              <View style={styles.moreImagesOverlay}>
                <Text style={styles.moreImagesText}>+{images.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableWithoutFeedback onPress={() => handleDoubleTap(item.id)}>
      <View style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <Text style={styles.organizerName}>{item.organizer}</Text>
          <View style={styles.categoryPrice}>
            <Text style={styles.categoryText}>{item.category}</Text>
            <Text style={styles.priceText}> · {item.price}</Text>
          </View>
        </View>
        <View style={styles.imageContainer}>
          {renderImageGrid(item.images || [item.image])}
          {showHeartAnimation[item.id] && heartAnimations[item.id] && (
            <Animated.View
              style={[
                styles.heartAnimationContainer,
                {
                  opacity: heartAnimations[item.id],
                  transform: [
                    {
                      scale: heartAnimations[item.id].interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.5, 1.2, 0.8],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Icon name="heart" size={80} color="#FF4A6D" />
            </Animated.View>
          )}
        </View>
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
          <View>
            <Text 
              style={styles.eventDescription} 
              numberOfLines={expandedDescriptions.has(item.id) ? undefined : 2}
            >
              {item.description}
            </Text>
            {item.description && item.description.length > 100 && (
              <TouchableOpacity onPress={() => toggleDescription(item.id)}>
                <Text style={styles.seeMoreText}>
                  {expandedDescriptions.has(item.id) ? 'see less' : 'see more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleCommentPress(item.id)}
              >
                <Icon name="comment-text-outline" size={22} color="#666" />
                <Text style={styles.actionCount}>{item.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleShareEvent(item)}
              >
                <Icon name="share-variant-outline" size={22} color="#666" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.joinButton}
            onPress={() => navigation.navigate('EventDetailScreen', { event: item })}
            >
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  const handleRefresh = () => {
    dispatch(fetchEvents());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.homeText}>Home</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateEvent')}>
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

      {/* Comment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={handleCommentCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.commentModalContainer}>
            <View style={styles.commentModalHeader}>
              <Text style={styles.commentModalTitle}>Add Comment</Text>
              <TouchableOpacity onPress={handleCommentCancel}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.commentInput}
              placeholder="Write your comment here..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />
            
            <View style={styles.commentModalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCommentCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleCommentSubmit}
              >
                <Text style={styles.submitButtonText}>Post Comment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#6695ebff',
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
    height: 250,
    marginTop: 0,
    marginBottom: 4,
    backgroundColor: '#f0f0f0',
  },
  imageContainer: {
    position: 'relative',
  },
  heartAnimationContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -40,
    marginLeft: -40,
    zIndex: 10,
    pointerEvents: 'none',
  },
  imageGrid: {
    flexDirection: 'row',
    height: 250,
    marginTop: 0,
    marginBottom: 4,
  },
  imageGridHalf: {
    width: '50%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  imageGridColumn: {
    flex: 1,
    flexDirection: 'column',
  },
  imageGridQuarter: {
    width: '100%',
    height: 125,
    backgroundColor: '#f0f0f0',
  },
  imageGridQuarterContainer: {
    position: 'relative',
    height: 125,
  },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
    marginBottom: 4,
  },
  seeMoreText: {
    color: '#007BFF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 4,
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
  },
  // Comment Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  commentModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  commentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    minHeight: 100,
    fontSize: 16,
    backgroundColor: '#ffffffff',
    color: '#000',
  },
  commentModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
