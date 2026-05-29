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
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ApiError } from '../../api/client';
import { obtenerPreguntaSecreta, recuperarPassword } from '../../api/usuarios';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import type { AuthStackParamList } from '../../navigation/types';
import { fontFamily } from '../../theme/fonts';
import { light } from '../../theme/mototrackerLight';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recoverOpen, setRecoverOpen] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverError, setRecoverError] = useState<string | null>(null);
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
      const msg = e instanceof ApiError ? e.message : 'No se pudo iniciar sesion.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const openRecovery = async () => {
    const initialEmail = email.trim();
    setRecoverEmail(initialEmail);
    setSecretQuestion('');
    setSecretAnswer('');
    setNewPassword('');
    setRecoverError(null);
    setRecoverOpen(true);

    if (initialEmail) {
      await loadSecretQuestion(initialEmail);
    }
  };

  const loadSecretQuestion = async (emailToSearch = recoverEmail) => {
    const searchEmail = emailToSearch.trim();
    if (!searchEmail) {
      setRecoverError('Ingresa tu email para buscar la pregunta secreta.');
      return;
    }

    setRecoverLoading(true);
    setRecoverError(null);
    setError(null);
    try {
      const res = await obtenerPreguntaSecreta(searchEmail);
      setRecoverEmail(res.email);
      setSecretQuestion(res.preguntaSecreta);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se encontro el usuario.';
      setRecoverError(msg);
    } finally {
      setRecoverLoading(false);
    }
  };

  const resetPassword = async () => {
    setRecoverLoading(true);
    setRecoverError(null);
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
      const msg = e instanceof ApiError ? e.message : 'No se pudo recuperar la contrasena.';
      setRecoverError(msg);
    } finally {
      setRecoverLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.shell}>
          <View style={styles.logo}>
            <Ionicons name="bicycle-outline" size={27} color="#FFFFFF" />
          </View>

          <Text style={styles.brand}>MotoTracker</Text>
          <Text style={styles.subtitle}>Gestion profesional de tu moto</Text>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Ingresar</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.label}>Correo electronico</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#8A94A6"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Contrasena</Text>
            <View style={styles.passwordInputWrap}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                placeholder="********"
                placeholderTextColor="#8A94A6"
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                onPress={() => setShowPassword((value) => !value)}
                style={styles.passwordToggle}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#5B6472"
                />
              </Pressable>
            </View>

            <Pressable
              onPress={openRecovery}
              style={styles.recoverWrap}
            >
              <Text style={styles.recoverText}>Olvide mi contrasena</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                (pressed || loading) && styles.buttonPressed,
              ]}
              disabled={loading}
              onPress={onSubmit}
            >
              <Text style={styles.buttonText}>{loading ? 'Ingresando...' : 'Ingresar'}</Text>
            </Pressable>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>No tenes cuenta?</Text>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Registrate aca</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={recoverOpen} transparent animationType="slide" onRequestClose={() => setRecoverOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setRecoverOpen(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Recuperar contrasena</Text>
            <AppTextInput
              label="Email"
              variant="light"
              autoCapitalize="none"
              keyboardType="email-address"
              value={recoverEmail}
              onChangeText={(value) => {
                setRecoverEmail(value);
                setSecretQuestion('');
                setRecoverError(null);
              }}
            />
            {recoverError ? <Text style={styles.recoverError}>{recoverError}</Text> : null}
            {secretQuestion ? (
              <>
                <Text style={styles.questionLabel}>{secretQuestion}</Text>
                <AppTextInput
                  label="Respuesta"
                  variant="light"
                  secureTextEntry
                  value={secretAnswer}
                  onChangeText={setSecretAnswer}
                />
                <AppTextInput
                  label="Nueva contrasena"
                  variant="light"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <PrimaryButton title="Actualizar contrasena" variant="blue" loading={recoverLoading} onPress={resetPassword} />
              </>
            ) : (
              <PrimaryButton title="Buscar pregunta" variant="blue" loading={recoverLoading} onPress={() => loadSecretQuestion()} />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  shell: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 25,
    paddingVertical: 55,
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
  brand: {
    color: '#2563EB',
    fontSize: 26,
    lineHeight: 32,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    color: '#7B8794',
    fontSize: 13,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    marginBottom: 35,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E0EA',
    borderRadius: 10,
    padding: 25,
  },
  formTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1F2937',
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    marginBottom: 20,
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 14,
    fontFamily: fontFamily.medium,
  },
  label: {
    fontSize: 12,
    color: '#5B6472',
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 42,
    borderWidth: 1,
    borderColor: '#CFD8E3',
    borderRadius: 7,
    paddingHorizontal: 12,
    marginBottom: 18,
    backgroundColor: '#F8F7FF',
    color: '#1F2937',
    fontFamily: fontFamily.regular,
    fontSize: 14,
  },
  passwordInputWrap: {
    width: '100%',
    height: 42,
    borderWidth: 1,
    borderColor: '#CFD8E3',
    borderRadius: 7,
    marginBottom: 18,
    backgroundColor: '#F8F7FF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingLeft: 12,
    paddingRight: 8,
    color: '#1F2937',
    fontFamily: fontFamily.regular,
    fontSize: 14,
  },
  passwordToggle: {
    width: 42,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoverWrap: {
    alignItems: 'flex-end',
    marginTop: -8,
    marginBottom: 12,
  },
  recoverText: {
    color: '#2563EB',
    fontSize: 12,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
  },
  button: {
    width: '100%',
    height: 44,
    backgroundColor: '#2563EB',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  buttonPressed: {
    backgroundColor: '#1D4ED8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 14,
  },
  registerRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  registerText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: fontFamily.regular,
  },
  registerLink: {
    color: '#2563EB',
    fontFamily: fontFamily.bold,
    fontWeight: '700',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  modalSheet: {
    backgroundColor: light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: light.border,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: light.text,
    marginBottom: 14,
  },
  recoverError: {
    color: '#DC2626',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
    fontFamily: fontFamily.medium,
  },
  questionLabel: {
    color: light.navy,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 20,
  },
});
