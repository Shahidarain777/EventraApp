import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../api/axios';

const EmailVerificationScreen = () => {

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    // Get email from route params or from signup
    // Fix: ensure route.params is typed as an object with email
    const routeEmail = (route.params && (route.params as any).email) || '';
    if (routeEmail) {
      setEmail(routeEmail);
    }
  }, [route.params]);

  const handleVerifyEmail = async (token: string) => {
    setLoading(true);
    try {
      const response = await api.post('/verify-email', { token });
      if (response.status === 200) {
        setVerificationStatus('success');
        Alert.alert(
            'Email Verified!',
            'Your email has been successfully verified. You can now log in to your account.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('LoginScreen'), // Use correct screen name
              },
            ]
          );
      }
    } catch (error: any) {
      setVerificationStatus('error');
      const message = error.response?.data?.message || 'Verification failed. Please try again.';
      Alert.alert('Verification Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      Alert.alert('Error', 'Email address is required');
      return;
    }

    setResendLoading(true);
    try {
      const response = await api.post('/resend-verification', { email });
      if (response.status === 200) {
        Alert.alert(
          'Verification Email Sent',
          'A new verification email has been sent to your email address. Please check your inbox and spam folder.',
          [{ text: 'OK' }]
        );
        setShowResendModal(false);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to resend verification email.';
      Alert.alert('Error', message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!email) {
      Alert.alert('Error', 'Email address is required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/check-email-verification?email=${encodeURIComponent(email)}`);
      if (response.status === 200 && response.data.isEmailVerified) {
        setVerificationStatus('success');
        Alert.alert(
            'Email Already Verified!',
            'Your email has been verified. You can now log in to your account.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('LoginScreen'), // Use correct screen name
              },
            ]
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
    <LinearGradient colors={["#075cf8ff", "#4f89e6ff"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={styles.flexContainer}>
          <ScrollView
            style={{ flex: 1, width: '100%' }}
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.verificationContent}>
              <View style={styles.logoContainer}>
                <Image source={require('../../assets/EventraLogo.png')} style={styles.logoRect} resizeMode="contain" />
              </View>
              
              <View style={styles.iconContainer}>
                <Ionicons name="mail-check-outline" size={80} color="#4F8CFF" />
              </View>
              
              <Text style={styles.title}>Verify Your Email</Text>
              <Text style={styles.subtitle}>
                We've sent a verification email to:
              </Text>
              <Text style={styles.emailText}>{email}</Text>
              
              <Text style={styles.description}>
                Please check your inbox and click the verification link to activate your account. 
                If you don't see the email, check your spam folder.
              </Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.primaryButton} 
                  onPress={handleCheckVerification}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>I've Verified My Email</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.secondaryButton} 
                  onPress={() => setShowResendModal(true)}
                  disabled={resendLoading}
                >
                  <Text style={styles.secondaryButtonText}>Resend Verification Email</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.backButtonText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Resend Modal */}
      <Modal
        visible={showResendModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Resend Verification Email</Text>
            <Text style={styles.modalDescription}>
              Enter your email address to receive a new verification email.
            </Text>
            
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={22} color="#8fa1c7" style={styles.icon} />
              <TextInput
                style={styles.inputRowInput}
                placeholder="Email"
                placeholderTextColor="#8fa1c7"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                selectionColor="#4F8CFF"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setShowResendModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalConfirmButton} 
                onPress={handleResendVerification}
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Send</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

export default EmailVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  flexContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '8%',
    paddingHorizontal: '4%',
  },
  verificationContent: {
    width: '100%',
    maxWidth: 370,
    alignSelf: 'center',
    marginTop: -50,
    marginBottom: 10,
    alignItems: 'center',
    gap: 20,
    backgroundColor: 'transparent',
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 1,
  },
  logoRect: {
    width: 260,
    height: 120,
    marginBottom: 'auto',
    alignSelf: 'center',
    borderRadius: 16,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F8CFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#222',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4F8CFF',
  },
  secondaryButtonText: {
    color: '#4F8CFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  backButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    opacity: 0.95,
  },
  icon: {
    marginLeft: 8,
    marginRight: 8,
  },
  inputRowInput: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#1a1a1a',
    fontSize: 18,
    borderWidth: 0,
    fontWeight: '400',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#4F8CFF',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 