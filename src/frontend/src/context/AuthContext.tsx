import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

interface AuthContextType {
    user: any;
    loading: boolean;
    logout: () => void;
    token: string | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: () => { },
    token: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [firebaseUser, loading] = useAuthState(auth);
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const syncWithBackend = async () => {
            if (firebaseUser) {
                // User logged in via Firebase
                const currentToken = await firebaseUser.getIdToken();
                setToken(currentToken);

                try {
                    // Sync with our Node.js MongoDB backend
                    const res = await axios.post('http://localhost:5000/api/auth/sync', {
                        token: currentToken
                    });
                    setUser(res.data); // Store the MongoDB user payload

                    // Set axios default header for future authenticated requests
                    axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
                } catch (error) {
                    console.error("Failed to sync Firebase user with backend:", error);
                    // Still set user from Firebase so chatbot & auth features work
                    setUser({
                        username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                        email: firebaseUser.email,
                        uid: firebaseUser.uid,
                    });
                }
            } else {
                // User logged out
                setUser(null);
                setToken(null);
                delete axios.defaults.headers.common['Authorization'];
            }
        };

        if (!loading) {
            syncWithBackend();
        }
    }, [firebaseUser, loading]);

    const logout = () => {
        auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, token }}>
            {children}
        </AuthContext.Provider>
    );
};
