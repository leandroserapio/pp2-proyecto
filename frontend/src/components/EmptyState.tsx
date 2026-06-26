import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useAppSettings } from '../context/AppSettingsContext';
import { fontFamily } from '../theme/fonts';
import { light } from '../theme/mototrackerLight';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'card' | 'plain';
  frameStyle?: ViewStyle;
};

export function EmptyState({
  title,
  subtitle,
  icon,
  actionLabel,
  onAction,
  variant = 'card',
  frameStyle,
}: Props) {
  const { theme } = useAppSettings();

  if (variant === 'plain') {
    return (
      <View style={[styles.plainWrap, frameStyle]}>
        <Text style={[styles.plainTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.plainSub, { color: theme.textMuted }]}>{subtitle}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.frame, frameStyle]}>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {icon ? (
          <View style={[styles.iconCircle, { backgroundColor: theme.bg }]}>{icon}</View>
        ) : null}
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
        {actionLabel && onAction ? (
          <PrimaryButton
            title={actionLabel}
            variant="blue"
            onPress={onAction}
            style={styles.cta}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flexGrow: 1,
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
  },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 20,
    fontSize: 18,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    textAlign: 'center',
    color: light.navy,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    lineHeight: 22,
    textAlign: 'center',
    color: light.textMuted,
  },
  cta: {
    alignSelf: 'stretch',
    marginTop: 4,
  },
  plainWrap: {
    flexGrow: 1,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  plainTitle: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    textAlign: 'center',
    color: light.text,
  },
  plainSub: {
    marginTop: 8,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    lineHeight: 22,
    textAlign: 'center',
    color: light.textMuted,
  },
});
