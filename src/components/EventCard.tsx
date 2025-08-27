import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { Image } from 'react-native';
import ViewShot from 'react-native-view-shot';
import RNShare from 'react-native-share';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  TextInput,
  Share,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootState, AppDispatch } from '../redux/store';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigations';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { likeEvent, addComment, Event } from '../redux/slices/eventSlice';
import ImageGrid from '../components/ImageGrid';
import ImageViewing from 'react-native-image-viewing';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type EventCardProps = {
  event: Event;
  showJoin?: boolean;
  showActions?: boolean;
};

const getJoinButtonText = (status: string | undefined) => {
  switch (status) {
    case 'member':
      return 'Member';
    case 'approval_pending':
      return 'Awaiting Approval';
    case 'payment_pending':
      return 'Payment Pending';
    case 'payment_verification_pending':
      return 'Payment Verification';
    case 'canceled':
      return 'Join';
    default:
      return 'Join';
  }
};

const EventCard = ({
  event,
  showJoin = true,
  showActions = true,
}: EventCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUserId = useSelector((state: RootState) => state.auth.user?._id?.toString() || '');
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(Array.isArray(event.likedBy) ? event.likedBy.length : 0);
  const [localIsLiked, setLocalIsLiked] = useState(
    Array.isArray(event.likedBy)
      ? event.likedBy.some((u) => u.id?.toString() === currentUserId)
      : false
  );
  const [localCommentCount, setLocalCommentCount] = useState(event.noOfComments);
  const [localComments, setLocalComments] = useState(event.comments || []);
  const heartAnimation = useRef(new Animated.Value(0)).current;
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const isLong = event.description && event.description.length > 100;
  const navigation = useNavigation<NavigationProp>();

  // Sync localIsLiked with backend on mount or when event changes
  useEffect(() => {
    const liked = Array.isArray(event.likedBy)
      ? event.likedBy.some((u) => u.id?.toString() === currentUserId)
      : false;
    setLocalIsLiked(liked);
  }, [event, currentUserId]);


  const isLiked =
    Array.isArray(event.likedBy)
      ? event.likedBy.some((u) => u.id?.toString() === currentUserId)
      : false;

  const handleLikeEvent = async (eventId: string | number) => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      await dispatch(likeEvent(eventId)).unwrap();
      // Locally update like status/count
      if (!localIsLiked) {
        setLocalLikeCount((prev) => prev + 1);
        setLocalIsLiked(true);
        triggerHeartAnimation();
      } else {
        setLocalLikeCount((prev) => (prev > 0 ? prev - 1 : 0));
        setLocalIsLiked(false);
      }
    } catch (error) {
      // No alert message, just reset loading
    }
    setLikeLoading(false);
  };

  const handleCommentPress = () => {
    setCommentModalVisible(true);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || commentLoading) return;
    setCommentLoading(true);
    try {
      await dispatch(
        addComment({
          eventId: event.eventId,
          comment: commentText.trim(),
        })
      ).unwrap();
      // Locally update comment count and comments
      setLocalCommentCount((prev) => prev + 1);
      setLocalComments((prev) => [
        ...prev,
        {
          userName: 'You',
          message: commentText.trim(),
          profileImage: '', // You can update with actual user profile image if available
        },
      ]);
      setCommentText('');
      setCommentModalVisible(false);
    } catch (error) {
      // No alert message
    }
    setCommentLoading(false);
  };

  const isEventEnded = (() => {
    if (!event.dateTime?.end) return false;
    const endDate = new Date(event.dateTime.end);
    return endDate < new Date();
  })();

  const handleCommentCancel = () => {
    setCommentText('');
    setCommentModalVisible(false);
  };

  const viewShotRef = useRef<React.ElementRef<typeof ViewShot>>(null);
  const [isSharing, setIsSharing] = useState(false);
  const APK_LINK = 'https://drive.google.com/file/d/1enCFvJTr3jqIkbAVZ5gOmw2AnlECkhpT/view?usp=sharing'; // Replace with your actual APK link
  const handleShareEvent = async () => {
    try {
      setIsSharing(true);
      if (viewShotRef.current && typeof viewShotRef.current.capture === 'function') {
        const uri = await viewShotRef.current.capture();
        await RNShare.open({
          url: uri,
          message: `Install the app: ${APK_LINK}`,
        });
      }
    } catch (error) {
      // Optionally handle error
    } finally {
      setIsSharing(false);
    }
  };

  // Normalize image URLs for ImageGrid and viewer
  const normalizedImages: string[] = (() => {
    const base = api.defaults.baseURL?.replace(/\/api$/, '') || '';
    const list: unknown = (event as any).imageUrl;
    const arr = Array.isArray(list) ? list : list ? [list] : [];
    return arr
      .filter((u): u is string => typeof u === 'string' && !!u)
      .map((url) => {
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) return `${base}${url}`;
        if (url.startsWith('/')) return `${base}/uploads${url}`;
        return `${base}/uploads/${url}`;
      });
  })();

  const handleImagePress = (index: number) => {
    if (!normalizedImages.length) return;
    setViewerIndex(index);
    setViewerVisible(true);
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

  // Helper to get relative time string
  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return '';
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hour${Math.floor(diffSec / 3600) > 1 ? 's' : ''} ago`;
    if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)} day${Math.floor(diffSec / 86400) > 1 ? 's' : ''} ago`;
    return created.toLocaleDateString();
  };

  return (
    <>
  <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.95 }} style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={styles.hostRow}>
            {event.hostProfileImage ? (
              <View style={styles.hostImageWrapper}>
                <Image
                  source={{
                    uri: (() => {
                      if (event.hostProfileImage.startsWith('http')) return event.hostProfileImage;
                      if (event.hostProfileImage.startsWith('/uploads')) {
                        return `${api.defaults.baseURL?.replace(/\/api$/, '')}${event.hostProfileImage}`;
                      }
                      if (event.hostProfileImage.startsWith('/')) {
                        return `${api.defaults.baseURL?.replace(/\/api$/, '')}/uploads${event.hostProfileImage}`;
                      }
                      return `${api.defaults.baseURL?.replace(/\/api$/, '')}/uploads/${event.hostProfileImage}`;
                    })(),
                  }}
                  style={styles.hostImage}
                />
              </View>
            ) : (
              <View style={styles.hostImagePlaceholder}>
                <Icon name="account-circle" size={32} color="#bbb" />
              </View>
            )}
            <View>
              <Text style={styles.organizerName}>{event.hostName}</Text>
              <Text style={styles.createdTime}>{getRelativeTime(event.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.categoryInfoPrice}>
            <Text style={styles.categoryInfoText}>{event.categoryInfo.name}</Text>
            <Text style={styles.priceText}> · {event.price === 0 ? 'Free' : event.price}</Text>
          </View>
        </View>

        <View style={styles.imageContainer}>
          <ImageGrid imageUrl={normalizedImages} onImagePress={handleImagePress} />
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
            <Text style={styles.eventDescription} numberOfLines={isSharing ? undefined : (expanded ? undefined : 2)}>
              {event.description}
            </Text>
            {!isSharing && isLong && (
              <TouchableOpacity onPress={() => setExpanded((e) => !e)}>
                <Text style={styles.seeMoreText}>{expanded ? 'see less' : 'see more'}</Text>
              </TouchableOpacity>
            )}
          </View>
          {!isSharing && showActions && (
            <View style={styles.eventActions}>
              <View style={styles.socialActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLikeEvent(event.eventId)}
                  disabled={likeLoading}
                >
                  {likeLoading ? (
                    <ActivityIndicator size={18} color="#FF4A6D" style={{ marginRight: 4 }} />
                  ) : (
                    <Icon
                      name={localIsLiked ? 'heart' : 'heart-outline'}
                      size={22}
                      color={localIsLiked ? '#FF4A6D' : '#666'}
                    />
                  )}
                  <Text style={styles.actionCount}>{localLikeCount}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleCommentPress}
                >
                  <Icon name="chatbubbles-outline" size={22} color="#666" />
                  <Text style={styles.actionCount}>{localCommentCount}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShareEvent}
                >
                  <Icon name="paper-plane-outline" size={22} color="#666" />
                </TouchableOpacity>
              </View>
              {showJoin && (
                <TouchableOpacity
                  style={(() => {
                    if (isEventEnded) return [styles.joinButton, { backgroundColor: '#cccccc' }];
                    if (event.hostId?.toString() === currentUserId)
                      return [styles.joinButton, { backgroundColor: '#4874e2ff' }];
                    const member = event.joinedMembers?.find(
                      (m) => m.userId?.toString() === currentUserId
                    );
                    if (member) return [styles.joinButton, { backgroundColor: '#43a047' }];
                    return [styles.joinButton, { backgroundColor: '#2196F3' }];
                  })()}
                  onPress={() => {
                    if (isEventEnded) {
                      if (event.hostId?.toString() === currentUserId) {
                        navigation.navigate('ManageEventScreen', { event });
                      }
                      // If not host, do nothing when event ended
                    } else {
                      if (event.hostId?.toString() === currentUserId) {
                        navigation.navigate('ManageEventScreen', { event });
                      }
                      else if (event.joinedMembers?.some((m) => m.status?.toString() === "payment_pending")) {
                        navigation.navigate('InvoiceScreen', { event });
                      }
                      // else if (event.hostId?.toString() === currentUserId) {
                      //   navigation.navigate('ManageEventScreen', { event });
                      // }
                      else {
                        navigation.navigate('EventDetailScreen', { event });
                      }
                    }
                  }}
                  activeOpacity={isEventEnded ? 1 : 0.7}
                  disabled={isEventEnded}
                >
                  <Text
                    style={(() => {
                      if (isEventEnded) return styles.joinButtonText;
                      if (event.hostId?.toString() === currentUserId)
                        return [styles.joinButtonText, { color: '#fff' }];
                      const member = event.joinedMembers?.find(
                        (m) => m.userId?.toString() === currentUserId
                      );
                      if (member) return [styles.joinButtonText, { color: '#fff' }];
                      return styles.joinButtonText;
                    })()}
                  >
                    {isEventEnded
                      ? 'Event Ended'
                      : event.hostId?.toString() === currentUserId
                      ? 'Manage Event'
                      : (() => {
                          const member = event.joinedMembers?.find(
                            (m) => m.userId?.toString() === currentUserId
                          );
                          return member && member.userId?.toString() === currentUserId
                            ? getJoinButtonText(member.status)
                            : 'Join';
                        })()}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
  </ViewShot>
      {/* Fullscreen Image Viewer */}
      <ImageViewing
        images={normalizedImages.map((uri) => ({ uri }))}
        imageIndex={viewerIndex}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
        onImageIndexChange={(idx) => setViewerIndex(idx)}
        backgroundColor="#000"
        presentationStyle="fullScreen"
        swipeToCloseEnabled
        doubleTapToZoomEnabled
        FooterComponent={({ imageIndex }) => (
          <View style={viewerStyles.footer}>
            <Text style={viewerStyles.footerText}>{`${imageIndex + 1}/${normalizedImages.length}`}</Text>
          </View>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={handleCommentCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fbCommentModalContainer}>
            <View style={styles.fbCommentModalHeader}>
              <Text style={styles.fbCommentModalTitle}>Comments</Text>
              <TouchableOpacity onPress={handleCommentCancel}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.fbCommentsList}>
              {localComments && localComments.length > 0 ? (
                <ScrollView>
                  {localComments.map((c, idx) => (
                    <View key={idx} style={styles.fbCommentItem}>
                      <View style={styles.fbCommentAvatar}>
                        {c.profileImage ? (
                          <Image
                            source={{
                              uri: (() => {
                                if (c.profileImage.startsWith('http')) return c.profileImage;
                                if (c.profileImage.startsWith('/uploads')) {
                                  return `${api.defaults.baseURL?.replace(/\/api$/, '')}${c.profileImage}`;
                                }
                                if (c.profileImage.startsWith('/')) {
                                  return `${api.defaults.baseURL?.replace(/\/api$/, '')}/uploads${c.profileImage}`;
                                }
                                return `${api.defaults.baseURL?.replace(/\/api$/, '')}/uploads/${c.profileImage}`;
                              })(),
                            }}
                            style={{ width: 32, height: 32, borderRadius: 16 }}
                          />
                        ) : (
                          <Icon name="person-circle" size={32} color="#bbb" />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fbCommentUser}>{c.userName}</Text>
                        <Text style={styles.fbCommentText}>{c.message}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.fbNoComments}>No comments yet.</Text>
              )}
            </View>
            <View style={styles.fbCommentInputRow}>
              
              <TextInput
                style={styles.fbCommentInput}
                placeholder="Write a comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
                numberOfLines={1}
                textAlignVertical="center"
                autoFocus
              />
              <TouchableOpacity
                style={styles.fbSendButton}
                onPress={handleCommentSubmit}
                disabled={commentLoading}
              >
                {commentLoading ? (
                  <ActivityIndicator size={20} color="#fff" />
                ) : (
                  <Icon name="send" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default EventCard;

// ...styles unchanged, same as your provided styles...

const styles = StyleSheet.create({
  createdTime: {
    fontSize: 12,
    color: '#888',
    marginTop: -3,
  },
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
    marginTop: 0,
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
  fbCommentModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 10,
    paddingBottom: 0,
    maxHeight: '80%',
    width: '100%',
    alignSelf: 'center',
  },
  fbCommentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 10,
  },
  fbCommentModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  fbCommentsList: {
    maxHeight: 220,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  fbCommentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 8,
  },
  fbCommentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  fbCommentUser: {
    fontWeight: 'bold',
    color: '#2788ff',
    fontSize: 14,
    marginBottom: 2,
  },
  fbCommentText: {
    color: '#222',
    fontSize: 14,
  },
  fbNoComments: {
    color: '#888',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  fbCommentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#fff',
    marginTop: 2,
  },
  fbCommentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#f7f7f7',
    color: '#000',
    marginRight: 8,
    minHeight: 40,
    maxHeight: 80,
  },
  fbSendButton: {
    backgroundColor: '#007BFF',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  // submitButtonText: {
  //   color: '#fff',
  //   fontSize: 16,
  //   fontWeight: '600',
  // },
});

const viewerStyles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
