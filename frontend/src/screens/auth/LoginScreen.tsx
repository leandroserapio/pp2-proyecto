import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';
import type { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ApiError } from '../../api/client';
import { obtenerPreguntaSecreta, recuperarPassword } from '../../api/usuarios';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const { theme } = useAppSettings();
  const { height, width } = useWindowDimensions();
  const compact = height < 720 || width < 380;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoverOpen, setRecoverOpen] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [secretQuestion, setSecretQuestion] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoverLoading, setRecoverLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Completa email y contrasena.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo iniciar sesion';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const openRecovery = () => {
    setRecoverEmail(email);
    setSecretQuestion('');
    setSecretAnswer('');
    setNewPassword('');
    setRecoverOpen(true);
  };

  const loadSecretQuestion = async () => {
    setRecoverLoading(true);
    setError(null);
    try {
      const res = await obtenerPreguntaSecreta((recoverEmail || email).trim());
      setRecoverEmail(res.email);
      setSecretQuestion(res.preguntaSecreta);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se encontro el usuario';
      Alert.alert('Recuperacion', msg);
    } finally {
      setRecoverLoading(false);
    }
  };

  const resetPassword = async () => {
    setRecoverLoading(true);
    try {
      await recuperarPassword({
        email: recoverEmail.trim(),
        respuestaSecreta: secretAnswer.trim(),
        nuevaPassword: newPassword,
      });
      setPassword(newPassword);
      setRecoverOpen(false);
      setSecretQuestion('');
      setSecretAnswer('');
      setNewPassword('');
      Alert.alert('Listo', 'Tu contrasena fue actualizada.');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo recuperar la contrasena';
      Alert.alert('Recuperacion', msg);
    } finally {
      setRecoverLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, compact && styles.scrollCompact]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.shell, compact && styles.shellCompact]}>
          <View style={[styles.logo, { backgroundColor: theme.primary }]}>
            <Ionicons name="bicycle-outline" size={28} color={theme.onPrimary} />
          </View>
          <Text style={[styles.brand, { color: theme.primary }]}>MotoTracker</Text>
          <Text style={[styles.sub, compact && styles.subCompact, { color: theme.textMuted }]}>
            Gestion profesional de tu moto
          </Text>

          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>Ingresar</Text>
            {error ? <Text style={[styles.err, { color: theme.danger }]}>{error}</Text> : null}

            <AppTextInput
              label="Email"
              variant="light"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="nombre@mail.com"
            />
            <AppTextInput
              label="Contrasena"
              variant="light"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="********"
            />
            <PrimaryButton title="Ingresar" variant="blue" loading={loading} onPress={onSubmit} style={styles.btn} />

            <Pressable onPress={openRecovery} style={styles.linkWrap}>
              <Text style={[styles.link, { color: theme.primary }]}>Olvide mi contrasena</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
              <Text style={[styles.link, { color: theme.primary }]}>Crear cuenta</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={recoverOpen} transparent animationType="slide" onRequestClose={() => setRecoverOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]} onPress={() => setRecoverOpen(false)} />
          <View style={[styles.modalSheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Recuperar contrasena</Text>
            <AppTextInput
              label="Email"
              variant="light"
              autoCapitalize="none"
              keyboardType="email-address"
              value={recoverEmail}
              onChangeText={(value) => {
                setRecoverEmail(value);
                setSecretQuestion('');
              }}
            />
            {secretQuestion ? (
              <>
                <Text style={[styles.questionLabel, { color: theme.text }]}>{secretQuestion}</Text>
                <AppTextInput label="Respuesta" variant="light" secureTextEntry value={secretAnswer} onChangeText={setSecretAnswer} />
                <AppTextInput label="Nueva contrasena" variant="light" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
                <PrimaryButton title="Actualizar contrasena" variant="blue" loading={recoverLoading} onPress={resetPassword} />
              </>
            ) : (
              <PrimaryButton title="Buscar pregunta" variant="blue" loading={recoverLoading} onPress={loadSecretQuestion} />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: light.bg },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
    paddingVertical: 36,
  },
  scrollCompact: {
    justifyContent: 'flex-start',
    paddingVertical: 20,
  },
  shell: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    alignItems: 'center',
  },
  shellCompact: {
    maxWidth: 400,
  },
  logo: {
    width: 58,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brand: {
    fontSize: 30,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    textAlign: 'center',
  },
  sub: {
    marginTop: 6,
    color: light.textMuted,
    textAlign: 'center',
    fontFamily: fontFamily.regular,
    fontSize: 15,
  },
  subCompact: {
    fontSize: 14,
  },
  card: {
    alignSelf: 'stretch',
    backgroundColor: light.surface,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: light.border,
    marginTop: 22,
  },
  formTitle: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.text,
    marginBottom: 12,
  },
  err: {
    color: light.danger,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: fontFamily.regular,
  },
  btn: { marginTop: 6 },
  linkWrap: { marginTop: 16, alignItems: 'center' },
  link: { color: light.primary, fontWeight: '700', fontFamily: fontFamily.bold },
  modalRoot: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: light.overlay },
  modalSheet: {
    backgroundColor: light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: light.border,
    padding: 20,
    width: '100%',
    maxWidth: 430,
  },
  modalTitle: { fontSize: 18, fontFamily: fontFamily.bold, fontWeight: '700', color: light.text, marginBottom: 14 },
  questionLabel: { color: light.navy, fontFamily: fontFamily.bold, fontWeight: '700', marginBottom: 12, lineHeight: 20 },
});
