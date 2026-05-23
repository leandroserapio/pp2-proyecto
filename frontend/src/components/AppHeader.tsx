// src/components/AppHeader.tsx

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { fontFamily } from '../theme/fonts';
import { light } from '../theme/mototrackerLight';
import { AppDrawerMenu } from './AppDrawerMenu';

type Props = {
  subtitle?: string;
  title?: string;
};

export function AppHeader({
  subtitle,
  title = 'MotoTracker',
}: Props) {
  const { user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons
            name="menu"
            size={30}
            color={light.primary}
          />
        </Pressable>

        <View style={styles.titleWrap}>
          <Text style={styles.brand}>
            {title}
          </Text>

          {subtitle ? (
            <Text
              style={styles.subtitle}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.nombre?.trim()?.charAt(0)?.toUpperCase() ?? 'M'}
          </Text>
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
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: light.surface,
    borderBottomWidth: 1,
    borderBottomColor: light.border,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  brand: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 20,
    color: light.primary,
  },
  subtitle: {
    marginTop: 2,
    maxWidth: '100%',
    color: light.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: light.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: light.border,
  },
  avatarText: {
    color: light.primaryDark,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
  },
});
