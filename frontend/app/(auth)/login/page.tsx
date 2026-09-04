import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, ShieldCheck, Sparkles, Star } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In — QuickBite",
  description: "Sign in to your QuickBite account to order delicious meals and track deliveries.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual Column (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 text-white overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80"
            alt="Delicious gourmet food platter"
            fill
            priority
            sizes="500px"
            className="object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg">
                <Flame className="w-6 h-6 fill-white" />
              </div>
              <span className="text-2xl font-black text-white">
                Quick<span className="text-orange-400">Bite</span>
              </span>
            </Link>
          </div>

          {/* Middle Highlight Quote */}
          <div className="relative z-10 space-y-4 my-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-orange-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Food Experience</span>
            </div>
            <h2 className="text-2xl font-black leading-snug">
              Order from over 500+ top local restaurants.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Track your meal live with real-time WebSocket sync, secure Razorpay checkout, and speedy doorstep delivery.
            </p>
          </div>

          {/* Bottom Trust Stat */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Secure Auth</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>4.9 / 5.0 Rating</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center">
          <div className="w-full max-w-md space-y-2 mb-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Welcome back! 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter your credentials to access your QuickBite account.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
