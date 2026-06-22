// src/components/AppHeader.tsx

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { fontFamily } from '../theme/fonts';
import { light } from '../theme/mototrackerLight';
import { AppDrawerMenu } from './AppDrawerMenu';

const SIDE_SLOT_WIDTH = 44;

export function AppHeader() {
  const { user } = useAuth();
  const { theme } = useAppSettings();
  const navigation = useNavigation<any>();
  const [menuVisible, setMenuVisible] = useState(false);

  const goToAccount = () => {
    navigation.navigate('Inicio', { screen: 'Cuenta' });
  };

  return (
    <>
      <View style={[
        styles.header,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
        }
      ]}>
        <View style={styles.sideSlot}>
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons
              name="menu"
              size={28}
              color={theme.primary}
            />
          </Pressable>
        </View>

        <View style={styles.centerSlot}>
          <Text style={[
            styles.brand,
            {
              color: theme.primary
            }
          ]}>
            MotoTracker
          </Text>
        </View>

        <View style={[styles.sideSlot, styles.sideSlotRight]}>
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={goToAccount}
            style={[
              styles.avatar,
              {
                backgroundColor: theme.surfaceMuted,
              }
            ]}
          >
            <Text style={[
              styles.avatarText,
              {
                color: theme.text
              }
            ]}>
              {user?.nombre?.trim()?.charAt(0)?.toUpperCase() ?? 'M'}
            </Text>
          </Pressable>
        </View>
      </View>

      <AppDrawerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: light.surface,
    borderBottomWidth: 1,
    borderBottomColor: light.border,
  },
  sideSlot: {
    width: SIDE_SLOT_WIDTH,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideSlotRight: {
    alignItems: 'flex-end',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 20,
    color: light.primary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: light.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: light.text,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 15,
  },
});
