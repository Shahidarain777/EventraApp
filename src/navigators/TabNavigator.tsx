import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ ProfileScreen';
import CreateEventScreen from '../screens/CreateEventScreen';


const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen 
        name="CreateEvent" 
        component={CreateEventScreen} 
        options={{ tabBarButton: () => null, headerShown: false }} // Hide from tab bar
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
