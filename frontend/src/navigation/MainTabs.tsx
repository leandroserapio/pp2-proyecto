// src/navigation/MainTabs.tsx

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

const Tab = createBottomTabNavigator<MainTabParamList>();

const androidTabScreenOptions = {

  headerShown: false,

  tabBarActiveTintColor: light.primary,

  tabBarInactiveTintColor: light.tabInactive,

  tabBarShowLabel: true,

  tabBarStyle: {
    backgroundColor: light.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: light.border,
    elevation: 0,
  },

  tabBarLabelStyle: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    fontWeight: '500' as const,
  },

} as const;

const iosWebTabScreenOptions = {

  headerShown: false,

  tabBarActiveTintColor: '#FFFFFF',

  tabBarInactiveTintColor: light.tabInactive,

  tabBarActiveBackgroundColor: light.tabActivePill,

  tabBarInactiveBackgroundColor: 'transparent',

  tabBarShowLabel: true,

  tabBarLabelPosition: 'below-icon' as const,

  tabBarStyle: {
    backgroundColor: light.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: light.border,
    elevation: 0,
    shadowOpacity: 0,
    padding: 8,
    paddingHorizontal: 8,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: 'none',
          height: 'auto' as const
        }
      : {}),
  },

  tabBarItemStyle: {
    borderRadius: 16,
    overflow: 'hidden' as const,
  },

  tabBarLabelStyle: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    fontWeight: '500' as const,
    marginTop: 4,
  },

  tabBarIconStyle: {
    marginBottom: 2,
  },

} as const;

export function MainTabs() {

  return (

    <Tab.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? androidTabScreenOptions
          : iosWebTabScreenOptions
      }
    >

      {/* GARAGE */}

      <Tab.Screen
        name="Garage"
        component={GarageScreen}
        options={{
          title: 'Garage',
          tabBarIcon: ({ color, size }) => (

            <Ionicons
              name="bicycle-outline"
              size={size}
              color={color}
            />

          ),
        }}
      />

      {/* GASTOS */}

      <Tab.Screen
        name="GastosStack"
        component={GastosStackNavigator}
        options={{
          title: 'Gastos',
          tabBarIcon: ({ color, size }) => (

            <Ionicons
              name="cash-outline"
              size={size}
              color={color}
            />

          ),
        }}
      />

      {/* MANTENIMIENTO */}

      <Tab.Screen
        name="Mantenimiento"
        component={MantenimientoTabScreen}
        options={{
          title: 'Mantenimiento',
          tabBarIcon: ({ color, size }) => (

            <Ionicons
              name="construct-outline"
              size={size}
              color={color}
            />

          ),
        }}
      />

      {/* VIAJES */}

      <Tab.Screen
        name="Viajes"
        component={ViajesTabScreen}
        options={{
          title: 'Viajes',
          tabBarIcon: ({ color, size }) => (

            <Ionicons
              name="map-outline"
              size={size}
              color={color}
            />

          ),
        }}
      />

    </Tab.Navigator>

  );
}