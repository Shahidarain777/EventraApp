import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// --- Event Interface ---
export interface Event {
  id: string;
  eventId: string | number;
  title: string;
  description: string;
  price: string | number;
  hostId: string | number;
  imageUrl: string[];
  hostName: string;
  hostProfileImage: string;
  createdAt: string; // Use Date for consistency, but can be string if API returns ISO format
  dateTime: {
    start: string;
    end: string;
  };
  noOfLikes: number;
  comments: { userName: string; message: string, profileImage: string }[];
  noOfComments: number;
  joinedCount: number;
  categoryInfo: {
    name: string;
    status: string;
  };
  likedBy?: { id: string | number; userName: string }[];
  visibility?: string;
  approvalRequired?: string;
  maxAttendees?: number | string;
  currency: string; // e.g., USD, EUR
  location?: {
    type: 'venue' | 'online';
    venueName?: string;
    link?: string; // For online events
    platform?: string; // e.g., Zoom, Google Meet
    city?: string;
    state?: string;
    country?: string;
    address?: string;
    latitude?: number | string;
    longitude?: number | string;
  };

  subEvents?: Array<{
    _id?: string;
    subEventId?: string | number;
    itemName: string;
    isPaid: boolean;
    fee: number;
    maxAttendees: number;
    joinedCount?: number;
    // userStatus?: 'not_joined' | 'payment_pending' | 'member' | 'approval_pending';
  }>;
  // Add joinedMembers for now
  joinedMembers?: Array<{
    userId: string | number;
    name: string;
    status: string;
    profileImage?: string;
    selectedSubEvents: number[]; // Array of subEventIds
    totalAmount: number; // Total amount for selected sub-events
    ticketQuantities?: {
      // mainEvent: number;
      subEvents: { [key: string]: number };
    };
    rejectionReason: string; // Reason for rejection if applicable
  }>;

  payments?: Array<{
    id: string | number;
    name: string;
    profileImage?: string;
    userId: string | number;
    amount: number;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    proofImages: string[];
  }>;

  accountHolderName: string;
  accountNumber: string;
  bankName: string;
}

interface EventState {
  events: Event[];
  event: Event | null;
  loading: boolean;
  error: string | null;
  likeStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  likingEventId: string | null;
}

const initialState: EventState = {
  events: [],
  event: null,
  loading: false,
  error: null,
  likeStatus: 'idle',
  likingEventId: null,
};

const likeEventAPI = async (eventId: string | number) => {
  await api.post('/event_likes', { eventId });
};

function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.id?.toString() || user?._id?.toString() || '';
  } catch {
    return '';
  }
}

// FETCH EVENTS: attach isLiked for each event
export const fetchEvents = createAsyncThunk<
  Event[],
  void,
  { rejectValue: string }
>('events/fetchEvents', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/events');
    const userId = getCurrentUserId();
    if (response.data?.events?.length > 0) {
      return response.data.events.map((event: Event) => {
        // Find current user's joinedMember entry
        let ticketQuantities = undefined;
        if (Array.isArray(event.joinedMembers)) {
          const currentMember = event.joinedMembers.find((m: any) => m.userId?.toString() === userId);
          if (currentMember && currentMember.ticketQuantities) {
            ticketQuantities = currentMember.ticketQuantities;
          }
        }
        return {
          ...event,
          isLiked: Array.isArray(event.likedBy)
            ? event.likedBy.some((u) => u.id?.toString() === userId)
            : false,
          ticketQuantities,
        };
      });
    }
    return [];
  } catch (error: any) {
    return rejectWithValue('Failed to fetch events');
  }
});

// LIKE EVENT: update likedBy and noOfLikes in Redux, backend must persist likedBy
export const likeEvent = createAsyncThunk<
  { eventId: string | number; userId: string; noOfLikes: number },
  string | number,
  { rejectValue: string; state: { events: EventState } }
