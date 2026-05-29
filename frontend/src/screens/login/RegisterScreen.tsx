import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const [preguntaSecreta, setPreguntaSecreta] = useState('');
  const [respuestaSecreta, setRespuestaSecreta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await register({
        nombre: nombre.trim(),
        email: email.trim(),
        password,
        preguntaSecreta: preguntaSecreta.trim(),
        respuestaSecreta: respuestaSecreta.trim(),
      });
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Crear cuenta</Text>
          {error ? <Text style={styles.err}>{error}</Text> : null}

          <Text style={styles.sectionTitle}>Tus datos</Text>
          <AppTextInput label="Nombre" variant="light" value={nombre} onChangeText={setNombre} />
          <AppTextInput
            label="Email"
            variant="light"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <AppTextInput label="Contrasena" variant="light" secureTextEntry value={password} onChangeText={setPassword} />

          <Text style={styles.sectionTitle}>Recuperacion</Text>
          <AppTextInput
            label="Pregunta secreta"
            variant="light"
            placeholder="Ej: Nombre de tu primera mascota"
            value={preguntaSecreta}
            onChangeText={setPreguntaSecreta}
          />
          <AppTextInput
            label="Respuesta secreta"
            variant="light"
            secureTextEntry
            value={respuestaSecreta}
            onChangeText={setRespuestaSecreta}
          />

          <PrimaryButton title="Registrarme" variant="blue" loading={loading} onPress={onSubmit} style={styles.btn} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: light.bg },
  scroll: { padding: 22, paddingBottom: 38 },
  card: {
    backgroundColor: light.surface,
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: light.border,
  },
  title: { fontSize: 22, fontWeight: '800', color: light.text, marginBottom: 12 },
  sectionTitle: { marginTop: 10, marginBottom: 10, fontSize: 13, fontWeight: '800', color: light.primary },
  err: { color: '#B91C1C', marginBottom: 10 },
  btn: { marginTop: 6 },
});
