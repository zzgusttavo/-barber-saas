"use client";

import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

const problems = [
  "Horários esquecidos pelos clientes",
  "Clientes faltando sem avisar",
  "Agenda no papel totalmente desorganizada",
  "Muito tempo perdido respondendo mensagens",
  "Difícil acompanhar o faturamento no fim do dia"
];

export default function Problem() {
  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 leading-tight">
            Sua agenda ainda <br/>vive no <span className="text-[#25D366]">WhatsApp?</span>
          </h2>
          
          <div className="space-y-4">
            {problems.map((prob, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-red-500/10"
              >
                <XCircle className="text-red-500 flex-shrink-0" />
                <p className="text-text-secondary font-medium">{prob}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative h-[500px] rounded-3xl overflow-hidden border border-white/10"
        >
          {/* Abstract representation of chaos */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-background flex flex-col items-center justify-center p-8">
             <div className="w-full max-w-sm space-y-3 blur-[2px] opacity-50">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="h-16 w-full bg-card rounded-xl border border-white/5 flex items-center px-4">
                   <div className="w-10 h-10 rounded-full bg-white/5 mr-4"/>
                   <div className="h-4 w-1/2 bg-white/10 rounded"/>
                 </div>
               ))}
             </div>
             <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm">
                <p className="text-white font-bold text-2xl text-center px-6">
                  Chega de perder tempo e dinheiro com organização amadora.
                </p>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
