// src/components/AppHeader.tsx

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { useAppSettings } from '../context/AppSettingsContext';
import { light } from '../theme/mototrackerLight';
import { headerBarStyles } from '../theme/headerStyles';
import { AppDrawerMenu } from './AppDrawerMenu';
import { MotoSelectorDropdown } from './MotoSelectorDropdown';

const LOGO_MOTOTRACKER = require('../../assets/logo_mototracker.png');

export function AppHeader() {
  const { theme } = useAppSettings();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <View
        style={[
          headerBarStyles.bar,
          headerBarStyles.barShadow,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View style={styles.leftSlot}>
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="menu" size={28} color={theme.primary} />
          </Pressable>

          <Image
            accessibilityLabel="Logo MotoTracker"
            source={LOGO_MOTOTRACKER}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.rightSlot}>
          <MotoSelectorDropdown />
        </View>
      </View>

      <AppDrawerMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  leftSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  logo: {
    width: 36,
    height: 36,
  },
  rightSlot: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 12,
  },
});
