import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { PawPrint, Heart, Calendar, LayoutDashboard, Stethoscope, MessageCircle, FileText, User, Menu, X, ArrowRight, Plus, LogOut, Sparkles } from 'lucide-react';
const rawBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
export const base = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;
export const endpoints = { pets: '/pets', doctors: '/doctors', appointments: '/appointments/mine', prescriptions: '/prescriptions/mine', medical: '/medical-history/mine', dashboard: '/dashboard/owner', models: '/ai/models', chat: '/ai/chat/message', history: '/ai/chat/conversations' };
export async function api(path, method = 'GET', body) {
    const token = localStorage.getItem('vetToken');
    const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    if (body && !(body instanceof FormData))
        headers['Content-Type'] = 'application/json';
    const r = await fetch(base + path, { method, headers, body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined });
    const data = await r.json().catch(() => ({}));
    if (!r.ok)
        throw Error(data.message || `Request failed (${r.status})`);
    return data;
}
export function rows(data, key) { const aliases = { models: 'aiModels', medical: 'medicalRecords' }; const value = data?.[aliases[key] || key] ?? data?.data ?? data; return Array.isArray(value) ? value : Array.isArray(value?.[key]) ? value[key] : []; }
export function useData(path) {
    const [state, setState] = useState({ path: null, data: null, error: '', loading: true });
    const [revision, setRevision] = useState(0);
    const load = useCallback(() => setRevision(value => value + 1), []);
    useEffect(() => {
        let active = true;
        setState({ path, data: null, error: '', loading: true });
        api(path).then(data => {
            if (active) setState({ path, data, error: '', loading: false });
        }).catch(error => {
            if (active) setState({ path, data: null, error: error.message, loading: false });
        });
        return () => { active = false; };
    }, [path, revision]);
    return { ...(state.path === path ? state : { data: null, error: '', loading: true }), load };
}
