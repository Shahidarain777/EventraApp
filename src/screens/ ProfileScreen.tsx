import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { logout, updateProfileImage, fetchUserProfileImage } from '../redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import api from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const user = useAppSelector((state) => state.auth.user);
  const [uploadingImage, setUploadingImage] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);

  // Load profile image from database and AsyncStorage on component mount
  useEffect(() => {
    loadProfileImage();
  }, [user?._id]);

  const loadProfileImage = async () => {
    if (!user?._id) return;

    try {
      // First, try to fetch from database
      const result = await dispatch(fetchUserProfileImage(user._id));
      
      if (result.payload) {
        // Save to AsyncStorage for offline access
        await saveProfileImageToStorage(result.payload as string);
      } else {
        // Fallback: load from AsyncStorage if database call fails
        await loadProfileImageFromStorage();
      }
    } catch (error) {
      console.log('Failed to fetch profile image from database, trying AsyncStorage:', error);
      // Fallback: load from AsyncStorage
      await loadProfileImageFromStorage();
    }
  };

  const loadProfileImageFromStorage = async () => {
    try {
      const savedProfileImage = await AsyncStorage.getItem(`profileImage_${user?._id}`);
      if (savedProfileImage && user && !user.profileImage) {
        dispatch(updateProfileImage(savedProfileImage));
      }
    } catch (error) {
      console.log('Failed to load profile image from storage:', error);
    }
  };

  const saveProfileImageToStorage = async (imageUrl: string) => {
    try {
      if (user?._id) {
        await AsyncStorage.setItem(`profileImage_${user._id}`, imageUrl);
      }
    } catch (error) {
      console.log('Failed to save profile image to storage:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            // Clear profile image from storage on logout
            try {
              if (user?._id) {
                await AsyncStorage.removeItem(`profileImage_${user._id}`);
              }
            } catch (error) {
              console.log('Failed to clear profile image from storage:', error);
            }
            dispatch(logout());
          },
        },
      ]
    );
  };

  const handleProfileImagePick = () => {
    launchImageLibrary({
      mediaType: 'photo',
      quality: 0.3, // Reduced quality to 30% to stay under 1MB
      maxWidth: 800, // Limit width to 800px
      maxHeight: 800, // Limit height to 800px
      selectionLimit: 1,
    }, async (response) => {
      if (response.didCancel || response.errorCode) return;
      
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        
        if (!asset.uri) {
          Alert.alert('Error', 'Failed to get image URI');
          return;
        }

                // Check file size (optional warning)
        if (asset.fileSize && asset.fileSize > 20 * 1024 * 1024) { // 20MB
          Alert.alert(
            'Image too large', 
            'Please select a smaller image or the app will compress it automatically.'
          );
        }

        // Show uploading state
        setUploadingImage(true);
        
        try {
          // Create FormData for multipart upload
          const formData = new FormData();
          formData.append('image', {
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `profile_${Date.now()}.jpg`,
          } as any);

          console.log('Uploading image:', {
            size: asset.fileSize,
            type: asset.type,
            name: asset.fileName
          });

          // Upload image to your API
          const response = await api.post('/upload_image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,  // Use token here
            },
            timeout: 30000,
          });

          if (response.data?.image?.url) {
            // Update profile image state with the uploaded image URL
            const imageUrl = `${api.defaults.baseURL?.replace('/api', '')}${response.data.image.url}`;

            // 1. Update user profileImage in backend
            try {
              if (user?._id) {
                await api.put(`/users/${user._id}`, { profileImage: imageUrl }, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
              }
            } catch (err) {
              console.error('Failed to update user profile image in backend:', err);
              // Optionally show a warning, but continue
            }

            // 2. Update Redux state and save to AsyncStorage
            dispatch(updateProfileImage(imageUrl));
            await saveProfileImageToStorage(imageUrl);

            Alert.alert('Success', 'Profile image updated successfully!');
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error: any) {
          console.error('Image upload error:', error);
          
          let errorMessage = 'Failed to upload image. Please try again.';
          if (error.response?.status === 413) {
            errorMessage = 'Image is too large. Please select a smaller image.';
          } else if (error.response?.status === 404) {
            errorMessage = 'Upload service not found. Please contact support.';
          } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Upload timeout. Please check your connection and try again.';
          }
          
          Alert.alert('Upload Failed', errorMessage);
        } finally {
          setUploadingImage(false);
        }
      }
    });
  };

  // const updateUserProfileImage = async (imageUrl: string) => {
  //   try {
  //     // You'll need to create this API endpoint to update user profile
  //     await api.put('/profile/image', { profileImageUrl: imageUrl });
  //   } catch (error) {
  //     console.error('Failed to update user profile:', error);
  //     // Don't show error to user as the image was uploaded successfully
  //   }
  // };

  const handlePasswordChange = () => {
    Alert.alert(
      'Change Password',
      'This feature will be available soon.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View> */}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profileImageSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer} 
            onPress={handleProfileImagePick}
            disabled={uploadingImage}
          >
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Icon name="account" size={60} color="#ccc" />
              </View>
            )}
            
            {/* Show loading indicator while uploading */}
            {uploadingImage && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#007BFF" />
              </View>
            )}
            
            <View style={styles.editIconContainer}>
              <Icon name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          
          {uploadingImage && (
            <Text style={styles.uploadingText}>Uploading...</Text>
          )}
        </View>

        {/* User Information */}
        <View style={styles.userInfoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#007BFF" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{user?.name || 'John Doe'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#007BFF" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || 'user@example.com'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="key-outline" size={20} color="#007BFF" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Password</Text>
                <Text style={styles.infoValue}>••••••••</Text>
              </View>
              <TouchableOpacity style={styles.changeButton} onPress={handlePasswordChange}>
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#007BFF" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })
                    : 'January 2024'
                  }
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Options */}
          <View style={styles.optionsSection}>
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => navigation.navigate('SettingsScreen' as never)}
            >
              <Ionicons name="settings-outline" size={20} color="#666" />
              <Text style={styles.optionText}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => navigation.navigate('HelpSupport' as never)}
            >
              <Ionicons name="help-circle-outline" size={20} color="#666" />
              <Text style={styles.optionText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => navigation.navigate('CommunityGuidelinesScreen' as never)}
            >
              <Ionicons name="document-text-outline" size={20} color="#666" />
              <Text style={styles.optionText}>Terms & Privacy</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Logout Button at Bottom */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#007BFF',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#007BFF',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007BFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#007BFF',
    fontWeight: '500',
  },
  userInfoSection: {
    paddingHorizontal: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  changeButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  changeButtonText: {
    color: '#007BFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#111',
    fontWeight: '500',
  },
  optionsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#111',
    marginLeft: 12,
    flex: 1,
  },
  logoutContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutButton: {
    backgroundColor: '#161112ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
