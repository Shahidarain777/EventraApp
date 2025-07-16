import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import store from '../store';

export interface Event {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string; // Keep for backward compatibility
  images?: string[]; // New field for multiple images
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
    images: [
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3'
    ],
    organizer: 'Asad Raza',
    date: '2024-07-15',
    likes: 124,
    comments: 23,
    category: 'Conference',
    isLiked: false
  },
  {
    id: '2',
    title: 'Business Networking Event',
    description: 'Connect with like-minded professionals and expand your business network.',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3',
    images: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3'
    ],
    organizer: 'Sarah Johnson',
    date: '2024-07-20',
    likes: 45,
    comments: 12,
    category: 'Business',
    isLiked: false
  },
  {
    id: '3',
    title: 'Art Gallery Opening',
    description: 'Discover amazing artwork from local artists at this exclusive gallery opening.',
    price: '$25',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3'
    ],
    organizer: 'Michael Chen',
    date: '2024-07-25',
    likes: 78,
    comments: 8,
    category: 'Arts',
    isLiked: false
  },
  {
    id: '4',
    title: 'Food Festival Downtown',
    description: 'Taste delicious food from around the world at our annual food festival.',
    price: '$15',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3',
    images: [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3'
    ],
    organizer: 'Food Lovers Inc',
    date: '2024-08-01',
    likes: 156,
    comments: 34,
    category: 'Food',
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

        // Always provide a dateTime object
        const dateTime = event.dateTime && event.dateTime.start && event.dateTime.end
          ? event.dateTime
          : {
              start: event.date || undefined,
              end: event.endDate || undefined,
            };

        return {
          id: event._id || event.id,
          title: event.title,
          description: event.description,
          price: event.isPaid ? `$${event.price}` : 'Free',
          image: Array.isArray(event.imageUrl)
            ? event.imageUrl[0]
            : event.imageUrl || 'https://via.placeholder.com/300x200?text=Event',
          images: Array.isArray(event.imageUrl) 
            ? event.imageUrl 
            : event.imageUrl 
              ? [event.imageUrl] 
              : ['https://via.placeholder.com/300x200?text=Event'],
          organizer: organizerName,
          date: event.dateTime?.start
            ? new Date(event.dateTime.start).toLocaleDateString()
            : 'TBD',
          endDate: event.dateTime?.end || event.endDate,
          dateTime,
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
    const event = response.data;
    // Always provide a dateTime object
    const dateTime = event.dateTime && event.dateTime.start && event.dateTime.end
      ? event.dateTime
      : {
          start: event.date || undefined,
          end: event.endDate || undefined,
        };
    return {
      ...event,
      endDate: event.dateTime?.end || event.endDate,
      dateTime,
    };
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

export const addComment = createAsyncThunk<
  { eventId: string; comment: string },
  { eventId: string; comment: string },
  { rejectValue: string }
>('events/addComment', async ({ eventId, comment }, { rejectWithValue }) => {
  try {
    const response = await api.post('/event_comments', {
      eventId,
      comment
    });
    return { eventId, comment };
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to add comment';
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
      })

      .addCase(addComment.pending, (state) => {
        // Optional: Add loading state for comments if needed
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { eventId } = action.payload;
        const event = state.events.find(event => event.id === eventId);
        if (event) {
          event.comments += 1;
        }
        if (state.event && state.event.id === eventId) {
          state.event.comments += 1;
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// ✅ Exports
export const { clearEventError, clearCurrentEvent } = eventSlice.actions;
export default eventSlice.reducer;
