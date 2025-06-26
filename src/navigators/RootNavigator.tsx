import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
