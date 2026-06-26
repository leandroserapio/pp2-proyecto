import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { AppStackHeader } from '../components/AppStackHeader';
import type { AppTheme } from '../context/AppSettingsContext';

export function getStackScreenOptions(theme: AppTheme): NativeStackNavigationOptions {
  return {
    header: (props) => <AppStackHeader {...props} />,
    headerShadowVisible: false,
    contentStyle: { backgroundColor: theme.bg },
  };
}
