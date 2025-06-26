import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigations';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loginUser } from '../redux/slices/authSlice';

type RootNav = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

const LoginScreen = () => {
  const navigation = useNavigation<RootNav>();
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
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});
