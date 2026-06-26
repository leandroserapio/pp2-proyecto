import { Ionicons } from '@expo/vector-icons';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSettings } from '../context/AppSettingsContext';
import { headerBarStyles } from '../theme/headerStyles';

export function AppStackHeader({ navigation, options }: NativeStackHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppSettings();
  const title = typeof options.title === 'string' ? options.title : '';
  const HeaderRight = options.headerRight;
  const canGoBack = navigation.canGoBack();

  return (
    <View
      style={[
        headerBarStyles.barShadow,
        {
          paddingTop: insets.top,
          backgroundColor: theme.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
      ]}
    >
      <View
        style={[
          headerBarStyles.bar,
          {
            backgroundColor: theme.surface,
            borderBottomColor: 'transparent',
            borderBottomWidth: 0,
            paddingTop: 0,
          },
        ]}
      >
        <View style={headerBarStyles.backSlot}>
          {canGoBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver"
              hitSlop={10}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={28} color={theme.primary} />
            </Pressable>
          ) : null}
        </View>

        <Text style={[headerBarStyles.title, { color: theme.primary }]} numberOfLines={1}>
          {title}
        </Text>

        <View style={headerBarStyles.rightSlot}>
          {HeaderRight ? <HeaderRight canGoBack={canGoBack} tintColor={theme.primary} /> : null}
        </View>
      </View>
    </View>
  );
}
