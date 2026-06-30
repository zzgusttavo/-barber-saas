"use client";

import { motion } from "framer-motion";

const steps = [
  { title: "Cadastre sua barbearia", desc: "Crie sua conta em 30 segundos." },
  { title: "Configure seus profissionais", desc: "Adicione sua equipe e os horários de cada um." },
  { title: "Cadastre seus serviços", desc: "Corte, barba, pigmentação e os preços." },
  { title: "Receba agendamentos", desc: "Compartilhe seu link e deixe os clientes agendarem sozinhos." },
  { title: "Organize sua rotina", desc: "Acompanhe tudo pelo painel enquanto o robô cuida do Zap." }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-[#0a0a0a] relative" id="como-funciona">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black text-white"
          >
            É muito simples começar.
          </motion.h2>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-0.5 bg-white/10 md:-translate-x-1/2" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative flex items-center md:justify-between ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Number Circle */}
                <div className="absolute left-0 md:left-1/2 w-14 h-14 rounded-full bg-background border-4 border-[#0a0a0a] shadow-[0_0_0_2px_rgba(34,197,94,0.3)] md:-translate-x-1/2 flex items-center justify-center z-10 text-primary font-bold text-xl">
                  {i + 1}
                </div>

                <div className="ml-20 md:ml-0 md:w-[45%] bg-card p-6 rounded-2xl border border-white/5 shadow-lg">
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-text-secondary">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
