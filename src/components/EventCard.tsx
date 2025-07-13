import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Event } from '../redux/slices/eventSlice';

interface EventCardProps {
  item: Event;
  isLiking: boolean;
  likeButtonAnimation: Animated.Value;
  handleDoubleTap: () => void;
  handleLikeEvent: (id: string) => void;
  lastLikedEventId: string | null;
  likeAnimationValue: Animated.Value;
}

const EventCard = ({
  item,
  isLiking,
  likeButtonAnimation,
  handleDoubleTap,
  handleLikeEvent,
  lastLikedEventId,
  likeAnimationValue
}: EventCardProps) => {
  
  // Animation styles for the like button
  const likeButtonAnimatedStyle = {
    transform: [{ scale: likeButtonAnimation }]
  };

  return (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.organizerName}>{item.organizer}</Text>
        <View style={styles.categoryPrice}>
          <Text style={styles.categoryText}>{item.category}</Text>
          <Text style={styles.priceText}> · {item.price}</Text>
        </View>
      </View>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={handleDoubleTap}
      >
        <View style={{ position: 'relative' }}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.eventImage} 
            resizeMode="cover" 
            defaultSource={require('../../assets/EventraLogo.png')} 
          />
          
          {/* Heart overlay animation on double tap like */}
          {lastLikedEventId === item.id && (
            <Animated.View 
              style={[
                styles.heartOverlay,
                {
                  opacity: likeAnimationValue.interpolate({
                    inputRange: [0, 0.3, 0.6, 1],
                    outputRange: [0, 1, 0.8, 0]
                  }),
                  transform: [{
                    scale: likeAnimationValue.interpolate({
                      inputRange: [0, 0.3, 0.6, 1],
                      outputRange: [0.3, 1.2, 1, 0.8]
                    })
                  }]
                }
              ]}
            >
              <Icon name="cards-heart" size={80} color="white" />
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
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
              disabled={isLiking}
            >
              {isLiking ? (
                <ActivityIndicator size="small" color="#FF4A6D" style={{ width: 22, height: 22 }} />
              ) : (
                <Animated.View style={likeButtonAnimatedStyle}>
                  <Icon 
                    name={item.isLiked ? "cards-heart" : "cards-heart-outline"} 
                    size={22} 
                    color={item.isLiked ? "#FF4A6D" : "#666"} 
                  />
                </Animated.View>
              )}
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
  heartOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  }
});

export default EventCard;
