import React, { useState } from 'react';
import { Image } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  Alert,
  Modal,
  TextInput,
  Share,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState, AppDispatch } from '../redux/store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigations';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { likeEvent, addComment, Event } from '../redux/slices/eventSlice';
import ImageGrid from '../components/ImageGrid';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type EventCardProps = {
  event: Event;
  showJoin?: boolean;
  showActions?: boolean;
};

const EventCard = ({
  event,
  showJoin = true,
  showActions = true,
}: EventCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const heartAnimation = new Animated.Value(0);
  const isLong = event.description && event.description.length > 100;
  const navigation = useNavigation<NavigationProp>();

  // Get current user id as STRING!
  const currentUserId = useSelector((state: RootState) => state.auth.user?._id?.toString() || '');

  // DEBUG LOGGING
  React.useEffect(() => {
//     Alert.alert('currentUserId:', currentUserId);
//     Alert.alert(
//   'Debug Info',
//   `currentUserId: ${currentUserId}\nlikedBy: ${JSON.stringify(event.likedBy)}`
// );
    // console.log(
    //   'isLiked:',
    //   Array.isArray(event.likedBy)
    //     ? event.likedBy.some((u) => u.id?.toString() === currentUserId)
    //     : false
    // );
  }, [event.likedBy, currentUserId]);

  // Always compute isLiked from event.likedBy and current user id, both as string!
  const isLiked = Array.isArray(event.likedBy)
    ? event.likedBy.some((u) => u.id?.toString() === currentUserId)
    : false;

  const handleLikeEvent = async (eventId: string | number) => {
    try {
      await dispatch(likeEvent(eventId)).unwrap();
      triggerHeartAnimation();
    } catch (error) {
      Alert.alert('Error', 'Failed to like event.');
    }
  };

  // Ensure these functions are defined before usage
  const handleCommentPress = () => {
    setCommentModalVisible(true);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }
    try {
      await dispatch(addComment({
        eventId: event.eventId,
        comment: commentText.trim()
      })).unwrap();
      setCommentText('');
      setCommentModalVisible(false);
      Alert.alert('Success', 'Comment added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
  };

  const isEventEnded = (() => {
    if (!event.dateTime?.end) return false;
    // Make sure to parse the end date correctly. Adjust parsing if your date format is different.
    const endDate = new Date(event.dateTime.end);
    return endDate < new Date();
  })();

  const handleCommentCancel = () => {
    setCommentText('');
    setCommentModalVisible(false);
  };

  const handleShareEvent = async (event: Event) => {
    try {
      const shareMessage = `🎉 Check out this event: ${event.title}\n\n📝 ${event.description}\n\n📅 Date: ${event.dateTime.start} - ${event.dateTime.end}\n💰 Price: ${event.price}\n👨‍💼 Organizer: ${event.hostName}\n\nJoin us for an amazing experience!`;

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

  return (
    <>
      <TouchableWithoutFeedback onPress={() => handleLikeEvent(event.eventId)}>
        <View style={styles.eventCard}>
          <View style={styles.eventHeader}>
            <View style={styles.hostRow}>
              {event.hostProfileImage ? (
                <View style={styles.hostImageWrapper}>
                  <Image
                    source={{ uri: event.hostProfileImage }}
                    style={styles.hostImage}
                  />
                </View>
              ) : (
                <View style={styles.hostImagePlaceholder}>
                  <Icon name="account-circle" size={32} color="#bbb" />
                </View>
              )}
              <Text style={styles.organizerName}>{event.hostName}</Text>
            </View>

            <View style={styles.categoryInfoPrice}>
              <Text style={styles.categoryInfoText}>{event.categoryInfo.name}</Text>
              <Text style={styles.priceText}> · {event.price === 0 ? "Free" : event.price}</Text>
            </View>
          </View>

          <View style={styles.imageContainer}>
            <ImageGrid imageUrl={event.imageUrl || [event.imageUrl]} />
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
                    onPress={() => handleLikeEvent(event.eventId)}
                  >
                    <Icon 
                      name={isLiked ? "heart" : "heart-outline"} 
                      size={22} 
                      color={isLiked ? "#FF4A6D" : "#666"} 
                    />
                    <Text style={styles.actionCount}>{event.noOfLikes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={handleCommentPress}
                  >
                    <Icon name="comment-text-outline" size={22} color="#666" />
                    <Text style={styles.actionCount}>{event.noOfComments}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleShareEvent(event)}
                  >
                    <Icon name="share-variant-outline" size={22} color="#666" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={(() => {
                    if (isEventEnded) return [styles.joinButton, { backgroundColor: '#cccccc' }];
                    if (event.hostId?.toString() === currentUserId) return [styles.joinButton, { backgroundColor: '#22223b' }]; // Professional color
                    const member = event.joinedMembers?.find(
                      (m) => m.userId?.toString() === currentUserId
                    );
                    if (member) return [styles.joinButton, { backgroundColor: '#43a047' }]; // Green for status
                    return [styles.joinButton, { backgroundColor: '#2196F3' }]; // Blue for join
                  })()}
                  onPress={() => {
                    if (!isEventEnded) {
                      if (event.hostId?.toString() === currentUserId) {
                        navigation.navigate('ManageEventScreen', { event });
                      } else {
                        navigation.navigate('EventDetailScreen', { event });
                      }
                    }
                  }}
                  activeOpacity={isEventEnded ? 1 : 0.7}
                  disabled={isEventEnded}
                >
                  <Text style={(() => {
                    if (isEventEnded) return styles.joinButtonText;
                    if (event.hostId?.toString() === currentUserId) return [styles.joinButtonText, { color: '#fff' }];
                    const member = event.joinedMembers?.find(
                      (m) => m.userId?.toString() === currentUserId
                    );
                    if (member) return [styles.joinButtonText, { color: '#fff' }];
                    return styles.joinButtonText;
                  })()}>
                    {isEventEnded
                      ? 'Event Ended'
                      : event.hostId?.toString() === currentUserId
                        ? 'Manage Event'
                        : (() => {
                            const member = event.joinedMembers?.find(
                              (m) => m.userId?.toString() === currentUserId
                            );
                            return member ? member.status : 'Join';
                          })()
                    }
                  </Text>
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
              <Text style={styles.commentModalTitle}>Comments</Text>
              <TouchableOpacity onPress={handleCommentCancel}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            {/* Show all comments */}
            <View style={{ maxHeight: 180, marginBottom: 10 }}>
              {event.comments && event.comments.length > 0 ? (
                <ScrollView>
                  {event.comments.map((c, idx) => (
                    <View key={idx} style={{ marginBottom: 10, backgroundColor: '#f7f7f7', borderRadius: 8, padding: 8 }}>
                      <Text style={{ fontWeight: 'bold', color: '#2788ff' }}>{c.userName}</Text>
                      <Text style={{ color: '#222' }}>{c.message}</Text>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Text style={{ color: '#888', marginBottom: 10 }}>No comments yet.</Text>
              )}
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
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostImageWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  hostImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
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
  categoryInfoPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryInfoText: {
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
