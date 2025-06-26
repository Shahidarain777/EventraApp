import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const HomeScreen = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Home Screen</Text>
      <Text>{user?.name} Welcome to the Eventra App!</Text>
    </View>
  );
};

export default HomeScreen;

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
