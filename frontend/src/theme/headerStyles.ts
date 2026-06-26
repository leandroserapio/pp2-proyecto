import { Platform, StyleSheet } from 'react-native';

import { fontFamily } from './fonts';
import { light } from './mototrackerLight';

export const APP_HEADER_BAR_MIN_HEIGHT = 56;
export const APP_HEADER_PADDING_HORIZONTAL = 16;
export const APP_HEADER_PADDING_VERTICAL = 8;

export const headerBarStyles = StyleSheet.create({
  bar: {
    minHeight: APP_HEADER_BAR_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: APP_HEADER_PADDING_HORIZONTAL,
    paddingVertical: APP_HEADER_PADDING_VERTICAL,
    borderBottomWidth: 1,
  },
  barShadow: Platform.select({
    web: {
      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
    },
    default: {
      elevation: 4,
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
  }),
  backSlot: {
    flexShrink: 0,
    marginRight: 4,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.primary,
  },
  rightSlot: {
    flexShrink: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 40,
    marginLeft: 12,
  },
});
