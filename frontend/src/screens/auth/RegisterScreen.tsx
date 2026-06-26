import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { light } from '../../theme/mototrackerLight';
import { fontFamily } from '../../theme/fonts';
import { useAuth } from '../../context/AuthContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ApiError } from '../../api/client';

const LOGO_MOTOTRACKER = require('../../../assets/logo_mototracker.png');

export function RegisterScreen() {
  const { register } = useAuth();
  const { theme } = useAppSettings();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preguntaSecreta, setPreguntaSecreta] = useState('');
  const [respuestaSecreta, setRespuestaSecreta] = useState('');
  const [marcaMoto, setMarcaMoto] = useState('');
  const [modeloMoto, setModeloMoto] = useState('');
  const [anioMoto, setAnioMoto] = useState('');
  const [patenteMoto, setPatenteMoto] = useState('');
  const [kilometrajeMoto, setKilometrajeMoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    const parsedAnio = anioMoto ? Number(anioMoto) : null;
    const parsedKilometraje = kilometrajeMoto ? Number(kilometrajeMoto) : 0;

    if (!nombre.trim() || !email.trim() || !password || !preguntaSecreta.trim() || !respuestaSecreta.trim()) {
      setError('Completa tus datos y la recuperacion de cuenta.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Ingresa un email valido.');
      return;
    }
    if (password.length < 4) {
      setError('La contrasena debe tener al menos 4 caracteres.');
      return;
    }
    if (!marcaMoto.trim() || !modeloMoto.trim()) {
      setError('Marca y modelo de la moto son obligatorios.');
      return;
    }
    if (parsedAnio != null && (!Number.isInteger(parsedAnio) || parsedAnio < 1900 || parsedAnio > new Date().getFullYear() + 1)) {
      setError('Ingresa un anio de moto valido.');
      return;
    }
    if (!Number.isFinite(parsedKilometraje) || parsedKilometraje < 0) {
      setError('El kilometraje no puede ser negativo.');
      return;
    }

    setLoading(true);
    try {
      await register({
        nombre: nombre.trim(),
        email: email.trim(),
        password,
        preguntaSecreta: preguntaSecreta.trim(),
        respuestaSecreta: respuestaSecreta.trim(),
        marcaMoto: marcaMoto.trim(),
        modeloMoto: modeloMoto.trim(),
        anioMoto: parsedAnio,
        patenteMoto: patenteMoto.trim() || null,
        kilometrajeActualMoto: parsedKilometraje,
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
      style={[styles.root, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.header}>
            <Image
              accessibilityLabel="Logo MotoTracker"
              source={LOGO_MOTOTRACKER}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: theme.text }]}>Crear cuenta</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>Configura tu perfil y tu primera moto</Text>
          </View>
          {error ? <Text style={[styles.err, { color: theme.danger }]}>{error}</Text> : null}

          <Text style={[styles.sectionTitle, { color: theme.primary }]}>Tus datos</Text>
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

          <Text style={[styles.sectionTitle, { color: theme.primary }]}>Recuperacion</Text>
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

          <Text style={[styles.sectionTitle, { color: theme.primary }]}>Tu primera moto</Text>
          <AppTextInput label="Marca *" variant="light" placeholder="Ej: Honda" value={marcaMoto} onChangeText={setMarcaMoto} />
          <AppTextInput label="Modelo *" variant="light" placeholder="Ej: Wave 110" value={modeloMoto} onChangeText={setModeloMoto} />
          <AppTextInput label="Año" variant="light" keyboardType="number-pad" value={anioMoto} onChangeText={setAnioMoto} />
          <AppTextInput label="Patente" variant="light" autoCapitalize="characters" value={patenteMoto} onChangeText={setPatenteMoto} />
          <AppTextInput
            label="Kilometraje actual"
            variant="light"
            keyboardType="number-pad"
            value={kilometrajeMoto}
            onChangeText={setKilometrajeMoto}
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
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: light.border,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  header: { alignItems: 'center', marginBottom: 14 },
  logo: {
    width: 110,
    height: 44,
    marginBottom: 10,
  },
  title: { fontSize: 24, fontFamily: fontFamily.bold, fontWeight: '700', color: light.text },
  subtitle: { marginTop: 6, fontSize: 14, color: light.textMuted, fontFamily: fontFamily.regular, textAlign: 'center' },
  sectionTitle: { marginTop: 10, marginBottom: 10, fontSize: 13, fontFamily: fontFamily.bold, fontWeight: '700', color: light.primary },
  err: { color: light.danger, marginBottom: 10, fontFamily: fontFamily.regular },
  btn: { marginTop: 6 },
});
