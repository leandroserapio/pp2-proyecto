// src/navigation/MainTabs.tsx

import { Ionicons } from '@expo/vector-icons';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import type { MainTabParamList } from './types';

import { MototrackerTabBar } from './MototrackerTabBar';

import { GastosStackNavigator } from './GastosStackNavigator';
import { HomeStackNavigator } from './HomeStackNavigator';

import { RecordatoriosScreen } from '../screens/tabs/RecordatoriosScreen';

import { MantenimientoStackNavigator } from './MantenimientoStackNavigator';
import { ViajesStackNavigator } from './ViajesStackNavigator';
import { MotosStackNavigator } from './MotosStackNavigator';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const hiddenTabBarStyle = { display: 'none' as const };

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <MototrackerTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* INICIO */}
      <Tab.Screen
        name="Inicio"
        component={HomeStackNavigator}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* RECORDATORIOS */}
      <Tab.Screen
        name="Recordatorios"
        component={RecordatoriosScreen}
        options={{
          title: 'Recordatorios',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
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
        options={({ route }) => ({
          title: 'Gastos',
          tabBarStyle: (route.params as { hideTabBar?: boolean } | undefined)
            ?.hideTabBar
            ? hiddenTabBarStyle
            : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'cash' : 'cash-outline'}
              size={size}
              color={color}
            />
          ),
        })}
      />

      {/* MANTENIMIENTO */}
      <Tab.Screen
        name="MantenimientoStack"
        component={MantenimientoStackNavigator}
        options={({ route }) => ({
          title: 'Servicios',
          tabBarLabel: 'Servicios',
          tabBarStyle: (route.params as { hideTabBar?: boolean } | undefined)?.hideTabBar
            ? hiddenTabBarStyle
            : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'construct' : 'construct-outline'}
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
          tabBarStyle:
            getFocusedRouteNameFromRoute(route) === 'ViajesAdd'
              ? hiddenTabBarStyle
              : undefined,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'map' : 'map-outline'}
              size={size}
              color={color}
            />
          ),
        })}
      />

      {/* AJUSTES (accesible por navegacion, fuera de la barra) */}
      <Tab.Screen
        name="MotosStack"
        component={MotosStackNavigator}
        options={{
          title: 'Mis motos',
          tabBarButton: () => null,
        }}
      />

      <Tab.Screen
        name="Ajustes"
        component={SettingsScreen}
        options={{
          title: 'Ajustes',
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
}
