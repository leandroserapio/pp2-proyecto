import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';
import type { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ApiError } from '../../api/client';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>MotoTracker</Text>
        <Text style={styles.sub}>Ingresá a tu cuenta</Text>
        {error ? <Text style={styles.err}>{error}</Text> : null}
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
        <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
          <Text style={styles.link}>Crear cuenta</Text>
        </Pressable>
      </View>
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
    color: '#B91C1C',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: fontFamily.regular,
  },
  btn: { marginTop: 6 },
  linkWrap: { marginTop: 16, alignItems: 'center' },
  link: { color: light.primary, fontWeight: '700', fontFamily: fontFamily.bold },
});
