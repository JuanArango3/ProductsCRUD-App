import { API_BASE_URL } from '@/constants/Backend';
import * as SecureStore from 'expo-secure-store';
import {
    ApiError,
    ApiErrorBody,
    CreateProductRequest,
    LoginRequest,
    PageInfo,
    ProductDTO,
    RegisterRequest,
    TokenResponse
} from "@/types/api";


async function getToken():Promise<string | null> {
    return await SecureStore.getItemAsync('authToken');
}

async function apiRequest<T>(
    endpoint:string,
    method: string = 'GET',
    body:any = null,
    isFormData: boolean = false
):Promise<T> {
    const token = await getToken();
    const headers: HeadersInit = {};

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config:RequestInit = {
        method: method,
        headers: headers,
    };

    if (body) {
        config.body = isFormData ? (body as FormData) : JSON.stringify(body);
    }

    try {
        console.log(`API Request: ${method} ${API_BASE_URL}${endpoint}`);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Intentar parsear JSON o a texto como fallback
        const responseBody: ApiErrorBody | string | T = await response.json().catch(async () => await response.text());

        console.log(`API Response Status: ${response.status}`); // Log status
        // console.log('API Response Body:', responseBody); // Log body (cuidado con datos sensibles)


        if (!response.ok) {
            let errorMessage = `Error ${response.status}`;
            let errorBody: ApiErrorBody | string | undefined;

            if (typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody) {
                errorMessage = (responseBody as ApiErrorBody).message || errorMessage;
                errorBody = responseBody as ApiErrorBody;
            } else if (typeof responseBody === 'string') {
                errorMessage = responseBody || errorMessage;
                errorBody = responseBody;
            }

            const error = new Error(errorMessage) as ApiError;
            error.status = response.status;
            error.body = errorBody;
            // noinspection ExceptionCaughtLocallyJS
            throw error;
        }

        return responseBody as T;

    } catch (error) {
        const apiError = error as ApiError;
        console.error(`API Error (${method} ${endpoint}):`, apiError.status, apiError.message, apiError.body || apiError);
        throw apiError;
    }
}

export const authService = {
    login: (username: string, password: string): Promise<TokenResponse> =>
        apiRequest<TokenResponse>('/auth/login', 'POST', { username, password } as LoginRequest),
    register: (username: string, password: string): Promise<TokenResponse> =>
        apiRequest<TokenResponse>('/auth/register', 'POST', { username, password } as RegisterRequest),
}

export const productService = {
    getProducts: (page: number = 0, size: number = 10): Promise<PageInfo<ProductDTO>> =>
        apiRequest<PageInfo<ProductDTO>>(`/product?page=${page}&size=${size}`, 'GET'),
    getProductById: (id: number): Promise<ProductDTO> =>
        apiRequest<ProductDTO>(`/product/${id}`, 'GET'),
    createProduct: (productData: CreateProductRequest): Promise<ProductDTO> =>
        apiRequest<ProductDTO>('/product', 'POST', productData),
    updateProduct: (productData: ProductDTO): Promise<ProductDTO> =>
        apiRequest<ProductDTO>('/product', 'PUT', productData),
    deleteProduct: (id: number): Promise<void> => // DELETE no devuelve cuerpo usualmente
        apiRequest<void>(`/product/${id}`, 'DELETE'),
};

interface FormDataFile {
    uri: string;
    name: string;
    type: string;
}

export const imageService = {
    uploadImage: (fileUri: string, fileName: string, fileType: string): Promise<string> => { // La api devuelve un string (UUID) de la imagen subida
        const formData = new FormData();
        formData.append('file', {
            uri: fileUri,
            name: fileName,
            type: fileType,
        } as any);
        return apiRequest<string>('/image', 'POST', formData, true);
    },
    getImageUrl: (uuid: string | null): string | null =>
        uuid ? `${API_BASE_URL}/image/${uuid}` : null,
};