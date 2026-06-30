"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Scissors, Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/barbeiro");
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-black mb-4 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <Scissors size={24} />
          </div>
          <h1 className="text-2xl font-black text-white">Acesse seu Painel</h1>
          <p className="text-white/50 text-sm mt-1">Bem-vindo de volta ao Agenda Barber</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">E-mail</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white focus:outline-none focus:border-primary/50 transition-all"
                placeholder="seuemail@exemplo.com"
              />
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Senha</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white focus:outline-none focus:border-primary/50 transition-all tracking-widest"
                placeholder="••••••••"
              />
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-black font-bold py-4 rounded-xl mt-6 hover:bg-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
          >
            {loading ? "Entrando..." : (
              <>Entrar no Painel <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/40 text-sm">
            Não tem uma conta? <Link href="/#planos" className="text-primary hover:underline font-medium">Teste Grátis</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
