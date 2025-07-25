import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ManageEventScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Event</Text>
      {/* Future implementation will go here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
  },
});

export default ManageEventScreen;
