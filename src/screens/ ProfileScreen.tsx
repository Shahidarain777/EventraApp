import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  SafeAreaView,
  Alert 
} from 'react-native';
import { logout } from '../redux/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [profileImage, setProfileImage] = useState<string | null>(null);

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
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  const handleProfileImagePick = () => {
    launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
      selectionLimit: 1,
    }, (response) => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets && response.assets[0]) {
        setProfileImage(response.assets[0].uri || null);
      }
    });
  };

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
          <TouchableOpacity style={styles.profileImageContainer} onPress={handleProfileImagePick}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Icon name="account" size={60} color="#ccc" />
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Icon name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
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
            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="settings-outline" size={20} color="#666" />
              <Text style={styles.optionText}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="help-circle-outline" size={20} color="#666" />
              <Text style={styles.optionText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
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
