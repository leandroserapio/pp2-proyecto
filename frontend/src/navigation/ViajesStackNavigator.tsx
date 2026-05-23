import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { light } from '../theme/mototrackerLight';
import { fontFamily } from '../theme/fonts';
import type { ViajesStackParamList } from './types';
import { ViajesAddScreen } from '../screens/viajes/ViajesAddScreen';
import { ViajesDetailScreen } from '../screens/viajes/ViajesDetailScreen';
import { ViajesEditScreen } from '../screens/viajes/ViajesEditScreen';
import { ViajesListScreen } from '../screens/viajes/ViajesListScreen';

const Stack = createNativeStackNavigator<ViajesStackParamList>();

const headerSurface = {
  backgroundColor: light.surface,
  borderBottomWidth: 1,
  borderBottomColor: light.border,
};

export function ViajesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: headerSurface,
        headerTintColor: light.primary,
        headerTitleStyle: {
          fontFamily: fontFamily.bold,
          fontWeight: '700',
          fontSize: 17,
          color: light.primary,
        },
        contentStyle: { backgroundColor: light.bg },
      }}
    >
      <Stack.Screen name="ViajesHome" component={ViajesListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ViajesAdd" component={ViajesAddScreen} options={{ title: 'Agregar Viaje' }} />
      <Stack.Screen name="ViajesDetail" component={ViajesDetailScreen} options={{ title: 'Viajes' }} />
      <Stack.Screen name="ViajesEdit" component={ViajesEditScreen} options={{ title: 'Editar Viaje' }} />
    </Stack.Navigator>
  );
}
