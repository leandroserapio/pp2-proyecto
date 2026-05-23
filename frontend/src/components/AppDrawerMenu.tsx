// src/components/AppDrawerMenu.tsx

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { light } from '../theme/mototrackerLight';
import { fontFamily } from '../theme/fonts';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function AppDrawerMenu({ visible, onClose }: Props) {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const initial = user?.nombre?.trim()?.charAt(0)?.toUpperCase() ?? 'M';

  function goTo(routeName: 'Ajustes' | 'Cuenta' | 'Garage') {
    onClose();

    if (routeName === 'Garage') {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Main',
          params: {
            screen: 'Garage',
          },
        }),
      );
      return;
    }

    navigation.dispatch(CommonActions.navigate(routeName));
  }

  function cerrarSesion() {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que querés cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            onClose();
            await logout();
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
        <View style={[styles.menu, darkMode && styles.menuDark]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={[styles.title, darkMode && styles.textDark]}>
                MotoTracker
              </Text>

              <Pressable onPress={onClose}>
                <Ionicons
                  name="close"
                  size={30}
                  color={darkMode ? 'white' : 'black'}
                />
              </Pressable>
            </View>

            <Pressable
              style={styles.item}
              onPress={() => goTo('Garage')}
            >
              <Ionicons
                name="home"
                size={24}
                color={darkMode ? 'white' : light.primary}
              />
              <Text style={[styles.itemText, darkMode && styles.textDark]}>
                Inicio
              </Text>
            </Pressable>

            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              Motos
            </Text>

            <Pressable
              style={styles.subItem}
              onPress={() => goTo('Garage')}
            >
              <Ionicons
                name="add-circle-outline"
                size={22}
                color={light.primary}
              />
              <Text style={[styles.itemText, darkMode && styles.textDark]}>
                Registrar moto
              </Text>
            </Pressable>

            <Pressable
              style={styles.subItem}
              onPress={() => goTo('Garage')}
            >
              <MaterialCommunityIcons
                name="motorbike"
                size={22}
                color={light.primary}
              />
              <Text style={[styles.itemText, darkMode && styles.textDark]}>
                Seleccionar moto
              </Text>
            </Pressable>

            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              Cuenta
            </Text>

            <View style={styles.accountContainer}>
              <View style={styles.profileImage}>
                <Text style={styles.profileInitial}>
                  {initial}
                </Text>
              </View>

              <Text style={[styles.accountText, darkMode && styles.textDark]}>
                Nombre: {user?.nombre ?? 'Usuario'}
              </Text>

              <Text style={[styles.accountText, darkMode && styles.textDark]}>
                Email: {user?.email ?? '-'}
              </Text>

              <Pressable
                style={styles.editButton}
                onPress={() => goTo('Cuenta')}
              >
                <Text style={styles.editButtonText}>
                  Modificar cuenta
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>
              Ajustes
            </Text>

            <View style={styles.settingRow}>
              <Text style={[styles.itemText, darkMode && styles.textDark]}>
                Modo oscuro
              </Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.itemText, darkMode && styles.textDark]}>
                Notificaciones
              </Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
              />
            </View>

            <Pressable
              style={styles.settingsButton}
              onPress={() => goTo('Ajustes')}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={light.primary}
              />
              <Text style={[styles.itemText, darkMode && styles.textDark]}>
                Ver ajustes
              </Text>
            </Pressable>

            <Pressable
              style={styles.logoutButton}
              onPress={cerrarSesion}
            >
              <Ionicons
                name="log-out-outline"
                size={24}
                color="white"
              />
              <Text style={styles.logoutText}>
                Cerrar sesión
              </Text>
            </Pressable>
          </ScrollView>
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
    backgroundColor: 'white',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  menuDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.primary,
  },
  sectionTitle: {
    marginTop: 26,
    marginBottom: 14,
    fontSize: 18,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.navy,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    marginLeft: 10,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
  },
  itemText: {
    fontSize: 16,
    color: light.navy,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
  },
  accountContainer: {
    marginTop: 8,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
    backgroundColor: light.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: light.border,
  },
  profileInitial: {
    color: light.primaryDark,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 30,
  },
  accountText: {
    fontSize: 15,
    color: light.navy,
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: light.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontFamily: fontFamily.bold,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  logoutButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 40,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
  },
  textDark: {
    color: 'white',
  },
});
