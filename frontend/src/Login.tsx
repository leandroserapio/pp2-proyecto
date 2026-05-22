import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Completá email y contraseña");
      return;
    }

    Alert.alert("Login correcto", "Más adelante esto te llevará a Mi Garage");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>🏍️</Text>
        </View>

        <Text style={styles.appName}>MotoTrack</Text>

        <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
        <Text style={styles.subtitle}>
          Inicia sesión para gestionar tus motos.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Tu email"
          placeholderTextColor="#6B7280"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Tu contraseña"
          placeholderTextColor="#6B7280"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity activeOpacity={0.8}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>

        <View style={styles.separatorContainer}>
          <View style={styles.separator} />
          <Text style={styles.separatorText}>O ingresá con</Text>
          <View style={styles.separator} />
        </View>

        <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
          <Text style={styles.googleText}>
            <Text style={styles.googleLetter}>G</Text> Google
          </Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>
          ¿No tenés cuenta?{" "}
          <Text style={styles.registerLink}>Registrate</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 22,
  },
  logoCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E8F0FF",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 24,
  },
  appName: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 18,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  forgotText: {
    fontSize: 12,
    color: "#0B55D9",
    textAlign: "right",
    marginBottom: 14,
  },
  button: {
    height: 46,
    backgroundColor: "#1557D6",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  separatorText: {
    fontSize: 12,
    color: "#6B7280",
    marginHorizontal: 10,
  },
  googleButton: {
    height: 44,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    backgroundColor: "#FFFFFF",
  },
  googleText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  googleLetter: {
    color: "#EA4335",
    fontWeight: "700",
  },
  registerText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  registerLink: {
    color: "#0B55D9",
    fontWeight: "700",
  },
});