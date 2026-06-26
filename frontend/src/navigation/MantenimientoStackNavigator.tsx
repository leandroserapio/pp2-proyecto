import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppSettings } from '../context/AppSettingsContext';
import { MantenimientoEditScreen } from '../screens/mantenimiento/MantenimientoEditScreen';
import { MantenimientoListScreen } from '../screens/mantenimiento/MantenimientoListScreen';
import { getStackScreenOptions } from './stackScreenOptions';
import type { MantenimientoStackParamList } from './types';

const Stack = createNativeStackNavigator<MantenimientoStackParamList>();

export function MantenimientoStackNavigator() {
  const { theme } = useAppSettings();

  return (
    <Stack.Navigator screenOptions={getStackScreenOptions(theme)}>
      <Stack.Screen
        name="MantenimientoHome"
        component={MantenimientoListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MantenimientoEdit"
        component={MantenimientoEditScreen}
        options={{ title: 'Editar Mantenimiento' }}
      />
    </Stack.Navigator>
  );
}
