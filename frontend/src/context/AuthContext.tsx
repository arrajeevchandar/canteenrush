'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    username: string;
    role: string;
    user_id: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, role: string, username: string, userId: number) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for stored token on load
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');
        const storedUsername = localStorage.getItem('username');
        const storedUserId = localStorage.getItem('user_id');

        if (storedToken && storedRole && storedUsername && storedUserId) {
            setToken(storedToken);
            setUser({
                username: storedUsername,
                role: storedRole,
                user_id: parseInt(storedUserId)
            });
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, role: string, username: string, userId: number) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', role);
        localStorage.setItem('username', username);
        localStorage.setItem('user_id', userId.toString());

        setToken(newToken);
        setUser({ username, role, user_id: userId });

        if (role === 'vendor') {
            router.push('/vendor');
        } else {
            router.push('/menu');
        }
    };

    const logout = () => {
        localStorage.clear();
        setToken(null);
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
