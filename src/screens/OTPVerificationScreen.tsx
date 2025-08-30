import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigators/RootNavigator';
import api from '../api/axios';

// Add this screen to your navigator

type OTPVerificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OTPVerificationScreen'>;

const OTPVerificationScreen = () => {
  const navigation = useNavigation<OTPVerificationScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'OTPVerificationScreen'>>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const email = route.params?.email || '';
  // Get source screen from params
  const source = route.params?.source || '';

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/verify-password-otp', { email, otp });
      if (response.data && response.data.message) {
        Alert.alert('Success', response.data.message, [
          {
            text: 'OK',
            onPress: () => {
              if (source === 'ForgotPasswordScreen') {
                navigation.navigate('ResetPasswordScreen', { email });
              } else if (source === 'SignupScreen') {
                (navigation as any).reset({
                  index: 0,
                  routes: [
                    { name: 'Auth', params: { screen: 'Login' } }
                  ],
                });
              }
            }
          }
        ]);
      } else {
        Alert.alert('Error', 'Failed to verify OTP');
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Network error');
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.subtitle}>Enter the OTP sent to your email and set your new password.</Text>
      <TextInput
        style={styles.input}
        placeholder="OTP"
        placeholderTextColor="#1e232dff"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Submit'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OTPVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    fontSize: 16,
    color: '#222',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 18,
    height: 48,
  },
  button: {
    width: '100%',
    backgroundColor: '#4F8CFF',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});
