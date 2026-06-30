"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Building2, Store, Check, ArrowLeft, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    businessName: "",
    termsAccepted: false,
    businessSize: "",
    teamSize: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const setBusinessSize = (size: string) => {
    setFormData((prev) => ({ ...prev, businessSize: size }));
  };

  const setTeamSize = (size: string) => {
    setFormData((prev) => ({ ...prev, teamSize: size }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    } else {
      router.push("/barbeiro");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.fullName.length > 2 &&
          formData.phone.length > 8 &&
          formData.email.includes("@") &&
          formData.businessName.length > 2 &&
          formData.termsAccepted
        );
      case 2:
        return formData.businessSize !== "";
      case 3:
        return formData.teamSize !== "";
      case 4:
        return formData.password.length >= 6;
      default:
        return false;
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <main className="min-h-screen bg-background flex flex-col lg:flex-row font-sans selection:bg-primary/30 selection:text-white">
      
      {/* Coluna Esquerda: Promoção e Branding (Oculta no mobile pequeno, topo no tablet) */}
      <section className="hidden lg:flex lg:w-[45%] relative bg-[#050505] flex-col p-12 border-r border-white/5 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-2 text-white font-bold text-2xl mb-24 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black">
            <Scissors size={20} />
          </div>
          Agenda Barber
        </div>

        <div className="relative z-10 mt-auto mb-auto">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.2] tracking-tight mb-8">
            Tudo para você <br/>simplificar a sua gestão <br/>em um só lugar.
          </h1>
          <h2 className="text-3xl xl:text-4xl font-bold text-primary leading-tight">
            Aqui, ela acontece <br/>num piscar de olhos.
          </h2>
        </div>

        {/* Floating Mockup Illusion */}
        <motion.div 
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-10 w-96 h-96 bg-card rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rotate-[-10deg] opacity-50 pointer-events-none hidden xl:block"
        >
          <div className="p-6 border-b border-white/5 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
            <div className="w-3 h-3 rounded-full bg-green-500/20" />
          </div>
          <div className="p-6 space-y-4">
            <div className="w-full h-8 bg-white/5 rounded-md" />
            <div className="w-3/4 h-8 bg-white/5 rounded-md" />
            <div className="w-5/6 h-8 bg-white/5 rounded-md" />
          </div>
        </motion.div>
      </section>

      {/* Coluna Direita: Formulário Interativo */}
      <section className="flex-1 flex flex-col bg-[#0a0a0a] relative overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center p-6 border-b border-white/5 bg-background">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-black mr-3">
            <Scissors size={16} />
          </div>
          <span className="text-white font-bold text-lg">Agenda Barber</span>
        </div>

        <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto p-4 md:p-12 lg:p-16 xl:p-24 justify-center min-h-[80vh] md:min-h-[600px]">
          
          {/* Progress Indicator */}
          <div className="mb-6 md:mb-12">
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div 
                  key={step} 
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step <= currentStep ? 'bg-primary' : 'bg-white/10'}`} 
                />
              ))}
            </div>
            {currentStep > 1 && (
              <button 
                onClick={prevStep}
                className="flex items-center text-sm font-medium text-text-secondary hover:text-white transition-colors"
              >
                <ArrowLeft size={16} className="mr-1" /> Voltar
              </button>
            )}
          </div>

          {/* Form Area */}
          <div className="relative min-h-[350px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full"
              >
                
                {/* STEP 1: Dados Base */}
                {currentStep === 1 && (
                  <div>
                    <div className="text-center mb-8 md:mb-10">
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Cadastre seu negócio</h2>
                      <p className="text-text-secondary text-sm md:text-base">Bora dar um up na sua gestão.</p>
                    </div>

                    <div className="space-y-4 md:space-y-5">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Nome completo</label>
                        <input 
                          type="text" 
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full bg-card border border-white/10 rounded-xl px-3 py-3 md:px-4 md:py-3.5 text-sm md:text-base text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                          placeholder="Ex: Gustavo Henrique"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Celular (WhatsApp)</label>
                        <input 
                          type="text" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-card border border-white/10 rounded-xl px-3 py-3 md:px-4 md:py-3.5 text-sm md:text-base text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">E-mail</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-card border border-white/10 rounded-xl px-3 py-3 md:px-4 md:py-3.5 text-sm md:text-base text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                          placeholder="seuemail@exemplo.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Nome do negócio</label>
                        <input 
                          type="text" 
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleChange}
                          className="w-full bg-card border border-white/10 rounded-xl px-3 py-3 md:px-4 md:py-3.5 text-sm md:text-base text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                          placeholder="Ex: Barbearia do Gustavo"
                        />
                      </div>

                      <div className="pt-2 md:pt-4">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center mt-1">
                            <input 
                              type="checkbox" 
                              name="termsAccepted"
                              checked={formData.termsAccepted}
                              onChange={handleChange}
                              className="peer sr-only"
                            />
                            <div className="w-5 h-5 rounded border-2 border-white/20 bg-card peer-checked:bg-primary peer-checked:border-primary transition-all group-hover:border-white/40" />
                            <Check size={14} className="absolute text-black opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                          </div>
                          <span className="text-sm text-text-secondary leading-relaxed">
                            Li e aceito o <Link href="#" className="text-white hover:text-primary underline underline-offset-2">termo de uso</Link> e a <Link href="#" className="text-white hover:text-primary underline underline-offset-2">política de privacidade</Link>.
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Tamanho do Negócio */}
                {currentStep === 2 && (
                  <div>
                    <div className="text-center mb-8 md:mb-10">
                      <p className="text-primary text-xs md:text-sm font-bold uppercase tracking-wider mb-2">Informações adicionais</p>
                      <h2 className="text-2xl md:text-3xl font-black text-white">Tamanho do negócio</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                      <button
                        onClick={() => setBusinessSize("unico")}
                        className={`p-4 md:p-6 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-3 md:gap-4 ${
                          formData.businessSize === "unico" 
                            ? "border-primary bg-primary/10 text-white" 
                            : "border-white/10 bg-card text-text-secondary hover:border-white/30 hover:text-white"
                        }`}
                      >
                        <Store size={28} className={formData.businessSize === "unico" ? "text-primary" : "text-white/40"} />
                        <span className="font-bold text-base md:text-lg">Estabelecimento único</span>
                      </button>

                      <button
                        onClick={() => setBusinessSize("rede")}
                        className={`p-4 md:p-6 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-3 md:gap-4 ${
                          formData.businessSize === "rede" 
                            ? "border-primary bg-primary/10 text-white" 
                            : "border-white/10 bg-card text-text-secondary hover:border-white/30 hover:text-white"
                        }`}
                      >
                        <Building2 size={28} className={formData.businessSize === "rede" ? "text-primary" : "text-white/40"} />
                        <span className="font-bold text-base md:text-lg">Rede ou Franquia</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Equipe */}
                {currentStep === 3 && (
                  <div>
                    <div className="text-center mb-8 md:mb-10">
                      <p className="text-primary text-xs md:text-sm font-bold uppercase tracking-wider mb-2">Informações adicionais</p>
                      <h2 className="text-xl md:text-3xl font-black text-white">Número de profissionais</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                      {["1 prof.", "2 prof.", "3 a 4", "5 a 10", "11 a 30", "Mais de 30"].map((size) => (
                        <button
                          key={size}
                          onClick={() => setTeamSize(size)}
                          className={`p-3 md:p-4 rounded-xl border-2 text-center text-sm md:text-base transition-all ${
                            formData.teamSize === size 
                              ? "border-primary bg-primary/10 text-white font-bold" 
                              : "border-white/10 bg-card text-text-secondary hover:border-white/30 hover:text-white font-medium"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: Senha */}
                {currentStep === 4 && (
                  <div>
                    <div className="text-center mb-8 md:mb-10">
                      <p className="text-primary text-xs md:text-sm font-bold uppercase tracking-wider mb-2">Informações adicionais</p>
                      <h2 className="text-2xl md:text-3xl font-black text-white">Defina sua senha</h2>
                    </div>

                    <div className="max-w-sm mx-auto">
                      <div className="relative mb-8">
                        <label className="block text-xs md:text-sm font-medium text-text-secondary mb-1">Senha de acesso ao painel</label>
                        <div className="relative">
                          <input 
                            type="password" 
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-card border border-white/10 rounded-xl pl-11 pr-4 py-3 md:py-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-medium tracking-widest"
                            placeholder="••••••••"
                          />
                          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        </div>
                        <p className="text-xs text-text-secondary mt-2">Mínimo de 6 caracteres.</p>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Button */}
          <div className="mt-12 flex justify-center w-full">
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className={`w-full max-w-sm py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                isStepValid() 
                  ? "bg-primary text-black hover:bg-primary-hover shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] scale-100" 
                  : "bg-white/5 text-white/30 cursor-not-allowed scale-95"
              }`}
            >
              {currentStep === TOTAL_STEPS ? (
                <>Finalizar Cadastro</>
              ) : (
                <>Continuar <ArrowRight size={18} /></>
              )}
            </button>
          </div>

        </div>
      </section>
    </main>
  );
}
