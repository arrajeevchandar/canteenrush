'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { UserPlus, User, Mail, Lock, ShieldCheck, ArrowRight, Store } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'student', // Default
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Registration failed');
            }

            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message + ' ❌');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50">
            <div className="w-full max-w-md animate-fade-in-up">
                {/* Logo Section */}
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex p-4 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-100 text-white mb-2">
                        <UserPlus className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
                        Join the <span className="text-indigo-600">Rush!</span>
                    </h2>
                    <p className="text-gray-500 font-bold">Create your account to start ordering 🍔</p>
                </div>

                {/* Register Form */}
                <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl border border-white">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <User className="w-3 h-3" />
                                Username
                            </label>
                            <input
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Choose a username"
                                className="w-full bg-gray-50/50 border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                Email Address
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                className="w-full bg-gray-50/50 border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Lock className="w-3 h-3" />
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-gray-50/50 border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" />
                                Select Role
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'student' })}
                                    className={`py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 
                                        ${formData.role === 'student' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200'}`}
                                >
                                    Student 🎓
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'vendor' })}
                                    className={`py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 
                                        ${formData.role === 'vendor' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200'}`}
                                >
                                    Vendor 🏪
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-black text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 border-b-4 border-indigo-900 flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up Now 🚀'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 font-bold">
                            Already a member?{' '}
                            <Link href="/login" className="text-indigo-600 hover:underline">
                                Sign In <ArrowRight className="inline w-4 h-4" />
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
