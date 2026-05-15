import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { light } from '../theme/mototrackerLight';
import { fontFamily } from '../theme/fonts';

type Props = PressableProps & {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'danger' | 'blue';
};

export function PrimaryButton({
  title,
  loading,
  disabled,
  variant = 'primary',
  style,
  ...rest
}: Props) {
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';
  const isBlue = variant === 'blue';
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) =>
        [
          styles.base,
          isGhost && styles.ghost,
          isDanger && styles.danger,
          isBlue && styles.blue,
          !isGhost && !isDanger && !isBlue && styles.primary,
          (disabled || loading) && styles.disabled,
          pressed && styles.pressed,
          style,
        ] as StyleProp<ViewStyle>
      }
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? colors.accent : '#fff'} />
      ) : (
        <Text
          style={[
            styles.text,
            isGhost && styles.textGhost,
            isDanger && styles.textDanger,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: { backgroundColor: colors.accent },
  blue: { backgroundColor: light.primary },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  danger: { backgroundColor: colors.danger },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.88 },
  text: { color: '#fff', fontSize: 16, fontFamily: fontFamily.semiBold, fontWeight: '600' },
  textGhost: { color: colors.accent },
  textDanger: { color: '#1a0505', fontWeight: '700' },
});
