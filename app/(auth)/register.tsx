import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { authService } from '@/services/api'; // Ajusta ruta
import { useRouter } from 'expo-router'; // Usar useRouter
import { ApiError } from '@/types/api';
import {useAuth} from "@/context/AuthContext"; // Ajusta ruta

const RegisterScreen = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const { register } = useAuth();
    const router = useRouter(); // Hook de navegación

    const handleRegister = async () => {
        if (!username || !password || !confirmPassword) { Alert.alert('Error', 'Por favor completa todos los campos.'); return; }
        if (password !== confirmPassword) { Alert.alert('Error', 'Las contraseñas no coinciden.'); return; }
        setLoading(true);
        try {
            await register(username, password);
            router.replace('/(tabs)');
        } catch (error) {
            const apiError = error as ApiError;
            console.error("Register screen error:", apiError);
            const message = apiError.message || 'Error en el registro. Intenta de nuevo.';
            if (apiError.status === 409) { Alert.alert('Error de Registro', 'El nombre de usuario ya está en uso.'); }
            else if (apiError.body && typeof apiError.body !== 'string' && apiError.body.errors) { const validationErrors = Object.entries(apiError.body.errors).map(([field, msg]) => `${field}: ${msg}`).join('\n'); Alert.alert('Error de Registro', `Error de validación:\n${validationErrors}`); }
            else { Alert.alert('Error de Registro', message); }
        } finally { setLoading(false); }
    };

    return (
        <View style={styles.container}>

            <TextInput style={styles.input} placeholder="Usuario" value={username} onChangeText={setUsername} autoCapitalize="none"/>
            <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry/>
            <TextInput style={styles.input} placeholder="Confirmar Contraseña" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry/>
            {loading ? <ActivityIndicator size="large" color="#0000ff" /> : <Button title="Registrarse" onPress={handleRegister} />}
        </View>
    );
};

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 20 }, title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }, input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, borderRadius: 5 },});
export default RegisterScreen;