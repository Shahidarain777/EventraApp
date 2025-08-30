import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Image, ActivityIndicator, Switch, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigations';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchCategories, addCategory } from '../redux/slices/categorySlice';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimeSelector from '../components/DateTimeSelector';
import ImageUploadCard from '../components/ImageUploadCard';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LocationSelectorModal from '../components/LocationSelectorModal';
import api from '../api/axios';

type LocationData = { type: 'venue' | 'online'; venueName?: string; address?: string; city?: string; state?: string; country?: string; latitude?: number; longitude?: number; link?: string; platform?: string; };

const CreateEventScreen = () => {
  // Helper to check if all required fields are filled
  const isFormValid = () => {
    if (!title.trim()) return false;
    if (!categoryId && !otherCategory.trim()) return false;
    if (!description.trim()) return false;
    if (!date.start || !date.end) return false;
    if (isPaid && !joiningFee) return false;
    if (!locationData) return false;
    if (locationData.type === 'venue' && !(locationData.address || locationData.venueName)) return false;
    if (locationData.type === 'online' && !locationData.link) return false;
    for (let i = 0; i < subEvents.length; i++) {
      const se = subEvents[i];
      if (!se.itemName.trim()) return false;
      if (!se.maxAttendees) return false;
      if (se.isPaid && !se.fee) return false;
    }
    if (isPaid && (!accountHolderName.trim() || !accountNumber.trim() || !bankName)) return false;
    return true;
  };
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading: categoriesLoading } = useSelector((state: RootState) => state.categories);
  const eventError = useSelector((state: RootState) => state.events.error);
  const token = useSelector((state: RootState) => state.auth.token);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [showOtherCategory, setShowOtherCategory] = useState(false);
  const [otherCategory, setOtherCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [approvalRequired, setApprovalRequired] = useState('no');
  const [capacity, setCapacity] = useState('');
  const [capacityStep] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const [joiningFee, setJoiningFee] = useState('');
  const [currency, setCurrency] = useState('PKR');
  const [amountStep] = useState(1);
  const [date, setDate] = useState({ start: new Date(), end: new Date() });
  const [subEvents, setSubEvents] = useState<{ itemName: string; maxAttendees: string; fee: string; isPaid: boolean }[]>([]);
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!categories?.length) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories]);

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

  const addSubEvent = () => setSubEvents(prev => [...prev, { itemName: '', maxAttendees: '', fee: '', isPaid: false }]);
  const removeSubEvent = (idx: number) => setSubEvents(prev => prev.filter((_, i) => i !== idx));
  const updateSubEvent = (idx: number, field: string, value: any) =>
    setSubEvents(prev => prev.map((se, i) => i === idx ? { ...se, [field]: value } : se));

  const handleLocationSave = (data: LocationData) => {
    setLocationData(data);
    setLocationModalVisible(false);
  };

  const getLocationDisplayText = () => {
    if (!locationData) return 'Set a location or an online event link';
    if (locationData.type === 'venue') {
      return locationData.venueName || locationData.address ||
        [locationData.city, locationData.state, locationData.country].filter(Boolean).join(', ') || 'Venue location set';
    }
    return locationData.platform ? `${locationData.platform} meeting` : 'Online event link set';
  };

  let imagePickInProgress = false;
  const handleImagePick = () => {
    if (imagePickInProgress) return;
    imagePickInProgress = true;
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 5, quality: 0.7 }, resp => {
      imagePickInProgress = false;
      if (resp.didCancel || resp.errorCode || !resp.assets) return;
      if (Array.isArray(resp.assets)) {
        setImages(prev => [...prev, ...(resp.assets?.map(a => a.uri || '') ?? [])]);
      }
    });
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const fd = new FormData();
      fd.append('image', { uri, type: 'image/jpeg', name: `event_${Date.now()}.jpg` } as any);
      fd.append('eventId', 'event');
      const res = await api.post('/upload_image', fd, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
        timeout: 30000,
      });
      return res.data?.image?.url || null;
    } catch (e) {
      console.error('Image upload error:', e);
      return null;
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) return setError('Event title is required');
    if (!categoryId && !otherCategory.trim()) return setError('Category is required');
    if (!description.trim()) return setError('Description is required');
    if (!date.start || !date.end) return setError('Start and End date required');
    if (isPaid && !joiningFee) return setError('Joining fee required for paid event');
    if (!locationData) return setError('Location is required');
    if (locationData.type === 'venue' && !(locationData.address || locationData.venueName)) return setError('Venue address or name is required');
    if (locationData.type === 'online' && !locationData.link) return setError('Online event link is required');

    for (let i = 0; i < subEvents.length; i++) {
      const se = subEvents[i];
      if (!se.itemName.trim()) return setError(`Sub-event ${i+1}: Item name is required`);
      if (!se.maxAttendees) return setError(`Sub-event ${i+1}: Max attendees is required`);
      if (se.isPaid && !se.fee) return setError(`Sub-event ${i+1}: Fee is required for paid sub-event`);
    }

    if (isPaid && (!accountHolderName.trim() || !accountNumber.trim() || !bankName)) {
      return setError('Payment account holder, number, and bank are required for paid event');
    }

    setUploading(true);
    let finalCategoryId = categoryId;
    if (!categoryId && otherCategory.trim()) {
      try {
        const result = await dispatch(addCategory({ categoryName: otherCategory.trim() })).unwrap();
        finalCategoryId = result.categoryId?.toString() || null;
        if (!finalCategoryId) throw new Error();
      } catch {
        setUploading(false);
        return setError('Failed to add new category');
      }
    }

    const locationObj = locationData.type === 'venue'
      ? { type: 'venue', city: locationData.city||'', state: locationData.state||'', country: locationData.country||'', address: locationData.address||locationData.venueName||'', latitude: locationData.latitude||0, longitude: locationData.longitude||0, venueName: locationData.venueName||'' }
      : { type: 'online', link: locationData.link||'', platform: locationData.platform||'', city:'', state:'', country:'', address:'', latitude:0, longitude:0, venueName:'' };

    const uploadedImageUrls: string[] = [];
    for (const uri of images) {
      const url = await uploadImage(uri);
      if (url) uploadedImageUrls.push(url);
      else {
        setUploading(false);
        return setError('Failed to upload one or more images.');
      }
    }

    const body: any = {
      title: title.trim(),
      description: description.trim(),
      location: locationObj,
      categoryId: finalCategoryId,
      dateTime: { start: date.start.toISOString(), end: date.end.toISOString() },
      isPaid, price: isPaid ? parseFloat(joiningFee) : 0,
      maxAttendees: capacity ? parseInt(capacity) : undefined,
      isLimited: !!capacity,
      imageUrl: uploadedImageUrls,
      approvalRequired, subEvents: subEvents.map(se => ({
        itemName: se.itemName.trim(), isPaid: se.isPaid,
        fee: se.isPaid ? parseFloat(se.fee) : 0,
        maxAttendees: parseInt(se.maxAttendees)
      })),
      visibility, currency,
      ...(isPaid ? { accountHolderName: accountHolderName.trim(), accountNumber: accountNumber.trim(), bankName } : {})
    };

    try {
      await api.post('/events', body);
      setUploading(false);
      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }]
          }) }
      ]);
    } catch (e: any) {
      setUploading(false);
      setError(e?.response?.data?.message || 'Failed to create event');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 69 }]} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Create Event</Text>

      <View style={styles.imageCard}>
        <Text style={styles.eventImagesLabel}>Event Images</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagePreviewRow}>
          <ImageUploadCard
            images={images}
            onAdd={handleImagePick}
            onRemove={idx => setImages(prev => prev.filter((_, i) => i !== idx))}
          />
        </ScrollView>
      </View>

      <Text style={styles.label}>Event Title</Text>
      <TextInput style={styles.input} placeholder="Event Title" placeholderTextColor="#888" value={title} onChangeText={setTitle} />
      <Text style={styles.label}>Category</Text>
      <RNPickerSelect
        placeholder={{ label: categoriesLoading ? 'Loading categories...' : 'Select a category...', value: null, color: '#9EA0A4' }}
        style={{ inputIOS: styles.input, inputAndroid: styles.input, placeholder: { color: '#888' } }}
        onValueChange={handleCategoryChange}
        value={showOtherCategory ? 'Other' : categoryId}
        items={[...(categories || []).filter(c => c.status === 'approve').map(c => ({ label: c.categoryName, value: c.categoryId.toString() })), { label: 'Other', value: 'Other' }]}
      />
      {showOtherCategory && (
        <TextInput style={styles.input} placeholder="Other Category" placeholderTextColor="#888" value={otherCategory} onChangeText={setOtherCategory} />
      )}

      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.textarea} placeholder="Description" placeholderTextColor="#888" value={description} onChangeText={setDescription} multiline numberOfLines={10} />

      <Text style={styles.label}>Event Location</Text>
      <TouchableOpacity style={styles.locationCard} onPress={() => setLocationModalVisible(true)}>
        <View style={styles.locationCardContent}>
          <Ionicons name={locationData?.type === 'online' ? 'link-outline' : 'location-outline'} size={24} color="#888" />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationTitle}>Location</Text>
            <Text style={styles.locationSubtitle}>{getLocationDisplayText()}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </View>
      </TouchableOpacity>

      <Text style={styles.label}>Visibility</Text>
      <View style={styles.rowBtns}>
        <TouchableOpacity style={[styles.toggleBtn, visibility === 'public' && styles.toggleBtnActive]} onPress={() => setVisibility('public')}>
          <Text style={styles.toggleBtnText}>Public</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, visibility === 'private' && styles.toggleBtnActive]} onPress={() => setVisibility('private')}>
          <Text style={styles.toggleBtnText}>Private</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Approval</Text>
      <View style={styles.rowBtns}>
        <TouchableOpacity style={[styles.toggleBtn, approvalRequired === 'yes' && styles.toggleBtnActive]} onPress={() => setApprovalRequired('yes')}>
          <Text style={styles.toggleBtnText}>Approval Required</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, approvalRequired === 'no' && styles.toggleBtnActive]} onPress={() => setApprovalRequired('no')}>
          <Text style={styles.toggleBtnText}>Anyone Can Join</Text>
        </TouchableOpacity>
      </View>

      {/* <Text style={styles.label}>Capacity</Text>
      <View style={styles.feeInputRow}>
        <TouchableOpacity style={styles.stepBtn} onPress={() => setCapacity(Math.max(0, (parseInt(capacity)||0) - capacityStep).toString())}>
          <Text style={styles.stepBtnText}>-</Text>
        </TouchableOpacity>
        <TextInput style={[styles.feeInput, { textAlign: 'center', minWidth: 60 }]} placeholder="Max attendees" placeholderTextColor="#888" value={capacity} onChangeText={text => /^\d*$/.test(text) && setCapacity(text)} keyboardType="numeric" />
        <TouchableOpacity style={styles.stepBtn} onPress={() => setCapacity(((parseInt(capacity)||0) + capacityStep).toString())}>
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View> */}

      <DateTimeSelector
        startDate={date.start}
        endDate={date.end}
        onStartDateChange={newDate => setDate(prev => ({ ...prev, start: newDate }))}
        onEndDateChange={newDate => setDate(prev => ({ ...prev, end: newDate }))}
      />

      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <Text style={[styles.label, { flex: 1 }]}>Is Paid?</Text>
        <Switch value={isPaid} onValueChange={setIsPaid} trackColor={{ false: '#e0e0e0', true: '#007BFF' }} thumbColor={isPaid ? '#007BFF' : '#fff'} />
      </View>

      {isPaid && (
        <>
          <View style={styles.feeInputRow}>
            <TouchableOpacity style={styles.currencyBox} onPress={() => setCurrency(currency === 'PKR' ? 'USD' : 'PKR')}>
              <Text style={styles.currencyText}>{currency}</Text>
            </TouchableOpacity>
            {/* <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setJoiningFee(Math.max(0, (parseInt(joiningFee)||0) - amountStep).toString())}>
                <Text style={styles.stepBtnText}>-</Text>
              </TouchableOpacity>
              <TextInput style={[styles.feeInput, { textAlign: 'center', minWidth: 60 }]} placeholder="Amount" placeholderTextColor="#888" value={joiningFee} onChangeText={text => /^\d*$/.test(text) && setJoiningFee(text)} keyboardType="numeric" />
              <TouchableOpacity style={styles.stepBtn} onPress={() => setJoiningFee(((parseInt(joiningFee)||0) + amountStep).toString())}>
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View> */}
          </View>

          <Text style={styles.label}>Account Holder Name</Text>
          <TextInput style={styles.input} placeholder="Account Holder Name" placeholderTextColor="#888" value={accountHolderName} onChangeText={setAccountHolderName} />

          <Text style={styles.label}>Account Number</Text>
          <TextInput style={styles.input} placeholder="Account Number" placeholderTextColor="#888" value={accountNumber} keyboardType="numeric" onChangeText={setAccountNumber} />

          <Text style={styles.label}>Bank Name</Text>
          <RNPickerSelect placeholder={{ label: 'Select a bank...', value: '' }} style={{ inputIOS: styles.input, inputAndroid: styles.input }} onValueChange={setBankName} value={bankName}
            items={[
              { label: 'JazzCash', value: 'JazzCash' },
              { label: 'Easypaisa', value: 'Easypaisa' },
              { label: 'Sadapay', value: 'Sadapay' },
              { label: 'Nayapay', value: 'Nayapay' },
              { label: 'HBL', value: 'HBL' },
              { label: 'MCB', value: 'MCB' },
              { label: 'UBL', value: 'UBL' },
              { label: 'Meezan bank', value: 'Meezan bank' },
              { label: 'Bank Alfalah', value: 'Bank Alfalah' },
              { label: 'Faysal Bank', value: 'Faysal Bank' },
              { label: 'Bank Islami', value: 'Bank Islami' },
              { label: 'Al Baraka Bank', value: 'Al Baraka Bank' },
              { label: 'Habib Metropolitan Bank', value: 'Habib Metropolitan Bank' },
              { label: 'National Bank of Pakistan', value: 'National Bank of Pakistan' },
            ]}
          />
        </>
      )}

      <Text style={styles.label}>Sub Events (add atleast one)</Text>
      {subEvents.map((sv, index) => (
        <View key={index} style={styles.subEventCard}>
          <View style={styles.subEventHeader}>
            <Text style={styles.subEventTitle}>Sub Event {index + 1}</Text>
            <TouchableOpacity onPress={() => removeSubEvent(index)}>
              <Ionicons name="close-circle" size={24} color="#d9534f" />
            </TouchableOpacity>
          </View>
          <View style={styles.subEventRow}>
            <View style={styles.subEventInputHalf}>
              <Text style={styles.subEventLabel}>Max Attendees</Text>
              <TextInput style={styles.subEventInput} placeholder="Max attendees" placeholderTextColor="#888" value={sv.maxAttendees} keyboardType="numeric" onChangeText={text => /^\d*$/.test(text) && updateSubEvent(index,'maxAttendees', text)} />
            </View>
            <View style={styles.subEventInputHalf}>
              <Text style={styles.subEventLabel}>Fee</Text>
              <TextInput style={styles.subEventInput} placeholder="Fee" placeholderTextColor="#888" value={sv.fee} keyboardType="numeric" onChangeText={text => /^\d*$/.test(text) && (updateSubEvent(index,'fee', text), updateSubEvent(index, 'isPaid', parseInt(text)>0))} />
            </View>
          </View>
          <View style={styles.subEventFullRow}>
            <Text style={styles.subEventLabel}>Item Name</Text>
            <TextInput style={styles.subEventInputFull} placeholder="e.g., Food Stall" placeholderTextColor="#888" value={sv.itemName} onChangeText={text => updateSubEvent(index,'itemName', text)} />
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addSubEventBtn} onPress={addSubEvent}>
        <Ionicons name="add-circle" size={24} color="#007BFF" />
        <Text style={styles.addSubEventBtnText}>Add Sub-Event</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitBtn, !isFormValid() ? { backgroundColor: '#ccc' } : { backgroundColor: '#2788ff' }]}
        onPress={handleSubmit}
        disabled={!isFormValid() || uploading}
      >
        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Upload Event</Text>}
      </TouchableOpacity>

      <LocationSelectorModal visible={locationModalVisible} onClose={() => setLocationModalVisible(false)} onSave={handleLocationSave} initialData={locationData || undefined} />

      {(error || eventError) && (
        <View style={{ marginTop: 18, marginBottom: 10, alignItems: 'center', width: '100%' }}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {eventError ? <Text style={styles.error}>{eventError}</Text> : null}
        </View>
      )}
    </ScrollView>
  );
};

