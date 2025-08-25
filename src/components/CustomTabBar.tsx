import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : typeof options.title === 'string'
            ? options.title
            : route.name;

        const isFocused = state.index === index;
        let iconName = '';
        let iconSize = 28;
        let iconColor = isFocused ? '#075cf8ff' : '#fff';

        switch (route.name) {
          case 'Home':
            iconName = isFocused ? 'home' : 'home-outline';
            break;
          case 'MyEvents':
            iconName = isFocused ? 'calendar' : 'calendar-outline';
            break;
          case 'CreateEvent':
            iconName = 'add-outline';
            iconSize = 38;
            iconColor = isFocused ? '#075cf8ff' : '#075cf8ff';
            break;
          case 'Search':
            iconName = isFocused ? 'search' : 'search-outline';
            break;
          case 'Profile':
            iconName = isFocused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'ellipse-outline';
        }

        // Central elevated button for CreateEvent
        if (route.name === 'CreateEvent') {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={() => navigation.navigate(route.name)}
              style={styles.centerButton}
              activeOpacity={0.8}
            >
              <View style={styles.centerIconWrapper}>
                <Ionicons name={iconName} size={iconSize} color={iconColor} />
              </View>
              <Text style={styles.centerLabel}>{label === 'Create Event' ? 'Visit' : label}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={() => navigation.navigate(route.name)}
            style={styles.tabButton}
            activeOpacity={0.8}
          >
            <Ionicons name={iconName} size={iconSize} color={iconColor} />
            <Text style={[styles.label, isFocused && styles.labelFocused]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(40,40,50,0.85)',
    // borderTopLeftRadius: 32,
    // borderTopRightRadius: 32,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 0 : 0, // Increased gap
    height: 90,
    marginHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 13,
    color: '#fff',
    marginTop: 2,
    fontWeight: '500',
  },
  labelFocused: {
    color: '#075cf8ff',
    fontWeight: 'bold',
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    flex: 1,
  },
  centerIconWrapper: {
    backgroundColor: '#cfced8ff',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#075cf8ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  centerLabel: {
    fontSize: 15,
    color: '#fff',
    marginTop: 4,
    fontWeight: 'bold',
  },
});

export default CustomTabBar;
