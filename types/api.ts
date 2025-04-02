export interface LoginRequest {
    username: string;
    password?: string;
}

export interface RegisterRequest {
    username: string;
    password?: string;
}

export interface TokenResponse {
    token: string;
}

export interface ProductDTO {
    id: number;
    name: string;
    description: string;
    authorId: number;
    imageIds: string[];
    price: number;
    createdAt?: string;
}

export interface CreateProductRequest {
    name: string;
    description: string;
    price: number;
    imageIds: string[];
}

export interface PageInfo<T> {
    elements: T[];
    totalElements: number;
    actualPage: number;
    totalPages: number;
}

export interface JwtPayload {
    sub?: string;
    authorities?: string[];
    roles?: string[];
    scp?: string[];
    iat?: number;
    exp?: number;
}

export interface ApiErrorBody {
    timestamp?: string;
    status?: number;
    error?: string;
    message?: string;
    path?: string;
    errors?: { [key: string]: string };
}

export interface ApiError extends Error {
    status?: number;
    body?: ApiErrorBody | string;
}