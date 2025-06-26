import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { logout } from '../redux/slices/authSlice';
import { useAppDispatch } from '../redux/hooks';

const ProfileScreen = () => {
 const dispatch = useAppDispatch();

  const handleLogout=()=>{
    dispatch(logout());
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile Screen</Text>
      <Text>This is where user profile info will go.</Text>

         <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
