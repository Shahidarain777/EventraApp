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
  const events = useSelector((state: any) => state.events.events);
  const [uploadingImage, setUploadingImage] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);

  const currentUserId = user?._id?.toString() || '';
  const invoiceCount = events?.filter((event: any) =>
    Array.isArray(event.joinedMembers) &&
    event.joinedMembers.some((m: any) => m.userId?.toString() === currentUserId && m.status === 'payment_pending')
  ).length;

  useEffect(() => {
    loadProfileImage();
  }, [user?._id]);

  const loadProfileImage = async () => {
    if (!user?._id) return;

    try {
      const result = await dispatch(fetchUserProfileImage(user._id));
      if (result.payload) {
        await saveProfileImageToStorage(result.payload as string);
      } else {
        await loadProfileImageFromStorage();
      }
    } catch (error) {
      await loadProfileImageFromStorage();
    }
  };

  const loadProfileImageFromStorage = async () => {
    try {
      const savedProfileImage = await AsyncStorage.getItem(`profileImage_${user?._id}`);
      if (savedProfileImage && user && !user.profileImage) {
        dispatch(updateProfileImage(savedProfileImage));
      }
    } catch {}
  };

  const saveProfileImageToStorage = async (imageUrl: string) => {
    try {
      if (user?._id) {
        await AsyncStorage.setItem(`profileImage_${user._id}`, imageUrl);
      }
    } catch {}
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user?._id) {
                await AsyncStorage.removeItem(`profileImage_${user._id}`);
              }
            } catch {}
            dispatch(logout());
          },
        },
      ]
    );
  };

  const handleProfileImagePick = () => {
    launchImageLibrary({
      mediaType: 'photo',
      quality: 0.3,
      maxWidth: 800,
      maxHeight: 800,
      selectionLimit: 1,
    }, async (response) => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (!asset.uri) return;

        if (asset.fileSize && asset.fileSize > 20 * 1024 * 1024) {
          Alert.alert('Image too large', 'Please select a smaller image.');
        }

        setUploadingImage(true);

        try {
          const formData = new FormData();
          formData.append('image', {
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `profile_${Date.now()}.jpg`,
          } as any);
          formData.append('eventId', 'profile');

          const response = await api.post('/upload_image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
            timeout: 30000,
          });

          const uploadedImage = response.data?.image;
          if (uploadedImage?.url) {
            const imageUrl = uploadedImage.url;

            if (user && user._id) {
              try {
                await api.put(`/users/${user._id}`, { profileImage: imageUrl }, {
                  headers: { Authorization: `Bearer ${token}` },
                });
              } catch {}

              dispatch(updateProfileImage(imageUrl));
              await saveProfileImageToStorage(imageUrl);
              Alert.alert('Success', 'Profile image updated successfully!');
            }
          } else if (response.status === 201) {
            Alert.alert('Success', 'Profile image updated successfully!');
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error: any) {
          let errorMessage = 'Failed to upload image. Please try again.';
          if (error.response?.status === 413) {
            errorMessage = 'Image is too large.';
          } else if (error.response?.status === 404) {
            errorMessage = 'Upload service not found.';
          } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Upload timeout.';
          }
          Alert.alert('Upload Failed', errorMessage);
        } finally {
          setUploadingImage(false);
        }
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHorizontalCard}>
          <View style={styles.profileHorizontalRow}>
            <TouchableOpacity 
              style={styles.profileImageHorizontalContainer} 
              onPress={handleProfileImagePick}
              disabled={uploadingImage}
            >
              {user?.profileImage ? (
                <Image
                  source={{
                    uri: (() => {
                      if (user.profileImage.startsWith('http')) return user.profileImage;
                      if (user.profileImage.startsWith('/uploads')) {
                        return `${api.defaults.baseURL?.replace(/\/api$/, '')}${user.profileImage}`;
                      }
                      if (user.profileImage.startsWith('/')) {
                        return `${api.defaults.baseURL?.replace(/\/api$/, '')}/uploads${user.profileImage}`;
                      }
                      return `${api.defaults.baseURL?.replace(/\/api$/, '')}/uploads/${user.profileImage}`;
                    })()
                  }}
                  style={styles.profileImageHorizontal}
                />
              ) : (
                <View style={styles.placeholderImageHorizontal}>
                  <Ionicons name="person-outline" size={60} color="#007BFF" />
                </View>
              )}
              {uploadingImage && (
                <View style={styles.loadingOverlayHorizontal}>
                  <ActivityIndicator size="large" color="#007BFF" />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.profileTextColumn}>
              <Text style={styles.profileName}>{user?.name || 'Eventra'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'appeventra@gmail.com'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileBtn} onPress={() => navigation.navigate('EditProfileScreen' as never)}>
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.invoiceCardWrapper}>
          <TouchableOpacity style={styles.invoiceCardBtn} onPress={() => navigation.navigate('InvoiceScreen' as never)}>
            <Ionicons name="receipt-outline" size={38} color="#2788ff" style={{ marginBottom: 8 }} />
            <Text style={styles.invoiceCardLabel}>Invoice</Text>
            <View style={styles.invoiceCountPill}>
              <Text style={styles.invoiceCountText}>{invoiceCount}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.optionsSection}>
          <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('SettingsScreen' as never)}>
            <Ionicons name="settings-outline" size={20} color="#666" />
            <Text style={styles.optionText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('HelpSupport' as never)}>
            <Ionicons name="help-circle-outline" size={20} color="#666" />
            <Text style={styles.optionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem} onPress={() => navigation.navigate('CommunityGuidelinesScreen' as never)}>
            <Ionicons name="document-text-outline" size={20} color="#666" />
            <Text style={styles.optionText}>Terms & Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  invoiceCardWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
  },
  invoiceCardBtn: {
    backgroundColor: '#fff',
    borderRadius: 22,
    width: '90%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  invoiceCardLabel: {
    
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  invoiceCountPill: {
    backgroundColor: '#eaf6ff',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 4,
    alignItems: 'center',
    marginTop: 2,
  },
  invoiceCountText: {
    color: '#2788ff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  invoiceTabWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  invoiceTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 40,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    marginVertical: 8,
  },
  invoiceTabText: {
    color: '#0059ffff',
    fontWeight: 'bold',
    fontSize: 22,
    marginLeft: 6,
  },
  profileHorizontalCard: {
    backgroundColor: '#0059ffff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 18,
    flexDirection: 'column',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  profileHorizontalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  profileImageHorizontalContainer: {
    marginRight: 16,
    position: 'relative',
  },
  profileImageHorizontal: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#e6f2ea',
  },
  placeholderImageHorizontal: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e6f2ea',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  loadingOverlayHorizontal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTextColumn: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#e6f2ea',
    fontWeight: '500',
  },
  editProfileBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    elevation: 1,
  },
  editProfileBtnText: {
    color: '#0059ffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
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
    backgroundColor: '#f7faff',

  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f7faff',
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
    borderRadius: 30,
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
