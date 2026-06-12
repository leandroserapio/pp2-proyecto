import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
    setError(null);
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo iniciar sesión';
      setError(msg);
    } finally {
      setLoading(false);
    }
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
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.logo}>
          <Ionicons name="bicycle-outline" size={27} color="#FFFFFF" />
        </View>
        <Text style={[styles.title, { color: theme.primary }]}>MotoTracker</Text>
        <Text style={[styles.sub, { color: theme.textMuted }]}>Ingresá a tu cuenta</Text>
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
          label="Contraseña"
          variant="light"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />
        <PrimaryButton title="Ingresar" variant="blue" loading={loading} onPress={onSubmit} style={styles.btn} />
        <Pressable
          onPress={() => {
            setRecoverEmail(email);
            setRecoverOpen(true);
          }}
          style={styles.linkWrap}
        >
          <Text style={[styles.link, { color: theme.primary }]}>Olvide mi contrasena</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
          <Text style={[styles.link, { color: theme.primary }]}>Crear cuenta</Text>
        </Pressable>
      </View>

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
  root: { flex: 1, backgroundColor: light.bg, justifyContent: 'center', padding: 22 },
  card: {
    backgroundColor: light.surface,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: light.border,
  },
  logo: {
    width: 55,
    height: 45,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    color: light.primaryDark,
    textAlign: 'center',
  },
  sub: {
    marginTop: 6,
    color: light.textMuted,
    textAlign: 'center',
    marginBottom: 18,
    fontFamily: fontFamily.regular,
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
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: light.overlay },
  modalSheet: {
    backgroundColor: light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: light.border,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontFamily: fontFamily.bold, fontWeight: '700', color: light.text, marginBottom: 14 },
  questionLabel: { color: light.navy, fontFamily: fontFamily.bold, fontWeight: '700', marginBottom: 12, lineHeight: 20 },
});
