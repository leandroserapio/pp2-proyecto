// src/components/AppDrawerMenu.tsx

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { fontFamily } from '../theme/fonts';
import { light } from '../theme/mototrackerLight';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type MenuRoute = 'Ajustes' | 'Cuenta' | 'Garage' | 'Inicio';

const menuItems: Array<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: MenuRoute;
  secondaryIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
}> = [
  {
    icon: 'home-outline',
    label: 'Inicio',
    route: 'Inicio',
  },
  {
    icon: 'add-circle-outline',
    label: 'Garage',
    route: 'Garage',
    secondaryIcon: 'motorbike',
  },
  {
    icon: 'person-outline',
    label: 'Cuenta',
    route: 'Cuenta',
  },
  {
    icon: 'settings-outline',
    label: 'Ajustes',
    route: 'Ajustes',
  },
];

export function AppDrawerMenu({ visible, onClose }: Props) {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const { theme } = useAppSettings();

  function goTo(routeName: MenuRoute) {
    onClose();

    if (routeName === 'Inicio' || routeName === 'Garage') {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Main',
          params: {
            screen: routeName,
            params: routeName === 'Garage' ? { openAdd: false } : undefined,
          },
        }),
      );
      return;
    }

    navigation.dispatch(CommonActions.navigate(routeName));
  }

  async function doLogout() {
    onClose();
    await logout();
  }

  function cerrarSesion() {
    if (Platform.OS === 'web') {
      const confirmed =
        typeof globalThis.confirm === 'function'
          ? globalThis.confirm('Estas seguro que queres cerrar sesion?')
          : true;

      if (confirmed) {
        void doLogout();
      }

      return;
    }

    Alert.alert(
      'Cerrar sesión',
      'Estas seguro',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await doLogout();
          },
        },
      ],
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.menu,
          {
            backgroundColor: theme.surface,
          }
        ]}>
          <View style={styles.header}>
            <View>
              <Text style={[
                styles.title,
                {
                  color: theme.primary
                }
              ]}>
                MotoTracker
              </Text>
              <Text style={[
                styles.subtitle,
                {
                  color: theme.textMuted
                }
              ]}>
                {user?.nombre ?? 'Usuario'}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={26}
                color={theme.text}
              />
            </Pressable>
          </View>

          <View style={styles.items}>
            {menuItems.map((item) => (
              <Pressable
                key={item.route}
                style={({ pressed }) => [
                  styles.item,
                  {
                    backgroundColor: pressed ? theme.bg : 'transparent',
                  }
                ]}
                onPress={() => goTo(item.route)}
              >
                <View style={styles.itemIconWrap}>
                  {item.secondaryIcon ? (
                    <MaterialCommunityIcons
                      name={item.secondaryIcon}
                      size={22}
                      color={theme.primary}
                    />
                  ) : (
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={theme.primary}
                    />
                  )}
                </View>

                <Text style={[
                  styles.itemText,
                  {
                    color: theme.text
                  }
                ]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.logoutButton}
            onPress={cerrarSesion}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color="#fff"
            />
            <Text style={styles.logoutText}>
              Cerrar sesión
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  menu: {
    width: '82%',
    height: '100%',
    backgroundColor: light.surface,
    paddingTop: 60,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.primary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: light.textMuted,
    fontFamily: fontFamily.regular,
  },
  items: {
    gap: 4,
  },
  item: {
    minHeight: 50,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  itemIconWrap: {
    width: 34,
    alignItems: 'center',
    marginRight: 10,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    color: light.text,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
  logoutButton: {
    minHeight: 50,
    marginTop: 'auto',
    borderRadius: 8,
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  logoutText: {
    color: 'white',
    fontSize: 15,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
  },
});
