'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Store, LogOut, User, Menu, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2 group transition-all">
              <div className="p-2 bg-indigo-600 rounded-xl group-hover:rotate-6 transition-transform shadow-lg shadow-indigo-100">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl text-gray-900 tracking-tighter">
                Canteen<span className="text-indigo-600">Rush</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {user?.role === 'student' && (
                <>
                  <Link href="/menu" className="px-5 py-2 rounded-xl text-sm font-black text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2">
                    Menu 🍱
                  </Link>
                  <Link href="/orders" className="px-5 py-2 rounded-xl text-sm font-black text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2">
                    My Orders 🎫
                  </Link>
                </>
              )}
              {user?.role === 'vendor' && (
                <Link href="/vendor" className="px-5 py-2 rounded-xl text-sm font-black text-indigo-600 bg-indigo-50 transition-all flex items-center gap-2">
                  Vendor Dashboard 📊
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-black text-gray-900 leading-none">{user.username}</span>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{user.role}</span>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 border-2 border-white shadow-sm">
                  <User className="w-5 h-5" />
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-rose-500 transition-colors uppercase font-black text-[10px] tracking-widest"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="px-6 py-2.5 rounded-xl text-sm font-black text-gray-600 hover:bg-gray-50 transition-all">
                  Sign In
                </Link>
                <Link href="/register" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                  Join Now
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar (Basic) */}
      {isMenuOpen && (
        <div className="md:hidden glass-card absolute top-full left-0 right-0 border-t border-gray-100 animate-fade-in-up">
          <div className="p-6 space-y-4">
            {user?.role === 'student' && (
              <>
                <Link href="/menu" className="block font-black text-gray-600">Menu 🍱</Link>
                <Link href="/orders" className="block font-black text-gray-600">My Orders 🎫</Link>
              </>
            )}
            {user?.role === 'vendor' && (
              <Link href="/vendor" className="block font-black text-indigo-600">Vendor Dashboard 📊</Link>
            )}
            {!user && (
              <>
                <Link href="/login" className="block font-black text-gray-600">Sign In</Link>
                <Link href="/register" className="block font-black text-indigo-600">Join Now</Link>
              </>
            )}
            {user && (
              <button onClick={logout} className="w-full text-left font-black text-rose-500 pt-4 border-t border-gray-100">Logout 👋</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
