'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { BarChart3, TrendingUp, Users, Scissors } from 'lucide-react';
import styles from './relatorios.module.css';

export default function RelatoriosPage() {
  const [periodo, setPeriodo] = useState('mes');

  // Dados mockados
  const kpis = [
    { titulo: 'Faturamento Bruto', valor: 'R$ 4.250,00', cresc: '+12%', icon: <TrendingUp size={20} color="#16a34a" /> },
    { titulo: 'Novos Clientes', valor: '24', cresc: '+5%', icon: <Users size={20} color="#3b82f6" /> },
    { titulo: 'Serviços Feitos', valor: '142', cresc: '+18%', icon: <Scissors size={20} color="#a855f7" /> },
  ];

  const servicosPopulares = [
    { nome: 'Corte Social', qtd: 45, percent: 31 },
    { nome: 'Corte + Barba', qtd: 38, percent: 26 },
    { nome: 'Degradê', qtd: 35, percent: 24 },
    { nome: 'Sobrancelha', qtd: 24, percent: 19 },
  ];

  return (
    <div style={{ paddingBottom: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b', margin: 0 }}>Relatórios</h1>
        <select 
          value={periodo} 
          onChange={(e) => setPeriodo(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e4e4e7', backgroundColor: '#fff', fontSize: '0.875rem', fontWeight: 600, color: '#18181b', outline: 'none' }}
        >
          <option value="semana">Últimos 7 dias</option>
          <option value="mes">Este Mês</option>
          <option value="ano">Este Ano</option>
        </select>
      </div>

      <div className={styles.kpiGrid}>
        {kpis.map((kpi, idx) => (
          <Card key={idx} style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.02)' }}>
            <CardContent style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {kpi.icon}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', backgroundColor: 'rgba(34,197,94,0.1)', padding: '0.25rem 0.5rem', borderRadius: '12px' }}>
                  {kpi.cresc}
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#71717a', fontWeight: 600, marginBottom: '0.25rem' }}>{kpi.titulo}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>{kpi.valor}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} color="#16a34a" /> Serviços Mais Procurados
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {servicosPopulares.map((servico, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, color: '#18181b', marginBottom: '0.5rem' }}>
                <span>{servico.nome}</span>
                <span>{servico.qtd} ({servico.percent}%)</span>
              </div>
              <div style={{ width: '100%', height: 8, backgroundColor: '#f4f4f5', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${servico.percent}%`, height: '100%', backgroundColor: '#16a34a', borderRadius: '4px' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
