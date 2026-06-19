// src/navigation/MainTabs.tsx

import { Ionicons } from '@expo/vector-icons';

import {
  BottomTabBar,
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import { Platform, StyleSheet } from 'react-native';

import { fontFamily } from '../theme/fonts';

import { useAppSettings } from '../context/AppSettingsContext';

import type { MainTabParamList } from './types';

import { GastosStackNavigator } from './GastosStackNavigator';
import { HomeStackNavigator } from './HomeStackNavigator';

import { GarageScreen } from '../screens/tabs/GarageScreen';

import { MantenimientoTabScreen } from '../screens/tabs/MantenimientoTabScreen';
import { ViajesStackNavigator } from './ViajesStackNavigator';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const hiddenTabItemStyle = {
  width: 0,
  minWidth: 0,
  maxWidth: 0,
  flex: 0,
  flexGrow: 0,
  overflow: 'hidden' as const,
  ...(Platform.OS === 'web' ? { display: 'none' as const } : {}),
};

function WebBottomTabBar(props: BottomTabBarProps) {
  return (
    <BottomTabBar
      {...props}
      style={{
        width: '100%',
        left: 0,
        right: 0,
        alignSelf: 'stretch',
      }}
    />
  );
}

export function MainTabs() {
  const { theme } = useAppSettings();
  const hiddenTabBarStyle = { display: 'none' as const };
  const androidBaseTabBarStyle = {
    backgroundColor: theme.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.border,
    elevation: 0,
  };
  const iosWebBaseTabBarStyle = {
    backgroundColor: theme.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.border,
    elevation: 0,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    width: '100%' as const,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: 'none',
          height: 'auto' as const,
          left: 0,
          right: 0,
          alignSelf: 'stretch',
        }
      : {}),
  };

  const androidTabScreenOptions = {

    headerShown: false,

    tabBarActiveTintColor: theme.primary,

    tabBarInactiveTintColor: theme.tabInactive,

    tabBarShowLabel: true,

    tabBarStyle: androidBaseTabBarStyle,

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

    tabBarStyle: iosWebBaseTabBarStyle,

    tabBarItemStyle: {
      flex: 1,
      flexGrow: 1,
      ...(Platform.OS === 'web'
        ? { flexBasis: 0, minWidth: 0 }
        : {}),
      borderRadius: 16,
      minHeight: 58,
      paddingTop: 4,
      paddingBottom: 4,
    },

    tabBarLabelStyle: {
      fontSize: 11,
      fontFamily: fontFamily.medium,
      fontWeight: '500' as const,
      lineHeight: 14,
      marginTop: 2,
    },

    tabBarIconStyle: {
      marginBottom: 0,
    },

  } as const;

  return (

    <Tab.Navigator
      tabBar={Platform.OS === 'web' ? WebBottomTabBar : undefined}
      screenOptions={
        Platform.OS === 'android'
          ? androidTabScreenOptions
          : iosWebTabScreenOptions
      }
    >

      {/* INICIO */}

      <Tab.Screen
        name="Inicio"
        component={HomeStackNavigator}
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
        options={({ route }) => ({
          title: 'Garage',
          tabBarStyle: route.params?.hideTabBar
            ? hiddenTabBarStyle
            : (Platform.OS === 'android' ? androidBaseTabBarStyle : iosWebBaseTabBarStyle),
          tabBarIcon: ({ color, size }) => (

            <Ionicons
              name="bicycle-outline"
              size={size}
              color={color}
            />

          ),
        })}
      />

      {/* GASTOS */}

      <Tab.Screen
        name="GastosStack"
        component={GastosStackNavigator}
        options={({ route }) => ({
          title: 'Gastos',
          tabBarStyle: route.params?.hideTabBar
            ? hiddenTabBarStyle
            : (Platform.OS === 'android' ? androidBaseTabBarStyle : iosWebBaseTabBarStyle),
          tabBarIcon: ({ color, size }) => (

            <Ionicons
              name="cash-outline"
              size={size}
              color={color}
            />

          ),
        })}
      />

      {/* MANTENIMIENTO */}

      <Tab.Screen
        name="Mantenimiento"
        component={MantenimientoTabScreen}
        options={({ route }) => ({
          title: 'Servicios',
          tabBarLabel: 'Servicios',
          tabBarStyle: route.params?.hideTabBar
            ? hiddenTabBarStyle
            : (Platform.OS === 'android' ? androidBaseTabBarStyle : iosWebBaseTabBarStyle),
          tabBarIcon: ({ color, size }) => (

            <Ionicons
              name="construct-outline"
              size={size}
              color={color}
            />

          ),
        })}
      />

      {/* VIAJES */}

      <Tab.Screen
        name="ViajesStack"
        component={ViajesStackNavigator}
        options={({ route }) => ({
          title: 'Viajes',
          tabBarStyle: getFocusedRouteNameFromRoute(route) === 'ViajesAdd'
            ? hiddenTabBarStyle
            : (Platform.OS === 'android' ? androidBaseTabBarStyle : iosWebBaseTabBarStyle),
          tabBarIcon: ({ color, size }) => (

            <Ionicons
              name="map-outline"
              size={size}
              color={color}
            />

          ),
        })}
      />

      <Tab.Screen
        name="Ajustes"
        component={SettingsScreen}
        options={{
          title: 'Ajustes',
          tabBarButton: () => null,
          tabBarItemStyle: hiddenTabItemStyle,
        }}
      />

    </Tab.Navigator>

  );
}
