// App.tsx

import React, { useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigators/RootNavigator';
import store, { persistor, AppDispatch } from './src/redux/store'; // ⬅️ Added AppDispatch here
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginFromStorage } from './src/redux/slices/authSlice';
import { PersistGate } from 'redux-persist/integration/react';
import { navigationRef } from './src/navigators/NavigationService';

const AppEntry = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch() as AppDispatch; // ✅ Cast dispatch here

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          await dispatch(loginFromStorage(token)); // ✅ No TypeScript error now
        }
      } catch (e) {
        console.log('Token check failed:', e);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  if (loading) return null; // Splash screen placeholder

  return <RootNavigator />;
};

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer ref={navigationRef}>
          <AppEntry />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
