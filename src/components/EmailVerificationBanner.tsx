import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../api/axios';

const EmailVerificationBanner = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(false);

  // Don't show banner if user is verified or doesn't exist
  if (!user || user.isEmailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'Email address not found');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/resend-verification', { email: user.email });
      if (response.status === 200) {
        Alert.alert(
          'Verification Email Sent',
          'A new verification email has been sent to your email address. Please check your inbox and spam folder.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend verification email.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'Email address not found');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/check-email-verification?email=${encodeURIComponent(user.email)}`);
      if (response.status === 200 && response.data.isEmailVerified) {
        Alert.alert(
          'Email Verified!',
          'Your email has been verified. Please refresh the app to continue.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Not Verified', 'Your email is not yet verified. Please check your inbox for the verification email.');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to check verification status.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.banner}>
      <View style={styles.bannerContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="warning-outline" size={20} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.bannerTitle}>Email Not Verified</Text>
          <Text style={styles.bannerText}>
            Please verify your email address to access all features.
          </Text>
        </View>
      </View>
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCheckVerification}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>Check</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.resendButton]}
          onPress={handleResendVerification}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#4F8CFF" />
          ) : (
            <Text style={styles.resendButtonText}>Resend</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EmailVerificationBanner;

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FF6B35',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  resendButton: {
    backgroundColor: '#fff',
  },
  resendButtonText: {
    color: '#FF6B35',
    fontWeight: '600',
    fontSize: 14,
  },
}); 