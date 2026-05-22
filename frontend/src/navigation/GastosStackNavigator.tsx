import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { light } from '../theme/mototrackerLight';
import { fontFamily } from '../theme/fonts';
import type { GastosStackParamList } from './types';
import { GastosAddScreen } from '../screens/gastos/GastosAddScreen';
import { GastosDetailScreen } from '../screens/gastos/GastosDetailScreen';
import { GastosEditScreen } from '../screens/gastos/GastosEditScreen';
import { GastosListScreen } from '../screens/gastos/GastosListScreen';

const Stack = createNativeStackNavigator<GastosStackParamList>();

const headerSurface = {
  backgroundColor: light.surface,
  borderBottomWidth: 1,
  borderBottomColor: light.border,
};

export function GastosStackNavigator() {
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
      <Stack.Screen name="GastosHome" component={GastosListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GastosAdd" component={GastosAddScreen} options={{ title: 'Agregar Gasto' }} />
      <Stack.Screen name="GastosDetail" component={GastosDetailScreen} options={{ title: 'Gastos' }} />
      <Stack.Screen name="GastosEdit" component={GastosEditScreen} options={{ title: 'Editar Gasto' }} />
    </Stack.Navigator>
  );
}
