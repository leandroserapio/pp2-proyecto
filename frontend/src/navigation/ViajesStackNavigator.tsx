import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fontFamily } from '../theme/fonts';
import { useAppSettings } from '../context/AppSettingsContext';
import type { ViajesStackParamList } from './types';
import { ViajesAddScreen } from '../screens/viajes/ViajesAddScreen';
import { ViajesDetailScreen } from '../screens/viajes/ViajesDetailScreen';
import { ViajesEditScreen } from '../screens/viajes/ViajesEditScreen';
import { ViajesListScreen } from '../screens/viajes/ViajesListScreen';

const Stack = createNativeStackNavigator<ViajesStackParamList>();

export function ViajesStackNavigator() {
  const { theme } = useAppSettings();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: theme.surface,
        },
        headerTintColor: theme.primary,
        headerTitleStyle: {
          fontFamily: fontFamily.bold,
          fontWeight: '700',
          fontSize: 17,
          color: theme.primary,
        },
        contentStyle: { backgroundColor: theme.bg },
      }}
    >
      <Stack.Screen name="ViajesHome" component={ViajesListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ViajesAdd" component={ViajesAddScreen} options={{ title: 'Agregar Viaje' }} />
      <Stack.Screen name="ViajesDetail" component={ViajesDetailScreen} options={{ title: 'Viajes' }} />
      <Stack.Screen name="ViajesEdit" component={ViajesEditScreen} options={{ title: 'Editar Viaje' }} />
    </Stack.Navigator>
  );
}
