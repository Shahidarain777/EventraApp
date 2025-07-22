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
  ActivityIndicator,
  Switch,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { createEvent } from '../redux/slices/eventSlice';
import { launchImageLibrary } from 'react-native-image-picker';
import UserSearchBox from '../components/UserSearchBox';
import DatePickerRow from '../components/DatePickerRow';
import ImageUploadCard from '../components/ImageUploadCard';
import RNPickerSelect from 'react-native-picker-select';
// import AddressPicker from '../components/AddressPicker';
// @ts-ignore
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Modal } from 'react-native'; 
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import LocationPickerModal from '../components/LocationPickerModal';

import axios from '../api/axios'; // If not already imported
import api from '../api/axios';


type User = { id: string; username: string };




export const categoriesPreset = [
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


  // User search hooks (must be inside function component)
  const [subLeader, setSubLeader] = useState('');
  const [financeManager, setFinanceManager] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearchType, setUserSearchType] = useState<'subLeader' | 'financeManager' | null>(null);

  React.useEffect(() => {
    const fetchUsers = async () => {
      if (userQuery.length < 2) {
        setUserResults([]);
        return;
      }
      try {
        const res = await axios.get(`/users/search?query=${userQuery}`);
        setUserResults(res.data || []);
      } catch {
        setUserResults([]);
      }
    };
    fetchUsers();
  }, [userQuery]);
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const eventError = useSelector((state: RootState) => state.events.error);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
// Removed unused categoryOptions state
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
  const [capacityStep, setCapacityStep] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const [joiningFee, setJoiningFee] = useState('');
  const [currency, setCurrency] = useState('PKR');
  const [amountStep, setAmountStep] = useState(1);
  const [date, setDate] = useState({ start: new Date(), end: new Date() });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [error, setError] = useState('');
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{latitude: number, longitude: number} | null>(null);

  const handleCategoryChange = (text: string) => {
    setCategory(text);
    if (!categoriesPreset.includes(text) && text.length > 0) {
      setShowOtherCategory(true);
    } else {
      setShowOtherCategory(false);
      setOtherCategory('');
    }
  };

  // Debounce image pick to prevent multiple triggers
  let imagePickInProgress = false;
  const handleImagePick = async () => {
    if (imagePickInProgress) return;
    imagePickInProgress = true;
    launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5,
      quality: 0.7,
    }, (response) => {
      imagePickInProgress = false;
      if (response.didCancel || response.errorCode) return;
      if (response.assets) {
        setImages(prev => [...prev, ...response.assets!.map(a => a.uri || '')]);
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
    if (!date.start || !date.end) return setError('Start and End date required');
    if (isPaid && !joiningFee) return setError('Joining fee required for paid event');
    setUploading(true);




    // ...body is now built dynamically below...
// let body={
// "title": "Full-Stack Coding Bootcamp",
// "description": "An intensive coding bootcamp covering React, Node.js, and MongoDB.",
// "location": {
// "city": "Karachi",
// "state": "Sindh",
// "country": "Pakistan",
// "address": "Tech Hub, Shahrah-e-Faisal",
// "latitude": 24.8607,
// "longitude": 67.0011
// },
// "categoryId": "3",
// "dateTime": {
// "start": "2025-08-01T09:00:00Z",
// "end": "2025-08-05T17:00:00Z"
// },
// "isPaid": true,
// "price": 15000,
// "maxAttendees": 50,
// "isLimited": true,
// "imageUrl": [
// "https://unsplash.com/photos/person-typing-on-laptop-in-coding-environment"
// ],
// "approvalRequired": "yes"
// }

    // setError('');
    // if (!title.trim()) return setError('Event title is required');
    // if (!category.trim() && !otherCategory.trim()) return setError('Category is required');
    // if (!description.trim()) return setError('Description is required');
    // if (!date.start || !date.end) return setError('Start and End date required');
    // if (isPaid && !joiningFee) return setError('Joining fee required for paid event');
    // setUploading(true);

    // Build event body from user input
    const body = {
      title: title.trim(),
      description: description.trim(),
      "location": {
      "city": "Karachi",
      "state": "Sindh",
      "country": "Pakistan",
      "address": "Tech Hub, Shahrah-e-Faisal",
      "latitude": 24.8607,
      "longitude": 67.0011
      },
      categoryId: category || otherCategory,
      dateTime: {
        start: date.start ? date.start.toISOString() : undefined,
        end: date.end ? date.end.toISOString() : undefined,
      },
      isPaid: isPaid,
      price: isPaid ? parseFloat(joiningFee) : 0,
      maxAttendees: capacity ? parseInt(capacity) : undefined,
      isLimited: !!capacity,
      imageUrl: images.length > 0 ? images : [],
      approvalRequired: approvalRequired,
      //subLeader: subLeader.trim(),
      //financeManager: financeManager.trim(),
      //visibility: visibility,
      //currency: currency,
    };
  };
 
  return (



    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Create Event</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {eventError ? <Text style={styles.error}>{eventError}</Text> : null}

      {/* Card style for event images upload at top */}
      <View style={styles.imageCard}>
        <Text style={styles.eventImagesLabel}>Event Images</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagePreviewRow}
        >
          <ImageUploadCard
            images={images}
            onAdd={handleImagePick}
            onRemove={idx => setImages(prev => prev.filter((_, i) => i !== idx))}
          />
        </ScrollView>
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
    label: 'Select a category...',
    value: null,
    color: '#9EA0A4',
  }}
  style={{
    inputIOS: styles.input, // iOS styling
    inputAndroid: styles.input, // Android styling
    placeholder: {
      color: '#888',
    },
  }}
  onValueChange={(value) => {
    if (value === 'Other') {
      setShowOtherCategory(true);
      setCategory('');
      setOtherCategory('');
    } else {
      setShowOtherCategory(false);
      setCategory(value || '');
    }
  }}
  value={showOtherCategory ? 'Other' : category}
  items={[
    ...categoriesPreset.map(cat => ({ label: cat, value: cat })),
    { label: 'Other', value: 'Other' },
  ]}
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

      {/* Sub Leader and Finance Manager as simple input boxes */}
      <Text style={styles.label}>Sub Leader</Text>
      <TextInput
        style={styles.input}
        placeholder="Sub Leader"
        placeholderTextColor="#888"
        value={subLeader}
        onChangeText={setSubLeader}
      />
      <Text style={styles.label}>Finance Manager</Text>
      <TextInput
        style={styles.input}
        placeholder="Finance Manager"
        placeholderTextColor="#888"
        value={financeManager}
        onChangeText={setFinanceManager}
      />

      <Text style={styles.label}>Event Location</Text>
      <TouchableOpacity
        style={{width: '100%', backgroundColor: '#007BFF', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 14}}
        onPress={() => setMapModalVisible(true)}
      >
        <Text style={{color: '#fff', fontWeight: '600', fontSize: 16}}>Pick Location on Map</Text>
      </TouchableOpacity>
      <View style={styles.latLngRow}>
        <TextInput
          style={styles.latLngInput}
          placeholder="Latitude"
          placeholderTextColor="#888"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="numeric"
          editable={false}
        />
        <TextInput
          style={styles.latLngInput}
          placeholder="Longitude"
          placeholderTextColor="#888"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numeric"
          editable={false}
        />
      </View>
      {/* Use built-in Modal for map picker */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMapModalVisible(false)}
      >
        <LocationPickerModal
          visible={true}
          onClose={() => setMapModalVisible(false)}
          onPick={(lat, lng) => {
            setLatitude(lat.toString());
            setLongitude(lng.toString());
            setMapModalVisible(false);
          }}
          initialLocation={latitude && longitude ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) } : undefined}
        />
      </Modal>

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
      <View style={styles.feeInputRow}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => {
            const val = Math.max(0, (parseInt(capacity) || 0) - capacityStep);
            setCapacity(val.toString());
          }}
        >
          <Text style={styles.stepBtnText}>-</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.feeInput, { textAlign: 'center', minWidth: 60 }]}
          placeholder="Max attendees"
          placeholderTextColor="#888"
          value={capacity}
          onChangeText={text => {
            if (/^\d*$/.test(text)) setCapacity(text);
          }}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={() => {
            const val = (parseInt(capacity) || 0) + capacityStep;
            setCapacity(val.toString());
          }}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={{ width: '100%', marginBottom: 10 }}>
        <Text style={styles.label}>Start Date - End Date</Text>
        <DatePickerRow
          date={date}
          setShowStartPicker={setShowStartPicker}
          setShowEndPicker={setShowEndPicker}
          showStartPicker={showStartPicker}
          showEndPicker={showEndPicker}
          handleDateChange={handleDateChange}
          styles={styles}
        />
      </View>

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
        <View style={styles.feeInputRow}>
          {/* Currency Dropdown */}
          <TouchableOpacity style={styles.currencyBox} onPress={() => setCurrency(currency === 'PKR' ? 'USD' : 'PKR')}>
            <Text style={styles.currencyText}>{currency}</Text>
          </TouchableOpacity>
          {/* Amount Input with Stepper Dropdown */}
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 }}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => {
                const val = Math.max(0, (parseInt(joiningFee) || 0) - amountStep);
                setJoiningFee(val.toString());
              }}
            >
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.feeInput, { textAlign: 'center', minWidth: 60 }]}
              placeholder="Amount"
              placeholderTextColor="#888"
              value={joiningFee}
              onChangeText={text => {
                // Only allow numbers
                if (/^\d*$/.test(text)) setJoiningFee(text);
              }}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => {
                const val = (parseInt(joiningFee) || 0) + amountStep;
                setJoiningFee(val.toString());
              }}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  imageCard: {
    width: '100%',
    backgroundColor: '#f7f7f7', // match event title input box color
    borderRadius: 20,
    padding: 24,
    marginBottom: 18,
    alignItems: 'center',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  eventImagesLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2788ff',
    marginBottom: 10,
    alignSelf: 'center',
    letterSpacing: 0.5,
  },
  imagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 80,
    maxHeight: 90,
    // No flexWrap, keep in one row
    paddingRight: 12,
  },
  imagePreviewBox: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  eventImagePreview: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  addImageBtnCenter: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#2788ff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7faff',
    alignSelf: 'center',
  },
  container: {
    padding: '6%',
    backgroundColor: '#f7faff', // subtle blue shade for page background
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
  textarea: {
    width: '100%',
    backgroundColor: '#f7f7f7', // match event title input box color
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
    backgroundColor: '#2d8bffff',
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
    borderColor: '#2d8bffff',
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
    backgroundColor: '#fff', // Make background white for visibility
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#222', // Ensure input text is dark
    fontWeight: '500',
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
    backgroundColor: '#2788ffff',
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
    backgroundColor: '#2788ff', // modern blue
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
  userSearchBox: {
    width: '100%',
    marginBottom: 18,
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userSearchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  userSearchInput: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#222',
    fontWeight: '500',
  },
  userSearchIcon: {
    marginLeft: 8,
    color: '#888',
  },
  userDropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 3,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  userDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userDropdownText: {
    fontSize: 16,
    color: '#222',
  },
  feeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  currencyBox: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#eaf0fa',
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#dbe6fa',
  },
  currencyText: {
    color: '#2788ff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  feeInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
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
  stepDropdownBox: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  stepDropdownItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f7f7f7',
    marginRight: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  stepDropdownItemSelected: {
    backgroundColor: '#2788ff',
  },
  stepDropdownText: {
    color: '#222',
    fontWeight: '500',
    fontSize: 15,
  },
  error: {
    color: '#d9534f',
    marginBottom: 10,
    fontSize: 15,
    alignSelf: 'center',
  },
});
