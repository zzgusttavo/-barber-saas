"use client";

import { motion } from "framer-motion";
import { Calendar, Users, BarChart, Bell, Smartphone, Scissors } from "lucide-react";

const features = [
  { icon: Calendar, title: "Agendamento Online", desc: "Seu cliente agenda sozinho 24h por dia." },
  { icon: Users, title: "Gestão de Clientes", desc: "Histórico completo de quem frequenta seu salão." },
  { icon: Bell, title: "Lembretes no Zap", desc: "Reduza faltas com mensagens automáticas." },
  { icon: BarChart, title: "Relatórios", desc: "Saiba exatamente quanto você está ganhando." },
  { icon: Smartphone, title: "Painel Responsivo", desc: "Acesse tudo do seu celular ou computador." },
  { icon: Scissors, title: "Múltiplos Barbeiros", desc: "Cada profissional tem sua própria agenda." }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Solution() {
  return (
    <section className="py-24 bg-background relative overflow-hidden" id="recursos">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black text-white mb-6"
          >
            Tudo o que sua barbearia precisa em um <span className="text-primary">único sistema.</span>
          </motion.h2>
          <p className="text-text-secondary text-lg">
            Esqueça as planilhas e cadernos. O BarberFlow tem todas as ferramentas para profissionalizar seu negócio.
          </p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feat, i) => (
            <motion.div 
              key={i}
              variants={item}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-8 rounded-2xl bg-card border border-white/5 hover:border-primary/30 transition-colors group cursor-default"
            >
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-white mb-6 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                <feat.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
              <p className="text-text-secondary leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
