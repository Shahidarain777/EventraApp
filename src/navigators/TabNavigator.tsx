import MyEventsScreen from '../screens/MyEventsScreen';
import SearchScreen from '../screens/SearchScreen';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ ProfileScreen';
import CreateEventScreen from '../screens/CreateEventScreen';

import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyEvents" component={MyEventsScreen} options={{ tabBarLabel: 'MyEvents' }} />
      <Tab.Screen name="CreateEvent" component={CreateEventScreen} options={{ tabBarLabel: 'Post' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: 'Search' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
