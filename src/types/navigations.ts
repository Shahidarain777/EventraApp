export type RootStackParamList = {
  Auth: undefined;
  Main: undefined; // ✅ Main is your TabNavigator
};

export type AuthStackParamList = {
  Login: undefined;
};

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
};
