// src/screens/settings/SettingsScreen.tsx

import { useState } from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../../components/AppHeader';
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';

export function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
    >
      <AppHeader title="Ajustes" />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.text}>
            Modo oscuro
          </Text>

          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.text}>
            Notificaciones
          </Text>

          <Switch
            value={notifications}
            onValueChange={setNotifications}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: light.bg,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  row: {
    backgroundColor: light.surface,
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: light.border,
  },
  text: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    color: light.text,
  },
});
