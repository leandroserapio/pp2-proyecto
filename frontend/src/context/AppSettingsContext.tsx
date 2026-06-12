// src/context/AppSettingsContext.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { light } from '../theme/mototrackerLight';

const STORAGE_SETTINGS = '@mototracker/appSettings';

export const dark = {
  ...light,
  bg: '#0B1220',
  surface: '#111827',
  surfaceMuted: '#1E293B',
  primary: '#2563EB',
  primarySoft: '#1E3A8A',
  primaryDark: '#DBEAFE',
  navy: '#F8FAFC',
  text: '#F8FAFC',
  textMuted: '#AAB7C9',
  border: '#2B3547',
  tabInactive: '#94A3B8',
  tabActivePill: '#2563EB',
  shadow: 'rgba(0, 0, 0, 0.32)',
  shadowMedium: 'rgba(0, 0, 0, 0.42)',
  shadowStrong: 'rgba(0, 0, 0, 0.55)',
  overlaySoft: 'rgba(0, 0, 0, 0.45)',
  overlay: 'rgba(0, 0, 0, 0.62)',
  overlayStrong: 'rgba(0, 0, 0, 0.72)',
  success: '#4ADE80',
  successSoft: '#123524',
  danger: '#F87171',
  dangerSoft: '#3B1218',
  warning: '#FBBF24',
  warningSoft: '#3A2A0A',
  categoryService: '#A78BFA',
  categoryInsurance: '#F472B6',
  categoryFuel: '#3B82F6',
};

export type AppTheme = typeof light;

type StoredSettings = {
  darkMode: boolean;
  notifications: boolean;
  reminders: boolean;
};

type AppSettingsContextValue = StoredSettings & {
  theme: AppTheme;
  setDarkMode: (value: boolean) => void;
  setNotifications: (value: boolean) => void;
  setReminders: (value: boolean) => void;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: PropsWithChildren) {
  const [darkMode, setDarkModeState] = useState(false);
  const [notifications, setNotificationsState] = useState(true);
  const [reminders, setRemindersState] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_SETTINGS);
        if (!raw || cancelled) return;

        const parsed = JSON.parse(raw) as Partial<StoredSettings>;
        setDarkModeState(Boolean(parsed.darkMode));
        setNotificationsState(parsed.notifications !== false);
        setRemindersState(parsed.reminders !== false);
      } catch {
        // Si la configuracion esta corrupta, seguimos con valores seguros.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: StoredSettings) => {
    await AsyncStorage.setItem(STORAGE_SETTINGS, JSON.stringify(next));
  }, []);

  const update = useCallback(
    (next: Partial<StoredSettings>) => {
      const merged = {
        darkMode,
        notifications,
        reminders,
        ...next,
      };

      setDarkModeState(merged.darkMode);
      setNotificationsState(merged.notifications);
      setRemindersState(merged.reminders);
      void persist(merged);
    },
    [darkMode, notifications, persist, reminders],
  );

  const value = useMemo(
    () => ({
      darkMode,
      notifications,
      reminders,
      theme: darkMode ? dark : light,
      setDarkMode: (next: boolean) => update({ darkMode: next }),
      setNotifications: (next: boolean) => update({ notifications: next }),
      setReminders: (next: boolean) => update({ reminders: next }),
    }),
    [darkMode, notifications, reminders, update],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings(): AppSettingsContextValue {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings debe usarse dentro de AppSettingsProvider');
  return ctx;
}
