import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export interface Event {
  id: string;
  eventId: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string[];
  hostName: string;
  dateTime: {
    start: string;
    end: string;
  };
  noOfLikes: number;
  comments: { userName: string; message: string }[];
  noOfComments: number;
  categoryInfo: {
    name: string;
    status: string;
  };
  isLiked?: boolean;
  visibility?: string;
  approvalRequired?: string;
  maxAttendees?: number | string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    address?: string;
    latitude?: number | string;
    longitude?: number | string;
  };
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

const likeEventAPI = async (eventId: string) => {
  await api.post('/event_likes', { eventId });
};

export const fetchEvents = createAsyncThunk<
  Event[],
  void,
  { rejectValue: string }
>('events/fetchEvents', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/events');
    if (response.data?.events?.length > 0) {
      return response.data.events;
    }
    return [];
  } catch (error: any) {
    return rejectWithValue('Failed to fetch events');
  }
});

export const likeEvent = createAsyncThunk<
  { eventId: string; noOfLikes: number; isLiked: boolean },
  string,
  { rejectValue: string; state: { events: EventState } }
>('events/likeEvent', async (eventId, { getState, rejectWithValue }) => {
  try {
    const events = getState().events.events;
    const event = events.find(e => e.eventId === eventId);
    const currentLikeStatus = event?.isLiked || false;

    if (currentLikeStatus) {
      return {
        eventId,
        noOfLikes: event?.noOfLikes ?? 0,
        isLiked: true
      };
    }

    await likeEventAPI(eventId);

    return {
      eventId,
      noOfLikes: (event?.noOfLikes ?? 0) + 1,
      isLiked: true
    };
  } catch {
    const events = getState().events.events;
    const event = events.find(e => e.eventId === eventId);
    return {
      eventId,
      noOfLikes: (event?.noOfLikes ?? 0) + 1,
      isLiked: true
    };
  }
});

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
  { eventId: string | undefined; comment: string },
  { eventId: string | undefined; comment: string },
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
        state.likingEventId = action.meta.arg;
      })
      .addCase(likeEvent.fulfilled, (state, action) => {
        state.likeStatus = 'succeeded';
        state.likingEventId = null;
        const { eventId, noOfLikes, isLiked } = action.payload;
        const event = state.events.find(event => event.id === eventId);
        if (event) {
          event.noOfLikes = noOfLikes;
          event.isLiked = isLiked;
        }
        if (state.event && state.event.id === eventId) {
          state.event.noOfLikes = noOfLikes;
          state.event.isLiked = isLiked;
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
        const event = state.events.find(event => event.id === eventId);
        if (event) {
          event.noOfComments += 1;
        }
        if (state.event && state.event.id === eventId) {
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