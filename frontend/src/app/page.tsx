import Link from 'next/link';
import { Store, Zap, Clock, ArrowRight, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-white to-indigo-50/50">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-50/50 blur-[120px] -z-10 rounded-full"></div>
      <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-amber-50/50 blur-[100px] -z-10 rounded-full animate-pulse"></div>

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56 space-y-16 animate-fade-in-up">
          <div className="text-center space-y-8">
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-black text-xs uppercase tracking-[0.2em] shadow-sm mb-4">
              <Star className="w-4 h-4 fill-indigo-600" />
              Next-Gen Campus Dining
            </div>

            <h1 className="text-6xl font-black tracking-tighter text-gray-900 sm:text-8xl leading-[0.9]">
              Beat the <span className="text-indigo-600 underline decoration-8 decoration-indigo-200 underline-offset-8 italic">Rush</span>, <br />
              Taste the Future.
            </h1>

            <p className="mx-auto max-w-xl text-lg sm:text-2xl leading-relaxed text-gray-500 font-bold">
              Smart <span className="text-gray-900">pre-ordering</span> for your campus. Skip the line, predict your pickup time, and reclaim your break. 🚀
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/menu"
                className="w-full sm:w-auto px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-900"
              >
                Start Ordering 🍔
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-12 py-6 glass-card rounded-[2rem] font-black text-xl text-gray-900 hover:bg-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg border border-white"
              >
                Vendor Portal 🏪
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
            <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-white space-y-4 hover:scale-105 transition-transform">
              <div className="p-4 bg-amber-100 rounded-2xl w-fit">
                <Zap className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Lightning Fast</h3>
              <p className="text-gray-500 font-bold text-sm">Pre-order in seconds and have your meal ready when you arrive.</p>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-white space-y-4 hover:scale-105 transition-transform">
              <div className="p-4 bg-indigo-100 rounded-2xl w-fit">
                <Clock className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Smart Prediction</h3>
              <p className="text-gray-500 font-bold text-sm">AI-powered pickup estimates so you never wait a second too long.</p>
            </div>

            <div className="glass-card p-8 rounded-[2.5rem] shadow-xl border border-white space-y-4 hover:scale-105 transition-transform">
              <div className="p-4 bg-emerald-100 rounded-2xl w-fit">
                <Store className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Vendor Direct</h3>
              <p className="text-gray-500 font-bold text-sm">Order directly from your favorite campus stalls with real-time updates.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