>(
  'events/likeEvent',
  async (eventId, { getState, rejectWithValue }) => {
    try {
      const userId = getCurrentUserId();
      const events = getState().events.events;
      const event = events.find(e => e.eventId.toString() === eventId.toString());

      const alreadyLiked = Array.isArray(event?.likedBy)
        ? event.likedBy.some((u) => u.id?.toString() === userId)
        : false;

      if (alreadyLiked) {
        // UNLIKE: call DELETE API
        await api.delete('/event_likes', {
          headers: {}, // Add auth header if needed
          data: { eventId },
        });
        return {
          eventId,
          userId,
          noOfLikes: Math.max((event?.noOfLikes ?? 1) - 1, 0),
        };
      } else {
        // LIKE: call POST API
        try {
          await api.post('/event_likes', { eventId });
          return {
            eventId,
            userId,
            noOfLikes: (event?.noOfLikes ?? 0) + 1,
          };
        } catch (err: any) {
          // If 409, user already liked, so UNLIKE
          if (err?.response?.status === 409) {
            await api.delete('/event_likes', {
              headers: {},
              data: { eventId },
            });
            return {
              eventId,
              userId,
              noOfLikes: Math.max((event?.noOfLikes ?? 1) - 1, 0),
            };
          }
          throw err;
        }
      }
    } catch {
      // Optimistic fallback
      const userId = getCurrentUserId();
      const events = getState().events.events;
      const event = events.find(e => e.eventId.toString() === eventId.toString());
      return {
        eventId,
        userId,
        noOfLikes: (event?.noOfLikes ?? 0),
      };
    }
  }
);

export const createEvent = createAsyncThunk<
  Event,
  Omit<Event, 'id' | 'likes' | 'comments'>,
  { rejectValue: string }
>('events/createEvent', async (eventData, { rejectWithValue }) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch {
    return rejectWithValue('Failed to create event');
  }
});

export const addComment = createAsyncThunk<
  { eventId: string | number | undefined; comment: string },
  { eventId: string | number | undefined; comment: string },
  { rejectValue: string }
>('events/addComment', async ({ eventId, comment }, { rejectWithValue }) => {
  try {
    const response = await api.post('/event_comments', { eventId, comment });
    return response.data;
  } catch {
    return rejectWithValue('Failed to add comment');
  }
});

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearEventError: (state) => {
      state.error = null;
    },
    clearCurrentEvent: (state) => {
      state.event = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.events = [];
      })
      .addCase(likeEvent.pending, (state, action) => {
        state.likeStatus = 'loading';
        state.likingEventId = action.meta.arg as string;
      })
      .addCase(likeEvent.fulfilled, (state, action) => {
        state.likeStatus = 'succeeded';
        state.likingEventId = null;
        const { eventId, userId, noOfLikes } = action.payload;
        const event = state.events.find(event => event.eventId.toString() === eventId.toString());
        if (event) {
          if (!event.likedBy) event.likedBy = [];
          const idx = event.likedBy.findIndex(u => u.id?.toString() === userId);
          if (idx === -1) {
            // LIKE
            event.likedBy.push({ id: userId, userName: 'You' });
          } else {
            // UNLIKE
            event.likedBy.splice(idx, 1);
          }
          event.noOfLikes = noOfLikes;
        }
        if (state.event && state.event.eventId.toString() === eventId.toString()) {
          if (!state.event.likedBy) state.event.likedBy = [];
          const idx = state.event.likedBy.findIndex(u => u.id?.toString() === userId);
          if (idx === -1) {
            state.event.likedBy.push({ id: userId, userName: 'You' });
          } else {
            state.event.likedBy.splice(idx, 1);
          }
          state.event.noOfLikes = noOfLikes;
        }
      })
      .addCase(likeEvent.rejected, (state) => {
        state.likeStatus = 'failed';
        state.likingEventId = null;
      })
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.unshift(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { eventId } = action.payload;
        const event = state.events.find(event => event.eventId.toString() === eventId?.toString());
        if (event) {
          event.noOfComments += 1;
        }
        if (state.event && state.event.eventId.toString() === eventId?.toString()) {
          state.event.noOfComments += 1;
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearEventError, clearCurrentEvent } = eventSlice.actions;
export default eventSlice.reducer;