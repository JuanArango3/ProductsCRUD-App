import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { imageService } from '@/services/api';
import { ProductDTO } from '@/types/api';
interface ProductCardProps { product: ProductDTO; isAdmin: boolean; onEdit: (id: number) => void; onDelete: (id: number) => void; }
const placeholderImage = require('@/assets/images/ImagePlaceholder.svg');


const ProductCard: React.FC<ProductCardProps> = ({ product, isAdmin, onEdit, onDelete }) => {
    const firstImageId = (product.imageIds && product.imageIds.length > 0) ? product.imageIds[0] : null;
    const imageUrl = imageService.getImageUrl(firstImageId);
    return (
        <View style={styles.card}>
            <Image source={imageUrl ? { uri: imageUrl } : placeholderImage} style={styles.image} resizeMode="cover"/>
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{product.name || 'Sin Nombre'}</Text>
                <Text style={styles.description} numberOfLines={2}>{product.description || ''}</Text>
                <Text style={styles.price}>${product.price != null ? product.price.toFixed(2) : 'N/A'}</Text>
                {isAdmin ? (
                    <View style={styles.adminControls}>
                            <TouchableOpacity onPress={() => onEdit(product.id)} style={[styles.button, styles.editButton]}><Text style={styles.buttonText}>Editar</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => onDelete(product.id)} style={[styles.button, styles.deleteButton]}><Text style={styles.buttonText}>Eliminar</Text></TouchableOpacity>
                    </View>) : null}
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
        card: {
            backgroundColor: 'white',
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 15,
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.22, shadowRadius: 2.22
        },
        image: {
            width: '100%',
            aspectRatio: 16 / 9
        },
        infoContainer: { padding: 10 },
        name: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
        description: { fontSize: 12, color: '#666', marginBottom: 8 },
        price: { fontSize: 16, fontWeight: 'bold', color: '#007bff', marginBottom: 8 },
        adminControls: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5 },
        button: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 4, marginLeft: 10 },
        editButton: { backgroundColor: '#ffc107' },
        deleteButton: { backgroundColor: '#dc3545' },
        buttonText: { color: 'white', fontSize: 12, fontWeight: 'bold' }
});
export default ProductCard;