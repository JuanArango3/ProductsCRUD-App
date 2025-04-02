import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, Alert, RefreshControl } from 'react-native';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useFocusEffect, useRouter } from 'expo-router';
import { ProductDTO, ApiError } from '@/types/api';

const ProductListScreen = () => {
    const { isAdmin, logout, authToken } = useAuth(); // Necesitamos authToken para borrado/edición
    const router = useRouter();
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadProducts = useCallback(async (pageNum: number = 0, isRefreshing: boolean = false) => {
        if (loading || loadingMore) return;
        console.log(`Loading products page: ${pageNum}`);
        setLoading(pageNum === 0 && !isRefreshing);
        setLoadingMore(pageNum > 0); setError(null);
        try {
            const response = await productService.getProducts(pageNum, 10);
            setProducts(prev => pageNum === 0 ? response.elements : [...prev, ...response.elements]);
            setPage(response.actualPage); setTotalPages(response.totalPages);
        } catch (err) {
            const apiError = err as ApiError; console.error("Error loading products:", apiError);
            setError('No se pudieron cargar los productos.');
        } finally {
            setLoading(false); setLoadingMore(false); setRefreshing(false);
        }}, []
    );
    useFocusEffect(useCallback(() => { loadProducts(0); }, [loadProducts]));
    const handleLoadMore = () => { if (!loadingMore && page < totalPages - 1) { loadProducts(page + 1); } };
    const onRefresh = useCallback(() => { setRefreshing(true); loadProducts(0, true); }, [loadProducts]);

    const handleEdit = (productId: number) => {
        if (isAdmin) { // Verificar admin antes de navegar
            router.push({ pathname: "/productEdit", params: { productId: productId.toString() } });
        } else {
            Alert.alert("Acceso denegado", "Necesitas ser administrador para editar productos.");
            router.push('/login');
        }
    };

    const handleDelete = (productId: number) => {
        if (!isAdmin || !authToken) { // Verificar admin y token
            Alert.alert("Acceso denegado", "Necesitas ser administrador para eliminar productos.");
            router.push('/login');
            return;
        }
        Alert.alert( "Confirmar Eliminación", `¿Estás seguro de que quieres eliminar el producto ID ${productId}?`, [ { text: "Cancelar", style: "cancel" }, { text: "Eliminar", style: "destructive", onPress: async () => { try { setLoading(true); await productService.deleteProduct(productId); Alert.alert("Éxito", "Producto eliminado."); loadProducts(0); } catch (err) { const apiError = err as ApiError; console.error("Error deleting product:", apiError); const message = apiError.message || 'No se pudo eliminar el producto.'; Alert.alert("Error", message); if (apiError.status === 401 || apiError.status === 403) { logout(); } } finally { setLoading(false); } } } ] );
    };

    const renderFooter = () => { if (!loadingMore) return null; return <ActivityIndicator style={{ marginVertical: 20 }} size="large" />; };

    if (loading && products.length === 0) { return <View style={styles.centered}><ActivityIndicator size="large" /></View>; }
    if (error && products.length === 0) { return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>; }

    return (
        <View style={styles.container}>
            <FlatList data={products} renderItem={({ item }: { item: ProductDTO }) => (<ProductCard product={item} isAdmin={isAdmin} onEdit={handleEdit} onDelete={handleDelete} />)} keyExtractor={(item: ProductDTO) => item.id.toString()} contentContainerStyle={styles.listContainer} onEndReached={handleLoadMore} onEndReachedThreshold={0.5} ListFooterComponent={renderFooter} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} ListEmptyComponent={() => ( !loading && !error && <View style={styles.centered}><Text>No hay productos disponibles.</Text></View> )} />
            {error && products.length > 0 && <Text style={styles.errorTextFooter}>{error}</Text>}
        </View>
    );
};
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f8f9fa' }, listContainer: { padding: 10 }, centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }, errorText: { color: 'red', textAlign: 'center' }, errorTextFooter: { color: 'red', textAlign: 'center', padding: 10 } });
export default ProductListScreen;