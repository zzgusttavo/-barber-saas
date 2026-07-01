'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Banknote, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, Calendar } from 'lucide-react';
import styles from './caixa.module.css';

export default function MeuCaixaPage() {
  const [filter, setFilter] = useState('hoje'); // hoje, semana, mes
  const [caixaData, setCaixaData] = useState<any>({ transacoes: [], totalEntradas: 0, totalSaidas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/meu-caixa?filter=${filter}`)
      .then(res => res.json())
      .then(data => {
        setCaixaData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  const { transacoes, totalEntradas, totalSaidas } = caixaData;
  const saldoLiquido = totalEntradas - totalSaidas;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div style={{ paddingBottom: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {loading && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, backgroundColor: '#16a34a', zIndex: 50, animation: 'pulse 1.5s infinite' }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b', margin: 0 }}>Meu Caixa</h1>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e4e4e7', backgroundColor: '#fff', fontSize: '0.875rem', fontWeight: 600, color: '#18181b', outline: 'none' }}
        >
          <option value="hoje">Hoje</option>
          <option value="semana">Esta Semana</option>
          <option value="mes">Este Mês</option>
        </select>
      </div>

      <div className={styles.kpiGrid}>
        <Card style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.02)' }}>
          <CardContent style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="#16a34a" />
              </div>
              <span style={{ fontSize: '0.875rem', color: '#71717a', fontWeight: 600 }}>Entradas</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>{formatCurrency(totalEntradas)}</div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.02)' }}>
          <CardContent style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingDown size={16} color="#ef4444" />
              </div>
              <span style={{ fontSize: '0.875rem', color: '#71717a', fontWeight: 600 }}>Saídas</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b' }}>{formatCurrency(totalSaidas)}</div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#16a34a', border: 'none', color: '#fff' }} className={styles.balanceCard}>
          <CardContent style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={16} color="#fff" />
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, opacity: 0.9 }}>Saldo Líquido</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{formatCurrency(saldoLiquido)}</div>
          </CardContent>
        </Card>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#18181b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#16a34a" /> Transações Recentes
          </h3>
          <button style={{ backgroundColor: 'transparent', border: 'none', color: '#16a34a', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>Nova Saída</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {transacoes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#71717a' }}>Nenhuma transação registrada neste período.</div>
          ) : (
            transacoes.map((t: any) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: t.tipo === 'entrada' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {t.tipo === 'entrada' ? <ArrowUpRight size={20} color="#16a34a" /> : <ArrowDownRight size={20} color="#ef4444" />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#18181b' }}>{t.descricao}</div>
                    <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.25rem' }}>{t.metodo} • {t.data}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: t.tipo === 'entrada' ? '#16a34a' : '#18181b' }}>
                  {t.tipo === 'entrada' ? '+' : '-'}{formatCurrency(t.valor)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
