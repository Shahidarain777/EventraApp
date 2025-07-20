import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import { AuthStackParamList } from '../types/navigations';
import IntroScreen from '../screens/IntroScreen';
import SplashTransitionScreen from '../screens/SplashTransitionScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="SplashTransition" component={SplashTransitionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
