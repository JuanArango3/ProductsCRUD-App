import React from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext'; // Ajusta ruta
import { Link, useRouter } from 'expo-router';

const ProfileScreen = () => {
    const { authToken, authUser, isAdmin, isLoading, logout } = useAuth();
    const router = useRouter();

    if (isLoading) {
        return <ActivityIndicator size="large" style={styles.centered} />;
    }

    return (
        <View style={styles.container}>
            {authToken ? (
                // Vista si está logueado
                <>
                    <Text style={styles.title}>Mi Cuenta</Text>
                    <Text style={styles.info}>Usuario: {authUser?.sub ?? 'No disponible'}</Text>
                    <Text style={styles.info}>Rol: {isAdmin ? 'Administrador' : 'Usuario'}</Text>
                    <View style={styles.spacer} />
                    <Button title="Cerrar Sesión" onPress={logout} color="red" />
                </>
            ) : (
                // Vista si NO está logueado
                <>
                    <Text style={styles.title}>Acceder</Text>
                    <Text style={styles.info}>Inicia sesión o regístrate para acceder a todas las funciones.</Text>
                    <View style={styles.buttonContainer}>
                        <Link href="/login" asChild>
                            <Button title="Iniciar Sesión" />
                        </Link>
                        <View style={styles.spacer} />
                        <Link href="/register" asChild>
                            <Button title="Registrarse" color="#841584"/>
                        </Link>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center', // Centrar contenido verticalmente
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    info: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
    },
    buttonContainer: {
        marginTop: 30,
    },
    spacer: {
        height: 15,
    }
});

export default ProfileScreen;