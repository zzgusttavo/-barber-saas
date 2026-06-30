"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Scissors } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/50 backdrop-blur-md border-b border-white/5"
    >
      <div className="flex items-center gap-2 text-white font-bold text-xl">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-black">
          <Scissors size={18} />
        </div>
        BarberSaaS
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
        <Link href="#recursos" className="hover:text-white transition-colors">Recursos</Link>
        <Link href="#como-funciona" className="hover:text-white transition-colors">Como funciona</Link>
        <Link href="#planos" className="hover:text-white transition-colors">Planos</Link>
        <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/barbeiro" className="hidden md:block text-sm font-medium text-white hover:text-primary transition-colors">
          Entrar
        </Link>
        <Link 
          href="#planos" 
          className="px-5 py-2.5 rounded-full bg-primary text-black font-bold text-sm hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
        >
          Começar Agora
        </Link>
      </div>
    </motion.nav>
  );
}
