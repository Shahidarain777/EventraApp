import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import store from '../store';

export interface Event {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  organizer: string;
  date: string;
  likes: number;
  comments: number;
  category: string;
  isLiked?: boolean;
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

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Summer Tech Conference 2024',
    description: 'Join us for an evening of tech talks and networking. Explore the latest trends in AI and web development.',
    price: '$99',
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3',
    organizer: 'Asad Raza',
    date: '2024-07-15',
    likes: 124,
    comments: 23,
    category: 'Conference',
    isLiked: false
  }
];

// 🔧 API Service Functions
const likeEventAPI = async (eventId: string | number) => {
  const token = store.getState().auth.token;
  console.log('Token used for like request:', token);
  await api.post(
    '/event_likes',
    { eventId: Number(eventId) },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

const getLikeCountAPI = async (eventId: string | number) => {
  const token = store.getState().auth.token;
  const res = await api.get(`/event_likes?eventId=${Number(eventId)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.count || 0;
};

// 🔄 Thunks
export const fetchEvents = createAsyncThunk<
  Event[],
  void,
  { rejectValue: string }
>('events/fetchEvents', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/events');
    console.log('API Response:', response.data);

    if (response.data?.events?.length > 0) {
      return response.data.events.map((event: any) => {
        let organizerName = 'Event Host';
        if (event.hostName) organizerName = event.hostName;
        else if (event.host?.name) organizerName = event.host.name;
        else if (event.organizer) organizerName = event.organizer;
        else if (event.hostDetails?.name) organizerName = event.hostDetails.name;
        else if (event.createdBy?.name) organizerName = event.createdBy.name;

        return {
          id: event._id || event.id,
          title: event.title,
          description: event.description,
          price: event.isPaid ? `$${event.price}` : 'Free',
          image: Array.isArray(event.imageUrl)
            ? event.imageUrl[0]
            : event.imageUrl || 'https://via.placeholder.com/300x200?text=Event',
          organizer: organizerName,
          date: event.dateTime?.start
            ? new Date(event.dateTime.start).toLocaleDateString()
            : 'TBD',
          likes: event.likes || 0,
          comments: event.comments || 0,
          category: event.categoryInfo?.name || 'Event',
          isLiked: event.isLiked || false
        };
      });
    }

    console.log('No events returned from API, using mock data');
    return mockEvents;
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return mockEvents;
  }
});

export const fetchEventById = createAsyncThunk<
  Event,
  string,
  { rejectValue: string }
>('events/fetchEventById', async (eventId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch event';
    return rejectWithValue(message);
  }
});

export const likeEvent = createAsyncThunk<
  { eventId: string; likes: number; isLiked: boolean },
  string,
  { rejectValue: string; state: { events: EventState } }
>('events/likeEvent', async (eventId, { rejectWithValue, getState }) => {
  try {
    const events = getState().events.events;
    const event = events.find(e => e.id === eventId);
    const currentLikeStatus = event?.isLiked || false;

    if (currentLikeStatus) {
      console.log('Event already liked, not sending request');
      return {
        eventId,
        likes: event?.likes || 0,
        isLiked: true
      };
    }

    await likeEventAPI(eventId);
    const updatedLikes = await getLikeCountAPI(eventId);

    return {
      eventId,
      likes: updatedLikes,
      isLiked: true
    };
  } catch (error: any) {
    console.error('Error in likeEvent thunk:', error);
    const events = getState().events.events;
    const event = events.find(e => e.id === eventId);
    return {
      eventId,
      likes: (event?.likes || 0) + 1,
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
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to create event';
    return rejectWithValue(message);
  }
});

// 🔥 Slice
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
        state.events = mockEvents;
      })

      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.event = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(likeEvent.pending, (state, action) => {
        state.likeStatus = 'loading';
        state.likingEventId = action.meta.arg;
      })
      .addCase(likeEvent.fulfilled, (state, action) => {
        state.likeStatus = 'succeeded';
        state.likingEventId = null;

        const { eventId, likes, isLiked } = action.payload;
        const event = state.events.find(event => event.id === eventId);
        if (event) {
          event.likes = likes;
          event.isLiked = isLiked;
        }
        if (state.event && state.event.id === eventId) {
          state.event.likes = likes;
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
      });
  },
});

// ✅ Exports
export const { clearEventError, clearCurrentEvent } = eventSlice.actions;
export default eventSlice.reducer;
