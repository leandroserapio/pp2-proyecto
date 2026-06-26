// src/components/AppDrawerMenu.tsx

import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { fontFamily } from '../theme/fonts';
import { light } from '../theme/mototrackerLight';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type MenuRoute = 'Ajustes' | 'Inicio' | 'Recordatorios' | 'GastosStack' | 'MantenimientoStack' | 'ViajesStack' | 'MotosStack';

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
    label: 'Mis motos',
    route: 'MotosStack',
  },
  {
    icon: 'notifications-outline',
    label: 'Recordatorios',
    route: 'Recordatorios',
  },
  {
    icon: 'cash-outline',
    label: 'Gastos',
    route: 'GastosStack',
  },
  {
    icon: 'construct-outline',
    label: 'Servicios',
    route: 'MantenimientoStack',
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

const MENU_WIDTH_RATIO = 0.94;
const MENU_MAX_WIDTH = 420;
const OPEN_DURATION_MS = 260;
const CLOSE_DURATION_MS = 220;
const LOGO_MOTOTRACKER = require('../../assets/logo_mototracker.png');

export function AppDrawerMenu({ visible, onClose }: Props) {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const { theme } = useAppSettings();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const menuWidth = Math.min(Math.round(screenWidth * MENU_WIDTH_RATIO), MENU_MAX_WIDTH);
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
          },
        }),
      );
    });
  }

  function goToProfile() {
    closeWithAnimation(() => {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Main',
          params: {
            screen: 'Inicio',
            params: {
              screen: 'Cuenta',
            },
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
              paddingTop: insets.top + 24,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles.brandHeader}>
            <View style={styles.brandRow}>
              <Image
                accessibilityLabel="Logo MotoTracker"
                source={LOGO_MOTOTRACKER}
                style={styles.brandLogo}
                resizeMode="contain"
              />
              <Text style={[styles.brandTitle, { color: theme.primary }]}>
                MotoTracker
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar menú"
              hitSlop={10}
              onPress={() => closeWithAnimation()}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
            showsVerticalScrollIndicator={false}
            bounces
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.profileCard,
                {
                  backgroundColor: pressed ? theme.primaryDark : theme.primary,
                },
              ]}
              onPress={goToProfile}
            >
              <View style={[styles.avatar, { backgroundColor: theme.surfaceMuted }]}>
                <Text style={[styles.avatarText, { color: theme.text }]}>
                  {userInitial}
                </Text>
              </View>
              <View style={styles.profileTextWrap}>
                <Text style={[styles.profileName, { color: theme.onPrimary }]}>
                  {userName}
                </Text>
                <Text style={[styles.profileLink, { color: theme.onPrimaryMuted }]}>
                  Ver Perfil &gt;
                </Text>
              </View>
            </Pressable>

            <View style={styles.items}>
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Navegación</Text>
              {menuItems.map((item) => (
                <Pressable
                  key={item.route}
                  style={({ pressed }) => [
                    styles.item,
                    {
                      backgroundColor: pressed ? theme.primarySoft : 'transparent',
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
          </ScrollView>
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
    paddingHorizontal: 20,
    zIndex: 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 40,
    height: 40,
  },
  brandTitle: {
    fontSize: 24,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileCard: {
    minHeight: 92,
    marginBottom: 32,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
  },
  profileTextWrap: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.onPrimary,
  },
  profileLink: {
    marginTop: 6,
    fontSize: 14,
    color: light.onPrimaryMuted,
    fontFamily: fontFamily.regular,
  },
  items: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    marginBottom: 8,
  },
  item: {
    minHeight: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  itemIconWrap: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: light.text,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
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
