'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchOrders, createMenuItem, updateOrderStatus, fetchMenu, updateMenuItem, fetchOrderByToken } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Utensils,
    QrCode,
    Search,
    DollarSign,
    ShoppingBag,
    Clock,
    CheckCircle,
    XCircle,
    ChefHat,
    Plus,
    RefreshCw,
    TrendingUp,
    Store,
    Users,
    Image as ImageIcon
} from 'lucide-react';

interface Order {
    id: number;
    status: string;
    total_price: number;
    created_at: string;
    predicted_pickup_time: string;
    items: any[];
    token_number?: number;
}

interface MenuItem {
    id: number;
    name: string;
    price: number;
    description: string;
    prep_time_estimate: number;
    is_available: boolean;
    image_url?: string;
}

export default function VendorDashboard() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [activeTab, setActiveTab] = useState('orders'); // orders, menu
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Stats
    const totalOrders = orders.length;
    const activeOrdersCount = orders.filter(o => ['ordered', 'preparing'].includes(o.status)).length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_price : 0), 0);

    // Manual Token Entry
    const [manualToken, setManualToken] = useState('');
    const [scannedResult, setScannedResult] = useState<string | null>(null);

    // Scanner Ref
    const scannerRef = useRef<any>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'vendor') {
                router.push('/login');
                return;
            }
        }

        if (user && user.role === 'vendor') {
            loadOrders();
            loadMenu();
            const interval = setInterval(loadOrders, 5000); // Poll every 5s
            return () => clearInterval(interval);
        }
    }, [user, authLoading, router]);

    async function loadOrders() {
        try {
            const data = await fetchOrders();
            setOrders(data.sort((a: Order, b: Order) => b.id - a.id));
        } catch (e) {
            console.error(e);
        }
    }

    async function loadMenu() {
        try {
            const data = await fetchMenu();
            setMenuItems(data);
        } catch (e) {
            console.error(e);
        }
    }

    const handleStatusUpdate = async (orderId: number, status: string) => {
        try {
            await updateOrderStatus(orderId, status);
            loadOrders();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handleToggleAvailability = async (item: MenuItem) => {
        try {
            await updateMenuItem(item.id, { is_available: !item.is_available });
            loadMenu();
        } catch (error) {
            console.error('Failed to update item', error);
        }
    };

    const handleManualTokenSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = parseInt(manualToken);
            if (isNaN(token)) return;
            const order = await fetchOrderByToken(token);
            alert(`Found Order #${order.id} - Status: ${order.status}`);
            setScannedResult(`Order #${order.id}`);
        } catch (error) {
            alert('Order not found for token: ' + manualToken);
        }
    };

    const startScanner = async () => {
        const scannerId = "reader";
        setIsScannerOpen(true);
        // Wait for render
        setTimeout(async () => {
            if (!document.getElementById(scannerId)) return;
            if (scannerRef.current) return;

            try {
                const { Html5QrcodeScanner } = await import('html5-qrcode');
                const scanner = new Html5QrcodeScanner(
                    scannerId,
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    false
                );
                scanner.render(onScanSuccess, onScanFailure);
                scannerRef.current = scanner;
            } catch (e) {
                console.error("Failed to load scanner library", e);
                alert("Scanner library failed to load.");
            }
        }, 100);
    };

    function onScanSuccess(decodedText: string, decodedResult: any) {
        console.log(`Scan result ${decodedText}`, decodedResult);
        try {
            const data = JSON.parse(decodedText);
            if (data.token) {
                setManualToken(data.token.toString());
                alert(`Scanned Token: ${data.token}`);
            }
        } catch (e) {
            console.error("Invalid QR content");
        }
    }

    function onScanFailure(error: any) { }

    // Item Creation State
    const [newItem, setNewItem] = useState({ name: '', price: 0, description: '', prep_time_estimate: 10, image_url: '' });
    const [message, setMessage] = useState('');

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createMenuItem(newItem);
            setMessage('Item created successfully! ✨');
            setNewItem({ name: '', price: 0, description: '', prep_time_estimate: 10, image_url: '' });
            loadMenu();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to create item ❌');
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-lg text-white">
                                <Store className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Vendor Dashboard</h1>
                        </div>
                        <p className="text-gray-500 font-medium ml-1">Welcome back, <span className="text-indigo-600">Huda</span> 👋</p>
                    </div>
                    <div className="flex items-center space-x-1 glass-card p-1.5 rounded-xl shadow-lg border border-white/50">
                        <button
                            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg transition-all font-bold ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-gray-600 hover:bg-white/50'}`}
                            onClick={() => setActiveTab('orders')}>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Orders 📋</span>
                        </button>
                        <button
                            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg transition-all font-bold ${activeTab === 'menu' ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-gray-600 hover:bg-white/50'}`}
                            onClick={() => setActiveTab('menu')}>
                            <Utensils className="w-4 h-4" />
                            <span>Menu 🍱</span>
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 rounded-2xl shadow-xl hover-glow transition-all duration-300 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Orders 📊</p>
                                <p className="text-3xl font-black text-gray-900 mt-2">{totalOrders}</p>
                            </div>
                            <div className="p-4 bg-blue-100 rounded-2xl">
                                <TrendingUp className="w-7 h-7 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl shadow-xl hover-glow transition-all duration-300 border-l-4 border-amber-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Queue 🚶‍♂️</p>
                                <p className="text-3xl font-black text-gray-900 mt-2">{activeOrdersCount}</p>
                            </div>
                            <div className="p-4 bg-amber-100 rounded-2xl">
                                <Users className="w-7 h-7 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl shadow-xl hover-glow transition-all duration-300 border-l-4 border-emerald-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Revenue 💰</p>
                                <p className="text-3xl font-black text-gray-900 mt-2">${totalRevenue.toFixed(2)}</p>
                            </div>
                            <div className="p-4 bg-emerald-100 rounded-2xl">
                                <DollarSign className="w-7 h-7 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {activeTab === 'orders' && (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Action Bar */}
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Token Search */}
                            <div className="flex-1 glass-card p-4 rounded-2xl shadow-md border border-white/50 flex items-center gap-4 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                                <Search className="w-5 h-5 text-indigo-400" />
                                <form onSubmit={handleManualTokenSubmit} className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter token number (e.g. 1234)..."
                                        className="flex-1 bg-transparent outline-none text-gray-700 font-medium placeholder-gray-400"
                                        value={manualToken}
                                        onChange={(e) => setManualToken(e.target.value)}
                                    />
                                    <button type="submit" className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100 transition-colors">Check Status 🔍</button>
                                </form>
                            </div>

                            {/* Scanner Toggle */}
                            <button
                                onClick={() => isScannerOpen ? setIsScannerOpen(false) : startScanner()}
                                className={`px-8 py-4 rounded-2xl shadow-lg font-black transition-all flex items-center gap-3 active:scale-95 ${isScannerOpen ? 'bg-rose-500 text-white' : 'bg-gray-900 text-white hover:bg-black'}`}>
                                <QrCode className="w-6 h-6" />
                                <span>{isScannerOpen ? 'Close Scanner' : 'Scan Token 📱'}</span>
                            </button>
                        </div>

                        {/* Scanner Area */}
                        {isScannerOpen && (
                            <div className="glass-card p-8 rounded-3xl shadow-2xl border border-white flex flex-col items-center animate-fade-in-up">
                                <div className="space-y-2 text-center mb-6">
                                    <h3 className="text-xl font-black text-gray-900">Ready to Scan? 🚀</h3>
                                    <p className="text-gray-500">Center the student's QR code in the frame below</p>
                                </div>
                                <div id="reader" className="w-full max-w-md overflow-hidden rounded-2xl border-4 border-indigo-200"></div>
                            </div>
                        )}

                        {/* Orders Grid */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin-slow" />
                                    Live Orders 🏪
                                </h2>
                                <div className="flex gap-2">
                                    <span className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full border">
                                        Total: {orders.length}
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {orders.length === 0 ? (
                                    <div className="col-span-full py-20 text-center glass-card rounded-3xl border-2 border-dashed border-indigo-100 flex flex-col items-center gap-4">
                                        <div className="p-4 bg-indigo-50 rounded-full">
                                            <ShoppingBag className="w-10 h-10 text-indigo-200" />
                                        </div>
                                        <p className="text-gray-400 font-bold text-lg italic">No active orders right now 😴</p>
                                    </div>
                                ) : (
                                    orders.map(order => (
                                        <div
                                            key={order.id}
                                            className={`group glass-card rounded-3xl shadow-xl border-t-8 overflow-hidden hover:scale-[1.02] transition-all duration-300 
                                                ${order.status === 'ready' ? 'border-emerald-500' :
                                                    order.status === 'preparing' ? 'border-indigo-500 shadow-indigo-100' :
                                                        'border-amber-500 shadow-amber-100'}`}
                                        >
                                            <div className="p-6 space-y-5">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Order</span>
                                                            <span className="text-sm font-black text-gray-900">#{order.id}</span>
                                                        </div>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span className="text-3xl font-black text-indigo-600 font-mono tracking-tighter">{order.token_number}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm
                                                        ${order.status === 'ready' ? 'bg-emerald-500 text-white' :
                                                            order.status === 'preparing' ? 'bg-indigo-600 text-white' :
                                                                'bg-amber-500 text-white'}`}>
                                                        {order.status === 'ready' ? 'READY ✅' : order.status === 'preparing' ? 'PREP 🧑‍🍳' : 'NEW 🔔'}
                                                    </span>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                                        <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                                                            <Utensils className="w-3 h-3" />
                                                            Items
                                                        </p>
                                                        <ul className="space-y-2.5">
                                                            {order.items && order.items.map((item: any, idx: number) => (
                                                                <li key={idx} className="flex justify-between items-center text-sm">
                                                                    <span className="text-gray-700 font-black">{item.menu_item ? item.menu_item.name : 'Item'}</span>
                                                                    <span className="bg-white px-2 py-0.5 rounded-lg border text-xs font-black text-indigo-600">x{item.quantity}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="flex justify-between items-center px-1">
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                            {new Date(order.predicted_pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="text-lg font-black text-gray-900 tracking-tighter">${order.total_price.toFixed(2)}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 pt-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(order.id, 'preparing')}
                                                        disabled={order.status !== 'ordered'}
                                                        className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border-b-4 shadow-lg
                                                            ${order.status === 'ordered'
                                                                ? 'bg-indigo-600 text-white border-indigo-800 hover:scale-105 active:border-b-0 active:translate-y-1'
                                                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed uppercase'}`}
                                                    >
                                                        <ChefHat className="w-4 h-4" />
                                                        Start Prep
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                                                        disabled={order.status === 'ready' || order.status === 'completed'}
                                                        className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border-b-4 shadow-lg
                                                            ${order.status !== 'ready' && order.status !== 'completed'
                                                                ? 'bg-emerald-500 text-white border-emerald-700 hover:scale-105 active:border-b-0 active:translate-y-1'
                                                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed uppercase'}`}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Mark Ready
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
                        {/* Add Item Form */}
                        <div className="lg:col-span-1">
                            <div className="glass-card p-8 rounded-3xl shadow-2xl border border-white sticky top-6">
                                <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                    <Plus className="w-7 h-7 text-indigo-600 p-1.5 bg-indigo-50 rounded-xl" />
                                    Add New Item ✨
                                </h2>
                                <form onSubmit={handleCreateItem} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Item Name 🏷️</label>
                                        <input
                                            placeholder="e.g. Spicy Chicken Burger"
                                            className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold placeholder:font-medium"
                                            value={newItem.name}
                                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Price 💰</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="w-full bg-gray-50 border-2 border-gray-100 p-4 pl-8 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black"
                                                    value={newItem.price || ''}
                                                    onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Prep (m) ⏱️</label>
                                            <input
                                                type="number"
                                                placeholder="10"
                                                className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-black"
                                                value={newItem.prep_time_estimate}
                                                onChange={e => setNewItem({ ...newItem, prep_time_estimate: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <ImageIcon className="w-3 h-3" />
                                            Image URL 🔗
                                        </label>
                                        <input
                                            placeholder="https://example.com/food.jpg"
                                            className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold placeholder:font-medium text-xs"
                                            value={newItem.image_url}
                                            onChange={e => setNewItem({ ...newItem, image_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Description 📝</label>
                                        <textarea
                                            placeholder="Brief description of the item..."
                                            rows={2}
                                            className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold transition-all placeholder:font-medium"
                                            value={newItem.description}
                                            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 border-b-4 border-indigo-900">
                                        Add Item To Menu 🚀
                                    </button>
                                </form>
                                {message && (
                                    <div className={`mt-6 p-4 rounded-2xl text-sm font-black text-center animate-bounce ${message.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                        {message}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Menu List */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                <Utensils className="w-7 h-7 text-indigo-600" />
                                Current Menu 📋
                            </h2>
                            <div className="glass-card rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                                <ul className="divide-y divide-gray-100">
                                    {menuItems.map(item => (
                                        <li key={item.id} className="p-6 hover:bg-white/40 transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 overflow-hidden ${item.is_available ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-100 text-gray-400 grayscale'}`}>
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Utensils className="w-8 h-8" />
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className={`text-lg font-black tracking-tight ${!item.is_available ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.name}</p>
                                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                                                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg border border-emerald-100">${item.price}</span>
                                                        <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg border border-blue-100">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {item.prep_time_estimate} mins
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggleAvailability(item)}
                                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-b-4 active:border-b-0 active:translate-y-1
                                                    ${item.is_available
                                                        ? 'bg-emerald-500 text-white border-emerald-700 hover:bg-emerald-600'
                                                        : 'bg-rose-500 text-white border-rose-700 hover:bg-rose-600'}`}
                                            >
                                                {item.is_available ? 'IN STOCK ✅' : 'SOLD OUT 🚫'}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
