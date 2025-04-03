import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { productService, imageService } from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ApiError, ProductDTO, CreateProductRequest } from '@/types/api';
import { Ionicons } from '@expo/vector-icons';


const inputStyles = StyleSheet.create({ container: { flex: 1, padding: 20 }, label: { fontSize: 16, marginBottom: 5, fontWeight: 'bold' }, input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, borderRadius: 5, backgroundColor: 'white' }, textArea: { height: 100, textAlignVertical: 'top', borderColor: 'gray', borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, borderRadius: 5, backgroundColor: 'white' }, imagePreviewArea: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10, marginBottom: 15, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#ccc' }, previewContainer: { position: 'relative', width: 80, height: 80 * 9 / 16, borderWidth: 1, borderColor: '#eee', borderRadius: 4, overflow: 'hidden', backgroundColor: '#eee' }, previewImage: { width: '100%', height: '100%' }, removeButton: { position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(220, 53, 69, 0.8)', borderRadius: 10, padding: 2 }, errorText: { color: 'red', marginBottom: 10, textAlign: 'center' },});

const ProductEditScreen = () => {
    // Obtener parámetros con useLocalSearchParams (devuelve strings)
    const params = useLocalSearchParams<{ productId?: string }>();
    const productId = params.productId && params.productId !== 'null' ? parseInt(params.productId, 10) : null; // Convertir a número o null
    const router = useRouter();
    const { authToken, logout } = useAuth();
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [imageUuids, setImageUuids] = useState<string[]>([]);
    const [localImageUris, setLocalImageUris] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isFetchingData, setIsFetchingData] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Configurar título dinámicamente en el layout (opcional, si no se hizo en _layout)
    // useEffect(() => {
    //     navigation.setOptions({ title: productId ? 'Editar Producto' : 'Nuevo Producto' });
    // }, [productId, navigation]);

    useEffect(() => {
        if (productId) {
            setIsFetchingData(true); setError(null);
            productService.getProductById(productId)
                .then(product => { setName(product.name); setDescription(product.description); setPrice(product.price?.toString() ?? ''); setImageUuids(product.imageIds || []); })
                .catch(err => { const apiError = err as ApiError; console.error("Error fetching product data:", apiError); setError("No se pudo cargar la información del producto."); if (apiError.status === 401 || apiError.status === 403) logout(); })
                .finally(() => setIsFetchingData(false));
        }
    }, [productId, logout]);

    useEffect(() => { (async () => { const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); if (status !== 'granted') { Alert.alert('Permiso denegado', 'Se necesita acceso a la galería.'); } })(); }, []);

    const pickImage = async () => { /* ... (sin cambios) ... */ setError(null); try { let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsMultipleSelection: true, }); if (!result.canceled && result.assets) { setLocalImageUris(prevUris => [...prevUris, ...result.assets.map(asset => asset.uri)]); } } catch (pickerError) { console.error("Image picker error:", pickerError); Alert.alert("Error", "No se pudo abrir la galería."); } };
    const removeLocalImage = (uriToRemove: string) => { setLocalImageUris(prevUris => prevUris.filter(uri => uri !== uriToRemove)); };
    const removeUploadedImage = (uuidToRemove: string) => { setImageUuids(prevUuids => prevUuids.filter(uuid => uuid !== uuidToRemove)); };
    const uploadPendingImages = async (): Promise<boolean> => { /* ... (sin cambios) ... */ if (localImageUris.length === 0) return true; setLoading(true); setError(null); let uploadSuccess = true; const newlyUploadedUuids: string[] = []; try { for (const uri of localImageUris) { const filename = uri.split('/').pop() || `upload-${Date.now()}`; const match = /\.(\w+)$/.exec(filename); let type = 'image'; if (match) { const ext = match[1].toLowerCase(); if (ext === 'jpg' || ext === 'jpeg') type = 'image/jpeg'; else if (ext === 'png') type = 'image/png'; else if (ext === 'webp') type = 'image/webp'; } console.log(`Uploading: ${filename} (${type})`); const uuid = await imageService.uploadImage(uri, filename, type); newlyUploadedUuids.push(uuid); console.log(`Uploaded ${filename}, UUID: ${uuid}`); } setImageUuids(prev => [...prev, ...newlyUploadedUuids]); setLocalImageUris([]); } catch (err) { const apiError = err as ApiError; console.error("Error uploading images:", apiError); const message = apiError.message || 'Error al subir una o más imágenes.'; setError(`Error de subida: ${message}`); uploadSuccess = false; if (apiError.status === 401 || apiError.status === 403) logout(); } finally { setLoading(false); } return uploadSuccess; };

    const handleSaveProduct = async () => { /* ... (sin cambios, usa imageUuids) ... */
        setError(null);
        if (!name || !description || !price) { setError("Nombre, descripción y precio son requeridos."); return; }
        const priceFloat = parseFloat(price); if (isNaN(priceFloat) || priceFloat < 0) { setError("El precio debe ser un número válido."); return; }
        const imagesUploaded = await uploadPendingImages(); if (!imagesUploaded) { return; }
        if (imageUuids.length === 0) { setError("El producto debe tener al menos una imagen."); return; }
        setLoading(true);
        const commonData = { name: name.trim(), description: description.trim(), price: priceFloat, imageIds: imageUuids };
        try {
            let savedProduct: ProductDTO;
            if (productId) { const updateData: ProductDTO = { ...commonData, id: productId, authorId: 0 }; savedProduct = await productService.updateProduct(updateData); }
            else { const createData: CreateProductRequest = commonData; savedProduct = await productService.createProduct(createData); }
            console.log("Product saved:", savedProduct); Alert.alert("Éxito", `Producto ${productId ? 'actualizado' : 'creado'}.`);
            router.back();
        } catch (err) { const apiError = err as ApiError; console.error("Error saving product:", apiError); const message = apiError.message || 'Error al guardar.'; if (apiError.body && typeof apiError.body !== 'string' && apiError.body.errors) { const validationErrors = Object.entries(apiError.body.errors).map(([field, msg]) => `${field}: ${msg}`).join('\n'); setError(`Validación:\n${validationErrors}`); } else { setError(message); } if (apiError.status === 401 || apiError.status === 403) logout(); }
        finally { setLoading(false); }
    };

    if (isFetchingData) { return <View style={inputStyles.container}><ActivityIndicator size="large" /></View>; }

    return (
        <ScrollView style={inputStyles.container}>
            <Text style={inputStyles.label}>Nombre:</Text>
            <TextInput style={inputStyles.input} value={name} onChangeText={setName} placeholder="Nombre del producto" />
            <Text style={inputStyles.label}>Descripción:</Text>
            <TextInput style={inputStyles.textArea} value={description} onChangeText={setDescription} placeholder="Descripción detallada" multiline />
            <Text style={inputStyles.label}>Precio:</Text>
            <TextInput style={inputStyles.input} value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="numeric" />
            <Text style={inputStyles.label}>Imágenes:</Text>
            <Button title="Seleccionar Imágenes" onPress={pickImage} />
            <View style={inputStyles.imagePreviewArea}>
                {imageUuids.map(uuid => (
                    <View key={uuid} style={inputStyles.previewContainer}>
                        <Image source={{ uri: imageService.getImageUrl(uuid) ?? undefined }} style={inputStyles.previewImage} />
                        <TouchableOpacity onPress={() => removeUploadedImage(uuid)} style={inputStyles.removeButton}>
                            <Ionicons name="close-circle" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                ))}
                {localImageUris.map(uri => (
                    <View key={uri} style={inputStyles.previewContainer}>
                        <Image source={{ uri: uri }} style={inputStyles.previewImage} />
                        <TouchableOpacity onPress={() => removeLocalImage(uri)} style={inputStyles.removeButton}>
                            <Ionicons name="close-circle" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                ))}
                {imageUuids.length === 0 && localImageUris.length === 0 && (<Text style={{ color: '#6c757d', fontSize: 12 }}>Ninguna imagen seleccionada.</Text>)}
            </View>
            {localImageUris.length > 0 && (<Text style={{ color: 'orange', fontSize: 12, marginBottom: 10 }}>Tienes {localImageUris.length} imágen(es) pendiente(s) de subir. Se subirán al guardar.</Text>)}
            {error && <Text style={inputStyles.errorText}>{error}</Text>}
            {loading ? (<ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />) : (<Button title={productId ? "Actualizar Producto" : "Crear Producto"} onPress={handleSaveProduct} disabled={loading} />)}
            <View style={{ height: 50 }} />
        </ScrollView>
    );
};
export default ProductEditScreen;