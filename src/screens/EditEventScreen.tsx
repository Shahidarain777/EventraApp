
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { RootState } from '../redux/store';
import { useNavigation, useRoute } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import api from '../api/axios';

const EditEventScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { event } = route.params as { event: any };
  const userId = useSelector((state: RootState) => state.auth.user?._id);
  const token = useSelector((state: RootState) => state.auth.token);
  const { categories, loading: categoriesLoading, error: categoriesError } = useSelector((state: RootState) => state.categories);

  // State for all event fields
  const [images, setImages] = useState<string[]>(event?.imageUrl || []);
  const [title, setTitle] = useState(event?.title || '');
  const [categoryId, setCategoryId] = useState(event?.categoryId || null);
  const [showOtherCategory, setShowOtherCategory] = useState(false);
  const [otherCategory, setOtherCategory] = useState('');
  const [description, setDescription] = useState(event?.description || '');
  const [latitude, setLatitude] = useState(event?.location?.latitude ? String(event.location.latitude) : '');
  const [longitude, setLongitude] = useState(event?.location?.longitude ? String(event.location.longitude) : '');
  const [country, setCountry] = useState(event?.location?.country || '');
  const [stateVal, setStateVal] = useState(event?.location?.state || '');
  const [city, setCity] = useState(event?.location?.city || '');
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
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [subEvents, setSubEvents] = useState(event?.subEvents || []);
  const [error, setError] = useState('');
  const [mapModalVisible, setMapModalVisible] = useState(false);

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
    try {
      const body = {
        eventId: event.eventId,
        title: title.trim(),
        description: description.trim(),
        location: {
          city,
          state: stateVal,
          country,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
        },
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

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Edit Event</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {/* Event Images */}
      <View style={{ width: '100%', backgroundColor: '#f7f7f7', borderRadius: 20, padding: 24, marginBottom: 18, alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2788ff', marginBottom: 10 }}>Event Images</Text>
        {/* Add your ImageUploadCard here, similar to CreateEventScreen */}
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
        style={{width: '100%', backgroundColor: '#007BFF', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 14}}
        onPress={() => setMapModalVisible(true)}
      >
        <Text style={{color: '#fff', fontWeight: '600', fontSize: 16}}>Pick Location on Map</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 14 }}>
        <TextInput
          style={{ width: '48%', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0', color: '#222', fontWeight: '500' }}
          placeholder="Latitude"
          placeholderTextColor="#888"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="numeric"
        />
        <TextInput
          style={{ width: '48%', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0', color: '#222', fontWeight: '500' }}
          placeholder="Longitude"
          placeholderTextColor="#888"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numeric"
        />
      </View>
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
});

export default EditEventScreen;
