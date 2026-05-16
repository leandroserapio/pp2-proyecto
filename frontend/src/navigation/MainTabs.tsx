import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';
import { light } from '../theme/mototrackerLight';
import { fontFamily } from '../theme/fonts';
import type { MainTabParamList } from './types';
import { GastosStackNavigator } from './GastosStackNavigator';
import { GarageScreen } from '../screens/tabs/GarageScreen';
import { MantenimientoTabScreen } from '../screens/tabs/MantenimientoTabScreen';
import { ViajesTabScreen } from '../screens/tabs/ViajesTabScreen';
import PerfilScreen from '../screens/tabs/PerfilScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: light.tabInactive,
        tabBarActiveBackgroundColor: light.tabActivePill,
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          backgroundColor: light.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: light.border,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 8,
          height: 74,
          ...(Platform.OS === 'web' ? { boxShadow: 'none' } : {}),
        },
        tabBarItemStyle: {
          borderRadius: 16,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fontFamily.medium,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen
        name="Garage"
        component={GarageScreen}
        options={{
          title: 'Garage',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bicycle-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="GastosStack"
        component={GastosStackNavigator}
        options={{
          title: 'Gastos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Mantenimiento"
        component={MantenimientoTabScreen}
        options={{
          title: 'Mantenimiento',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Viajes"
        component={ViajesTabScreen}
        options={{
          title: 'Viajes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
