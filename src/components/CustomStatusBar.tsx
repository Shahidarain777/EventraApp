import React from 'react';
import { View, StatusBar, StyleSheet, Platform } from 'react-native';

const CustomStatusBar = () => {
  return (
    <View style={styles.statusBarContainer}>
      <StatusBar
        barStyle="dark-content" // Dark text (best option available)
        backgroundColor="#fff" // White background
      />
    </View>
  );
};

const styles = StyleSheet.create({
  statusBarContainer: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight : 44, // 44 for iOS notch
    backgroundColor: '#fff', // White background
  },
});

export default CustomStatusBar;
