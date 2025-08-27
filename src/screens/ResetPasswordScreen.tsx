import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigators/RootNavigator';
import api from '../api/axios';

type ResetPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ResetPasswordScreen'>;

const ResetPasswordScreen = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'ResetPasswordScreen'>>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const email = route.params?.email || '';

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter both passwords');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
  const response = await api.put('/forgot-password-update', { email, newPassword, confirmPassword });
      if (response.data && response.data.message) {
        Alert.alert('Success', response.data.message, [
          {
              text: 'OK',
              onPress: () => (navigation as any).reset({
                index: 0,
                routes: [
                  { name: 'Auth', params: { screen: 'Login' } }
                ],
              })
          }
        ]);
      } else {
        Alert.alert('Error', 'Failed to update password');
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
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your new password below.</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="New Password"
          placeholderTextColor="#8fa1c7"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNewPassword}
        />
        <TouchableOpacity onPress={() => setShowNewPassword((prev) => !prev)}>
          <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={22} color="#8fa1c7" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Confirm Password"
          placeholderTextColor="#8fa1c7"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)}>
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color="#8fa1c7" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Submit'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetPasswordScreen;

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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    marginBottom: 18,
    height: 48,
    width: '100%',
  },
  input: {
    fontSize: 16,
    color: '#040404ff',
    backgroundColor: 'transparent',
    paddingVertical: 0,
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