export default CreateEventScreen;

const styles = StyleSheet.create({
  container: { padding: '6%', backgroundColor: '#f7faff', flexGrow: 1, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 18, alignSelf: 'center' },
  imageCard: { width: '100%', backgroundColor: '#f7f7f7', borderRadius: 20, padding: 24, marginBottom: 18, alignItems: 'center', elevation: 2 },
  eventImagesLabel: { fontSize: 18, fontWeight: 'bold', color: '#2788ff', marginBottom: 10 },
  imagePreviewRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingRight: 12 },
  label: { fontSize: 15, color: '#333', fontWeight: '600', marginBottom: 6, alignSelf: 'flex-start' },
  input: { width: '100%', backgroundColor: '#f7f7f7', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 6, fontSize: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e0e0e0', color: '#222', fontWeight: '500' },
  textarea: { width: '100%', backgroundColor: '#f7f7f7', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e0e0e0', minHeight: 70, maxHeight: 120, color: '#222', fontWeight: '500' },
  locationCard: { width: '100%', backgroundColor: '#f7f7f7', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  locationCardContent: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  locationTextContainer: { flex: 1 },
  locationTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 2 },
  locationSubtitle: { fontSize: 14, color: '#888' },
  rowBtns: { flexDirection: 'row', width: '100%', marginBottom: 14, justifyContent: 'space-between' },
  toggleBtn: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 10, paddingVertical: 10, marginHorizontal: 4, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#2788ffff' },
  toggleBtnText: { color: '#222', fontWeight: '600', fontSize: 15 },
  feeInputRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 14, backgroundColor: '#f7f7f7', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', paddingHorizontal: 10, paddingVertical: 2 },
  currencyBox: { paddingHorizontal: '43%', paddingVertical: 8, backgroundColor: '#eaf0fa', borderRadius: 8, marginRight: 6, borderWidth: 1, borderColor: '#dbe6fa' },
  currencyText: { color: '#2788ff', fontWeight: 'bold', fontSize: 16 },
  feeInput: { flex: 1, backgroundColor: 'transparent', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, fontSize: 16, color: '#222', fontWeight: '500' },
  stepBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#eaf0fa', justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#dbe6fa' },
  stepBtnText: { color: '#2788ff', fontWeight: 'bold', fontSize: 18 },
  submitBtn: { width: '100%', backgroundColor: '#2788ff', borderRadius: 30, paddingVertical: 15, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  error: { color: '#d9534f', marginBottom: 10, fontSize: 15, alignSelf: 'center' },
  subEventCard: { width: '100%', backgroundColor: '#f7f7f7', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  subEventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  subEventTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  subEventRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  subEventInputHalf: { width: '48%' },
  subEventLabel: { fontSize: 14, color: '#333', fontWeight: '500', marginBottom: 4 },
  subEventInput: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: '#ddd', color: '#222' },
  subEventFullRow: { width: '100%' },
  subEventInputFull: { width: '100%', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, borderWidth: 1, borderColor: '#ddd', color: '#222' },
  addSubEventBtn: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f8ff', borderRadius: 10, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: '#007BFF', borderStyle: 'dashed' },
  addSubEventBtnText: { color: '#007BFF', fontWeight: '600', fontSize: 16, marginLeft: 8 },
});
