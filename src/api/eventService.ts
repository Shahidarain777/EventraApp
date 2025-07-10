import api from './axios';

// Event type definition
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

const eventService = {
  // Get all events
  getAllEvents: async () => {
    try {
      const response = await api.get('/events');
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },
  // You can add more methods here as needed
};

export default eventService;
