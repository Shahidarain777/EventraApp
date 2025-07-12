export type RootStackParamList = {
  Auth: undefined;
  Main: undefined; // ✅ Main is your TabNavigator
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
