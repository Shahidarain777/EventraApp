import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onPick: (lat: number, lng: number) => void;
  initialLocation?: { latitude: number; longitude: number };
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  onPick,
  initialLocation,
}) => {
  const [pickedLocation, setPickedLocation] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(initialLocation || null);

  return (
    <Modal isVisible={visible} onBackdropPress={onClose}>
      <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', margin: 12 }}>Tap on map to select location</Text>
        <MapView
          style={{ width: '100%', height: 350 }}
          initialRegion={{
            latitude: pickedLocation?.latitude || 30.3753,
            longitude: pickedLocation?.longitude || 69.3451,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }}
          onPress={(e: MapPressEvent) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setPickedLocation({ latitude, longitude });
          }}
        >
          {pickedLocation && <Marker coordinate={pickedLocation} />}
        </MapView>
        <TouchableOpacity
          style={{ backgroundColor: '#007BFF', borderRadius: 8, padding: 12, alignItems: 'center', margin: 12 }}
          onPress={() => {
            if (pickedLocation) {
              onPick(pickedLocation.latitude, pickedLocation.longitude);
            }
            onClose();
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Done</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default LocationPickerModal;