
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Modal from 'react-native-modal';
import MapView, { Marker, MapPressEvent, PROVIDER_GOOGLE } from 'react-native-maps';
import { TextInput, FlatList, TouchableOpacity as RNTouchableOpacity, ActivityIndicator } from 'react-native';
import { GOOGLE_MAPS_API_KEY } from '../util/google';

interface LocationDetails {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
}

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onPick: (details: LocationDetails) => void;
  initialLocation?: { latitude: number; longitude: number };
}

// NOTE: The Maps SDK key in AndroidManifest is only for native maps.
// Web-services (Places/Geocoding) must receive a key from JS. We import it above.

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  onPick,
  initialLocation,
}) => {
  const [pickedLocation, setPickedLocation] = React.useState<LocationDetails | null>(
    initialLocation ? { latitude: initialLocation.latitude, longitude: initialLocation.longitude } : null
  );
  const [mapRegion, setMapRegion] = React.useState(
    initialLocation
      ? {
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }
      : {
          latitude: 30.3753,
          longitude: 69.3451,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }
  );
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [searchText, setSearchText] = React.useState<string>('');
  const [suggestions, setSuggestions] = React.useState<Array<{ description: string; place_id: string }>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = React.useState<boolean>(false);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Helper to fetch address details from lat/lng
  const fetchAddressDetails = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'REQUEST_DENIED' || data.status === 'INVALID_REQUEST') {
        setSearchError('Google Places API error: ' + data.error_message);
        return;
      }
      if (data.results && data.results.length > 0) {
        setSearchError(null);
        const address = data.results[0].formatted_address;
        let city, state, country;
        data.results[0].address_components.forEach((comp: any) => {
          if (comp.types.includes('locality')) city = comp.long_name;
          if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
          if (comp.types.includes('country')) country = comp.long_name;
        });
        setPickedLocation({ latitude: lat, longitude: lng, city, state, country, address });
      }
    } catch (err) {
      setSearchError('Network error or invalid API key.');
      setPickedLocation({ latitude: lat, longitude: lng });
    }
  };

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (text: string) => {
    if (!text || text.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      setLoadingSuggestions(true);
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        text
      )}&key=${GOOGLE_MAPS_API_KEY}&language=en`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status !== 'OK') {
        setSearchError(json.error_message || json.status || 'Places autocomplete error');
        setSuggestions([]);
        setLoadingSuggestions(false);
        return;
      }
      setSearchError(null);
      setSuggestions(
        (json.predictions || []).map((p: any) => ({ description: p.description, place_id: p.place_id }))
      );
    } catch (e: any) {
      setSuggestions([]);
      setSearchError(e?.message || 'Network error');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Fetch place details (lat/lng + components)
  const fetchPlaceDetails = async (placeId: string) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
        placeId
      )}&fields=geometry,address_component,formatted_address,address_components&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status !== 'OK') {
        setSearchError(json.error_message || json.status || 'Place details error');
        return;
      }
      const details = json.result;
      const lat = details.geometry.location.lat;
      const lng = details.geometry.location.lng;
      let city: string | undefined;
      let state: string | undefined;
      let country: string | undefined;
      (details.address_components || []).forEach((comp: any) => {
        if (comp.types.includes('locality')) city = comp.long_name;
        if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
        if (comp.types.includes('country')) country = comp.long_name;
      });
      setPickedLocation({
        latitude: lat,
        longitude: lng,
        city,
        state,
        country,
        address: details.formatted_address,
      });
      setMapRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      });
      setSuggestions([]);
      setSearchText(details.formatted_address || '');
      setSearchError(null);
    } catch (e: any) {
      setSearchError(e?.message || 'Network error');
    }
  };

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} propagateSwipe={true}>
      <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 0, margin: 0 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Select location on map</Text>
          <Pressable onPress={onClose} style={styles.headerClose} hitSlop={10}>
            <Text style={{ fontSize: 22, color: '#666' }}>×</Text>
          </Pressable>
        </View>
        {/* Search Bar + Suggestion List */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <TextInput
            placeholder="Search location"
            placeholderTextColor="#888"
            autoCorrect={false}
            autoCapitalize="none"
            style={styles.searchInput}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              if (debounceRef.current) clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(() => fetchSuggestions(text), 300);
            }}
          />
          {loadingSuggestions ? (
            <View style={styles.listView}><ActivityIndicator style={{ padding: 12 }} /></View>
          ) : suggestions.length > 0 ? (
            <View style={styles.listView}>
              <FlatList
                keyboardShouldPersistTaps="always"
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <RNTouchableOpacity
                    style={styles.listRow}
                    onPress={() => fetchPlaceDetails(item.place_id)}
                  >
                    <Text style={styles.listDescription}>{item.description}</Text>
                  </RNTouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
              />
            </View>
          ) : null}
        </View>
        {/* Error Message */}
        {searchError && (
          <View style={{ marginHorizontal: 24, marginBottom: 8 }}>
            <Text style={{ color: 'red', fontSize: 14 }}>{searchError}</Text>
          </View>
        )}
        {/* Map Card */}
        <View style={styles.mapCard}>
          <MapView
            style={styles.map}
            initialRegion={mapRegion}
            region={mapRegion}
            onRegionChangeComplete={(region) => setMapRegion(region)}
            onPress={(e: MapPressEvent) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              fetchAddressDetails(latitude, longitude);
              setMapRegion({
                latitude,
                longitude,
                latitudeDelta: 0.2,
                longitudeDelta: 0.2,
              });
            }}
            provider={PROVIDER_GOOGLE}
          >
            {pickedLocation && (
              <Marker
                coordinate={{ latitude: pickedLocation.latitude, longitude: pickedLocation.longitude }}
                draggable
                onDragEnd={e => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  fetchAddressDetails(latitude, longitude);
                  setMapRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.2,
                    longitudeDelta: 0.2,
                  });
                }}
              />
            )}
          </MapView>
        </View>
        {/* Address Details */}
        {pickedLocation && (
          <View style={styles.detailsRow}>
            <Text style={styles.detailsText}>Address: {pickedLocation.address || ''}</Text>
            <Text style={styles.detailsText}>City: {pickedLocation.city || ''}</Text>
            <Text style={styles.detailsText}>State: {pickedLocation.state || ''}</Text>
            <Text style={styles.detailsText}>Country: {pickedLocation.country || ''}</Text>
            <Text style={styles.detailsText}>Latitude: {pickedLocation.latitude}</Text>
            <Text style={styles.detailsText}>Longitude: {pickedLocation.longitude}</Text>
          </View>
        )}
        {/* Footer Buttons */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.doneBtn, !pickedLocation && { backgroundColor: '#d3d3d3' }]}
            onPress={() => {
              if (pickedLocation) {
                onPick(pickedLocation);
                onClose();
              }
            }}
            disabled={!pickedLocation}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  autocompleteContainer: {
    zIndex: 20,
    elevation: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 0,
    margin: 0,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  headerClose: {
    padding: 4,
  },
  searchBarRow: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  searchInput: {
    height: 44,
    borderColor: '#2788ff',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#07090bff',
  },
  listView: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    zIndex: 11,
  },
  listRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  listDescription: {
    fontSize: 15,
    color: '#222',
  },
  mapCard: {
    marginHorizontal: 24,
    marginTop: 48,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  detailsRow: {
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  detailsText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  cancelBtn: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginRight: 8,
  },
  cancelBtnText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  doneBtn: {
    backgroundColor: '#2788ff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LocationPickerModal;