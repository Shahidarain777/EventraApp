import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// @ts-ignore
import { launchImageLibrary, Asset, ImageLibraryOptions, ImagePickerResponse } from 'react-native-image-picker';
import { Platform } from 'react-native';
import { useAppSelector } from '../redux/hooks';

interface ProfileImagePickerProps {
  image: string;
  setImage: (val: string) => void;
  avatarStyle?: object;
}

const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({ image, setImage, avatarStyle }) => {
  const [error, setError] = useState('');
  const token = useAppSelector((state) => state.auth.token);

  const pickImage = async () => {
    setError('');
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, async (response: ImagePickerResponse) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        setError(response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset: Asset = response.assets[0];
        if (!asset.uri) {
          setError('No image URI found');
          return;
        }
        try {
          const formData = new FormData();
          formData.append('image', {
            uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
            name: asset.fileName || `photo.jpg`,
            type: asset.type || 'image/jpeg',
          } as unknown as Blob);
          if (!token) {
            setError('You must be logged in to upload an image.');
            return;
          }
          const res = await fetch('https://YOUR_BACKEND_URL/api/upload_image', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              // 'Content-Type': 'multipart/form-data', // Let fetch set this automatically
            },
            body: formData,
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.message || 'Upload failed');
            return;
          }
          setImage(data.image.url); // Save backend image URL
        } catch (err: any) {
          setError(err.message || 'Image upload failed');
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Profile Image</Text>
      <TouchableOpacity style={[styles.imagePicker, avatarStyle]} onPress={pickImage}>
        {!image && (
          <View style={styles.avatarSticker}>
            <Icon name="account-circle" size={74} color="#7da2d6" />
            <Text style={styles.avatarHint}>Tap to upload</Text>
          </View>
        )}
        {image ? (
          <Image
            source={{ uri: image.startsWith('http') ? image : `https://YOUR_BACKEND_URL${image}` }}
            style={[styles.image, avatarStyle, {position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}]}
            resizeMode="cover"
            onError={() => setImage('')}
          />
        ) : null}
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F8CFF',
    marginBottom: 8,
  },
  imagePicker: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#f0f4fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4F8CFF',
    marginBottom: 6,
    overflow: 'hidden',
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  avatarSticker: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  avatarHint: {
    color: '#7da2d6',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#b0c4de',
    fontSize: 14,
    marginTop: 4,
  },
  error: {
    color: '#ff6b6b',
    fontSize: 13,
    marginTop: 2,
  },
});

export default ProfileImagePicker;
