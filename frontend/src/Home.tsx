import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

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
    },
    motoContainer: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 32,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        color: '#666',
    },
    button: {
        backgroundColor: '#2563EB',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});