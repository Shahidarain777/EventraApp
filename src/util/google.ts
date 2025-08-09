// Centralized Google API key access for JS web-service calls (Places/Geocoding)
// In production, prefer loading this from a secure env or your backend.

// For now, read from process.env-like fallback if you later add react-native-config.
// Replace the empty string with a safe runtime-provided value.
export const GOOGLE_MAPS_API_KEY: string = (global as any)?.GOOGLE_MAPS_API_KEY || 'AIzaSyC5hygsTTkHQzWcFqFZe7vN_qtSGJJEfIY';

// Helper to assert key presence where required
export const ensureGoogleKey = (): string => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('GOOGLE_MAPS_API_KEY is not set. Places/Geocoding will fail.');
  }
  return GOOGLE_MAPS_API_KEY;
};

