import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { light } from './theme/mototrackerLight';
import { fontFamily } from './theme/fonts';

export default function Home() {
  return (
    <View style={styles.container}>

        <View style={styles.motoContainer}>
            <Text style={styles.title}>No tenes motos registradas</Text>
            <Text style={styles.subtitle}>
            Agregá tu primera moto para empezar a trackear tus gastos, viajes y mantenimiento.
            </Text>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Agregar Moto</Text>
            </TouchableOpacity>
        </View>

    </View>
  );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: light.bg,
    },
    motoContainer: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: light.border,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 32,
    },
    title: {
        fontSize: 20,
        fontFamily: fontFamily.bold,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        color: light.text,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: fontFamily.regular,
        textAlign: 'center',
        marginBottom: 24,
        color: light.textMuted,
    },
    button: {
        backgroundColor: light.primary,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    buttonText: {
        color: light.onPrimary,
        fontFamily: fontFamily.bold,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
