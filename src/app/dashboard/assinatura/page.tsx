'use client';

import React, { useState, useEffect } from 'react';
import styles from './assinatura.module.css';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AssinaturaPage() {
  const [subData, setSubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/subscriptions/status')
      .then(res => res.json())
      .then(data => {
        setSubData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const isFirstMonth = !subData?.mpSubscriptionId || subData?.mpSubscriptionStatus === 'pending' || (subData?.trialEndsAt && new Date(subData.trialEndsAt) > new Date());
  const isActive = subData?.mpSubscriptionStatus === 'authorized' || subData?.mpSubscriptionStatus === 'active';
  
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando dados da assinatura...</div>;
  }

  const startDate = subData?.createdAt ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(subData.createdAt)) : 'Indisponível';
  const nextBilling = subData?.mpNextBillingDate ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(subData.mpNextBillingDate)) : 'Aguardando pagamento';

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
              <div className={styles.planStatus} style={{ color: isActive ? '#16a34a' : (subData?.mpSubscriptionStatus === 'cancelled' ? '#ef4444' : '#eab308'), backgroundColor: isActive ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                {isActive ? 'Ativa' : (subData?.mpSubscriptionStatus === 'cancelled' ? 'Cancelada' : 'Pendente / Trial')}
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
              <span className={styles.infoLabel}>Início da conta</span>
              <span className={styles.infoValue}>{startDate}</span>
            </div>
            {subData?.mpSubscriptionId && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Próxima cobrança</span>
                <span className={styles.infoValue}>{nextBilling} (R$ 44,90)</span>
              </div>
            )}
          </div>

          <div className={`${styles.actions} flex flex-col-reverse sm:flex-row w-full gap-4`}>
            <Button variant="ghost" style={{ color: 'var(--danger-color)' }} className="w-full sm:w-auto" onClick={() => alert('Para cancelar, acesse a área de assinaturas do Mercado Pago.')}>
              Cancelar Assinatura
            </Button>
            <Button variant="accent" className="w-full sm:w-auto" onClick={() => window.open('https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=2c9380848f956c86018f99e46a7d0139', '_blank')}>
              Gerenciar no Mercado Pago
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
