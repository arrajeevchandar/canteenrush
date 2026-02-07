'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchOrders } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
    Package,
    Clock,
    CheckCircle2,
    Timer,
    ArrowLeft,
    QrCode,
    Ticket,
    Utensils,
    ChefHat,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

interface Order {
    id: number;
    status: string;
    total_price: number;
    created_at: string;
    predicted_pickup_time: string;
    vendor_id: number;
    token_number?: number;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        async function loadOrders() {
            try {
                const data = await fetchOrders();
                // Sort by ID descending (newest first)
                setOrders(data.sort((a: Order, b: Order) => b.id - a.id));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            loadOrders();
            // Poll for updates every 10 seconds
            const interval = setInterval(loadOrders, 10000);
            return () => clearInterval(interval);
        }
    }, [user, authLoading, router]);

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'ready':
                return {
                    bg: 'bg-emerald-500',
                    text: 'text-emerald-500',
                    light: 'bg-emerald-50',
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    label: 'Ready for Pickup 😋',
                    glow: 'shadow-emerald-200'
                };
            case 'preparing':
                return {
                    bg: 'bg-amber-500',
                    text: 'text-amber-500',
                    light: 'bg-amber-50',
                    icon: <Timer className="w-4 h-4 animate-spin-slow" />,
                    label: 'Cooking Now 🔥',
                    glow: 'shadow-amber-200'
                };
            case 'completed':
                return {
                    bg: 'bg-gray-500',
                    text: 'text-gray-500',
                    light: 'bg-gray-100',
                    icon: <Package className="w-4 h-4" />,
                    label: 'Delivered ✅',
                    glow: 'shadow-gray-200'
                };
            default:
                return {
                    bg: 'bg-indigo-500',
                    text: 'text-indigo-500',
                    light: 'bg-indigo-50',
                    icon: <Clock className="w-4 h-4" />,
                    label: 'Order Placed 📑',
                    glow: 'shadow-indigo-200'
                };
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50/30">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Tracking your tickets...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/50 pb-20">
            <div className="max-w-4xl mx-auto px-6 pt-12 space-y-12 animate-fade-in-up">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center sm:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                            <Ticket className="w-3 h-3" />
                            Live Tickets
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
                            My <span className="text-indigo-600">Orders</span>
                        </h1>
                        <p className="text-gray-500 font-bold">Real-time status of your delicious treats! 🎫</p>
                    </div>

                    <Link
                        href="/menu"
                        className="group inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl text-indigo-600 font-black text-sm transition-all active:scale-95"
                    >
                        Order More
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Orders List */}
                <div className="grid grid-cols-1 gap-8">
                    {orders.length > 0 ? (
                        orders.map((order) => {
                            const styles = getStatusStyles(order.status);
                            const orderDate = new Date(order.created_at);
                            const pickupTime = new Date(order.predicted_pickup_time);

                            return (
                                <div key={order.id} className="relative group overflow-hidden">
                                    <div className="glass-card rounded-[3rem] p-8 md:p-10 border border-white flex flex-col md:flex-row gap-10 shadow-2xl hover-glow transition-all group-hover:scale-[1.01]">
                                        {/* Ticket Stub (QR Code) */}
                                        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-[2rem] border-2 border-indigo-50 shadow-inner group-hover:rotate-1 transition-transform">
                                            <div className="relative">
                                                <QRCodeSVG
                                                    value={JSON.stringify({ id: order.id, token: order.token_number })}
                                                    size={120}
                                                    includeMargin={true}
                                                    className="rounded-lg"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[2px]">
                                                    <QrCode className="w-8 h-8 text-indigo-600" />
                                                </div>
                                            </div>
                                            <div className="mt-4 text-center">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Security Token</span>
                                                <div className="text-2xl font-black text-indigo-600 leading-none mt-1">
                                                    {order.token_number || order.id.toString().padStart(4, '0')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ticket Details */}
                                        <div className="flex-1 space-y-8">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Order #{order.id}</h3>
                                                        <span className="text-gray-300 font-black">/</span>
                                                        <span className="text-lg font-black text-emerald-500">${order.total_price.toFixed(2)}</span>
                                                    </div>
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                        Ordered <span className="text-gray-900">{orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </p>
                                                </div>

                                                <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-3xl ${styles.light} border-2 border-white shadow-sm shadow-indigo-100`}>
                                                    <div className={`p-2 ${styles.bg} rounded-xl text-white shadow-lg ${styles.glow}`}>
                                                        {styles.icon}
                                                    </div>
                                                    <span className={`font-black text-sm uppercase tracking-wider ${styles.text}`}>
                                                        {styles.label}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-6 bg-white/40 rounded-[2rem] border border-white space-y-1">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Est. Pickup
                                                    </span>
                                                    <div className="text-xl font-black text-gray-900 italic">
                                                        {pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-white/40 rounded-[2rem] border border-white space-y-1 flex flex-col items-center justify-center">
                                                    <ChefHat className="w-6 h-6 text-gray-200" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decorative Ticket Perforations */}
                                    <div className="hidden md:block absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 bg-indigo-50 border border-white rounded-full shadow-inner"></div>
                                    <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 bg-indigo-50 border border-white rounded-full shadow-inner"></div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-24 glass-card rounded-[4rem] border border-white shadow-xl space-y-6">
                            <div className="relative inline-block">
                                <Utensils className="w-24 h-24 text-indigo-100 mx-auto" />
                                <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm animate-bounce">?</div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">No orders yet</h3>
                                <p className="text-gray-500 font-bold max-w-sm mx-auto">Hungry? Your next great meal is just a few clicks away on the menu!</p>
                            </div>
                            <Link
                                href="/menu"
                                className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black tracking-widest uppercase text-xs shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
                            >
                                Browse Menu 🍔
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
