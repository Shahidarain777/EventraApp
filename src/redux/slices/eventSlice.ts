import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Event model
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
}

// State type
interface EventState {
  events: Event[];
  event: Event | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: EventState = {
  events: [],
  event: null,
  loading: false,
  error: null,
};

// Mock data for development/fallback
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
    category: 'Conference'
  },
  {
    id: '2',
    title: 'Design Workshop',
    description: 'Hands-on workshop on UI/UX design principles and tools.',
    price: '$75',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3',
    organizer: 'Sarah Johnson',
    date: '2024-07-22',
    likes: 89,
    comments: 12,
    category: 'Workshop'
  },
  {
    id: '3',
    title: 'Networking Mixer',
    description: 'Connect with professionals in tech and digital industries.',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3',
    organizer: 'Tech Network Group',
    date: '2024-07-30',
    likes: 67,
    comments: 8,
    category: 'Networking'
  }
];

// Fetch all events thunk
export const fetchEvents = createAsyncThunk<
  Event[],
  void,
  { rejectValue: string }
>('events/fetchEvents', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/events');
    console.log('API Response:', response.data);
    
    // Check if response contains valid data in the events property
    if (response.data && response.data.events && Array.isArray(response.data.events) && response.data.events.length > 0) {
      // Map the API events to match our Event interface
      return response.data.events.map((event: any) => {
        // Determine the organizer/host name
        let organizerName = 'Event Host';
        
        // Check for various possible host name fields from the API
        if (event.hostName) {
          organizerName = event.hostName;
        } else if (event.host && event.host.name) {
          organizerName = event.host.name;
        } else if (event.organizer) {
          organizerName = event.organizer;
        } else if (event.hostDetails && event.hostDetails.name) {
          organizerName = event.hostDetails.name;
        } else if (event.createdBy && event.createdBy.name) {
          organizerName = event.createdBy.name;
        }

        // For future enhancement: if none of the above, you could make a separate API call
        // to get the host details using hostId, but for now we'll use default
        
        return {
          id: event._id || event.id,
          title: event.title,
          description: event.description,
          price: event.isPaid ? `$${event.price}` : 'Free',
          image: Array.isArray(event.imageUrl) ? event.imageUrl[0] : (event.imageUrl || 'https://via.placeholder.com/300x200?text=Event'),
          organizer: organizerName,
          date: event.dateTime?.start ? new Date(event.dateTime.start).toLocaleDateString() : 'TBD',
          likes: event.likes || 0,
          comments: event.comments || 0,
          category: event.categoryInfo?.name || 'Event'
        };
      });
    }
    
    // If response doesn't contain valid data, use mock data
    console.log('No events returned from API, using mock data');
    return mockEvents;
  } catch (error: any) {
    console.error('Error fetching events:', error);
    // Return mock data instead of rejecting
    return mockEvents;
  }
});

// Fetch single event thunk
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

// Like event thunk
export const likeEvent = createAsyncThunk<
  { eventId: string; likes: number },
  string,
  { rejectValue: string }
>('events/likeEvent', async (eventId, { rejectWithValue }) => {
  try {
    const response = await api.post(`/events/${eventId}/like`);
    return { 
      eventId,
      likes: response.data.likes || 0
    };
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to like event';
    return rejectWithValue(message);
  }
});

// Create event thunk
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

// Redux slice
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
      // Fetch events cases
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
        // Use mock data as fallback when API fails
        state.events = mockEvents;
      })
      
      // Fetch event by ID cases
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
      
      // Like event cases
      .addCase(likeEvent.fulfilled, (state, action) => {
        const { eventId, likes } = action.payload;
        const event = state.events.find(event => event.id === eventId);
        if (event) {
          event.likes = likes;
        }
        if (state.event && state.event.id === eventId) {
          state.event.likes = likes;
        }
      })
      
      // Create event cases
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.unshift(action.payload); // Add new event to the beginning
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
