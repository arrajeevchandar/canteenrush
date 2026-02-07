'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchOrders } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import {
    ShoppingBag,
    Clock,
    CheckCircle,
    Loader2,
    Ticket,
    ChefHat,
    Bell,
    ArrowRight,
    Star,
    Coffee
} from 'lucide-react';

interface Order {
    id: number;
    status: string;
    total_price: number;
    created_at: string;
    predicted_pickup_time: string;
    vendor_id: number;
    token_number: number;
    queue_position?: number;
    items?: any[];
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
                setOrders(data.sort((a: Order, b: Order) => b.id - a.id));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            loadOrders();
            const interval = setInterval(loadOrders, 5000);
            return () => clearInterval(interval);
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-600 font-black animate-pulse uppercase tracking-widest text-sm">Locating Your Orders... 🍔</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-12 animate-fade-in-up">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 text-white">
                                <Ticket className="w-8 h-8" />
                            </div>
                            <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Your <span className="text-indigo-600">Orders</span></h1>
                        </div>
                        <p className="text-gray-500 font-bold ml-1">Track your meals in real-time. No more waiting in lines! ⏰</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="py-24 text-center glass-card rounded-[3rem] border-2 border-dashed border-indigo-100 flex flex-col items-center gap-6 animate-fade-in-up">
                        <div className="p-8 bg-indigo-50 rounded-full">
                            <Coffee className="w-16 h-16 text-indigo-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-gray-900">Your tray is empty! 😴</h3>
                            <p className="text-gray-500 font-medium">Ready for something delicious? Head back to the menu!</p>
                        </div>
                        <button
                            onClick={() => router.push('/menu')}
                            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 border-b-4 border-indigo-900"
                        >
                            Browse Menu
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {orders.map((order) => (
                            <div key={order.id} className="group relative flex flex-col animate-fade-in-up">
                                {/* Ticket Design Top */}
                                <div className={`relative px-8 py-6 rounded-t-[2.5rem] border-x border-t border-white/50 shadow-2xl overflow-hidden
                                    ${order.status === 'ready' ? 'bg-emerald-500 text-white' :
                                        order.status === 'preparing' ? 'bg-indigo-600 text-white' :
                                            'bg-amber-500 text-white'}`}>

                                    {/* Design Elements */}
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                    <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-black/5 rounded-full blur-xl"></div>

                                    <div className="relative flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1 flex items-center gap-2">
                                                <Star className="w-3 h-3 fill-current" />
                                                Order ID
                                            </p>
                                            <h3 className="text-2xl font-black tracking-tight">#{order.id}</h3>
                                        </div>
                                        <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                                            {order.status === 'ready' && <CheckCircle className="w-4 h-4" />}
                                            {order.status === 'ordered' && <Bell className="w-4 h-4" />}
                                            {order.status === 'preparing' && <ChefHat className="w-4 h-4 animate-bounce" />}
                                            {order.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Ticket Body */}
                                <div className="p-8 bg-white rounded-b-[2.5rem] border-x border-b border-white shadow-2xl space-y-8 flex-1 flex flex-col relative z-10 transition-transform group-hover:scale-[1.01]">
                                    {/* Perforation Effect */}
                                    <div className="absolute -top-3 left-0 right-0 flex justify-between px-4 overflow-hidden pointer-events-none">
                                        {[...Array(20)].map((_, i) => (
                                            <div key={i} className="w-2 h-2 bg-white rounded-full translate-y-2 shadow-inner"></div>
                                        ))}
                                    </div>

                                    {/* QR Code Section */}
                                    <div className="flex flex-col items-center bg-gray-50/50 p-6 rounded-3xl border border-dashed border-indigo-100 hover:bg-white transition-colors">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Your Pickup Token 🎫</p>
                                        <div className="text-6xl font-black text-indigo-600 font-mono tracking-tighter mb-6 select-none">
                                            {order.token_number}
                                        </div>
                                        <div className="bg-white p-4 rounded-3xl shadow-lg border border-indigo-50 hover:scale-110 transition-transform cursor-zoom-in">
                                            <QRCodeSVG value={JSON.stringify({ id: order.id, token: order.token_number })} size={140} fgColor="#4f46e5" />
                                        </div>
                                        <p className="text-[10px] font-black text-indigo-300 mt-6 animate-pulse uppercase tracking-[0.2em]">Scan at counter 📱</p>
                                    </div>

                                    {/* Queue Position */}
                                    {order.status !== 'ready' && order.status !== 'completed' && (
                                        <div className="text-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Queue Status 🚶‍♂️</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="flex h-3 w-3 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600 shadow-sm shadow-indigo-200"></span>
                                                </div>
                                                <span className="text-2xl font-black text-gray-900 tracking-tighter">
                                                    {order.queue_position ? `#${order.queue_position}` : 'IN LINE'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Items List */}
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-2">
                                            <ShoppingBag className="w-4 h-4 text-gray-300" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Details 📝</p>
                                        </div>
                                        <div className="space-y-3">
                                            {order.items && order.items.length > 0 ? (
                                                order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center group/item transition-all">
                                                        <span className="text-sm font-black text-gray-700">{item.menu_item ? item.menu_item.name : 'Item'}</span>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-20 h-px bg-gray-100 group-hover/item:bg-indigo-100 transition-colors"></div>
                                                            <span className="bg-gray-100 px-2 py-0.5 rounded-lg text-[10px] font-black text-indigo-600">x{item.quantity}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm text-gray-300 italic font-medium">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Fetching items...
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ticket Footer */}
                                    <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Paid 💸</p>
                                            <p className="text-2xl font-black text-gray-900 tracking-tighter">${order.total_price.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right space-y-0.5">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Estimated Pickup ⏲️</p>
                                            <div className="flex items-center justify-end gap-1.5 font-black text-gray-900 italic tracking-tight">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                {new Date(order.predicted_pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
