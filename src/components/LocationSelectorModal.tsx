import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LocationPickerModal from './LocationPickerModal';
import AddressPicker from '../components/AddressPicker';

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

interface LocationSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (locationData: LocationData) => void;
  initialData?: LocationData;
}

const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
}) => {
  const [activeTab, setActiveTab] = useState<'venue' | 'online'>(
    initialData?.type || 'venue'
  );
  
  // Venue states
  const [venueName, setVenueName] = useState(initialData?.venueName || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [state, setState] = useState(initialData?.state || '');
  const [country, setCountry] = useState(initialData?.country || '');
  const [latitude, setLatitude] = useState(
    initialData?.latitude?.toString() || ''
  );
  const [longitude, setLongitude] = useState(
    initialData?.longitude?.toString() || ''
  );
  
  // Online states
  const [onlineLink, setOnlineLink] = useState(initialData?.link || '');
  const [platform, setPlatform] = useState(initialData?.platform || '');
  
  // Map modal (react-native-modal inside LocationPickerModal, avoid nesting RN Modal)
  const [mapModalVisible, setMapModalVisible] = useState(false);

  const handleSave = () => {
    if (activeTab === 'venue') {
      if (!address.trim() && !venueName.trim()) {
        Alert.alert('Error', 'Please provide venue name or address');
        return;
      }
      
      onSave({
        type: 'venue',
        venueName: venueName.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      });
    } else {
      if (!onlineLink.trim()) {
        Alert.alert('Error', 'Please provide an online event link');
        return;
      }
      
      onSave({
        type: 'online',
        link: onlineLink.trim(),
        platform: platform,
      });
    }
    onClose();
  };

  const handleQuickPlatform = async (platformName: string, url: string) => {
    setPlatform(platformName);
    setOnlineLink('');
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(url);
      }
    } catch (error) {
      Alert.alert(
        `Open ${platformName}`,
        `Please open your browser and go to:\n${url}\n\nCreate your meeting there and paste the link back here.`,
        [
          {
            text: 'Copy URL',
            onPress: () => {
              // You can add Clipboard.setString(url) here if you have @react-native-clipboard/clipboard installed
            }
          },
          { text: 'OK' }
        ]
      );
    }
  };

  const handleMapLocationPick = (details: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
    country?: string;
    address?: string;
  }) => {
    setLatitude(details.latitude?.toString() || '');
    setLongitude(details.longitude?.toString() || '');
    setCity(details.city || '');
    setState(details.state || '');
    setCountry(details.country || '');
    setAddress(details.address || '');
    setMapModalVisible(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Location</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'venue' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('venue')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'venue' && styles.activeTabText,
                ]}
              >
                Venue
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'online' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('online')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'online' && styles.activeTabText,
                ]}
              >
                Online
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content based on active tab - no ScrollView */}
          <View style={styles.scrollViewContainer}>
            <View style={styles.contentContainer}>
              {activeTab === 'venue' ? (
                <View style={styles.venueContent}>
                  {/* Use Map Modal for location search and selection */}
                  <View style={styles.searchRow}>
                    <TouchableOpacity
                      style={[styles.mapButton, { flex: 1, justifyContent: 'center' }]}
                      onPress={() => setMapModalVisible(true)}
                    >
                      <Ionicons name="location" size={20} color="#2788ff" />
                      <Text style={styles.mapButtonText}>Search & Select Location on Map</Text>
                    </TouchableOpacity>
                  </View>
                  {address ? (
                    <View style={{ marginBottom: 8 }}>
                      <Text style={{ fontSize: 15, color: '#2788ff', fontWeight: '500' }}>Selected Address:</Text>
                      <Text style={{ fontSize: 15, color: '#333' }}>{address}</Text>
                    </View>
                  ) : null}

                  <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#4F8CFF' }}>Venue Details</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Venue name"
                    placeholderTextColor="#888"
                    value={venueName}
                    onChangeText={setVenueName}
                  />

                  <View style={styles.addressRowFlat}>
                    <View style={styles.addressCol}>
                      <AddressPicker
                        country={country}
                        setCountry={setCountry}
                        state={state}
                        setState={setState}
                        city={city}
                        setCity={setCity}
                      />
                    </View>
                  </View>

                  {/* Coordinates */}
                  {(latitude || longitude) && (
                    <View style={styles.coordinatesContainer}>
                      <Text style={styles.coordinatesLabel}>Coordinates:</Text>
                      <Text style={styles.coordinatesText}>
                        {latitude}, {longitude}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.onlineContent}>
                  {/* Online Link Input */}
                  <TextInput
                    style={styles.linkInput}
                    placeholder="Paste your meeting link here after creating it from the buttons below"
                    placeholderTextColor="#888"
                    value={onlineLink}
                    onChangeText={setOnlineLink}
                    multiline
                    numberOfLines={4}
                  />

                  {/* Quick Platform Buttons */}
                  <Text style={styles.quickLinksTitle}>Create a new link</Text>
                  <View style={styles.quickLinksContainer}>
                    <TouchableOpacity
                      style={styles.quickLinkButton}
                      onPress={() =>
                        handleQuickPlatform('Zoom', 'https://app.zoom.us/wc')
                      }
                    >
                      <Ionicons name="videocam" size={20} color="#2788ff" />
                      <Text style={styles.quickLinkText}>Zoom</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickLinkButton}
                      onPress={() =>
                        handleQuickPlatform('Google Meet', 'https://meet.google.com/landing')
                      }
                    >
                      <Ionicons name="logo-google" size={20} color="#2788ff" />
                      <Text style={styles.quickLinkText}>Google meet</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Location</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Modal: render picker directly; it uses react-native-modal internally */}
      {mapModalVisible && (
        <LocationPickerModal
          visible={true}
          onClose={() => setMapModalVisible(false)}
          onPick={handleMapLocationPick}
          initialLocation={
            latitude && longitude
              ? {
                  latitude: parseFloat(latitude),
                  longitude: parseFloat(longitude),
                }
              : undefined
          }
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    height: '68%',
    minHeight: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    margin: 20,
    marginBottom: 0,
    borderRadius: 12,
    padding: 4,
    height: 50,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2788ff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  scrollViewContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  addressRowFlat: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginBottom: 0,
    marginTop: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressCol: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  // Venue Content Styles
  venueContent: {
    paddingBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2788ff',
    minWidth: 80,
  },
  mapButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#2788ff',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  coordinatesContainer: {
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  coordinatesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2788ff',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#666',
  },
  
  // Online Content Styles
  onlineContent: {
    paddingBottom: 20,
  },
  linkInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    height: 120,
    textAlignVertical: 'top',
  },
  quickLinksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quickLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  quickLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2788ff',
    flex: 1,
  },
  quickLinkText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#2788ff',
  },
  
  // Save Button
  saveButton: {
    backgroundColor: '#2788ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    margin: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LocationSelectorModal;