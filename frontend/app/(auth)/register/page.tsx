import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Flame, ShieldCheck, Sparkles, Store, Utensils } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create an Account — QuickBite",
  description: "Join QuickBite as a Customer to order delicious food or as a Seller to grow your restaurant business.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual Column (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 text-white overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80"
            alt="Warm inviting restaurant ambiance"
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

          {/* Middle Value Props */}
          <div className="relative z-10 space-y-5 my-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-orange-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Join 50,000+ Foodies & Sellers</span>
            </div>

            <h2 className="text-2xl font-black leading-snug">
              One platform for foodies and restaurant owners.
            </h2>

            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                  <Check className="w-3 h-3" />
                </div>
                <span>Fast 25-minute deliveries with live GPS tracking</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                  <Check className="w-3 h-3" />
                </div>
                <span>Instant seller onboarding & menu management</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                  <Check className="w-3 h-3" />
                </div>
                <span>Zero commission on your first 30 days as a partner</span>
              </li>
            </ul>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Encrypted Data Privacy</span>
            </div>
            <span>No credit card required</span>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center">
          <div className="w-full max-w-md space-y-1.5 mb-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Create your account ✨
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Choose your role and start ordering or selling today.
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
