'use client';

import { useEffect, useState } from 'react';
import { fetchMenu, createOrder, predictTime } from '@/lib/api';
import {
    Search,
    ShoppingCart,
    Clock,
    Utensils,
    Plus,
    Minus,
    Trash2,
    ChefHat,
    Star,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface MenuItem {
    id: number;
    name: string;
    price: number;
    description: string;
    prep_time_estimate: number;
    vendor_id: number;
    vendor_name: string;
    is_available: boolean;
    image_url?: string;
}

export default function MenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderStatus, setOrderStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        async function loadMenu() {
            try {
                const data = await fetchMenu();
                setItems(data);
            } catch (error) {
                console.error('Failed to load menu', error);
            } finally {
                setLoading(false);
            }
        }
        loadMenu();
    }, []);

    const addToCart = (item: MenuItem) => {
        const existing = cart.find(c => c.item.id === item.id);
        if (existing) {
            setCart(cart.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, { item, quantity: 1 }]);
        }
    };

    const removeFromCart = (id: number) => {
        const existing = cart.find(c => c.item.id === id);
        if (existing && existing.quantity > 1) {
            setCart(cart.map(c => c.item.id === id ? { ...c, quantity: c.quantity - 1 } : c));
        } else {
            setCart(cart.filter(c => c.item.id !== id));
        }
    };

    const handleOrder = async () => {
        if (cart.length === 0) return;
        if (!user) {
            router.push('/login');
            return;
        }

        try {
            // Group by vendor - for now we take the first vendor for simplicity as per original flow
            const vendorId = cart[0].item.vendor_id;
            const itemIds = cart.flatMap(c => Array(c.quantity).fill(c.item.id));

            const order = await createOrder(itemIds, vendorId);
            setOrderStatus({ message: `Order #${order.id} placed successfully! 🚀 Check 'My Orders' for updates.`, type: 'success' });
            setCart([]);

            // Clear message after 5 seconds
            setTimeout(() => setOrderStatus(null), 5000);
        } catch (error) {
            setOrderStatus({ message: 'Failed to place order. Please try again. ❌', type: 'error' });
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPrice = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);

    const getFoodEmoji = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('burger')) return '🍔';
        if (n.includes('pizza')) return '🍕';
        if (n.includes('coffee') || n.includes('tea')) return '☕';
        if (n.includes('sandwich')) return '🥪';
        if (n.includes('rice')) return '🍚';
        if (n.includes('dosa')) return '🥙';
        if (n.includes('noodle')) return '🍜';
        if (n.includes('chicken')) return '🍗';
        return '🍲';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50/30">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Loading the feast...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 pb-32">
            {/* Hero Section */}
            <div className="px-6 py-12 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                            <ChefHat className="w-3 h-3" />
                            Campus Specialties
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
                            Today's <span className="text-indigo-600">Menu</span>
                        </h1>
                        <p className="text-gray-500 font-bold max-w-md">Find your favorite meals and skip the campus rush! 😋</p>
                    </div>

                    <div className="relative group w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search dishes, stalls, or flavors..."
                            className="w-full bg-white border-2 border-gray-100 p-4 pl-12 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold placeholder:font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {orderStatus && (
                    <div className={`p-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 animate-shake ${orderStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                        {orderStatus.message}
                    </div>
                )}

                {/* Menu Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredItems.map((product) => (
                        <div key={product.id} className="group glass-card rounded-[2.5rem] overflow-hidden flex flex-col hover-glow transition-all hover:scale-[1.02] border border-white">
                            {/* Image Placeholder */}
                            <div className="h-48 bg-indigo-100 relative overflow-hidden flex items-center justify-center">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <span className="text-7xl group-hover:scale-125 transition-transform duration-500 grayscale group-hover:grayscale-0">
                                        {getFoodEmoji(product.name)}
                                    </span>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 shadow-sm flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {product.prep_time_estimate} MINS
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                                            <Utensils className="w-2 h-2" />
                                            {product.vendor_name || 'Campus Stall'}
                                        </div>
                                    </div>
                                    <span className="text-lg font-black text-indigo-600">
                                        ${product.price.toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-xs font-bold leading-relaxed line-clamp-2">
                                    {product.description || "A student-favorite prepared with fresh ingredients and lots of love!"}
                                </p>

                                <div className="pt-2">
                                    <button
                                        onClick={() => addToCart(product)}
                                        disabled={!product.is_available}
                                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 
                                            ${product.is_available
                                                ? 'bg-gray-50 text-gray-900 hover:bg-indigo-600 hover:text-white shadow-sm border border-gray-100 group-hover:border-indigo-600 hover:scale-[1.05] active:scale-95'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'}`}
                                    >
                                        {product.is_available ? (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                Add to Bag
                                            </>
                                        ) : 'Sold Out'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                        <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-black text-gray-900">No dishes found</h3>
                        <p className="text-gray-500 font-bold">Try searching for something else! 🕵️‍♂️</p>
                    </div>
                )}
            </div>

            {/* Premium Floating Cart */}
            {cart.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-[100] animate-move-up">
                    <div className="bg-gray-900/95 backdrop-blur-2xl p-4 md:p-6 rounded-[2.5rem] shadow-2xl border border-white/10 flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 flex items-center gap-4">
                            <div className="hidden sm:flex relative p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                                <ShoppingCart className="w-6 h-6" />
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-indigo-600 rounded-full text-[10px] font-black flex items-center justify-center">
                                    {cart.reduce((sum, c) => sum + c.quantity, 0)}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-black text-lg tracking-tight">Your Feast Bag</span>
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    Total: <span className="text-emerald-400">${totalPrice.toFixed(2)}</span>
                                </span>
                            </div>
                        </div>

                        {/* Cart Mini List (Horizontal) */}
                        <div className="hidden lg:flex items-center gap-2 max-w-xs overflow-x-auto no-scrollbar py-1 px-4 border-l border-white/10">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl" title={item.item.name}>
                                    {getFoodEmoji(item.item.name)}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => setCart([])}
                                className="p-4 bg-white/5 text-gray-400 hover:text-rose-400 rounded-2xl hover:bg-white/10 transition-all border border-white/5"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleOrder}
                                className="flex-1 md:flex-none px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border-b-4 border-indigo-900"
                            >
                                Checkout
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
