import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ ProfileScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchScreen from '../screens/SearchScreen';
import MyEventsScreen from '../screens/MyEventsScreen';


const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'CreateEvent') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen
        name="MyEvents"
        component={MyEventsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
          tabBarLabel: 'My Events',
        }}
      />
      <Tab.Screen 
        name="CreateEvent" 
        component={CreateEventScreen} 
        options={{ 
          headerShown: false,
          tabBarLabel: 'Create Event'
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" color={color} size={size} />
          ),
          tabBarLabel: 'Search',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
