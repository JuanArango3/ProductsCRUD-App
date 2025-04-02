import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { ApiError } from '@/types/api';

const LoginScreen = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const { login } = useAuth();
    const router = useRouter(); // Hook de navegación de Expo Router

    const handleLogin = async () => {
        if (!username || !password) { Alert.alert('Error', 'Por favor ingresa usuario y contraseña.'); return; }
        setLoading(true);
        try {
            await login(username, password);
            router.replace('/(tabs)');
        } catch (error) {
            const apiError = error as ApiError;
            console.error("Login screen error:", apiError);
            const message = apiError.message || 'Error al iniciar sesión. Intenta de nuevo.';
            Alert.alert('Error de Login', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Iniciar Sesión</Text>
            <TextInput style={styles.input} placeholder="Usuario" value={username} onChangeText={setUsername} autoCapitalize="none"/>
            <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry/>
            {loading ? ( <ActivityIndicator size="large" color="#0000ff" /> ) : (
                <>
                    <Button title="Entrar" onPress={handleLogin} />
                    <View style={styles.spacer} />
                    {/* Usar Link para navegar a Registro */}
                    <Link href="/(auth)/register" asChild>
                        <Button title="Registrarse" color="#841584" />
                    </Link>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 20 }, title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }, input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, borderRadius: 5 }, spacer: { height: 10 } });
export default LoginScreen;