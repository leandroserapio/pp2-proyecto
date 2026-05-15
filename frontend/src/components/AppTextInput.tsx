import type { TextInputProps } from 'react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import { light } from '../theme/mototrackerLight';
import { fontFamily } from '../theme/fonts';

type Props = TextInputProps & {
  label?: string;
  variant?: 'dark' | 'light';
};

export function AppTextInput({ label, style, variant = 'dark', ...rest }: Props) {
  const isLight = variant === 'light';
  const labelColor = isLight ? light.textMuted : colors.textMuted;
  const ph = isLight ? light.textMuted : colors.textMuted;
  const bg = isLight ? light.surface : colors.surface;
  const border = isLight ? light.border : colors.border;
  const fg = isLight ? light.text : colors.text;
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
