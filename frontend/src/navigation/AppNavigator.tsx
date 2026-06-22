// src/navigation/AppNavigator.tsx

import { useEffect } from 'react';
import {
  NavigationContainer,
  DefaultTheme
} from '@react-navigation/native';

import {
  createNativeStackNavigator
} from '@react-navigation/native-stack';

import {
  ActivityIndicator,
  StyleSheet,
  View
} from 'react-native';

import {
  GestureHandlerRootView
} from 'react-native-gesture-handler';

import {
  SafeAreaProvider
} from 'react-native-safe-area-context';

import {
  StatusBar
} from 'expo-status-bar';

import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { light } from '../theme/mototrackerLight';
import { fontFamily } from '../theme/fonts';

import {
  AuthProvider,
  useAuth
} from '../context/AuthContext';

import {
  MotoProvider
} from '../context/MotoContext';

import {
  AppSettingsProvider,
  useAppSettings
} from '../context/AppSettingsContext';

import {
  KILOMETERS_REMINDER_ID,
  asegurarRecordatorioKilometros,
  cancelarNotificacion,
} from '../services/notificationsService';

import type {
  AuthStackParamList,
  RootStackParamList
} from './types';

import { MainTabs } from './MainTabs';

import { LoginScreen } from '../screens/auth/LoginScreen';

import { RegisterScreen } from '../screens/auth/RegisterScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  const { theme } = useAppSettings();

  return (

    <AuthStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface
        },
        headerTintColor: theme.primary,
        headerTitleStyle: {
          fontFamily: fontFamily.bold,
          fontWeight: '700',
          color: theme.primary,
        },
        contentStyle: {
          backgroundColor: theme.bg
        },
      }}
    >

      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false
        }}
      />

      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Crear cuenta'
        }}
      />

    </AuthStack.Navigator>

  );
}

function MainGate() {

  const { user } = useAuth();

  if (!user) return null;

  return (

    <MotoProvider idUsuario={user.idUsuario}>

      <MainTabs />

    </MotoProvider>

  );
}

function RootNavigator() {

  const {
    user,
    bootstrapping
  } = useAuth();
  const { theme } = useAppSettings();

  if (bootstrapping) {

    return (

      <View style={[styles.boot, { backgroundColor: theme.bg }]}>

        <ActivityIndicator
          size="large"
          color={theme.primary}
        />

      </View>

    );
  }

  return (

    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.bg
        }
      }}
    >

      {user ? (

        <>

          <RootStack.Screen
            name="Main"
            component={MainGate}
          />

        </>

      ) : (

        <RootStack.Screen
          name="Auth"
          component={AuthNavigator}
        />

      )}

    </RootStack.Navigator>

  );
}

export function AppNavigator() {

  const [fontsReady] = useFonts({

    Inter_400Regular,

    Inter_500Medium,

    Inter_600SemiBold,

    Inter_700Bold,

  });

  if (!fontsReady) {

    return (

      <View style={styles.boot}>

        <ActivityIndicator
          size="large"
          color={light.primary}
        />

      </View>

    );
  }

  return (

    <GestureHandlerRootView style={styles.gestureRoot}>

      <SafeAreaProvider>

        <AppSettingsProvider>

          <AuthProvider>

            <AppNavigationContent />

          </AuthProvider>

        </AppSettingsProvider>

      </SafeAreaProvider>

    </GestureHandlerRootView>

  );
}

function AppNavigationContent() {
  const {
    darkMode,
    notifications,
    reminders,
    theme
  } = useAppSettings();

  useEffect(() => {
    if (!notifications || !reminders) {
      void cancelarNotificacion(KILOMETERS_REMINDER_ID);
      return;
    }

    void asegurarRecordatorioKilometros();
  }, [notifications, reminders]);

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.bg,
      card: theme.surface,
      text: theme.text,
      border: 'transparent',
      primary: theme.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>

      <StatusBar style={darkMode ? 'light' : 'dark'} />

      <RootNavigator />

    </NavigationContainer>
  );
}

const styles = StyleSheet.create({

  gestureRoot: {
    flex: 1
  },

  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: light.bg
  },

});
