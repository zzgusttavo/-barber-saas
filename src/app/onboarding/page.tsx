'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './onboarding.module.css';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    barbershopName: '',
    phone: '',
    address: '',
    barberName: '',
  });

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finaliza onboarding e vai para o dashboard
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.barbershopName.length > 2;
      case 2:
        return formData.phone.length > 8 && formData.address.length > 5;
      case 3:
        return formData.barberName.length > 2;
      default:
        return false;
    }
  };

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <h1 className={`${styles.title} text-gradient`}>Bem-vindo ao BarberSaaS</h1>
        <p className={styles.subtitle}>Vamos configurar sua barbearia em poucos passos.</p>
      </div>

      <Card className={styles.onboardingCard} glass>
        <CardContent>
          <div className={styles.stepIndicator}>
            {[1, 2, 3].map((step) => (
              <div 
                key={step} 
                className={`${styles.dot} ${step === currentStep ? styles.dotActive : ''}`} 
              />
            ))}
          </div>

          <div className={styles.slideIn} key={currentStep}>
            {currentStep === 1 && (
              <div className={styles.formArea}>
                <h2 className={styles.title} style={{ fontSize: '1.25rem' }}>Como se chama sua barbearia?</h2>
                <Input 
                  label="Nome da Barbearia" 
                  name="barbershopName"
                  placeholder="Ex: Barbearia do João" 
                  value={formData.barbershopName}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className={styles.formArea}>
                <h2 className={styles.title} style={{ fontSize: '1.25rem' }}>Onde vocês estão?</h2>
                <Input 
                  label="Telefone (WhatsApp)" 
                  name="phone"
                  placeholder="(00) 00000-0000" 
                  value={formData.phone}
                  onChange={handleChange}
                  autoFocus
                />
                <Input 
                  label="Endereço Completo" 
                  name="address"
                  placeholder="Rua, Número, Bairro - Cidade" 
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className={styles.formArea}>
                <h2 className={styles.title} style={{ fontSize: '1.25rem' }}>Quem é o barbeiro principal?</h2>
                <p className={styles.subtitle} style={{ marginBottom: '1rem' }}>
                  Você poderá adicionar mais profissionais depois.
                </p>
                <Input 
                  label="Nome do Barbeiro" 
                  name="barberName"
                  placeholder="Seu nome ou nome do profissional" 
                  value={formData.barberName}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <Button 
              variant="ghost" 
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Voltar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              {currentStep === TOTAL_STEPS ? 'Ir para o Painel' : 'Próximo'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
