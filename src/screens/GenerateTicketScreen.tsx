import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GenerateTicketScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generate Ticket</Text>
      {/* Ticket UI will be implemented here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7faff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
});

export default GenerateTicketScreen;
