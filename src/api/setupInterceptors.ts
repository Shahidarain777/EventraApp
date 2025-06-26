// src/api/setupInterceptors.ts

import api from './axios';
import  store  from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import { Alert } from 'react-native';

export const setupInterceptors = () => {
  api.interceptors.request.use(
    (config) => {
      const token = store.getState().auth.token;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 👉 Catch 401 errors (unauthorized)
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Optionally alert user
        Alert.alert('Session expired', 'Please log in again.');

        // Remove token + user from Redux
        store.dispatch(logout());

        // Optionally: force navigate to Login screen
        // since we’re outside a React component, use navigate ref
        import('../navigators/NavigationService').then((navService) => {
          navService.resetToLogin();
        });
      }

      return Promise.reject(error);
    }
  );
};
