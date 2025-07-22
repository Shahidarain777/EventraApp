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
  ScrollView,
} from 'react-native';
import AddressPicker from '../components/AddressPicker';
import api from '../api/axios';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SignupScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
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
      let message = err?.response?.data?.message || err?.message || 'Unknown error';
      Alert.alert('Network Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#4F8CFF", "#A6C8FF"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={styles.flexContainer}>
          <ScrollView
            style={{ flex: 1, width: '100%' }}
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.signupContent}>
              <View style={styles.logoContainer}>
                <Image source={require('../../assets/EventraLogo.png')} style={styles.logoRect} resizeMode="contain" />
              </View>
              <Text style={styles.loginTitle}>Signup</Text>

              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={22} color="#8fa1c7" style={styles.icon} />
                <TextInput
                  style={styles.inputRowInput}
                  placeholder="Name"
                  placeholderTextColor="#8fa1c7"
                  value={name}
                  onChangeText={setName}
                  selectionColor="#4F8CFF"
                  autoCapitalize="words"
                />
              </View>
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
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={22} color="#8fa1c7" style={styles.icon} />
                <TextInput
                  style={styles.inputRowInput}
                  placeholder="Password"
                  placeholderTextColor="#8fa1c7"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  selectionColor="#4F8CFF"
                />
                <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#8fa1c7"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.inputRow}>
                <Ionicons name="description-outline" size={22} color="#8fa1c7" style={styles.icon} />
                <TextInput
                  style={styles.inputRowInput}
                  placeholder="Bio (optional)"
                  placeholderTextColor="#8fa1c7"
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={2}
                  maxLength={120}
                />
              </View>
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
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignupScreen;

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
  signupContent: {
    width: '100%',
    maxWidth: 370,
    alignSelf: 'center',
    marginTop: -50,
    marginBottom: 10,
    alignItems: 'center',
    gap: 14,
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
  loginLinkBlue: {
    color: '#4F8CFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: -5,
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
  addressRowFlat: {
    width: '100%',
    flexDirection: 'row',
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
  signupBtnModern: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 90,
    marginBottom: 10,
    elevation: 2,
  },
  signupBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loginLinkBottom: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 10,
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
});