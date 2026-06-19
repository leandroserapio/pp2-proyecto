import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSettings } from '../context/AppSettingsContext';
import { sectionStyles } from '../theme/sectionStyles';
import { light } from '../theme/mototrackerLight';

const SHEET_OPEN_MS = 300;
const SHEET_CLOSE_MS = 240;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type BottomSheetRef = {
  close: () => void;
};

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export const BottomSheet = forwardRef<BottomSheetRef, Props>(function BottomSheet(
  { visible, title, onClose, children },
  ref,
) {
  const { theme } = useAppSettings();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetProgress = useRef(new Animated.Value(0)).current;
  const isClosingRef = useRef(false);
  const [presented, setPresented] = useState(false);
  const sheetTravel = Math.min(windowHeight * 0.9, 700);
  const sheetMaxHeight = Math.round(windowHeight * 0.85);
  const bottomSafeInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48)
    : insets.bottom;
  const sheetBottomPadding = Platform.OS === 'web' ? 20 : 16 + bottomSafeInset;
  const scrollMaxHeight = sheetMaxHeight - 40;

  const animateClose = useCallback(
    (afterClose?: () => void) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      Animated.timing(sheetProgress, {
        toValue: 0,
        duration: SHEET_CLOSE_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }).start(({ finished }) => {
        isClosingRef.current = false;
        if (!finished) return;
        setPresented(false);
        afterClose?.();
        onClose();
      });
    },
    [onClose, sheetProgress],
  );

  const animateOpen = useCallback(() => {
    isClosingRef.current = false;
    sheetProgress.setValue(0);
    Animated.timing(sheetProgress, {
      toValue: 1,
      duration: SHEET_OPEN_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [sheetProgress]);

  useImperativeHandle(ref, () => ({
    close: () => animateClose(),
  }), [animateClose]);

  useEffect(() => {
    if (visible) {
      if (isClosingRef.current) return;
      setPresented(true);
      return;
    }

    if (presented && !isClosingRef.current) {
      animateClose();
    }
  }, [animateClose, presented, visible]);

  useEffect(() => {
    if (!presented || !visible) return;
    animateOpen();
  }, [presented, visible, animateOpen]);

  const sheetTranslateY = sheetProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetTravel, 0],
  });
  const backdropOpacity = sheetProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const sheetShadowOpacity = sheetProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal
      visible={presented}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent={Platform.OS === 'android'}
      onRequestClose={() => animateClose()}
    >
      <View style={styles.modalRoot}>
        <AnimatedPressable
          style={[styles.modalBackdrop, { backgroundColor: theme.overlay, opacity: backdropOpacity }]}
          onPress={() => animateClose()}
        />
        <Animated.View
          style={[
            styles.modalSheetWrap,
            { transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          <Animated.View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
              Platform.OS !== 'web' ? { shadowOpacity: sheetShadowOpacity } : null,
              Platform.OS === 'web' ? { boxShadow: '0 -8px 28px rgba(15, 23, 42, 0.14)' } : null,
            ]}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              bounces={false}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: scrollMaxHeight }}
              contentContainerStyle={[styles.modalScrollContent, { paddingBottom: sheetBottomPadding }]}
            >
              <Text style={[sectionStyles.modalTitle, { color: theme.text }]}>{title}</Text>
              {children}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalRoot: { flex: 1 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: light.overlay },
  modalSheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
  },
  modalScrollContent: {
    flexGrow: 0,
  },
  modalSheet: {
    width: '100%',
    backgroundColor: light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
    borderColor: light.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 16,
    elevation: 12,
  },
});
