import React, { useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigation, useRoute } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import api from '../api/axios';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DateTimeSelector from '../components/DateTimeSelector';
import ImageUploadCard from '../components/ImageUploadCard';
import LocationSelectorModal from '../components/LocationSelectorModal';

interface LocationData {
  type: 'venue' | 'online';
  venueName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  link?: string;
  platform?: string;
}

const EditEventScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { event } = route.params as { event: any };
  const userId = useSelector((state: RootState) => state.auth.user?._id);
  const token = useSelector((state: RootState) => state.auth.token);
  const { categories, loading: categoriesLoading } = useSelector((state: RootState) => state.categories);

  const [locationData, setLocationData] = useState<LocationData | null>(
    event?.location
      ? {
          ...event.location,
          type: event.location.type || (event.location.link ? 'online' : 'venue'),
        }
      : null
  );
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
  // Remove main event capacity and joining fee logic
  // const [capacityStep] = useState(1);
  // const [isPaid, setIsPaid] = useState(event?.isPaid || false);
  // const [joiningFee, setJoiningFee] = useState(event?.price ? String(event.price) : '');
  // const [currency, setCurrency] = useState(event?.currency || 'PKR');
  const [date, setDate] = useState({
    start: event?.dateTime?.start ? new Date(event.dateTime.start) : new Date(),
    end: event?.dateTime?.end ? new Date(event.dateTime.end) : new Date(),
  });
  const [subEvents, setSubEvents] = useState<Array<{
    itemName: string;
    maxAttendees: string;
    fee: string;
    isPaid: boolean;
  }>>(event?.subEvents || []);
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
  };

  const handleSubmit = async () => {
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
      locationObj = {
        type: 'online',
        link: locationData.link || '',
        platform: locationData.platform || '',
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
        visibility,
        approvalRequired,
        imageUrl: images,
        subEvents,
      };
      await api.put('/events', { ...body, eventId: Number(event.eventId) }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Event updated!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update event');
    }
  };

  const addSubEvent = () => {
    setSubEvents(prev => [
      ...prev,
      { itemName: '', maxAttendees: '', fee: '', isPaid: false }
    ]);
  };

  const removeSubEvent = (index: number) => {
    setSubEvents(prev => prev.filter((_, i) => i !== index));
  };

  const updateSubEvent = (index: number, field: string, value: string | boolean) => {
    setSubEvents(prev => prev.map((event, i) =>
      i === index ? { ...event, [field]: value } : event
    ));
  };

  const handleLocationSave = (data: LocationData) => {
    setLocationData(data);
    setLocationModalVisible(false);
  };

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
      <DateTimeSelector
        startDate={date.start}
        endDate={date.end}
        onStartDateChange={d => setDate(prev => ({ ...prev, start: d }))}
        onEndDateChange={d => setDate(prev => ({ ...prev, end: d }))}
      />
      <Text style={styles.label}>Sub Events</Text>
      {subEvents.map((subEvent, index) => (
        <View key={index} style={styles.subEventCardStyle}>
          <View style={styles.subEventHeaderStyle}>
            <Text style={styles.subEventTitleStyle}>Sub Event {index + 1}</Text>
            <TouchableOpacity onPress={() => removeSubEvent(index)}>
              <Ionicons name="close-circle" size={24} color="#ed6462" />
            </TouchableOpacity>
          </View>
          <View style={styles.subEventRowStyle}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subEventLabelStyle}>Max Attendees</Text>
              <TextInput
                style={styles.subEventInputStyle}
                placeholder="Max attendees"
                placeholderTextColor="#bbb"
                value={subEvent.maxAttendees !== undefined && subEvent.maxAttendees !== null ? String(subEvent.maxAttendees) : ''}
                onChangeText={text => {
                  if (/^\d*$/.test(text)) updateSubEvent(index, 'maxAttendees', text);
                }}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.subEventLabelStyle}>Fee</Text>
              <TextInput
                style={styles.subEventInputStyle}
                placeholder="Fee"
                placeholderTextColor="#bbb"
                value={subEvent.fee !== undefined && subEvent.fee !== null ? String(subEvent.fee) : ''}
                onChangeText={text => {
                  if (/^\d*$/.test(text)) {
                    updateSubEvent(index, 'fee', text);
                    updateSubEvent(index, 'isPaid', parseInt(text) > 0);
                  }
                }}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.subEventFullRowStyle}>
            <Text style={styles.subEventLabelStyle}>Item Name</Text>
            <TextInput
              style={styles.subEventInputFullStyle}
              placeholder="e.g., Jazz Band, Food Stall"
              placeholderTextColor="#bbb"
              value={subEvent.itemName !== undefined && subEvent.itemName !== null ? String(subEvent.itemName) : ''}
              onChangeText={text => updateSubEvent(index, 'itemName', text)}
            />
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addSubEventBtnStyle} onPress={addSubEvent}>
        <Ionicons name="add-circle" size={24} color="#2788ff" />
        <Text style={styles.addSubEventBtnTextStyle}>Add Sub-Event</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
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
  subEventCardStyle : {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 18,
    borderWidth: 1.2,
    borderColor: '#e6eaf3',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  subEventHeaderStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subEventTitleStyle : {
    fontWeight: 'bold',
    fontSize: 15,
    flex: 1,
    color: '#1a1d21ff',
  },
  subEventRowStyle : {
    flexDirection: 'row',
    marginBottom: 10,
  },
  subEventLabelStyle : {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    color: '#1a1c21ff',
  },
  subEventInputStyle:{
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6eaf3',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    marginBottom: 0,
  },
  subEventFullRowStyle: {
    marginBottom: 0,
  },
  subEventInputFullStyle :{
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6eaf3',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    marginBottom: 0,
    marginTop: 2,
  },
  addSubEventBtnStyle :{
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#b3d8ff',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: '#fafdff',
  },
  addSubEventBtnTextStyle : {
    color: '#2788ff',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 16,
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
    borderRadius: 30,
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