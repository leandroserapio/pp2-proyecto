import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { light } from '../../theme/mototrackerLight';
import { useAuth } from '../../context/AuthContext';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ApiError } from '../../api/client';

export function RegisterScreen() {
  const { register } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await register({ nombre: nombre.trim(), email: email.trim(), password });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudo registrar';
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
        <Text style={styles.title}>Crear cuenta</Text>
        {error ? <Text style={styles.err}>{error}</Text> : null}
        <AppTextInput label="Nombre" variant="light" value={nombre} onChangeText={setNombre} />
        <AppTextInput
          label="Email"
          variant="light"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <AppTextInput label="Contraseña" variant="light" secureTextEntry value={password} onChangeText={setPassword} />
        <PrimaryButton title="Registrarme" variant="blue" loading={loading} onPress={onSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: light.bg, padding: 22, justifyContent: 'center' },
  card: {
    backgroundColor: light.surface,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: light.border,
  },
  title: { fontSize: 22, fontWeight: '800', color: light.text, marginBottom: 12 },
  err: { color: '#B91C1C', marginBottom: 10 },
});
