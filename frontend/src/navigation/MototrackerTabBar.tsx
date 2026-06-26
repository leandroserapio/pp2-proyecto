// src/navigation/MototrackerTabBar.tsx

import { useRef } from 'react';

import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { useLinkBuilder } from '@react-navigation/native';

import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  UIManager,
  View,
  useWindowDimensions,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily } from '../theme/fonts';
import { useAppSettings } from '../context/AppSettingsContext';
import { isTabletWidth, TAB_BAR_MAX_WIDTH } from '../theme/responsive';

// En la arquitectura vieja de Android hay que habilitar LayoutAnimation.
// En Fabric ya viene activo y el metodo puede no existir (lo verificamos).
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Transicion fluida al cambiar de pestana: la pill activa se expande/contrae
// y la etiqueta aparece/desaparece con un fundido suave.
const TAB_SWITCH_ANIMATION: typeof LayoutAnimation.Presets.easeInEaseOut = {
  duration: 220,
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
};

/**
 * Tab bar propia de MotoTracker.
 *
 * Pensada para escalar bien desde celulares angostos hasta tablets/web:
 * - El item activo se expande en una "pill" con icono + etiqueta, mientras que
 *   los inactivos quedan solo con icono. Asi nunca se desbordan las 5 pestanas
 *   en pantallas chicas (las etiquetas largas en espanol no se cortan).
 * - Respeta el safe-area inferior (gesto Android / home indicator iOS).
 * - En pantallas anchas se centra con un ancho maximo y bordes redondeados.
 */
export function MototrackerTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { theme } = useAppSettings();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { buildHref } = useLinkBuilder();

  const prevIndexRef = useRef(state.index);

  const tablet = isTabletWidth(width);

  // Si la ruta enfocada pidio ocultar la barra (tabBarStyle display:none),
  // no renderizamos nada. Cubre los flujos de alta/edicion a pantalla completa.
  const focusedRoute = state.routes[state.index];
  const focusedStyle = StyleSheet.flatten(
    descriptors[focusedRoute.key]?.options.tabBarStyle,
  ) as { display?: string } | undefined;
  if (focusedStyle?.display === 'none') {
    return null;
  }

  // Animamos el commit cuando cambia la pestana activa (no en web).
  if (prevIndexRef.current !== state.index) {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(TAB_SWITCH_ANIMATION);
    }
    prevIndexRef.current = state.index;
  }

  const compact = width < 360;
  const iconSize = tablet ? 24 : compact ? 22 : 23;
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'ios' ? 6 : 10);
  const horizontalPad = tablet ? 16 : compact ? 8 : 12;

  return (
    <View
      style={[
        styles.outer,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: bottomPad,
          paddingHorizontal: horizontalPad,
        },
        tablet && {
          maxWidth: TAB_BAR_MAX_WIDTH,
          alignSelf: 'center',
          width: '100%',
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.border,
          marginBottom: Platform.OS === 'web' ? 12 : 8,
        },
      ]}
    >
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          // Las pestanas marcadas con tabBarButton (p. ej. Ajustes) quedan
          // fuera de la barra pero accesibles por navegacion directa.
          if (options.tabBarButton) {
            return null;
          }

          const isFocused = state.index === index;

          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name;

          const iconColor = isFocused ? theme.onPrimary : theme.tabInactive;
          const icon = options.tabBarIcon?.({
            focused: isFocused,
            color: iconColor,
            size: iconSize,
          });

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <PlatformPressable
              key={route.key}
              href={buildHref(route.name, route.params)}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              pressColor="transparent"
              pressOpacity={0.7}
              style={[styles.item, isFocused && styles.itemFocused]}
            >
              <View
                style={[
                  styles.pill,
                  isFocused && {
                    backgroundColor: theme.tabActivePill,
                    paddingHorizontal: compact ? 12 : 16,
                  },
                ]}
              >
                {icon}
                {isFocused && (
                  <Text
                    numberOfLines={1}
                    style={[styles.label, { color: theme.onPrimary }]}
                  >
                    {label}
                  </Text>
                )}
              </View>
            </PlatformPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  item: {
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: 4,
    borderRadius: 24,
  },
  itemFocused: {
    flexShrink: 0,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: 12,
    // Radio concreto (= mitad del alto) para evitar el bug de Fabric/Android
    // donde un borderRadius muy grande se renderiza cuadrado.
    borderRadius: 20,
    overflow: 'hidden',
  },
  label: {
    marginLeft: 8,
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    flexShrink: 1,
  },
});
