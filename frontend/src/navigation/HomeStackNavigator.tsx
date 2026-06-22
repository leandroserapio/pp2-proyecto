import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppSettings } from '../context/AppSettingsContext';
import { AccountScreen } from '../screens/account/AccountScreen';
import { HomeScreen } from '../screens/tabs/HomeScreen';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  const { theme } = useAppSettings();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Cuenta" component={AccountScreen} />
    </Stack.Navigator>
  );
}
