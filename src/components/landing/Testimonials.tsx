"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Gustavo Henrique",
    role: "Barbearia do Gustavo",
    content: "O sistema mudou a forma como eu gerencio meu salão. O robô do WhatsApp reduziu minhas faltas a quase zero. Vale cada centavo!",
  },
  {
    name: "Carlos Eduardo",
    role: "Barber King",
    content: "A agenda no celular é perfeita. Meus clientes agendam sozinhos de madrugada e eu só acordo com as notificações de dinheiro entrando.",
  },
  {
    name: "Rafael Souza",
    role: "Studio Rafael",
    content: "Muito mais fácil de usar do que os outros sistemas caros do mercado. A interface é limpa e não trava nunca.",
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-background relative border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black text-white mb-6"
          >
            Quem usa, recomenda.
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 mb-4 text-[#ffb800]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-text-secondary text-lg leading-relaxed mb-6 italic">
                  "{review.content}"
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold">{review.name}</h4>
                <p className="text-primary text-sm font-medium">{review.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
