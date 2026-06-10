import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { fontFamily } from '../theme/fonts';
import { useAppSettings } from '../context/AppSettingsContext';

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
  const { theme } = useAppSettings();
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';
  const buttonColor = isDanger ? theme.danger : theme.primary;
  const textColor = isGhost ? theme.primary : theme.onPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) =>
        [
          styles.base,
          isGhost
            ? {
                backgroundColor: theme.primarySoft,
                borderWidth: 1,
                borderColor: theme.primary,
              }
            : {
                backgroundColor: buttonColor,
              },
          (disabled || loading) && styles.disabled,
          pressed && styles.pressed,
          style,
        ] as StyleProp<ViewStyle>
      }
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: textColor },
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
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.88 },
  text: { fontSize: 16, fontFamily: fontFamily.semiBold, fontWeight: '600' },
  textDanger: { fontWeight: '700' },
});
