'use client';

import { useEffect, useState } from 'react';
import { fetchMenu, createOrder, predictTime } from '@/lib/api';
import {
    ShoppingBag,
    Clock,
    Plus,
    Trash2,
    Utensils,
    Store,
    ArrowRight,
    Search,
    Flame,
    Leaf,
    Zap
} from 'lucide-react';

interface MenuItem {
    id: number;
    name: string;
    price: number;
    description: string;
    prep_time_estimate: number;
    vendor_id: number;
    vendor_name: string;
    is_available: boolean;
}

export default function MenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [orderStatus, setOrderStatus] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

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

    const addToCart = (id: number) => {
        setCart([...cart, id]);
    };

    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const handleOrder = async () => {
        if (cart.length === 0) return;
        try {
            const vendorId = items.find(i => i.id === cart[0])?.vendor_id || 1;
            const order = await createOrder(cart, vendorId);
            setOrderStatus({ msg: `Order #${order.id} placed! Status: ${order.status} 🎉`, type: 'success' });
            setCart([]);
            setTimeout(() => setOrderStatus(null), 5000);
        } catch (error) {
            setOrderStatus({ msg: 'Failed to place order. ❌', type: 'error' });
            setTimeout(() => setOrderStatus(null), 5000);
        }
    };

    const getFoodEmoji = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('burger')) return '🍔';
        if (lowerName.includes('pizza')) return '🍕';
        if (lowerName.includes('sandwich')) return '🥪';
        if (lowerName.includes('coffee') || lowerName.includes('tea')) return '☕';
        if (lowerName.includes('biryani') || lowerName.includes('rice')) return '🍛';
        if (lowerName.includes('dosa')) return '🥞';
        if (lowerName.includes('juice') || lowerName.includes('drink')) return '🍹';
        if (lowerName.includes('salad')) return '🥗';
        return '🍴';
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalInCart = cart.reduce((sum, id) => {
        const item = items.find(i => i.id === id);
        return sum + (item?.price || 0);
    }, 0);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-indigo-600 font-black animate-pulse uppercase tracking-widest text-sm">Fetching Flavors... 🍕</p>
        </div>
    );

    return (
        <div className="min-h-screen p-6 pb-32">
            <div className="max-w-7xl mx-auto space-y-12 animate-fade-in-up">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">😋</span>
                            <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
                                Today's <span className="text-indigo-600">Menu</span>
                            </h1>
                        </div>
                        <p className="text-gray-500 font-bold max-w-md">The best treats from your campus vendors, just a click away! 🚀</p>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-md glass-card p-2 rounded-2xl shadow-xl border border-white flex items-center gap-3 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                        <Search className="w-6 h-6 text-indigo-400 ml-2" />
                        <input
                            type="text"
                            placeholder="What are you craving today?"
                            className="bg-transparent outline-none flex-1 font-bold text-gray-700 placeholder-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {orderStatus && (
                    <div className={`p-6 rounded-3xl shadow-2xl animate-fade-in-up flex items-center justify-center font-black text-lg gap-4 border-b-4 
                        ${orderStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-500' : 'bg-rose-50 text-rose-700 border-rose-500'}`}>
                        {orderStatus.msg}
                    </div>
                )}

                {/* Categories / Tags (Purely UI) */}
                <div className="flex flex-wrap gap-4">
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 flex items-center gap-2">
                        <Zap className="w-4 h-4 fill-white" />
                        All Items
                    </button>
                    <button className="px-6 py-2 bg-white border-2 border-gray-100 text-gray-600 rounded-xl font-bold hover:border-indigo-200 transition-all flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        Popular
                    </button>
                    <button className="px-6 py-2 bg-white border-2 border-gray-100 text-gray-600 rounded-xl font-bold hover:border-indigo-200 transition-all flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-emerald-500" />
                        Healthy
                    </button>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredItems.map((product) => (
                        <div
                            key={product.id}
                            className="group glass-card rounded-[2rem] shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-white/50 overflow-hidden flex flex-col"
                        >
                            {/* Card Top - Emoji Badge */}
                            <div className="h-48 bg-gradient-to-br from-indigo-50 to-blue-50 relative flex items-center justify-center overflow-hidden group-hover:from-indigo-100 group-hover:to-blue-100 transition-colors">
                                <span className="text-[100px] drop-shadow-2xl transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12 select-none">
                                    {getFoodEmoji(product.name)}
                                </span>
                                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-indigo-600 shadow-sm border border-white">
                                    {product.prep_time_estimate} MINS ⏱️
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6 flex-1 flex flex-col space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                                            {product.name}
                                        </h3>
                                        <span className="text-2xl font-black text-gray-900 tracking-tighter">${product.price}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium line-clamp-2">{product.description}</p>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest bg-gray-50 p-2 rounded-xl border border-gray-100 italic">
                                    <Store className="w-3 h-3" />
                                    Sold by {product.vendor_name || 'Huda'}
                                </div>

                                <button
                                    onClick={() => addToCart(product.id)}
                                    disabled={!product.is_available}
                                    className={`mt-auto w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-b-4 flex items-center justify-center gap-2
                                        ${product.is_available
                                            ? 'bg-indigo-600 text-white border-indigo-900 shadow-lg shadow-indigo-100 hover:scale-105 active:border-b-0 active:translate-y-1'
                                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                                >
                                    {product.is_available ? (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            Add To Tray
                                        </>
                                    ) : 'SOLD OUT 🚫'}
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center gap-4 glass-card rounded-[3rem] border-2 border-dashed border-indigo-100">
                            <div className="p-6 bg-indigo-50 rounded-full">
                                <Utensils className="w-12 h-12 text-indigo-200" />
                            </div>
                            <p className="text-gray-400 font-black text-xl italic uppercase tracking-widest">Nothing matches your search 🔍</p>
                        </div>
                    )}
                </div>

                {/* Floating Cart */}
                {cart.length > 0 && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-50 animate-fade-in-up">
                        <div className="glass-card bg-indigo-900/90 backdrop-blur-xl border border-white/20 p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(67,56,202,0.3)] flex items-center justify-between gap-8 text-white">
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="p-4 bg-white/10 rounded-2xl">
                                        <ShoppingBag className="w-8 h-8" />
                                    </div>
                                    <span className="absolute -top-3 -right-3 bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 border-indigo-900 animate-bounce">
                                        {cart.length}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-indigo-200 uppercase tracking-widest">Your Tray</p>
                                    <p className="text-3xl font-black tracking-tighter">${totalInCart.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setCart([])}
                                    className="p-4 text-indigo-200 hover:text-white transition-colors hover:bg-white/5 rounded-2xl"
                                    title="Empty Tray"
                                >
                                    <Trash2 className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={handleOrder}
                                    className="bg-white text-indigo-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 flex items-center gap-3"
                                >
                                    Place Order
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
