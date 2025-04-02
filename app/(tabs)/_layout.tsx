import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext'; // Ajusta ruta
import { TouchableOpacity, Alert } from 'react-native';

export default function TabLayout() {
    const { isAdmin } = useAuth();
    const router = useRouter();

    // Función para verificar admin y navegar (para botón Añadir)
    const navigateToAddProduct = () => {
        if (isAdmin) {
            router.push({ pathname: "/productEdit", params: { productId: 'null' } });
        } else {
            Alert.alert("Acceso denegado", "Necesitas ser administrador para añadir productos.");
            // Opcional: redirigir a login si se quiere forzar
            // router.push('/login');
        }
    };

    return (
        <Tabs screenOptions={{ headerShown: true }} >
            <Tabs.Screen
                name="index" // app/(tabs)/index.tsx
                options={{
                    title: 'Tienda',
                    tabBarIcon: ({ color, size }) => (<Ionicons name="list" size={size} color={color} />),
                    headerRight: () => (isAdmin ? ( // Mostrar botón solo si es admin
                        <TouchableOpacity onPress={navigateToAddProduct} style={{ marginRight: 15 }}>
                            <Ionicons name="add-circle" size={26} color="#0d6efd" />
                        </TouchableOpacity>
                    ) : null), // No mostrar nada si no es admin
                }}
            />
            <Tabs.Screen
                name="explore" // app/(tabs)/explore.tsx
                options={{
                    title: 'Explorar',
                    tabBarIcon: ({ color, size }) => (<Ionicons name="search" size={size} color={color} />),
                }}
            />
            {/* Nueva Pestaña para Perfil/Login/Logout */}
            <Tabs.Screen
                name="profile" // app/(tabs)/profile.tsx
                options={{
                    title: 'Cuenta', // O 'Perfil' o 'Login'
                    tabBarIcon: ({ color, size }) => (<Ionicons name="person-circle-outline" size={size} color={color} />),
                }}
            />
        </Tabs>
    );
}