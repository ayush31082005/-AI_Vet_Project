import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { bookingReturnTarget } from '../services/bookingNavigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { GoogleLogin } from '@react-oauth/google';
import { PawPrint, ArrowRight } from 'lucide-react';
import { Brand } from '../components/Header';
import { api } from '../services/api';
import whoWeAreVetImg from '../assets/images/who-we-are-vet.jpg';

gsap.registerPlugin(useGSAP);

const ONLINE_BG = {
    login:
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1920&q=85',
    signup:
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1920&q=85',
};

export function Auth({ signup = false, setUser }) {
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const go = useNavigate();
    const location = useLocation();
    const returnTarget = bookingReturnTarget(location.search);
    const scope = useRef(null);

    useGSAP(
        () => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            gsap.from('.auth-glass-card', {
                opacity: 0,
                y: 22,
                scale: 0.97,
                duration: 0.65,
                ease: 'power3.out',
                clearProps: 'all',
            });
        },
        { scope, dependencies: [signup] }
    );

    async function finish(d) {
        if (!d.token) throw Error('Token missing in response');
        localStorage.setItem('vetToken', d.token);
        const p = await api('/auth/profile');
        setUser(p.user ?? p.data ?? p);
        const account = p.user ?? p.data ?? p;
        go(account.role === 'admin' ? '/admin/dashboard' : account.role === 'vet' ? '/doctor/dashboard' : returnTarget || '/app/dashboard', { replace: true });
    }

    async function submit(e) {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            const result = await api(
                '/auth/' + (signup ? 'signup' : 'login'),
                'POST',
                Object.fromEntries(new FormData(e.target))
            );
            if (signup && !result.token) {
                go('/login' + location.search);
                return;
            }
            await finish(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <section
            ref={scope}
            className="relative flex min-h-[calc(100svh-65px)] w-full items-center overflow-hidden bg-[#1D150E] px-4 py-8 sm:px-6"
        >
            {/* Full-bleed Online Background Photo */}
            <img
                src={signup ? ONLINE_BG.signup : ONLINE_BG.login}
                alt=""
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = whoWeAreVetImg;
                }}
                className="absolute inset-0 h-full w-full object-cover object-center"
                aria-hidden="true"
            />

            {/* Very Subtle Vignette so image remains vibrant & clear */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-black/35" />

            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-8 lg:flex-row">
                {/* Open Left Caption Over Clear Background */}
                <div className="hidden max-w-md text-white lg:block">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFEAD1]/95 px-3.5 py-1 text-xs font-semibold text-[#C25900] shadow-sm">
                        <PawPrint size={12} className="fill-[#FF8C1A] text-[#FF8C1A]" />
                        VioletVet Portal
                    </span>
                    <h2 className="mt-4 text-4xl font-extrabold leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
                        Caring For Pets
                        <span className="block text-[#FF9825]">Like Family.</span>
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.75)]">
                        Manage pet profiles, book veterinary appointments, and explore AI
                        pet healthcare from one convenient dashboard.
                    </p>
                </div>

                {/* Transparent Dark Glass Form Card (no white background) */}
                <div className="auth-glass-card w-full max-w-[440px] rounded-[26px] border border-white/25 bg-black/30 p-6 text-white shadow-2xl backdrop-blur-[5px] sm:p-8">
                    <div className="mb-4">
                        <Brand lightText />
                    </div>

                    <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                        {signup ? 'Create your account' : 'Welcome back'}
                    </h1>
                    <p className="mt-1 text-xs text-white/80 sm:text-sm">
                        {signup
                            ? 'Join VioletVet to organize your pet’s healthcare journey.'
                            : 'Sign in to manage pets, appointments, and records.'}
                    </p>

                    <form className="mt-5 space-y-3.5" onSubmit={submit}>
                        {signup && (
                            <div className="grid gap-3.5 sm:grid-cols-2">
                                <label className="text-white/95">
                                    Full name
                                    <input
                                        name="fullName"
                                        placeholder="Your full name"
                                        className="border-white/30 bg-white/15 text-white placeholder:text-white/60 focus:border-[#FF9825] focus:bg-white/20"
                                        required
                                    />
                                </label>
                                <label className="text-white/95">
                                    Mobile
                                    <input
                                        name="mobile"
                                        placeholder="+91 98765 43210"
                                        required
                                        className="border-white/30 bg-white/15 text-white placeholder:text-white/60 focus:border-[#FF9825] focus:bg-white/20"
                                    />
                                </label>
                            </div>
                        )}

                        <label className="text-white/95">
                            Email
                            <input
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                className="border-white/30 bg-white/15 text-white placeholder:text-white/60 focus:border-[#FF9825] focus:bg-white/20"
                                required
                            />
                        </label>

                        <label className="text-white/95">
                            Password
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                minLength={signup ? 8 : 1}
                                className="border-white/30 bg-white/15 text-white placeholder:text-white/60 focus:border-[#FF9825] focus:bg-white/20"
                                required
                            />
                        </label>

                        {error && <p className="error">{error}</p>}

                        <button
                            disabled={busy}
                            className="group w-full rounded-xl bg-[#FF8C1A] px-5 py-3 text-sm font-semibold text-[#2E1E0F] shadow-lg transition hover:bg-[#FFA242]"
                        >
                            {busy ? 'Please wait…' : signup ? 'Sign up' : 'Sign in'}
                            <ArrowRight
                                size={15}
                                className="transition-transform group-hover:translate-x-0.5"
                            />
                        </button>

                        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                            <div className="pt-1">
                                <GoogleLogin
                                    onSuccess={async (r) => {
                                        try {
                                            await finish(
                                                await api('/auth/google', 'POST', {
                                                    credential: r.credential,
                                                })
                                            );
                                        } catch (err) {
                                            setError(err.message);
                                        }
                                    }}
                                    onError={() => setError('Google login failed')}
                                />
                            </div>
                        )}

                        <p className="pt-1 text-center text-xs font-medium text-white/85 sm:text-sm">
                            <Link
                                to={(signup ? '/login' : '/signup') + location.search}
                                className="font-semibold text-[#FF9825] hover:underline"
                            >
                                {signup
                                    ? 'Already registered? Sign in'
                                    : 'New here? Create account'}
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </section>
    );
}
