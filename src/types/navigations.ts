import type { Event } from '../redux/slices/eventSlice';
export type RootStackParamList = {
  Auth: undefined;
  Main: { screen?: string } | undefined; // Allow nested tab navigation
  EventDetailScreen: { event: Event };
};


export type AuthStackParamList = {
  Intro: undefined;
  SplashTransition: undefined;
  Login: undefined;
  Signup: undefined;
};

export type TabParamList = {
  Home: undefined;
  CreateEvent: undefined;
  Profile: undefined;
};
