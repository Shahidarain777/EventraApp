import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import AddressPicker from '../components/AddressPicker';
import ProfileImagePicker from '../components/ProfileImagePicker';

import api from '../api/axios';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const SignupScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Validation Error', 'Name, email, and password are required');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/signup', {
        name,
        email,
        password,
        bio,
        profileImage,
        Address: { city, state, Country: country },
      });
      if (response.status === 201) {
        Alert.alert('Success', 'Account created! Please login.');
        navigation.goBack();
      } else {
        const msg = (response as any).data?.message || 'Unknown error';
        Alert.alert('Signup Failed', msg);
      }
    } catch (err: any) {
      let message = 'Unknown error';
      if (err instanceof Error) {
        message = err.message;
      } else if (err && typeof err === 'object' && 'response' in err && (err as any).response?.data?.message) {
        message = (err as any).response.data.message;
      }
      Alert.alert('Network Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#4F8CFF", "#A6C8FF"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={styles.signupContent}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/EventraLogo.png')} style={styles.logoRect} resizeMode="contain" />
          </View>
          <Text style={styles.loginTitle}>Signup</Text>
          <TextInput
            placeholder="Name"
            placeholderTextColor="#8fa1c7"
            style={styles.loginInput}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#8fa1c7"
            style={styles.loginInput}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#8fa1c7"
            style={styles.loginInput}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            placeholder="Bio (optional)"
            placeholderTextColor="#8fa1c7"
            style={styles.loginInput}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            maxLength={120}
          />
          <View style={styles.addressRowFlat}>
            <View style={styles.addressCol}>
              <AddressPicker
                country={country}
                setCountry={setCountry}
                state={state}
                setState={setState}
                city={city}
                setCity={setCity}
              />
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.signupBtnModern} onPress={handleSignup} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.signupBtnText}>Sign Up</Text>
          )}
        </TouchableOpacity>
        <View style={styles.loginLinkBottom}>
          <Text style={styles.loginLinkBottomText}>
            Already have an account?{' '}
            <Text style={styles.loginLinkBlue} onPress={() => navigation.goBack()}>Login</Text>
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
  signupContent: {
    width: '100%',
    maxWidth: 370,
    alignSelf: 'center',
    marginTop: 36,
    marginBottom: 10,
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'transparent',
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  logoRect: {
    width: 260,
    height: 120,
    marginBottom: 12,
    alignSelf: 'center',
    // backgroundColor: 'white',
    borderRadius: 16,
  },
  loginLinkBlue: {
    color: '#4F8CFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#EAF0FA',
    marginBottom: 10,
    alignSelf: 'center',
    backgroundColor: '#f4f7fb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F8CFF',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  addressRowFlat: {
    width: '100%',
    flexDirection: 'row',
    gap: 0,
    backgroundColor: 'transparent',
    marginBottom: 0,
    marginTop: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressCol: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    marginTop: 0,
    letterSpacing: 0.2,
    textAlign: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  loginInput: {
    width: '100%',
    backgroundColor: '#EAF0FA',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    color: '#1a1a1a',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#C7D3EA',
    fontWeight: '400',
    opacity: 0.95,
    marginBottom: 0,
  },
  formFields: {
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
    gap: 10,
  },
  inputModern: {
    width: '100%',
    backgroundColor: '#F4F7FB',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 0,
    color: '#1a1a1a',
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#E0E8F5',
    fontWeight: '400',
    opacity: 0.98,
    shadowColor: '#4F8CFF',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  addressLabelModern: {
    alignSelf: 'flex-start',
    fontSize: 15,
    fontWeight: '600',
    color: '#4F8CFF',
    marginBottom: 6,
    marginTop: 8,
    marginLeft: 2,
    letterSpacing: 0.2,
  },
  addressRowModern: {
    width: '100%',
    backgroundColor: '#F7FAFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EAF0',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    shadowColor: '#4F8CFF',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  signupBtnModern: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
    elevation: 2,
  },
  loginLinkBottom: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 2,
    paddingBottom: 8,
  },
  loginLinkBottomText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.1,
    opacity: 0.95,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 24,
    marginTop: 24,
    letterSpacing: 0.5,
  },
  input: {
    width: 320,
    maxWidth: '100%',
    backgroundColor: '#EAF0FA',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
    color: '#1a1a1a',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#C7D3EA',
    fontWeight: '400',
    opacity: 0.95,
  },
  bioInput: {
    width: 320,
    maxWidth: '100%',
    backgroundColor: '#f7faff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
    color: '#1a1a1a',
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#C7D3EA',
    fontWeight: '400',
    opacity: 0.95,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  addressLabel: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
    marginTop: 4,
    marginLeft: 2,
    letterSpacing: 0.2,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 320,
    maxWidth: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EAF0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  signupBtn: {
    width: 320,
    maxWidth: '100%',
    backgroundColor: '#222',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 18,
    elevation: 1,
  },
  signupBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loginLinkWrapper: {
    marginBottom: 24,
  },
  loginLink: {
    color: '#4F8CFF',
    fontWeight: 'bold',
    fontSize: 17,
    textDecorationLine: 'underline',
    marginLeft: 2,
  },
});
