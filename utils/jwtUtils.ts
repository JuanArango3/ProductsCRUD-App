import {JwtPayload} from "@/types/api";
import { Buffer } from 'buffer';

export function parseJwt(token:string):JwtPayload | null {
    if (!token) { return null; }
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        const jsonPayload = decodeURIComponent(Buffer.from(base64, 'base64').toString('binary').split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error parsing JWT:", e);
        return null;
    }
}

export function checkIsAdmin(token:string) {
    if (!token) { return false; }
    const decodedToken = parseJwt(token);
    if (!decodedToken) { return false; }
    const authorities = decodedToken.authorities || decodedToken.roles || decodedToken.scp || [];
    return Array.isArray(authorities) && authorities.includes('ROLE_ADMIN');
}