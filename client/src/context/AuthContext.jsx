import React, { createContext, useEffect, useState, useContext } from 'react';
import { api } from '../services/api';
export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        if (!localStorage.getItem('vetToken')) {
            setReady(true);
            return;
        }
        api('/auth/profile').then(d => setUser(d.user ?? d.data ?? d))
            .catch(() => localStorage.removeItem('vetToken')).finally(() => setReady(true));
    }, []);
    function logout() { localStorage.removeItem('vetToken'); setUser(null); }
    return <AuthContext.Provider value={{ user, setUser, ready, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
