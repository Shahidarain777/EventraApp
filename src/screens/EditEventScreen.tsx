
import React, { useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import ImageUploadCard from '../components/ImageUploadCard';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigation, useRoute } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import api from '../api/axios';
import LocationSelectorModal from '../components/LocationSelectorModal';

import Ionicons from 'react-native-vector-icons/Ionicons';

interface LocationData {
  type: 'venue' | 'online';
  // For venue
  venueName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  // For online
  link?: string;
  platform?: string;
}

const EditEventScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { event } = route.params as { event: any };
  const userId = useSelector((state: RootState) => state.auth.user?._id);
  const token = useSelector((state: RootState) => state.auth.token);
  const { categories, loading: categoriesLoading, error: categoriesError } = useSelector((state: RootState) => state.categories);

  // State for all event fields
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [images, setImages] = useState<string[]>(event?.imageUrl || []);
  const [title, setTitle] = useState(event?.title || '');
  const [categoryId, setCategoryId] = useState(event?.categoryId || null);
  const [showOtherCategory, setShowOtherCategory] = useState(false);
  const [otherCategory, setOtherCategory] = useState('');
  const [description, setDescription] = useState(event?.description || '');
  const [visibility, setVisibility] = useState(event?.visibility || 'public');
  const [approvalRequired, setApprovalRequired] = useState(event?.approvalRequired || 'no');
  const [capacity, setCapacity] = useState(event?.maxAttendees ? String(event.maxAttendees) : '');
  const [capacityStep, setCapacityStep] = useState(1);
  const [isPaid, setIsPaid] = useState(event?.isPaid || false);
  const [joiningFee, setJoiningFee] = useState(event?.price ? String(event.price) : '');
  const [currency, setCurrency] = useState(event?.currency || 'PKR');
  const [date, setDate] = useState({
    start: event?.dateTime?.start ? new Date(event.dateTime.start) : new Date(),
    end: event?.dateTime?.end ? new Date(event.dateTime.end) : new Date(),
  });
  const [subEvents, setSubEvents] = useState(event?.subEvents || []);
  const [error, setError] = useState('');

  if (!event) return <Text>Event not found.</Text>;
  if (event.hostId !== userId) return <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>Only the host can edit this event.</Text>;

  const handleCategoryChange = (value: string | null) => {
    if (value === 'Other') {
      setShowOtherCategory(true);
      setCategoryId(null);
      setOtherCategory('');
    } else {
      setShowOtherCategory(false);
      setCategoryId(value);
    }
  }

  const handleSubmit = async () => {

    // Validate location
    if (!locationData) return setError('Location is required');
    if (locationData.type === 'venue') {
      if (!locationData.address && !locationData.venueName) {
        return setError('Venue address or name is required');
      }
    } else if (locationData.type === 'online') {
      if (!locationData.link) {
        return setError('Online event link is required');
      }
    }


    let locationObj;
    if (locationData.type === 'venue') {
      locationObj = {
        type: 'venue',
        city: locationData.city || '',
        state: locationData.state || '',
        country: locationData.country || '',
        address: locationData.address || locationData.venueName || '',
        latitude: locationData.latitude || 0,
        longitude: locationData.longitude || 0,
        venueName: locationData.venueName || ''
      };
    } else {
      // For online events, only send online-specific fields
      locationObj = {
        type: 'online',
        link: locationData.link || '',
        platform: locationData.platform || '',
        // Explicitly set empty values for venue fields to avoid backend validation issues
        city: '',
        state: '',
        country: '',
        address: '',
        latitude: 0,
        longitude: 0,
        venueName: ''
      };
    }
    try {
      const body = {
        eventId: event.eventId,
        title: title.trim(),
        description: description.trim(),
        location: locationObj,
        categoryId,
        dateTime: {
          start: date.start ? date.start.toISOString() : undefined,
          end: date.end ? date.end.toISOString() : undefined,
        },
        isPaid,
        price: isPaid ? parseFloat(joiningFee) : 0,
        maxAttendees: capacity ? parseInt(capacity) : undefined,
        visibility,
        approvalRequired,
        imageUrl: images,
        currency,
        subEvents,
      };
      const res = await api.put('/events', { ...body, eventId: Number(event.eventId) }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Event updated!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update event');
    }
  };

  // Location handler
  const handleLocationSave = (data: LocationData) => {
    setLocationData(data);
    setLocationModalVisible(false);
  };

  // Get location display text
  const getLocationDisplayText = () => {
    if (!locationData) {
      return 'Set a location or an online event link';
    }
    
    if (locationData.type === 'venue') {
      if (locationData.venueName) {
        return locationData.venueName;
      }
      if (locationData.address) {
        return locationData.address;
      }
      if (locationData.city || locationData.state || locationData.country) {
        return [locationData.city, locationData.state, locationData.country]
          .filter(Boolean)
          .join(', ');
      }
      return 'Venue location set';
    } else {
      if (locationData.platform) {
        return `${locationData.platform} meeting`;
      }
      return 'Online event link set';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Edit Event</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {/* Event Images */}
      <View style={{ width: '100%', backgroundColor: '#f7f7f7', borderRadius: 20, padding: 24, marginBottom: 18, alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2788ff', marginBottom: 10 }}>Event Images</Text>
        <ImageUploadCard
          images={images}
          onAdd={() => {
            launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
              if (response.didCancel) return;
              if (response.errorCode) {
                Alert.alert('Error', response.errorMessage || 'Failed to pick image');
                return;
              }
              const uri = response.assets && response.assets[0]?.uri;
              if (uri) setImages([...images, uri]);
            });
          }}
          onRemove={idx => setImages(images.filter((_, i) => i !== idx))}
        />
      </View>
      <Text style={styles.label}>Event Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Event Title"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />
      <Text style={styles.label}>Category</Text>
      <RNPickerSelect
        placeholder={{
          label: categoriesLoading ? 'Loading categories...' : 'Select a category...',
          value: null,
          color: '#9EA0A4',
        }}
        style={{
          inputIOS: styles.input,
          inputAndroid: styles.input,
          placeholder: { color: '#888' },
        }}
        onValueChange={handleCategoryChange}
        value={showOtherCategory ? 'Other' : categoryId}
        items={
          [
            ...(categories || [])
              .filter(cat => cat.status === 'approve')
              .map(cat => ({ label: cat.categoryName, value: cat.categoryId.toString() })),
            { label: 'Other', value: 'Other' },
          ]
        }
      />
      {showOtherCategory && (
        <TextInput
          style={styles.input}
          placeholder="Other Category"
          placeholderTextColor="#888"
          value={otherCategory}
          onChangeText={setOtherCategory}
        />
      )}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.textarea}
        placeholder="Description"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />
      <Text style={styles.label}>Event Location</Text>
        <TouchableOpacity
          style={styles.locationCard}
          onPress={() => setLocationModalVisible(true)}
        >
          <View style={styles.locationCardContent}>
            <Ionicons 
              name={locationData?.type === 'online' ? 'link-outline' : 'location-outline'} 
              size={24} 
              color="#888" 
              style={styles.locationIcon}
            />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationTitle}>Location</Text>
              <Text style={styles.locationSubtitle}>
                {getLocationDisplayText()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </View>
        </TouchableOpacity>
      <Text style={styles.label}>Visibility</Text>
      <View style={{ flexDirection: 'row', width: '100%', marginBottom: 14, justifyContent: 'space-between' }}>
        <TouchableOpacity
          style={[{ flex: 1, backgroundColor: '#f0f0f0', borderRadius: 10, paddingVertical: 10, marginHorizontal: 4, alignItems: 'center' }, visibility === 'public' && { backgroundColor: '#2788ff' }]}
          onPress={() => setVisibility('public')}
        >
          <Text style={{ color: '#222', fontWeight: '600', fontSize: 15 }}>Public</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[{ flex: 1, backgroundColor: '#f0f0f0', borderRadius: 10, paddingVertical: 10, marginHorizontal: 4, alignItems: 'center' }, visibility === 'private' && { backgroundColor: '#2788ff' }]}
          onPress={() => setVisibility('private')}
        >
          <Text style={{ color: '#222', fontWeight: '600', fontSize: 15 }}>Private</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Approval</Text>
      <View style={{ flexDirection: 'row', width: '100%', marginBottom: 14, justifyContent: 'space-between' }}>
        <TouchableOpacity
          style={[{ flex: 1, backgroundColor: '#f0f0f0', borderRadius: 10, paddingVertical: 10, marginHorizontal: 4, alignItems: 'center' }, approvalRequired === 'yes' && { backgroundColor: '#2788ff' }]}
          onPress={() => setApprovalRequired('yes')}
        >
          <Text style={{ color: '#222', fontWeight: '600', fontSize: 15 }}>Approval Required</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[{ flex: 1, backgroundColor: '#f0f0f0', borderRadius: 10, paddingVertical: 10, marginHorizontal: 4, alignItems: 'center' }, approvalRequired === 'no' && { backgroundColor: '#2788ff' }]}
          onPress={() => setApprovalRequired('no')}
        >
          <Text style={{ color: '#222', fontWeight: '600', fontSize: 15 }}>Anyone Can Join</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Capacity</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 14, backgroundColor: '#f7f7f7', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', paddingHorizontal: 10, paddingVertical: 2 }}>
        <TouchableOpacity
          style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#eaf0fa', justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#dbe6fa' }}
          onPress={() => {
            const val = Math.max(0, (parseInt(capacity) || 0) - 1);
            setCapacity(val.toString());
          }}
        >
          <Text style={{ color: '#2788ff', fontWeight: 'bold', fontSize: 18 }}>-</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => {
              const val = (parseInt(capacity) || 0) + capacityStep;
              setCapacity(val.toString());
            }}
          >
            <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
        <TextInput
          style={[{ flex: 1, backgroundColor: 'transparent', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, fontSize: 16, color: '#222', fontWeight: '500', textAlign: 'center', minWidth: 60 }]}
          placeholder="Max attendees"
          placeholderTextColor="#888"
          value={capacity}
          onChangeText={text => { if (/^\d*$/.test(text)) setCapacity(text); }}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#eaf0fa', justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#dbe6fa' }}
          onPress={() => {
            const val = (parseInt(capacity) || 0) + 1;
            setCapacity(val.toString());
          }}
        >
          <Text style={{ color: '#2788ff', fontWeight: 'bold', fontSize: 18 }}>+</Text>
        </TouchableOpacity>
      </View>
      {/* Paid toggle and fee input */}
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <Text style={[styles.label, { flex: 1 }]}>Is Paid?</Text>
        <Switch
          value={isPaid}
          onValueChange={setIsPaid}
          trackColor={{ false: '#e0e0e0', true: '#007BFF' }}
          thumbColor={isPaid ? '#007BFF' : '#fff'}
        />
      </View>
      {isPaid && (
        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 14, backgroundColor: '#f7f7f7', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', paddingHorizontal: 10, paddingVertical: 2 }}>
          {/* Currency Dropdown */}
          <TouchableOpacity style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#eaf0fa', borderRadius: 8, marginRight: 6, borderWidth: 1, borderColor: '#dbe6fa' }} onPress={() => setCurrency(currency === 'PKR' ? 'USD' : 'PKR')}>
            <Text style={{ color: '#2788ff', fontWeight: 'bold', fontSize: 16 }}>{currency}</Text>
          </TouchableOpacity>
          {/* Amount Input with Stepper Dropdown */}
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 }}>
            <TouchableOpacity
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#eaf0fa', justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#dbe6fa' }}
              onPress={() => {
                const val = Math.max(0, (parseInt(joiningFee) || 0) - 1);
                setJoiningFee(val.toString());
              }}
            >
              <Text style={{ color: '#2788ff', fontWeight: 'bold', fontSize: 18 }}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={[{ flex: 1, backgroundColor: 'transparent', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, fontSize: 16, color: '#222', fontWeight: '500', textAlign: 'center', minWidth: 60 }]}
              placeholder="Amount"
              placeholderTextColor="#888"
              value={joiningFee}
              onChangeText={text => {
                if (/^\d*$/.test(text)) setJoiningFee(text);
              }}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#eaf0fa', justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#dbe6fa' }}
              onPress={() => {
                const val = (parseInt(joiningFee) || 0) + 1;
                setJoiningFee(val.toString());
              }}
            >
              <Text style={{ color: '#2788ff', fontWeight: 'bold', fontSize: 18 }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Sub Events section - you can use your sub-event logic here */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSave={handleLocationSave}
        initialData={locationData || undefined}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: '6%',
    backgroundColor: '#f7faff',
    flexGrow: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    alignSelf: 'center',
  },
  label: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#222',
    fontWeight: '500',
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eaf0fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#dbe6fa',
  },
  stepBtnText: {
    color: '#2788ff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  textarea: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 70,
    maxHeight: 120,
    color: '#222',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    backgroundColor: '#2788ff',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  error: {
    color: '#d9534f',
    marginBottom: 10,
    fontSize: 15,
    alignSelf: 'center',
  },

  // Location Card Styles
  locationCard: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  locationCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#888',
  },
});

export default EditEventScreen;
