"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const features = [
  "Agendamento online 24/7",
  "Agenda por barbeiro",
  "Clientes ilimitados",
  "Serviços ilimitados",
  "Histórico completo",
  "Lembretes automáticos via WhatsApp",
  "Relatórios financeiros",
  "Dashboard gerencial",
  "Atualizações constantes",
  "Suporte prioritário"
];

export default function Pricing() {
  return (
    <section className="py-24 bg-background relative" id="planos">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black text-white mb-6"
          >
            Invista na sua barbearia pelo preço de <span className="text-primary">um café.</span>
          </motion.h2>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="relative p-1 rounded-3xl bg-gradient-to-b from-primary/50 to-background">
            <div className="bg-card rounded-[22px] p-8 sm:p-10 text-center relative overflow-hidden">
              {/* Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-primary/20 blur-[60px] pointer-events-none" />
              
              <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Plano BarberSaaS</h3>
              <p className="text-text-secondary mb-6 relative z-10">Tudo incluso. Sem taxas escondidas.</p>
              
              <div className="mb-8 relative z-10">
                <p className="text-sm text-text-secondary font-medium uppercase tracking-wider mb-2">Primeiro mês</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xl font-bold text-white">R$</span>
                  <span className="text-6xl font-black text-white">5</span>
                  <span className="text-xl font-bold text-white">,00</span>
                </div>
                <p className="text-text-secondary mt-2">Depois R$ 44,90/mês</p>
              </div>

              <div className="space-y-4 mb-10 text-left relative z-10">
                {features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-primary" />
                    </div>
                    <span className="text-white/80">{feat}</span>
                  </div>
                ))}
              </div>

              <Link 
                href="/barbeiro" 
                className="block w-full py-4 rounded-xl bg-primary text-black font-bold text-lg hover:bg-primary-hover transition-colors shadow-[0_0_20px_rgba(34,197,94,0.3)] relative z-10"
              >
                Começar Agora
              </Link>
              <p className="text-xs text-text-secondary mt-4 relative z-10">
                Sem fidelidade • Cancele quando quiser
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
