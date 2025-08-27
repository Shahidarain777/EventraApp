import type { Event } from '../redux/slices/eventSlice';
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined; // ✅ Main is your TabNavigator
  HelpSupport: undefined;
  FAQScreen: undefined;
  EventDetailScreen: { event: Event };
  ManageEventScreen: { event: Event };
  InvoiceScreen: { event: Event };
  GenerateTicketScreen: { event: Event };
  ReportProblemScreen: undefined;
  EditProfileScreen: undefined;
  CommunityGuidelinesScreen: undefined;
  SettingsScreen: undefined;
  EditProfile: undefined;
  BlockedUsers: undefined;
  NotificationScreen: undefined;
  HomeScreen: undefined;
  LoginScreen: undefined;
  OTPVerificationScreen: { email: string };
  ResetPasswordScreen: { email: string };
};

export type AuthStackParamList = {
  Intro: undefined;
  SplashTransition: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPasswordScreen: undefined;
  EmailVerification: { email: string };
};

export type TabParamList = {
  Home: undefined;
  CreateEvent: undefined;
  Profile: undefined;
};
