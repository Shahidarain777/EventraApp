import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  TouchableWithoutFeedback,
  Alert,
  Modal,
  TextInput,
  Share
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { Event } from '../redux/slices/eventSlice';
import { RootState, AppDispatch } from '../redux/store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigations';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchEvents, likeEvent, addComment, Event } from '../redux/slices/eventSlice';
type NavigationProp = StackNavigationProp<RootStackParamList, 'EventDetailScreen'>;

type EventCardProps = {
  
  event: Event;
  //onJoin: (id: string) => void;
  showJoin?: boolean;
  //onLike: (id: string) => void;
  //onComment: (id: string) => void;
  //onShare?: (event: Event) => void;
  showActions?: boolean;
};

const DOUBLE_TAP_DELAY = 300;

const EventCard = ({
  
  event,
  //onJoin,
  showJoin = true,
  //onLike,
  //onComment,
 // onShare,
  showActions = true,
}: EventCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  // State for double tap functionality - track last tap time per event
  const [lastTapTimes, setLastTapTimes] = useState<{[key: string]: number}>({});
  const DOUBLE_TAP_DELAY = 300; // milliseconds
  
  // State for heart animation
  const [showHeartAnimation, setShowHeartAnimation] = useState<{[key: string]: boolean}>({});
  const [heartAnimations, setHeartAnimations] = useState<{[key: string]: Animated.Value}>({});
  
  // State for comment modal
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [lastTap, setLastTap] = useState<number | null>(null);
  const [showHeart, setShowHeart] = useState(false);
  const heartAnimation = new Animated.Value(0);
  const isLong = event.description && event.description.length > 100;
  const navigation = useNavigation<NavigationProp>();
  // const handleDoubleTap = () => {
  //   const now = Date.now();
  //   if (lastTap && now - lastTap < DOUBLE_TAP_DELAY) {
  //     onLike && onLike(event.id);
  //     triggerHeartAnimation();
  //   }
  //   setLastTap(now);
  // };

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

  const [localLikes, setLocalLikes] = useState(event.likes);
  const [localIsLiked, setLocalIsLiked] = useState(event.isLiked);

  const handleLikeEvent = async (eventId: string) => {
    try {
      await dispatch(likeEvent(eventId)).unwrap();
      setLocalIsLiked((prev) => !prev);
      setLocalLikes((prev) => prev + (localIsLiked ? -1 : 1));
    } catch (error) {
      Alert.alert('Error', 'Failed to like event.');
    }
  };

  const handleCommentPress = () => {
      setCommentModalVisible(true);
  };
  
  const [localComments, setLocalComments] = useState(event.comments);
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }
    try {
      await dispatch(addComment({
        eventId: event.id,
        comment: commentText.trim()
      })).unwrap();
      setLocalComments((prev) => prev + 1);
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
  

  const triggerHeartAnimation = () => {
    setShowHeart(true);
    heartAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(heartAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowHeart(false));
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
          <Image source={{ uri: images[0] }} style={styles.imageGridHalf} resizeMode="cover" />
          <Image source={{ uri: images[1] }} style={styles.imageGridHalf} resizeMode="cover" />
        </View>
      );
    }
    if (images.length === 3) {
      return (
        <View style={styles.imageGrid}>
          <Image source={{ uri: images[0] }} style={styles.imageGridHalf} resizeMode="cover" />
          <View style={styles.imageGridColumn}>
            <Image source={{ uri: images[1] }} style={styles.imageGridQuarter} resizeMode="cover" />
            <Image source={{ uri: images[2] }} style={styles.imageGridQuarter} resizeMode="cover" />
          </View>
        </View>
      );
    }
    return (
      <View style={styles.imageGrid}>
        <Image source={{ uri: images[0] }} style={styles.imageGridHalf} resizeMode="cover" />
        <View style={styles.imageGridColumn}>
          <Image source={{ uri: images[1] }} style={styles.imageGridQuarter} resizeMode="cover" />
          <View style={styles.imageGridQuarterContainer}>
            <Image source={{ uri: images[2] }} style={styles.imageGridQuarter} resizeMode="cover" />
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

  return (
    <>
      <TouchableWithoutFeedback onPress={handleDoubleTap.bind(null, event.id)}>
        <View style={styles.eventCard}>
          <View style={styles.eventHeader}>
            <Text style={styles.organizerName}>{event.organizer}</Text>
            <View style={styles.categoryPrice}>
              <Text style={styles.categoryText}>{event.category}</Text>
              <Text style={styles.priceText}> · {event.price}</Text>
            </View>
          </View>
          <View style={styles.imageContainer}>
            {renderImageGrid(event.images || [event.image])}
            {showHeart && (
              <Animated.View
                style={[
                  styles.heartAnimationContainer,
                  {
                    opacity: heartAnimation,
                    transform: [
                      {
                        scale: heartAnimation.interpolate({
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
            <Text style={styles.eventTitle} numberOfLines={1}>
              {event.title}
            </Text>
            <View>
              <Text style={styles.eventDescription} numberOfLines={expanded ? undefined : 2}>
                {event.description}
              </Text>
              {isLong && (
                <TouchableOpacity onPress={() => setExpanded((e) => !e)}>
                  <Text style={styles.seeMoreText}>{expanded ? 'see less' : 'see more'}</Text>
                </TouchableOpacity>
              )}
            </View>
            {showActions && (
              <View style={styles.eventActions}>
                <View style={styles.socialActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleLikeEvent(event.id)}
                  >
                    <Icon 
                      name={localIsLiked ? "heart" : "heart-outline"} 
                      size={22} 
                      color={localIsLiked ? "#FF4A6D" : "#666"} 
                    />
                    <Text style={styles.actionCount}>{localLikes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={handleCommentPress}
                  >
                    <Icon name="comment-text-outline" size={22} color="#666" />
                    <Text style={styles.actionCount}>{localComments}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleShareEvent(event)}
                  >
                    <Icon name="share-variant-outline" size={22} color="#666" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={styles.joinButton}
                  onPress={() => navigation.navigate('EventDetailScreen', { event })}
                >
                  <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
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
    </>
  );

};

export default EventCard;

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
