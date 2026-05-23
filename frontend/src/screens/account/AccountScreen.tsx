// src/screens/account/AccountScreen.tsx

import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../../components/AppHeader';
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';

export function AccountScreen() {
  const { user } = useAuth();
  const initial = user?.nombre?.trim()?.charAt(0)?.toUpperCase() ?? 'M';

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
    >
      <AppHeader title="Cuenta" />

      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initial}
          </Text>
        </View>

        <TextInput
          placeholder="Nombre"
          style={styles.input}
          value={user?.nombre ?? ''}
          editable={false}
        />

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={user?.email ?? ''}
          editable={false}
        />

        <Text style={styles.hint}>
          Los datos de cuenta se cargan desde la sesión actual.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: light.bg,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 40,
    marginBottom: 30,
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
    fontSize: 42,
  },
  input: {
    width: '100%',
    backgroundColor: light.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: light.border,
    color: light.text,
  },
  hint: {
    alignSelf: 'flex-start',
    color: light.textMuted,
    fontFamily: fontFamily.regular,
    lineHeight: 20,
  },
});
