import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';

import { light } from '../theme/mototrackerLight';

export const FAB_INSET = 24;
export const FAB_SIZE = 56;
export const FAB_SCROLL_PADDING = FAB_INSET + FAB_SIZE + FAB_INSET;

export const screenRootStyle = {
  flex: 1,
  position: 'relative' as const,
};

type ScreenFabProps = {
  visible?: boolean;
  onPress: () => void;
  backgroundColor: string;
  iconColor: string;
};

export function ScreenFab({ visible = true, onPress, backgroundColor, iconColor }: ScreenFabProps) {
  if (!visible) return null;

  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.fab, { backgroundColor }]}
      onPress={onPress}
    >
      <Ionicons name="add" size={30} color={iconColor} />
    </Pressable>
  );
}

export function ScreenRoot({ style, ...props }: ViewProps) {
  return <View style={[screenRootStyle, style]} {...props} />;
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: FAB_INSET,
    bottom: FAB_INSET,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 6,
    shadowColor: light.navy,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
