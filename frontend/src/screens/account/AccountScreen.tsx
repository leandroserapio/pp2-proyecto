// src/screens/account/AccountScreen.tsx

import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../../components/AppHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { fontFamily } from '../../theme/fonts';
import { light } from '../../theme/mototrackerLight';

export function AccountScreen() {
  const { user } = useAuth();
  const { theme } = useAppSettings();

  const [editing, setEditing] = useState(false);
  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  useEffect(() => {
    setNombre(user?.nombre ?? '');
    setEmail(user?.email ?? '');
  }, [user?.email, user?.nombre]);

  const initial = nombre.trim().charAt(0).toUpperCase() || 'M';

  const onSaveProfile = () => {
    if (!nombre.trim() || !email.trim()) {
      Alert.alert('Datos incompletos', 'Nombre y email son obligatorios.');
      return;
    }

    setEditing(false);
    Alert.alert('Cuenta', 'Los cambios quedaron preparados para guardar cuando el backend exponga edición de usuario.');
  };

  const onChangePassword = () => {
    if (!currentPassword || !newPassword || !repeatPassword) {
      Alert.alert('Datos incompletos', 'Completá los tres campos de contraseña.');
      return;
    }

    if (newPassword !== repeatPassword) {
      Alert.alert('Contraseña', 'La contraseña nueva no coincide.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setRepeatPassword('');
    Alert.alert('Contraseña', 'El cambio quedó preparado para conectar con el backend.');
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.bg
        }
      ]}
      edges={['top']}
    >
      <AppHeader title="Cuenta" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[
          styles.avatar,
          {
            backgroundColor: theme.primarySoft,
            borderColor: theme.border,
          }
        ]}>
          <Text style={[
            styles.avatarText,
            {
              color: theme.primaryDark
            }
          ]}>
            {initial}
          </Text>
        </View>

        <View style={[
          styles.panel,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }
        ]}>
          <View style={styles.panelHeader}>
            <Text style={[
              styles.panelTitle,
              {
                color: theme.text
              }
            ]}>
              Datos personales
            </Text>

            <Pressable
              style={styles.editLink}
              onPress={() => setEditing((prev) => !prev)}
            >
              <Text style={styles.editLinkText}>
                {editing ? 'Cancelar' : 'Editar'}
              </Text>
            </Pressable>
          </View>

          <AccountInput
            label="Nombre"
            value={nombre}
            onChangeText={setNombre}
            editable={editing}
          />

          <AccountInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            editable={editing}
            keyboardType="email-address"
          />

          {editing ? (
            <PrimaryButton
              title="Guardar cambios"
              variant="blue"
              onPress={onSaveProfile}
              style={styles.saveButton}
            />
          ) : null}
        </View>

        <View style={[
          styles.panel,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }
        ]}>
          <Text style={[
            styles.panelTitle,
            {
              color: theme.text
            }
          ]}>
            Cambiar contraseña
          </Text>

          <AccountInput
            label="Contraseña actual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />

          <AccountInput
            label="Nueva contraseña"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <AccountInput
            label="Repetir contraseña"
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            secureTextEntry
          />

          <PrimaryButton
            title="Cambiar contraseña"
            variant="blue"
            onPress={onChangePassword}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AccountInput({
  editable = true,
  keyboardType,
  label,
  onChangeText,
  secureTextEntry,
  value,
}: {
  editable?: boolean;
  keyboardType?: 'default' | 'email-address';
  label: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  value: string;
}) {
  const { theme } = useAppSettings();

  return (
    <View style={styles.inputBlock}>
      <Text style={[
        styles.label,
        {
          color: theme.textMuted
        }
      ]}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={theme.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: editable ? theme.bg : theme.surface,
            borderColor: theme.border,
            color: theme.text,
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: light.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
    alignItems: 'center',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 20,
    backgroundColor: light.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: light.border,
  },
  avatarText: {
    color: light.primaryDark,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 40,
  },
  panel: {
    width: '100%',
    backgroundColor: light.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: light.border,
    padding: 16,
    marginBottom: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  panelTitle: {
    fontSize: 17,
    color: light.text,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    marginBottom: 12,
  },
  editLink: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editLinkText: {
    color: light.primary,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
  inputBlock: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    color: light.textMuted,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    color: light.text,
  },
  saveButton: {
    marginTop: 4,
  },
});
