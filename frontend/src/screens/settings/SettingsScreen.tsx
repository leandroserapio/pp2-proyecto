// src/screens/settings/SettingsScreen.tsx

import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../../components/AppHeader';
import { ScreenSectionHeader } from '../../components/ScreenSectionHeader';
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
      <AppHeader />

      <ScrollView contentContainerStyle={styles.content}>
        <ScreenSectionHeader
          title="Ajustes"
          subtitle="Personalizá la apariencia y preferencias de la app."
        />

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
          label="Recordatorios"
          value={reminders}
          onValueChange={setReminders}
        />
      </ScrollView>
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
        trackColor={{ false: theme.surfaceMuted, true: theme.primarySoft }}
        thumbColor={value ? theme.primary : theme.textMuted}
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
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingBottom: 20,
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
