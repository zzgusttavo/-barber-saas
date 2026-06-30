"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
      
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl lg:text-6xl font-black text-black mb-8 leading-tight">
            Sua agenda pode ser muito mais organizada.
          </h2>
          <p className="text-xl text-black/80 mb-10 font-medium">
            Experimente o Agenda Barber e descubra como é simples gerenciar sua barbearia com uma plataforma moderna, rápida e intuitiva.
          </p>
          
          <Link 
            href="/barbeiro" 
            className="inline-block px-10 py-5 rounded-full bg-black text-white font-black text-xl hover:bg-gray-900 transition-all hover:scale-105 shadow-2xl"
          >
            Quero Começar por R$ 5
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
