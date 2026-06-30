"use client";

import { motion } from "framer-motion";
import { Calendar, Users, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden bg-background">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
            Sua barbearia merece mais clientes e <span className="text-primary">menos bagunça.</span>
          </h1>
          <p className="text-lg lg:text-xl text-text-secondary mb-10 max-w-lg leading-relaxed">
            Agendamentos online, organização da agenda, histórico de clientes, lembretes automáticos e relatórios completos em uma plataforma moderna, intuitiva e fácil de usar.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
            <Link 
              href="#planos" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-black font-bold text-lg hover:bg-primary-hover transition-all hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
            >
              Comece Agora por R$ 5
            </Link>
            <Link 
              href="/agendar/salaomodelo" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-card text-white border border-white/10 font-bold text-lg hover:bg-white/5 transition-all hover:scale-105"
            >
              Ver Demonstração
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-card flex items-center justify-center text-xs text-white">
                  🧔
                </div>
              ))}
            </div>
            <div className="text-sm text-text-secondary">
              <div className="flex text-[#ffb800] text-lg">★★★★★</div>
              <p>Mais de <strong className="text-white">1.000</strong> barbearias ativas.</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Floating Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:h-[600px] flex items-center justify-center"
        >
          {/* Main Dashboard Panel */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-full max-w-md bg-[#161616] rounded-2xl border border-white/10 shadow-2xl p-6 relative z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg">Agenda de Hoje</h3>
              <div className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full">
                +12 Clientes
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { time: "09:00", name: "Carlos Silva", service: "Cabelo & Barba" },
                { time: "10:30", name: "Marcos Paulo", service: "Degradê" },
                { time: "11:15", name: "João Pedro", service: "Barba" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-white/5">
                  <div className="text-primary font-bold">{item.time}</div>
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-text-secondary text-sm">{item.service}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div 
            animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-10 -left-10 bg-card p-4 rounded-2xl border border-white/10 shadow-xl flex items-center gap-4 z-20"
          >
            <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-white font-bold text-xl">245</p>
              <p className="text-text-secondary text-xs">Agendamentos</p>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -15, 0], x: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-10 -right-4 bg-card p-4 rounded-2xl border border-white/10 shadow-xl flex items-center gap-4 z-20"
          >
            <div className="p-3 rounded-full bg-green-500/20 text-green-400">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-white font-bold text-xl">R$ 8.450</p>
              <p className="text-text-secondary text-xs">Faturamento</p>
            </div>
          </motion.div>
          
        </motion.div>
      </div>
    </section>
  );
}
