import {ApiError, JwtPayload} from "@/types/api";
import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import ExpoSecureStore from "expo-secure-store/src/ExpoSecureStore";
import {checkIsAdmin, parseJwt} from "@/utils/jwtUtils";
import {authService} from "@/services/api";


interface AuthContextType {
    authToken: string | null;
    authUser: JwtPayload | null;
    isAdmin: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    register: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [authUser, setAuthUser] = useState<JwtPayload | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await ExpoSecureStore.getItemAsync('authToken');
                if (storedToken) {
                    updateAuthState(storedToken);
                }
            } catch (e) {
                console.error("Error loading auth token:", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    const updateAuthState = (token: string | null) => {
        if (token) {
            const decoded = parseJwt(token);
            setAuthToken(token);
            setAuthUser(decoded);
            setIsAdmin(checkIsAdmin(token));
            ExpoSecureStore.setItemAsync('authToken', token);
        } else {
            setAuthToken(null);
            setAuthUser(null);
            setIsAdmin(false);
            ExpoSecureStore.deleteItemAsync('authToken');
        }
    };

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await authService.login(username, password);
            if (response && response.token) {
                updateAuthState(response.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed:", error);
            throw error as ApiError;
        }
    };

    const register = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await authService.register(username, password);
            if (response && response.token) {
                updateAuthState(response.token)
                return true;
            }
            return false;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error as ApiError;
        }
    };

    const logout = () => {
        updateAuthState(null);
    };

    return (
        <AuthContext.Provider value={{ authToken, authUser, isAdmin, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};