import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { logout, updateProfileImage, fetchUserProfileImage } from '../redux/slices/authSlice';
import { clearNotifications } from '../redux/slices/NotificationSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import api from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
const { width } = Dimensions.get('window');
const BG_HEIGHT = width * 0.6;
const PROFILE_SIZE = 110;
const CARD_TOP_RADIUS = 32;

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const user = useAppSelector((state) => state.auth.user);
  const events = useSelector((state: any) => state.events.events);
  const [uploadingImage, setUploadingImage] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
      if (!token) {
        (navigation as any).reset({
          index: 0,
          routes: [{ name: 'Auth', params: { screen: 'Login' } }],
        });
      }
  }, [token, navigation]);

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
              // Clear notification cache
              await AsyncStorage.removeItem('notifications');
            } catch {}
            dispatch(clearNotifications());
            dispatch(logout());
              (navigation as any).reset({
                index: 0,
                routes: [{ name: 'Auth', params: { screen: 'Login' } }],
              });
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

  // Stats: total created events, total joined events, and logo
  const createdEventsCount = events?.filter((event: any) => event.hostId?.toString() === currentUserId).length || 0;
  const joinedEventsCount = events?.filter((event: any) =>
    Array.isArray(event.joinedMembers) &&
    event.joinedMembers.some((m: any) => m.userId?.toString() === currentUserId)
  ).length || 0;
  // Count all requests (approval, payment verification, etc.)
  const approvalRequestsCount = events?.filter((event: any) =>
    Array.isArray(event.joinedMembers) &&
    event.joinedMembers.some((m: any) =>
      m.userId?.toString() === currentUserId &&
      (m.status === 'approval_pending' || m.status === 'payment_verification_pending' || m.status === 'approval_request' || m.status === 'payment_pending')
    )
  ).length || 0;

  const stats = [
    { icon: 'create-outline', value: createdEventsCount, label: 'Created Event' },
    { icon: 'checkmark-done-outline', value: joinedEventsCount, label: 'Joined Event' },
    { icon: 'alert-circle-outline', value: approvalRequestsCount, label: 'Requests' },
  ];

  // Profile image logic
  let profileImageSource;
  if (user?.profileImage) {
    if (user.profileImage.startsWith('http')) profileImageSource = { uri: user.profileImage };
    else if (user.profileImage.startsWith('/uploads')) profileImageSource = { uri: `${api.defaults.baseURL?.replace(/\/api$/, '')}${user.profileImage}` };
    else if (user.profileImage.startsWith('/')) profileImageSource = { uri: `${api.defaults.baseURL?.replace(/\/api$/, '')}/uploads${user.profileImage}` };
    else profileImageSource = { uri: `${api.defaults.baseURL?.replace(/\/api$/, '')}/uploads/${user.profileImage}` };
  } else {
    profileImageSource = require('../../assets/eventra_illustration.png');
  }

  // Use the same image for background and profile
  const backgroundImageSource = profileImageSource;

  return (
    <View style={styles.root}>
      {/* Background Image */}
      <Image source={backgroundImageSource} style={styles.bgImage} />
      {/* Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.logoutIconBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={26} color="#fff" />
          <Text style={styles.logoutIconText}>Logout</Text>
        </TouchableOpacity>
      </View>
      {/* White Card */}
      <View style={styles.card}>
        {/* Profile Image with Edit Icon */}
        <View style={styles.profileWrapper}>
          <TouchableOpacity onPress={handleProfileImagePick} disabled={uploadingImage}>
            <Image source={profileImageSource} style={styles.profileImg} />
            {uploadingImage && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#075cf8ff" />
              </View>
            )}
            <View style={styles.editIcon}>
              <Ionicons name="pencil" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editProfileBtnAbsolute} onPress={() => navigation.navigate('EditProfileScreen' as never)}>
            <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        {/* Name & Location */}
        <Text style={styles.name}>{user?.name || 'Eventra'}</Text>
        <Text style={styles.location}>{user?.email}</Text>
        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editProfileBtn} onPress={() => navigation.navigate('EditProfileScreen' as never)}>
          <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.editProfileBtnText}>Edit Profile</Text>
        </TouchableOpacity>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((stat, idx) => (
            <View style={styles.statItem} key={idx}>
              {typeof stat.icon === 'string' ? (
                <Ionicons name={stat.icon} size={28} color="#075cf8ff" style={{ marginBottom: 4 }} />
              ) : (
                <Image source={stat.icon} style={{ width: 28, height: 28, marginBottom: 4 }} resizeMode="contain" />
              )}
              <Text style={styles.statValue}>{stat.value}</Text>
              {stat.label ? <Text style={styles.statLabel}>{stat.label}</Text> : null}
            </View>
          ))}
        </View>
      </View>
      {/* Tabs Section */}
      <View style={styles.tabsSection}>
        {/* Invoice Tab */}
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('InvoiceScreen' as never)}>
          <Ionicons name="receipt-outline" size={28} color="#075cf8ff" style={{ marginRight: 12 }} />
          <Text style={styles.tabText}>Invoice</Text>
          <View style={styles.invoiceCountPill}>
            <Text style={styles.invoiceCountText}>{invoiceCount}</Text>
          </View>
        </TouchableOpacity>
        {/* Settings Tab */}
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('SettingsScreen' as never)}>
          <Ionicons name="settings-outline" size={28} color="#075cf8ff" style={{ marginRight: 12 }} />
          <Text style={styles.tabText}>Settings</Text>
        </TouchableOpacity>
        {/* Help & Support Tab */}
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('HelpSupport' as never)}>
          <Ionicons name="help-circle-outline" size={28} color="#075cf8ff" style={{ marginRight: 12 }} />
          <Text style={styles.tabText}>Help & Support</Text>
        </TouchableOpacity>
        {/* Terms & Privacy Tab */}
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('CommunityGuidelinesScreen' as never)}>
          <Ionicons name="document-text-outline" size={28} color="#075cf8ff" style={{ marginRight: 12 }} />
          <Text style={styles.tabText}>Terms & Privacy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F6F2',
    paddingTop: 36,
    
  },
  bgImage: {
    width: '100%',
    height: BG_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    resizeMode: 'cover',
    zIndex: 1,
  },
  topBar: {
    position: 'absolute',
    top: '1%',
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoutIconBtn: {
    backgroundColor: 'rgba(40,40,50,0.85)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 260,
  },
  logoutIconText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 4,
  },

  card: {
    marginTop: BG_HEIGHT - PROFILE_SIZE / 2,
    backgroundColor: '#fff',
    borderTopLeftRadius: CARD_TOP_RADIUS,
    borderTopRightRadius: CARD_TOP_RADIUS,
    paddingTop: PROFILE_SIZE / 2 + 16,
    paddingHorizontal: 24,
    paddingBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    zIndex: 2,
  },
  profileWrapper: {
    position: 'absolute',
    top: -PROFILE_SIZE / 2,
    alignSelf: 'center',
  },
  profileImg: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  editIcon: {
    position: 'absolute',
    right: -4,
    bottom: 8,
    backgroundColor: '#075cf8ff',
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 3,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: PROFILE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginTop: 8,
    marginBottom: 2,
    textAlign: 'center',
  },
  location: {
    fontSize: 16,
    color: '#888',
    marginBottom: 18,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#075cf8ff',
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  editProfileBtn: {
    display: 'none',
  },
  editProfileBtnAbsolute: {
    position: 'absolute',
    right: -130,
    top: '50%',
    transform: [{ translateY: -22 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(1, 64, 253, 0.85)',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  editProfileBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  tabsSection: {
    marginTop: 2,
    paddingHorizontal: 4,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 3,
    shadowColor: 'rgba(40,40,50,0.85)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tabText: {
    fontSize: 17,
    color: 'rgba(40,40,50,0.85)',
    fontWeight: '600',
    flex: 1,
  },
  invoiceCountPill: {
    backgroundColor: '#eaf6ff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
    alignItems: 'center',
    marginLeft: 8,
  },
  invoiceCountText: {
    color: '#075cf8ff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
