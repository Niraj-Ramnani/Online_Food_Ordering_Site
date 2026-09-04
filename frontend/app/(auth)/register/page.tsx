import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Sparkles } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl">
        {/* Left Form Section */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-white shadow-sm shadow-orange-500/30">
              <Flame className="w-4 h-4 fill-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Quick<span className="text-orange-500">Bite</span>
            </span>
          </Link>

          <RegisterForm />

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 text-center">
            By registering, you agree to our Terms of Service & Privacy Policy.
          </div>
        </div>

        {/* Right Food Visual Section (Desktop) */}
        <div className="hidden lg:block lg:col-span-6 relative bg-slate-900">
          <Image
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000&auto=format&fit=crop&q=80"
            alt="Artisan Pizza Baking"
            fill
            sizes="50vw"
            priority
            className="object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Join 50,000+ Foodies & Sellers</span>
            </div>
            <h3 className="text-2xl font-black">
              Start your flavor journey today
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed max-w-sm">
              Whether you want to discover mouthwatering dishes or grow your restaurant business, QuickBite gives you full control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
