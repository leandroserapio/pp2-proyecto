import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fontFamily } from '../theme/fonts';
import { useAppSettings } from '../context/AppSettingsContext';
import type { GastosStackParamList } from './types';
import { GastosDetailScreen } from '../screens/gastos/GastosDetailScreen';
import { GastosEditScreen } from '../screens/gastos/GastosEditScreen';
import { GastosListScreen } from '../screens/gastos/GastosListScreen';

const Stack = createNativeStackNavigator<GastosStackParamList>();

export function GastosStackNavigator() {
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
        headerRightContainerStyle: {
          paddingRight: 16,
        },
        contentStyle: { backgroundColor: theme.bg },
      }}
    >
      <Stack.Screen name="GastosHome" component={GastosListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GastosDetail" component={GastosDetailScreen} options={{ title: 'Gastos' }} />
      <Stack.Screen name="GastosEdit" component={GastosEditScreen} options={{ title: 'Editar Gasto' }} />
    </Stack.Navigator>
  );
}
