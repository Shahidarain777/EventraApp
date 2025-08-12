// App.tsx

import React, { useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigators/RootNavigator';
import store, { persistor, AppDispatch } from './src/redux/store'; // ⬅️ Added AppDispatch here
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginFromStorage, updateProfileImage, fetchUserProfileImage } from './src/redux/slices/authSlice';
import { PersistGate } from 'redux-persist/integration/react';
import { navigationRef } from './src/navigators/NavigationService';
import { setupInterceptors } from './src/api/setupInterceptors';
import 'react-native-get-random-values';
import OneSignal from 'react-native-onesignal';
// Setup API interceptors once when app starts
setupInterceptors();


const AppEntry = () => {



  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch() as AppDispatch; // ✅ Cast dispatch here
  
  useEffect(() => {
    // Adjust for OneSignal v4 vs v5: prefer v4 API fallback if initialize() not present
    try {
      if (typeof (OneSignal as any).initialize === 'function') {
        (OneSignal as any).initialize('cfebaa5f-c0e5-4009-b951-e4f8efff21f2');
        if ((OneSignal as any).Notifications?.requestPermission) {
          (OneSignal as any).Notifications.requestPermission(true);
        }
      } else if (typeof (OneSignal as any).setAppId === 'function') {
        (OneSignal as any).setAppId('cfebaa5f-c0e5-4009-b951-e4f8efff21f2');
        if ((OneSignal as any).promptForPushNotificationsWithUserResponse) {
          (OneSignal as any).promptForPushNotificationsWithUserResponse();
        }
      }
    } catch (err) {
      console.log('OneSignal init error:', err);
    }
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const result = await dispatch(loginFromStorage(token)); // ✅ No TypeScript error now
          
          // Fetch profile image from database after successful login
          try {
            // Get user info from the loginFromStorage result or from stored user data
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
              const user = JSON.parse(userData);
              if (user?.id) {
                // Fetch profile image from uploaded_images table
                const profileImageResult = await dispatch(fetchUserProfileImage(user.id));
                
                // If profile image is found, also save it to AsyncStorage for offline access
                if (profileImageResult.payload) {
                  await AsyncStorage.setItem(`profileImage_${user.id}`, profileImageResult.payload as string);
                }
              }
            }
          } catch (profileError) {
            console.log('Failed to fetch profile image from database:', profileError);
            
            // Fallback: try to load from AsyncStorage
            try {
              const userData = await AsyncStorage.getItem('userData');
              if (userData) {
                const user = JSON.parse(userData);
                const savedProfileImage = await AsyncStorage.getItem(`profileImage_${user.id}`);
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
