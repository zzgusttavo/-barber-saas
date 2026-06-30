"use client";

import { Scissors } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-background pt-16 pb-8 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Scissors size={18} />
            </div>
            BarberFlow
          </div>
          
          <div className="flex gap-6 text-text-secondary">
            <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
            <Link href="#" className="hover:text-white transition-colors">Facebook</Link>
            <Link href="#" className="hover:text-white transition-colors">WhatsApp</Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-sm text-text-secondary gap-4">
          <p>© 2026 BarberFlow. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">Política de Privacidade</Link>
            <Link href="#" className="hover:text-white transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
