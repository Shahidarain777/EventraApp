import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { createEvent } from '../redux/slices/eventSlice';
import { launchImageLibrary } from 'react-native-image-picker';
import AddressPicker from '../components/AddressPicker';
// @ts-ignore
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

const categoriesPreset = [
  'Technology',
  'Health & Wellness',
  'Education',
  'Sports & Fitness',
  'Business & Networking',
  'Arts & Culture',
  'Food & Drink',
  'Music & Entertainment',
];

const CreateEventScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const eventError = useSelector((state: RootState) => state.events.error);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [categoryOptions, setCategoryOptions] = useState(categoriesPreset);
  const [showOtherCategory, setShowOtherCategory] = useState(false);
  const [otherCategory, setOtherCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [approvalRequired, setApprovalRequired] = useState('no');
  const [capacity, setCapacity] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [joiningFee, setJoiningFee] = useState('');
  const [date, setDate] = useState({ start: new Date(), end: new Date() });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [error, setError] = useState('');

  const handleCategoryChange = (text: string) => {
    setCategory(text);
    if (!categoriesPreset.includes(text) && text.length > 0) {
      setShowOtherCategory(true);
    } else {
      setShowOtherCategory(false);
      setOtherCategory('');
    }
  };

  const handleImagePick = async () => {
    launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5,
      quality: 0.7,
    }, (response) => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets) {
        setImages([...images, ...response.assets.map(a => a.uri || '')]);
      }
    });
  };


  const handleDateChange = (
    type: 'start' | 'end',
    _event: unknown,
    selectedDate?: Date | undefined
  ) => {
    if (type === 'start') {
      setShowStartPicker(false);
      if (selectedDate) setDate((prev) => ({ ...prev, start: selectedDate }));
    } else {
      setShowEndPicker(false);
      if (selectedDate) setDate((prev) => ({ ...prev, end: selectedDate }));
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) return setError('Event title is required');
    if (!category.trim() && !otherCategory.trim()) return setError('Category is required');
    if (!description.trim()) return setError('Description is required');
    if (!country || !state || !city) return setError('Complete address required');
    if (!latitude || !longitude) return setError('Latitude and Longitude required');
    if (!date.start || !date.end) return setError('Start and End date required');
    if (isPaid && !joiningFee) return setError('Joining fee required for paid event');
    setUploading(true);

    // Prepare event data for API
    const eventData = {
      title,
      description,
      price: isPaid ? joiningFee : 'Free',
      image: images[0] || '', // Only first image for now
      organizer: '', // You can set organizer from user state if needed
      date: date.start.toISOString(),
      category: showOtherCategory ? otherCategory : category,
      isLiked: false,
      // Add any other fields your API expects
      country,
      state,
      city,
      latitude,
      longitude,
      visibility,
      approvalRequired,
      capacity,
      endDate: date.end.toISOString(),
    };

    try {
      const resultAction = await dispatch(createEvent(eventData));
      if (createEvent.fulfilled.match(resultAction)) {
        setUploading(false);
        navigation.goBack();
      } else {
        setUploading(false);
        setError(resultAction.payload as string || 'Failed to create event');
      }
    } catch (err: any) {
      setUploading(false);
      setError(err.message || 'Failed to create event');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Create Event</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {eventError ? <Text style={styles.error}>{eventError}</Text> : null}
      <Text style={styles.label}>Event Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter event title"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        placeholder="Select or type category"
        value={category}
        onChangeText={handleCategoryChange}
      />
      {showOtherCategory && (
        <TextInput
          style={styles.input}
          placeholder="Enter new category"
          value={otherCategory}
          onChangeText={setOtherCategory}
        />
      )}
      <View style={styles.categoryListRow}>
        {categoriesPreset.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, category === cat && styles.categoryChipSelected]}
            onPress={() => handleCategoryChange(cat)}
          >
            <Text style={styles.categoryChipText}>{cat}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.categoryChip, showOtherCategory && styles.categoryChipSelected]}
          onPress={() => setShowOtherCategory(true)}
        >
          <Text style={styles.categoryChipText}>Other</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.textarea}
        placeholder="Describe your event"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Upload Event Images</Text>
      <View style={styles.imageRow}>
        {images.map((img, idx) => (
          <Image key={idx} source={{ uri: img }} style={styles.eventImage} />
        ))}
        <TouchableOpacity style={styles.addImageBtn} onPress={handleImagePick}>
          <Ionicons name="add" size={28} color="#007BFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Location</Text>
      <AddressPicker
        country={country}
        state={state}
        city={city}
        setCountry={setCountry}
        setState={setState}
        setCity={setCity}
      />
      <View style={styles.latLngRow}>
        <TextInput
          style={styles.latLngInput}
          placeholder="Latitude"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.latLngInput}
          placeholder="Longitude"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.label}>Visibility</Text>
      <View style={styles.rowBtns}>
        <TouchableOpacity
          style={[styles.toggleBtn, visibility === 'public' && styles.toggleBtnActive]}
          onPress={() => setVisibility('public')}
        >
          <Text style={styles.toggleBtnText}>Public</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, visibility === 'private' && styles.toggleBtnActive]}
          onPress={() => setVisibility('private')}
        >
          <Text style={styles.toggleBtnText}>Private</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Approval</Text>
      <View style={styles.rowBtns}>
        <TouchableOpacity
          style={[styles.toggleBtn, approvalRequired === 'yes' && styles.toggleBtnActive]}
          onPress={() => setApprovalRequired('yes')}
        >
          <Text style={styles.toggleBtnText}>Approval Required</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, approvalRequired === 'no' && styles.toggleBtnActive]}
          onPress={() => setApprovalRequired('no')}
        >
          <Text style={styles.toggleBtnText}>Anyone Can Join</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Capacity</Text>
      <TextInput
        style={styles.input}
        placeholder="Max attendees"
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Start Date - End Date</Text>
      <View style={styles.dateRow}>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStartPicker(true)}>
          <Text style={styles.dateBtnText}>{date.start.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <Text style={{ marginHorizontal: 8 }}>-</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEndPicker(true)}>
          <Text style={styles.dateBtnText}>{date.end.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>
      {showStartPicker && (
        <DateTimePicker
          value={date.start}
          mode="date"
          display="default"
          onChange={(e: any, d?: Date) => handleDateChange('start', e, d)}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={date.end}
          mode="date"
          display="default"
          onChange={(e: any, d?: Date) => handleDateChange('end', e, d)}
        />
      )}

      <View style={styles.rowBtns}>
        <TouchableOpacity
          style={[styles.toggleBtn, isPaid && styles.toggleBtnActive]}
          onPress={() => setIsPaid(!isPaid)}
        >
          <Text style={styles.toggleBtnText}>{isPaid ? 'Paid' : 'Free'}</Text>
        </TouchableOpacity>
      </View>
      {isPaid && (
        <TextInput
          style={styles.input}
          placeholder="Joining Fee"
          value={joiningFee}
          onChangeText={setJoiningFee}
          keyboardType="numeric"
        />
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Upload Event</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CreateEventScreen;

const styles = StyleSheet.create({
  container: {
    padding: '6%',
    backgroundColor: '#fff',
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
  },
  textarea: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 70,
    maxHeight: 120,
  },
  categoryListRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
    width: '100%',
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#007BFF',
  },
  categoryChipText: {
    color: '#333',
    fontWeight: '500',
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    width: '100%',
    flexWrap: 'wrap',
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  addImageBtn: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  latLngRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  latLngInput: {
    width: '48%',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  rowBtns: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 14,
    justifyContent: 'space-between',
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#007BFF',
  },
  toggleBtnText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  dateBtn: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateBtnText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '500',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#007BFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  submitBtnText: {
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
