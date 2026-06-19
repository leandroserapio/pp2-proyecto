import { StyleSheet } from 'react-native';

import { fontFamily } from './fonts';
import { light } from './mototrackerLight';

export const SECTION_HORIZONTAL = 18;

export const sectionStyles = StyleSheet.create({
  screenSection: {
    paddingHorizontal: SECTION_HORIZONTAL,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenSectionRow: {
    flex: 1,
  },
  screenSectionWithAction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  screenSectionCopy: {
    flex: 1,
    minWidth: 0,
  },
  screenEyebrow: {
    marginBottom: 4,
  },
  screenEyebrowText: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: light.textMuted,
  },
  screenTitle: {
    fontSize: 24,
    lineHeight: 29,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.text,
  },
  screenSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.regular,
    color: light.textMuted,
  },
  panelTitle: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.text,
    marginBottom: 4,
  },
  panelSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.regular,
    color: light.textMuted,
    marginBottom: 12,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.text,
    marginBottom: 14,
  },
  filterRow: {
    marginHorizontal: SECTION_HORIZONTAL,
    marginBottom: 10,
    backgroundColor: light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: light.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  filterInlineLabel: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    color: light.textMuted,
  },
  filterValueRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  listCardTitle: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.text,
  },
  formCardTitle: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.text,
    marginBottom: 12,
  },
});
