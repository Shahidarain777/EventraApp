// App.tsx

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigators/RootNavigator';
import store, { persistor, AppDispatch,RootState } from './src/redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginFromStorage, updateProfileImage, fetchUserProfileImage } from './src/redux/slices/authSlice';
import { PersistGate } from 'redux-persist/integration/react';
import { navigationRef } from './src/navigators/NavigationService';
import { setupInterceptors } from './src/api/setupInterceptors';
import 'react-native-get-random-values';
import CustomStatusBar from './src/components/CustomStatusBar';
// import OneSignal from 'react-native-onesignal';
// import { initNotifications } from './src/redux/slices/NotificationSlice';
// import api from './src/api/axios';
// import { Alert } from 'react-native';

// Setup API interceptors once when app starts
setupInterceptors();

const AppEntry = () => {
  ;
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch() as AppDispatch;
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {

  // 4️⃣ Check token & restore user session
    const checkToken = async () => {
      try {
        if (token) {
          // Fetch profile image after login
          try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
              const user = JSON.parse(userData);
              if (user?.id) {
                const profileImageResult = await dispatch(fetchUserProfileImage(user.id));

                // Save profile image for offline access
                if (profileImageResult.payload) {
                  await AsyncStorage.setItem(
                    `profileImage_${user.id}`,
                    profileImageResult.payload as string
                  );
                }
              }
            }
          } catch (profileError) {
            console.log('Failed to fetch profile image from DB:', profileError);

            // Fallback: load from AsyncStorage
            try {
              const userData = await AsyncStorage.getItem('userData');
              if (userData) {
                const user = JSON.parse(userData);
                const savedProfileImage = await AsyncStorage.getItem(
                  `profileImage_${user.id}`
                );
                if (savedProfileImage) {
                  dispatch(updateProfileImage(savedProfileImage));
                }
              }
            } catch (fallbackError) {
              console.log('Failed to load profile image from storage:', fallbackError);
            }
          }
        }
      } catch (e) {
        console.log('Token check failed:', e);
      } finally {
        setLoading(false);
      }
    };

    checkToken();

  // No cleanup needed
  }, []);

  if (loading) return null; // Splash screen placeholder

  return <RootNavigator />;
};

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer ref={navigationRef}>
          {/* Add space for status bar */}
          <React.Fragment>
             {/* <StatusBar backgroundColor="#fff" barStyle="dark-content" /> */}
            {/* <StatusBar barStyle='light-content' backgroundColor="#fff" /> */}
             <CustomStatusBar />
            <AppEntry />
          </React.Fragment>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
