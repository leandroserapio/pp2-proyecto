import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppSettings } from '../context/AppSettingsContext';
import { getStackScreenOptions } from './stackScreenOptions';
import type { MotosStackParamList } from './types';
import { MisMotosEditScreen } from '../screens/motos/MisMotosEditScreen';
import { MisMotosListScreen } from '../screens/motos/MisMotosListScreen';

const Stack = createNativeStackNavigator<MotosStackParamList>();

export function MotosStackNavigator() {
  const { theme } = useAppSettings();

  return (
    <Stack.Navigator screenOptions={getStackScreenOptions(theme)}>      <Stack.Screen
        name="MisMotosHome"
        component={MisMotosListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MisMotosEdit"
        component={MisMotosEditScreen}
        options={{ title: 'Editar moto' }}
      />
    </Stack.Navigator>
  );
}
