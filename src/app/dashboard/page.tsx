'use client';

import React from 'react';
import styles from './dashboard.module.css';
import { 
  Bell, 
  CircleDollarSign, 
  CalendarDays, 
  Users, 
  Star, 
  CheckCircle2, 
  ChevronRight, 
  TrendingUp, 
  Plus, 
  UserPlus, 
  Scissors, 
  Banknote 
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className={styles.dashboardContainer}>
      
      {/* Header */}
      <div className={styles.headerTop}>
        <div>
          <h1 className={styles.greeting}>Bom dia, Gustavo 👋</h1>
          <div className={styles.dateSub}>30 Julho • Quarta-feira</div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.bellButton}>
            <Bell size={20} strokeWidth={2} />
          </button>
          <div className={styles.avatar}>
            <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      {/* 2x2 KPIs */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
              <CircleDollarSign size={18} color="#22c55e" />
            </div>
            <span className={styles.kpiTitle}>Faturamento Hoje</span>
          </div>
          <div className={styles.kpiValue}>R$420,00</div>
          <div className={styles.kpiBottom}>
            <span className={styles.kpiBadge} style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>+10%</span>
            <svg width="40" height="20" viewBox="0 0 40 20"><path d="M0 15 Q 10 5, 20 10 T 40 2" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <CalendarDays size={18} color="#3b82f6" />
            </div>
            <span className={styles.kpiTitle}>Agendamentos</span>
          </div>
          <div className={styles.kpiValue}>8</div>
          <div className={styles.kpiBottom} style={{ justifyContent: 'flex-end' }}>
            <svg width="40" height="20" viewBox="0 0 40 20"><path d="M0 10 Q 10 15, 20 8 T 40 5" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
              <Users size={18} color="#a855f7" />
            </div>
            <span className={styles.kpiTitle}>Clientes do mês</span>
          </div>
          <div className={styles.kpiValue}>37</div>
          <div className={styles.kpiBottom} style={{ justifyContent: 'flex-end' }}>
             <svg width="40" height="20" viewBox="0 0 40 20"><path d="M0 12 Q 10 18, 20 10 T 40 2" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)' }}>
              <Star size={18} color="#eab308" />
            </div>
            <span className={styles.kpiTitle}>Avaliação</span>
          </div>
          <div className={styles.kpiValue}>4.9</div>
          <div className={styles.kpiBottom}>
            <div style={{ display: 'flex', gap: '0.1rem' }}>
              <Star size={12} fill="#eab308" color="#eab308" />
              <Star size={12} fill="#eab308" color="#eab308" />
              <Star size={12} fill="#eab308" color="#eab308" />
              <Star size={12} fill="#eab308" color="#eab308" />
              <Star size={12} fill="#eab308" color="#eab308" />
            </div>
          </div>
        </div>
      </div>

      {/* Próximo Atendimento */}
      <div>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle} style={{ color: '#16a34a', fontSize: '0.9rem' }}>Próximo atendimento</span>
        </div>
        <div className={styles.nextApptCard}>
          <div className={styles.nextApptInfo}>
            <div className={styles.clientAvatarLarge}>
              <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <div className={styles.clientDetails}>
              <span className={styles.clientName}>João da Silva</span>
              <span className={styles.clientService}>Corte Masculino</span>
              <span className={styles.clientTime}>
                <CalendarDays size={12} /> 09:00 • 40 minutos
              </span>
            </div>
          </div>
          <div className={`${styles.statusBadge} ${styles.statusConfirmed}`}>
            <CheckCircle2 size={14} /> Confirmado
          </div>
        </div>
      </div>

      {/* Agenda de hoje */}
      <div>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Agenda de hoje</span>
          <span className={styles.sectionLink}>Ver agenda completa <ChevronRight size={14} /></span>
        </div>
        
        <div className={styles.agendaList}>
          <div className={styles.agendaItem}>
            <div className={styles.agendaTime}>09:00 <div className={`${styles.agendaDot} ${styles.dotGreen}`}></div></div>
            <div className={styles.agendaClient}>
              <div className={styles.agendaAvatar}><img src="https://i.pravatar.cc/150?img=12" alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles.agendaClientName}>João da Silva</span>
                <span className={styles.agendaClientService}>Corte Masculino</span>
              </div>
            </div>
            <div className={`${styles.statusBadge} ${styles.statusConfirmed}`} style={{ backgroundColor: '#ffffff', border: '1px solid #16a34a' }}>
              Confirmado
            </div>
            <ChevronRight size={16} color="#d4d4d8" />
          </div>

          <div className={styles.agendaItem}>
            <div className={styles.agendaTime}>09:40 <div className={`${styles.agendaDot} ${styles.dotGrey}`}></div></div>
            <div className={styles.agendaClient}>
              <span className={styles.agendaLivre}>Livre</span>
            </div>
            <ChevronRight size={16} color="#d4d4d8" />
          </div>

          <div className={styles.agendaItem}>
            <div className={styles.agendaTime}>10:20 <div className={`${styles.agendaDot} ${styles.dotGreen}`}></div></div>
            <div className={styles.agendaClient}>
              <div className={styles.agendaAvatar}><img src="https://i.pravatar.cc/150?img=13" alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles.agendaClientName}>Carlos Eduardo</span>
                <span className={styles.agendaClientService}>Barba</span>
              </div>
            </div>
            <div className={`${styles.statusBadge} ${styles.statusConfirmed}`} style={{ backgroundColor: '#ffffff', border: '1px solid #16a34a' }}>
              Confirmado
            </div>
            <ChevronRight size={16} color="#d4d4d8" />
          </div>

          <div className={styles.agendaItem}>
            <div className={styles.agendaTime}>11:00 <div className={`${styles.agendaDot} ${styles.dotGrey}`}></div></div>
            <div className={styles.agendaClient}>
              <span className={styles.agendaLivre}>Livre</span>
            </div>
            <ChevronRight size={16} color="#d4d4d8" />
          </div>
        </div>
      </div>

      {/* Faturamento e Clientes */}
      <div className={styles.splitCols}>
        {/* Faturamento */}
        <div className={styles.splitCard}>
          <div className={styles.splitTitle}>Faturamento <span style={{color: '#a1a1aa', fontWeight: 500}}>(7 dias)</span></div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#18181b', marginBottom: '0.5rem' }}>R$ 2.340,00</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem' }}>
            ▲ 18,2%
          </div>
          {/* Chart placeholder */}
          <div style={{ height: '60px', width: '100%', background: 'linear-gradient(to top, rgba(34, 197, 94, 0.2), transparent)', position: 'relative', overflow: 'hidden' }}>
             <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0 }}>
               <path d="M0 30 Q 15 20, 30 25 T 50 15 T 70 20 T 100 5" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
             </svg>
          </div>
        </div>

        {/* Clientes recentes */}
        <div className={styles.splitCard}>
          <div className={styles.splitTitle}>Clientes recentes</div>
          
          <div className={styles.recentClientRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="https://i.pravatar.cc/150?img=12" alt="Joao" className={styles.recentAvatar} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles.recentName}>João da Silva</span>
                <span className={styles.recentService}>Corte Masculino</span>
              </div>
            </div>
            <span className={styles.recentPrice}>R$ 125,00</span>
          </div>

          <div className={styles.recentClientRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="https://i.pravatar.cc/150?img=13" alt="Carlos" className={styles.recentAvatar} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles.recentName}>Carlos Edu...</span>
                <span className={styles.recentService}>Barba</span>
              </div>
            </div>
            <span className={styles.recentPrice}>R$ 90,00</span>
          </div>

          <div className={styles.recentClientRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="https://i.pravatar.cc/150?img=14" alt="Pedro" className={styles.recentAvatar} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles.recentName}>Pedro Hen...</span>
                <span className={styles.recentService}>Corte + Barba</span>
              </div>
            </div>
            <span className={styles.recentPrice}>R$ 155,00</span>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <span className={styles.sectionLink} style={{ color: '#16a34a', justifyContent: 'center' }}>Ver todos <ChevronRight size={12} /></span>
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle} style={{ fontSize: '1rem' }}>Ações rápidas</span>
        </div>
        <div className={styles.quickActionsGrid}>
          <button className={styles.quickActionCard} style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)' }}>
            <Plus size={24} color="#16a34a" />
            <span className={styles.quickActionTitle}>Novo Agendamento</span>
          </button>

          <button className={styles.quickActionCard} style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
            <UserPlus size={24} color="#3b82f6" />
            <span className={styles.quickActionTitle}>Novo Cliente</span>
          </button>

          <button className={styles.quickActionCard} style={{ backgroundColor: 'rgba(168, 85, 247, 0.05)' }}>
            <Scissors size={24} color="#a855f7" />
            <span className={styles.quickActionTitle}>Novo Serviço</span>
          </button>

          <button className={styles.quickActionCard} style={{ backgroundColor: 'rgba(234, 179, 8, 0.05)' }}>
            <Banknote size={24} color="#eab308" />
            <span className={styles.quickActionTitle}>Registrar Venda</span>
          </button>
        </div>
      </div>

    </div>
  );
}
