import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  const handleRequest = () => {
    if (!email) {
      Alert.alert('Validation Error', 'Please enter your registered email.');
      return;
    }
    // TODO: Implement password reset logic here
    Alert.alert('Request Sent', 'If the email is registered, you will receive password reset instructions.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/EventraLogo.png')} style={styles.logoRect} resizeMode="contain" />
      </View>
      <Text style={styles.title}>Forgotten Password ?</Text>
      <Text style={styles.subtitle}>
        Enter your Registered email that have been entered in Eventra profile. After verification the password will be sent to provided email.
      </Text>
      <View style={styles.inputRow}>
        <Ionicons name="mail-outline" size={22} color="#8fa1c7" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8fa1c7"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleRequest}>
          <Text style={styles.buttonText}>Request</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 10,
    minHeight: 80,
    justifyContent: 'center',
  },
  logoRect: {
    width: 260,
    height: 120,
    marginBottom: 12,
    alignSelf: 'center',
    borderRadius: 16,
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
    marginBottom: 28,
    width: '100%',
    height: 48,
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 8,
    tintColor: '#8fa1c7',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#4F8CFF',
    borderRadius: 24,
    paddingVertical: 14,
    marginHorizontal: 8,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});
