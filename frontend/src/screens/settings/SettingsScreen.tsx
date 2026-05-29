// src/screens/settings/SettingsScreen.tsx

import {
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../../components/AppHeader';
import { useAppSettings } from '../../context/AppSettingsContext';
import { fontFamily } from '../../theme/fonts';
import { light } from '../../theme/mototrackerLight';

export function SettingsScreen() {
  const {
    darkMode,
    notifications,
    reminders,
    setDarkMode,
    setNotifications,
    setReminders,
    theme,
  } = useAppSettings();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.bg
        }
      ]}
      edges={['top']}
    >
      <AppHeader title="Ajustes" />

      <View style={styles.content}>
        <SettingRow
          label="Modo oscuro"
          value={darkMode}
          onValueChange={setDarkMode}
        />

        <SettingRow
          label="Notificaciones"
          value={notifications}
          onValueChange={setNotifications}
        />

        <SettingRow
          label="Recordatorio de kilometraje"
          value={reminders}
          onValueChange={setReminders}
        />
      </View>
    </SafeAreaView>
  );
}

function SettingRow({
  label,
  onValueChange,
  value,
}: {
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}) {
  const { theme } = useAppSettings();

  return (
    <View style={[
      styles.row,
      {
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }
    ]}>
      <Text style={[
        styles.text,
        {
          color: theme.text
        }
      ]}>
        {label}
      </Text>

      <Switch
        value={value}
        onValueChange={onValueChange}
      />
    </View>
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
    borderRadius: 8,
    marginBottom: 14,
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
