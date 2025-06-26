import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  auth: authReducer,
  // ... other reducers
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // persist only auth
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // optional: for non-serializable items in redux-persist
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
