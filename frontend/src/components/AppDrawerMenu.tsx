// src/components/AppDrawerMenu.tsx

import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { fontFamily } from '../theme/fonts';
import { light } from '../theme/mototrackerLight';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type MenuRoute = 'Ajustes' | 'Inicio' | 'Garage' | 'GastosStack' | 'Mantenimiento' | 'ViajesStack';

const menuItems: Array<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: MenuRoute;
}> = [
  {
    icon: 'home-outline',
    label: 'Inicio',
    route: 'Inicio',
  },
  {
    icon: 'bicycle-outline',
    label: 'Garage',
    route: 'Garage',
  },
  {
    icon: 'cash-outline',
    label: 'Gastos',
    route: 'GastosStack',
  },
  {
    icon: 'construct-outline',
    label: 'Servicios',
    route: 'Mantenimiento',
  },
  {
    icon: 'map-outline',
    label: 'Viajes',
    route: 'ViajesStack',
  },
  {
    icon: 'settings-outline',
    label: 'Ajustes',
    route: 'Ajustes',
  },
];

const MENU_WIDTH_RATIO = 0.82;
const OPEN_DURATION_MS = 260;
const CLOSE_DURATION_MS = 220;

export function AppDrawerMenu({ visible, onClose }: Props) {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const { theme } = useAppSettings();
  const { width: screenWidth } = useWindowDimensions();
  const menuWidth = Math.round(screenWidth * MENU_WIDTH_RATIO);
  const userName = user?.nombre?.trim() || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();
  const slideAnim = useRef(new Animated.Value(-menuWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isClosingRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      isClosingRef.current = false;
      slideAnim.setValue(-menuWidth);
      fadeAnim.setValue(0);
      return;
    }

    isClosingRef.current = false;
    slideAnim.setValue(-menuWidth);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: OPEN_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: OPEN_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, menuWidth, slideAnim, fadeAnim]);

  function closeWithAnimation(afterClose?: () => void) {
    if (isClosingRef.current) {
      return;
    }

    isClosingRef.current = true;

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -menuWidth,
        duration: CLOSE_DURATION_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: CLOSE_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onClose();
        afterClose?.();
      }
    });
  }

  function goTo(routeName: MenuRoute) {
    closeWithAnimation(() => {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Main',
          params: {
            screen: routeName,
            params: routeName === 'Garage' ? { openAdd: false } : undefined,
          },
        }),
      );
    });
  }

  async function doLogout() {
    await logout();
  }

  function cerrarSesion() {
    if (Platform.OS === 'web') {
      const confirmed =
        typeof globalThis.confirm === 'function'
          ? globalThis.confirm('Estas seguro que queres cerrar sesion?')
          : true;

      if (confirmed) {
        closeWithAnimation(() => {
          void doLogout();
        });
      }

      return;
    }

    Alert.alert(
      'Cerrar sesión',
      'Estas seguro',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            closeWithAnimation(() => {
              void doLogout();
            });
          },
        },
      ],
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => closeWithAnimation()}
    >
      <View style={styles.overlay}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.backdrop,
            {
              backgroundColor: theme.overlayStrong,
              opacity: fadeAnim,
            },
          ]}
        />

        <Pressable
          accessibilityRole="button"
          style={styles.backdropPressable}
          onPress={() => closeWithAnimation()}
        />

        <Animated.View
          style={[
            styles.menu,
            {
              width: menuWidth,
              backgroundColor: theme.surface,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={[styles.profileCard, { backgroundColor: theme.primary }]}>
            <View style={[styles.avatar, { backgroundColor: theme.surfaceMuted }]}>
              <Text style={[styles.avatarText, { color: theme.text }]}>
                {userInitial}
              </Text>
            </View>
            <View style={styles.profileTextWrap}>
              <Text style={[styles.title, { color: theme.onPrimary }]}>
                MotoTracker
              </Text>
              <Text style={[styles.subtitle, { color: theme.onPrimaryMuted }]}>
                {userName}
              </Text>
            </View>
          </View>

          <View style={styles.items}>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Navegación</Text>
            {menuItems.map((item) => (
              <Pressable
                key={item.route}
                style={({ pressed }) => [
                  styles.item,
                  {
                    borderColor: theme.border,
                    backgroundColor: pressed ? theme.primarySoft : theme.surface,
                  }
                ]}
                onPress={() => goTo(item.route)}
              >
                <View style={styles.itemIconWrap}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={theme.primary}
                  />
                </View>

                <Text style={[
                  styles.itemText,
                  {
                    color: theme.text
                  }
                ]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                {
                  borderColor: theme.danger,
                  backgroundColor: pressed ? theme.danger : theme.dangerSoft,
                },
              ]}
              onPress={cerrarSesion}
            >
              {({ pressed }) => (
                <>
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color={pressed ? theme.onPrimary : theme.danger}
                  />
                  <Text
                    style={[
                      styles.logoutText,
                      {
                        color: pressed ? theme.onPrimary : theme.danger,
                      },
                    ]}
                  >
                    Cerrar sesión
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    overflow: 'hidden',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  menu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: light.surface,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  profileCard: {
    minHeight: 74,
    marginBottom: 26,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
  },
  profileTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    color: light.primary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: light.textMuted,
    fontFamily: fontFamily.regular,
  },
  items: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    marginBottom: 2,
  },
  item: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  itemIconWrap: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: light.text,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 18,
    borderTopWidth: 1,
  },
  logoutButton: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: {
    color: light.textMuted,
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
});
