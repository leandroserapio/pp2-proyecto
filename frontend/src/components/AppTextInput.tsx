import type { TextInputProps } from 'react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { fontFamily } from '../theme/fonts';
import { useAppSettings } from '../context/AppSettingsContext';

type Props = TextInputProps & {
  label?: string;
  variant?: 'dark' | 'light';
};

export function AppTextInput({ label, style, variant = 'light', ...rest }: Props) {
  const { theme } = useAppSettings();
  const isLight = variant === 'light';
  const labelColor = theme.textMuted;
  const ph = theme.textMuted;
  const bg = isLight ? theme.surface : theme.bg;
  const border = theme.border;
  const fg = theme.text;
  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, { color: labelColor }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={ph}
        style={[styles.input, { backgroundColor: bg, borderColor: border, color: fg }, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { marginBottom: 6, fontSize: 13, fontFamily: fontFamily.medium, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fontFamily.regular,
  },
});
