// src/navigation/MainTabs.tsx

import { Ionicons } from '@expo/vector-icons';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Platform, StyleSheet, useWindowDimensions } from 'react-native';

import { fontFamily } from '../theme/fonts';

import { useAppSettings } from '../context/AppSettingsContext';
import { isTabletWidth, TAB_BAR_MAX_WIDTH } from '../theme/responsive';

import type { MainTabParamList } from './types';

import { GastosStackNavigator } from './GastosStackNavigator';

import { HomeScreen } from '../screens/tabs/HomeScreen';

import { GarageScreen } from '../screens/tabs/GarageScreen';

import { MantenimientoTabScreen } from '../screens/tabs/MantenimientoTabScreen';
import { ViajesStackNavigator } from './ViajesStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { theme } = useAppSettings();
  const { width } = useWindowDimensions();
  const tablet = isTabletWidth(width);
  const tabletTabFrame = tablet
    ? {
        width: '100%' as const,
        maxWidth: TAB_BAR_MAX_WIDTH,
        alignSelf: 'center' as const,
        borderRadius: Platform.OS === 'android' ? 0 : 18,
        marginBottom: Platform.OS === 'web' ? 12 : 8,
        overflow: 'hidden' as const,
      }
    : {};

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
      ...tabletTabFrame,
    },

    tabBarLabelStyle: {
      fontSize: 11,
      fontFamily: fontFamily.medium,
      fontWeight: '500' as const,
    },

  } as const;

  const iosWebTabScreenOptions = {

    headerShown: false,

    tabBarActiveTintColor: theme.onPrimary,

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
      padding: 8,
      paddingHorizontal: 8,
      ...tabletTabFrame,
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
          title: 'Servicios',
          tabBarLabel: 'Servicios',
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
