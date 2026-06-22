import type { ReactNode } from 'react';
import { Text, View, type ViewStyle } from 'react-native';

import { useAppSettings } from '../context/AppSettingsContext';
import { sectionStyles } from '../theme/sectionStyles';

type Props = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  action?: ReactNode;
  style?: ViewStyle;
};

export function ScreenSectionHeader({
  title,
  eyebrow,
  subtitle,
  action,
  style,
}: Props) {
  const { theme } = useAppSettings();

  return (
    <View style={[sectionStyles.screenSection, style]}>
      <View
        style={[
          sectionStyles.screenSectionRow,
          action ? sectionStyles.screenSectionWithAction : null,
        ]}
      >
        <View style={sectionStyles.screenSectionCopy}>
          {eyebrow ? (
            <View style={sectionStyles.screenEyebrow}>
              <Text
                style={[sectionStyles.screenEyebrowText, { color: theme.textMuted }]}
                numberOfLines={1}
              >
                {eyebrow}
              </Text>
            </View>
          ) : null}

          <Text
            style={[sectionStyles.screenTitle, { color: theme.text }]}
            numberOfLines={2}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text
              style={[sectionStyles.screenSubtitle, { color: theme.textMuted }]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {action ?? null}
      </View>
    </View>
  );
}
