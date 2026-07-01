'use client';

import React from 'react';
import styles from './assinatura.module.css';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AssinaturaPage() {
  const isFirstMonth = true; // Mock: indica se está no período promocional
  
  return (
    <div className={styles.container}>
      <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>
        Minha Assinatura
      </h1>

      <Card className={styles.planCard}>
        <div className={styles.badge}>Plano Único</div>
        <CardContent>
          <div className={styles.planHeader}>
            <div>
              <h2 className={styles.planTitle}>Plano Profissional</h2>
              <div className={styles.planStatus}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                Ativa
              </div>
            </div>

            <div className={styles.priceContainer}>
              {isFirstMonth ? (
                <>
                  <div className={styles.pricePromo}>
                    <span className={styles.currency}>R$</span>
                    0,00
                    <span className={styles.period}>/ 7 dias</span>
                  </div>
                  <div className={styles.priceNormal}>Depois R$ 44,90/mês</div>
                </>
              ) : (
                <div className={styles.pricePromo}>
                  <span className={styles.currency}>R$</span>
                  44,90
                  <span className={styles.period}>/ mês</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.alertBox}>
            <div className={styles.alertIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <p className={styles.alertText}>
              Comece hoje com <strong>7 dias totalmente grátis</strong>. Após o período de teste, sua assinatura será renovada via Mercado Pago por R$ 44,90/mês. Você pode cancelar a qualquer momento.
            </p>
          </div>

          <ul className={styles.featuresList}>
            {[
              'Agendamento online ilimitado',
              'Agenda individual por barbeiro',
              'Cadastro ilimitado de clientes',
              'Lembretes automáticos (WhatsApp)',
              'Histórico completo de clientes',
              'Relatórios de faturamento',
              'Dashboard gerencial',
              'Suporte premium'
            ].map((feature, idx) => (
              <li key={idx} className={styles.featureItem}>
                <svg className={styles.checkIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                {feature}
              </li>
            ))}
          </ul>

          <div className={styles.billingInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Início da assinatura</span>
              <span className={styles.infoValue}>29 de Junho de 2026</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Próxima cobrança</span>
              <span className={styles.infoValue}>29 de Julho de 2026 (R$ 44,90)</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Forma de pagamento</span>
              <span className={styles.infoValue}>Cartão final •••• 4242</span>
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="ghost" style={{ color: 'var(--danger-color)' }} onClick={() => alert('Para cancelar, acesse a área de assinaturas do Mercado Pago.')}>
              Cancelar Assinatura
            </Button>
            <Button variant="accent" onClick={() => window.open('https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380848f956c86018f99e46a7d0139', '_blank')}>
              Gerenciar no Mercado Pago
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
