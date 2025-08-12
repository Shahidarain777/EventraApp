import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '../../api/axios'; // Adjust path if needed

interface Notification {
  _id?: string;
  id?: string;
  title: string;
  message: string;
  createdAt?: string;
  read?: boolean;
  [key: string]: any;
}

interface NotificationPreferences {
  channels?: {
    push?: boolean;
    email?: boolean;
    sms?: boolean;
    inApp?: boolean;
  };
  [key: string]: any;
}

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  preferences: NotificationPreferences | null;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
  preferences: null,
};

export const fetchNotifications = createAsyncThunk<Notification[], void, { rejectValue: string }>(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/notifications', { params: { page: 1, limit: 50 } });
      if (typeof global !== 'undefined' && global.localStorage) {
        global.localStorage.setItem('notifications', JSON.stringify(response.data.notifications || []));
      }
      return response.data.notifications || [];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk<number, void, { rejectValue: string }>(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/notifications/unread-count');
      return response.data?.count ?? 0;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch unread count');
    }
  }
);

export const markNotificationRead = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: string }
>(
  'notifications/markNotificationRead',
  async (id, { rejectWithValue }) => {
    try {
      await axios.put(`/notifications/${id}`, { read: true });
      return { id };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk<
  { count: number },
  void,
  { rejectValue: string }
>(
  'notifications/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post('/notifications/read-all');
      return { count: res.data?.count ?? 0 };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk<
  { id: string; wasUnread: boolean },
  { id: string; wasUnread: boolean },
  { rejectValue: string }
>(
  'notifications/deleteNotification',
  async ({ id, wasUnread }, { rejectWithValue }) => {
    try {
      await axios.delete(`/notifications/${id}`);
      return { id, wasUnread };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete notification');
    }
  }
);

export const fetchNotificationPreferences = createAsyncThunk<
  NotificationPreferences,
  void,
  { rejectValue: string }
>(
  'notifications/fetchPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/notifications/preferences');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch notification preferences');
    }
  }
);

export const updateNotificationPreferences = createAsyncThunk<
  NotificationPreferences,
  Partial<NotificationPreferences>,
  { rejectValue: string }
>(
  'notifications/updatePreferences',
  async (updates, { rejectWithValue }) => {
    try {
      const res = await axios.put('/notifications/preferences', updates);
      return { ...(updates as any) } as NotificationPreferences;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update notification preferences');
    }
  }
);

export const initNotifications = () => (dispatch: any) => {
  return Promise.all([
    dispatch(fetchNotifications()),
    dispatch(fetchUnreadCount()),
  ]);
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNotifications.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload.id;
        const target = state.notifications.find(n => (n._id || n.id) === id);
        if (target && !target.read) {
          target.read = true;
          if (state.unreadCount > 0) state.unreadCount -= 1;
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, read: true }));
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const { id, wasUnread } = action.payload;
        state.notifications = state.notifications.filter(n => (n._id || n.id) !== id);
        if (wasUnread && state.unreadCount > 0) state.unreadCount -= 1;
      })
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.preferences = { ...(state.preferences || {}), ...(action.payload || {}) };
      });
  },
});

export const { setUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
