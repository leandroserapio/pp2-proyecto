import type { ViewStyle } from 'react-native';

export const TABLET_BREAKPOINT = 768;
export const CONTENT_MAX_WIDTH = 720;
export const FORM_MAX_WIDTH = 640;
export const DETAIL_MAX_WIDTH = 680;
export const TAB_BAR_MAX_WIDTH = 760;

export function isTabletWidth(width: number): boolean {
  return width >= TABLET_BREAKPOINT;
}

export function getResponsivePadding(width: number): number {
  return isTabletWidth(width) ? 24 : 18;
}

export function getCenteredContentStyle(width: number, maxWidth = CONTENT_MAX_WIDTH): ViewStyle {
  const style: ViewStyle = {
    width: '100%',
    alignSelf: 'center',
  };

  if (isTabletWidth(width)) {
    style.maxWidth = maxWidth;
  }

  return style;
}

export function getResponsiveFabRight(width: number, maxWidth = CONTENT_MAX_WIDTH, inset = 22): number {
  if (!isTabletWidth(width)) return inset;

  const contentWidth = Math.min(width, maxWidth);
  return Math.max(inset, (width - contentWidth) / 2 + inset);
}
