'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';
import { LogIn, User, Lock, ArrowRight, Store } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const res = await fetch(`${API_URL}/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await res.json();
            login(data.access_token, data.role, username, data.user_id);
        } catch (err) {
            setError('Invalid username or password ❌');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50">
            <div className="w-full max-w-md animate-fade-in-up">
                {/* Logo Section */}
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex p-4 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-200 text-white mb-2">
                        <Store className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
                        Welcome <span className="text-indigo-600">Back!</span>
                    </h2>
                    <p className="text-gray-500 font-bold">Sign in to continue your feast 😋</p>
                </div>

                {/* Login Form */}
                <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl border border-white">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <User className="w-3 h-3" />
                                Username
                            </label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Your username"
                                className="w-full bg-gray-50/50 border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold placeholder:font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Lock className="w-3 h-3" />
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-gray-50/50 border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold"
                            />
                        </div>

                        {error && (
                            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-black text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 border-b-4 border-indigo-900 flex items-center justify-center gap-3"
                        >
                            <LogIn className="w-6 h-6" />
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 font-bold">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-indigo-600 hover:underline">
                                Register Now <ArrowRight className="inline w-4 h-4" />
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
