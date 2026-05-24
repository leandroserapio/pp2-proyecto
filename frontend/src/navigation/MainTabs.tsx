// src/navigation/MainTabs.tsx

import { Ionicons } from '@expo/vector-icons';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Platform, StyleSheet } from 'react-native';

import { fontFamily } from '../theme/fonts';

import { useAppSettings } from '../context/AppSettingsContext';

import type { MainTabParamList } from './types';

import { GastosStackNavigator } from './GastosStackNavigator';

import { HomeScreen } from '../screens/tabs/HomeScreen';

import { GarageScreen } from '../screens/tabs/GarageScreen';

import { MantenimientoTabScreen } from '../screens/tabs/MantenimientoTabScreen';
import { ViajesStackNavigator } from './ViajesStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { theme } = useAppSettings();

  const androidTabScreenOptions = {

    headerShown: false,

    tabBarActiveTintColor: theme.primary,

    tabBarInactiveTintColor: theme.tabInactive,

    tabBarShowLabel: true,

    tabBarStyle: {
      backgroundColor: theme.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
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

    tabBarInactiveTintColor: theme.tabInactive,

    tabBarActiveBackgroundColor: theme.tabActivePill,

    tabBarInactiveBackgroundColor: 'transparent',

    tabBarShowLabel: true,

    tabBarLabelPosition: 'below-icon' as const,

    tabBarStyle: {
      backgroundColor: theme.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
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

  return (

    <Tab.Navigator
      screenOptions={
        Platform.OS === 'android'
          ? androidTabScreenOptions
          : iosWebTabScreenOptions
      }
    >

      {/* INICIO */}

      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (

            <Ionicons
              name="home-outline"
              size={size}
              color={color}
            />

          ),
        }}
      />

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
        name="ViajesStack"
        component={ViajesStackNavigator}
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
