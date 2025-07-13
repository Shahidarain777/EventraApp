import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios'; // Your Axios instance

// User model
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // Add phone number field
  role?: string; // Add role field
  createdAt?: string; // Add creation date field
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
  // Optional: validate token with /me
  return { user: null, token };
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
      });
  },
});

// ✅ Exports
export const { logout } = authSlice.actions;
export { loginUser, loginFromStorage }; // ✅ Clean exports here only
export default authSlice.reducer;
