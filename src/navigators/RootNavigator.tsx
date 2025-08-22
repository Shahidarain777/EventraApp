import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import FAQScreen from '../screens/FAQScreen';
import ReportProblemScreen from '../screens/ReportProblemScreen';
import CommunityGuidelinesScreen from '../screens/CommunityGuidelinesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import BlockedUsersScreen from '../screens/BlockedUsersScreen';
import ManageEventScreen from '../screens/ManageEventScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="EventDetailScreen" component={require('../screens/EventDetailScreen').default} />
          <Stack.Screen name="EditEventScreen" component={require('../screens/EditEventScreen').default} />
          <Stack.Screen name="ManageEventScreen" component={ManageEventScreen} />
          <Stack.Screen name="FAQScreen" component={FAQScreen} />
          <Stack.Screen name="ReportProblemScreen" component={ReportProblemScreen} />
          <Stack.Screen name="CommunityGuidelinesScreen" component={CommunityGuidelinesScreen} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
         <Stack.Screen name="InvoiceScreen" component={require('../screens/InvoiceScreen').default} />
          <Stack.Screen name="GenerateTicketScreen" component={require('../screens/GenerateTicketScreen').default} />
          <Stack.Screen name="NotificationScreen" component={require('../screens/NotificationScreen').default} />
          <Stack.Screen name="EditProfileScreen" component={require('../screens/EditProfileScreen').default} />
          <Stack.Screen name="Home" component={require('../screens/HomeScreen').default} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
