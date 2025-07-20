import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios'; // Your Axios instance
import AsyncStorage from '@react-native-async-storage/async-storage';

// User model
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // Add phone number field
  role?: string; // Add role field
  createdAt?: string; // Add creation date field
  profileImage?: string; // Add profile image URL field
  // Add more fields if needed
}

// State type
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// 🔐 Login API thunk
const loginUser = createAsyncThunk<
  { user: User; token: string },
  { email: string; password: string },
  { rejectValue: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/login', credentials);

    const token = response.headers['authorization']; // 👈 correct spelling

    if (!token) {
      throw new Error('Authorization token missing in response');
    }

    // Save user data to AsyncStorage for persistence
    await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));

    return {
      user: response.data.user,
      token,
    };
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Login failed';
    return rejectWithValue(message);
  }
});

// 🔁 Restore token from AsyncStorage thunk
const loginFromStorage = createAsyncThunk<
  { user: User | null; token: string },
  string
>('auth/loginFromStorage', async (token) => {
  try {
    // Optional: validate token with /me or get user data
    const userData = await AsyncStorage.getItem('userData');
    let user = null;
    if (userData) {
      user = JSON.parse(userData);
    }
    return { user, token };
  } catch (error) {
    return { user: null, token };
  }
});

// 🖼️ Fetch user profile image from uploaded_images table
const fetchUserProfileImage = createAsyncThunk<
  string | null,
  string,
  { rejectValue: string }
>('auth/fetchUserProfileImage', async (userId, { rejectWithValue }) => {
  try {
    // Make API call to get user's profile image from uploaded_images table
    const response = await api.get(`/upload_image/${userId}`);
    
    if (response.data?.profileImage) {
      return response.data.profileImage;
    }
    
    return null;
  } catch (error: any) {
    console.log('Failed to fetch profile image:', error);
    // Don't reject, just return null so it doesn't break the app
    return null;
  }
});

// Redux slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      // Clear AsyncStorage data
      AsyncStorage.multiRemove(['userData', 'token']).catch(console.log);
    },
    updateProfileImage: (state, action) => {
      if (state.user) {
        state.user.profileImage = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
      })

      .addCase(loginFromStorage.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
      })

      .addCase(fetchUserProfileImage.fulfilled, (state, action) => {
        if (state.user && action.payload) {
          state.user.profileImage = action.payload;
        }
      });
  },
});

// ✅ Exports
export const { logout, updateProfileImage } = authSlice.actions;
export { loginUser, loginFromStorage, fetchUserProfileImage }; // ✅ Clean exports here only
export default authSlice.reducer;
