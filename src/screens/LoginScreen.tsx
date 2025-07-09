import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Pressable,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, RootStackParamList } from '../types/navigations';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loginUser } from '../redux/slices/authSlice';
// import {Signup} from '../redux/slices/authSlice'; // Import Signup action if needed

type RootNav = NativeStackNavigationProp<RootStackParamList, 'Auth'>;
// Replace 'Login' with the actual screen name key from your AuthStackParamList
type SignUpNav = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;


const LoginScreen = () => {
  const navigation = useNavigation<RootNav>();
    const navi = useNavigation<SignUpNav>();
  

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Email and Password are required');
      return;
    }

    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(result)) {
      navigation.replace('Main'); // 🎯 Navigate on successful login
    } else {
      Alert.alert('Login Failed', result.payload || 'Unknown error');
    }
  };

  return (
    <LinearGradient colors={["#4F8CFF", "#A6C8FF"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={styles.formSimpleCentered}>
          <Text style={styles.loginTitle}>Login</Text>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#8fa1c7"
            style={styles.inputSimpleCentered}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            selectionColor="#4F8CFF"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#8fa1c7"
            style={styles.inputSimpleCentered}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            selectionColor="#4F8CFF"
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <TouchableOpacity style={styles.loginBtnSimple} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.loginBtnTextSimple}>Login</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.googleBtnSimple} onPress={() => Alert.alert('Google Login', 'Google login pressed')}>
            <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png' }} style={styles.googleIconSimple} />
            <Text style={styles.googleBtnTextSimple}>Continue with Google</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
  
        <Pressable onPress={() => navi.navigate('Signup')}>
            <Text style={styles.signupLink}>Signup</Text>
        </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
  // Remove card/box styles, use simple layout
  // headerSimple removed, title now inside form
  formSimpleCentered: {
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginTop: 60,
  },
  inputSimpleCentered: {
    width: '100%',
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
  loginBtnSimple: {
    width: '100%',
    backgroundColor: '#222',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 16,
    elevation: 1,
  },
  loginBtnTextSimple: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 19,
    letterSpacing: 0.5,
  },
  googleBtnSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F8CFF',
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    marginBottom: 2,
    marginTop: 2,
    elevation: 1,
  },
  googleIconSimple: {
    width: 22,
    height: 22,
    marginRight: 10,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  googleBtnTextSimple: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  loginTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    backgroundColor: '#F3F6FA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    color: '#222',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E3EAF2',
  },
  loginBtn: {
    width: '100%',
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F8CFF',
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 2,
    marginTop: 2,
    shadowColor: '#4F8CFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  googleBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 18,
  },
  signupText: {
    color: '#222',
    fontSize: 17,
  },
  signupLink: {
    color: '#4F8CFF',
    fontWeight: 'bold',
    fontSize: 17,
    textDecorationLine: 'underline',
    marginLeft: 2,
  },
});
