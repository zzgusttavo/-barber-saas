'use client';

import React, { useState, useEffect } from 'react';
import styles from './dashboard.module.css';
import { 
  Bell, 
  CircleDollarSign, 
  CalendarDays, 
  Users, 
  Star, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  UserPlus, 
  Scissors, 
  Banknote 
} from 'lucide-react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userName = session?.user?.name || "Proprietário";
  const firstName = userName.split(" ")[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [appRes, srvRes, barRes] = await Promise.all([
          fetch('/api/appointments'),
          fetch('/api/services'),
          fetch('/api/barbers')
        ]);
        const appData = await appRes.json();
        const srvData = await srvRes.json();
        const barData = await barRes.json();

        if(Array.isArray(appData)) {
          setAppointments(appData.map(app => ({
            ...app,
            dateObj: new Date(app.date)
          })));
        }
        if(Array.isArray(srvData)) setServices(srvData);
        if(Array.isArray(barData)) setBarbers(barData);
        setIsLoaded(true);
      } catch(e) {
        console.error("Failed to load data", e);
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  const today = new Date();
  today.setHours(0,0,0,0);
  
  const todaysAppointments = appointments.filter(a => {
    const aDate = new Date(a.dateObj);
    aDate.setHours(0,0,0,0);
    return aDate.getTime() === today.getTime();
  });

  const nextAppointment = todaysAppointments.find(a => a.status !== 'completed' && a.status !== 'cancelled' && a.dateObj >= new Date());
  
  const totalEarningsToday = todaysAppointments
    .filter(a => a.status === 'completed' || a.status === 'confirmed')
    .reduce((acc, curr) => {
      const srv = services.find(s => s.id === curr.serviceId);
      return acc + (srv ? Number(srv.price) : 0);
    }, 0);

  const monthAppointments = appointments.filter(a => a.dateObj.getMonth() === new Date().getMonth());
  const uniqueClientsMonth = new Set(monthAppointments.map(a => a.customerName)).size;
  
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (!isLoaded) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando dados...</div>;
  return (
    <div className={styles.dashboardContainer}>
      
      {/* Header */}
      <div className={styles.headerTop}>
        <div>
          <h1 className={styles.greeting}>{getGreeting()}, {firstName} 👋</h1>
          <div className={styles.dateSub}>
            {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', weekday: 'long' })}
          </div>
        </div>
        <div className={styles.headerTopRight}>
          <button className={styles.bellButton} onClick={() => alert('Nenhuma notificação nova')}>
            <Bell size={20} color="#71717a" />
            <div className={styles.notificationDot}></div>
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
          <div className={styles.kpiValue}>{formatCurrency(totalEarningsToday)}</div>
          <div className={styles.kpiBottom}>
            <span className={styles.kpiBadge} style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>Ao Vivo</span>
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
          <div className={styles.kpiValue}>{todaysAppointments.length}</div>
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
          <div className={styles.kpiValue}>{uniqueClientsMonth}</div>
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

      <div className={styles.desktopGrid}>
        
        {/* --- COLUNA ESQUERDA (70% no Desktop, 100% no Mobile) --- */}
        <div className={styles.leftCol}>
          
          {/* Agenda de hoje */}
          <div>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Agenda de hoje</span>
              <span className={styles.sectionLink} onClick={() => router.push('/dashboard/agenda')} style={{ cursor: 'pointer' }}>Ver agenda completa <ChevronRight size={14} /></span>
            </div>
            
            <div className={styles.agendaList}>
              {todaysAppointments.length > 0 ? todaysAppointments.map(appt => (
                <div key={appt.id} className={styles.agendaItem}>
                  <div className={styles.agendaTime}>{new Date(appt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} <div className={`${styles.agendaDot} ${styles.dotGreen}`}></div></div>
                  <div className={styles.agendaClient}>
                    <div className={styles.agendaAvatar}><img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(appt.customerName)}&background=random`} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /></div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className={styles.agendaClientName}>{appt.customerName}</span>
                      <span className={styles.agendaClientService}>{services.find(s=>s.id===appt.serviceId)?.name || 'Serviço'}</span>
                    </div>
                  </div>
                  <div className={`${styles.statusBadge} ${styles.statusConfirmed}`} style={{ backgroundColor: '#ffffff', border: '1px solid #16a34a' }}>
                    Confirmado
                  </div>
                  <ChevronRight size={16} color="#d4d4d8" />
                </div>
              )) : (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: '#71717a' }}>Agenda livre hoje!</div>
              )}
            </div>
          </div>

          {/* Clientes recentes */}
          <div className={styles.splitCard}>
            <div className={styles.splitTitle}>Clientes recentes</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)', color: '#71717a', fontSize: '0.75rem', fontWeight: 600 }}>
              <span>Cliente</span>
              <span style={{flex: 1, marginLeft: '1rem'}}>Último serviço</span>
              <span>Gasto total</span>
            </div>
            
            {appointments.slice(0, 3).map(appt => {
              const srv = services.find(s => s.id === appt.serviceId);
              return (
                <div key={appt.id} className={styles.recentClientRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', minWidth: '120px' }}>
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(appt.customerName)}&background=random`} alt="Avatar" className={styles.recentAvatar} />
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span className={styles.recentName} style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{appt.customerName.split(" ")[0]}</span>
                    </div>
                  </div>
                  <span className={styles.recentService} style={{ flex: 1, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', marginLeft: '1rem' }}>{srv?.name}</span>
                  <span className={styles.recentPrice}>{formatCurrency(Number(srv?.price || 0))}</span>
                </div>
              )
            })}
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <span className={styles.sectionLink} onClick={() => router.push('/dashboard/clientes')} style={{ color: '#16a34a', justifyContent: 'center', cursor: 'pointer' }}>Ver todos os clientes <ChevronRight size={12} /></span>
            </div>
          </div>

        </div>

        {/* --- COLUNA DIREITA (30% no Desktop, 100% no Mobile) --- */}
        <div className={styles.rightCol}>
          
          {/* Próximo Atendimento */}
          <div>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle} style={{ fontSize: '0.95rem' }}>Próximo atendimento</span>
            </div>
            {nextAppointment ? (
              <div className={styles.nextApptCard}>
                <div className={styles.nextApptInfo}>
                  <div className={styles.clientAvatarLarge}>
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nextAppointment.customerName)}&background=random`} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <div className={styles.clientDetails}>
                    <span className={styles.clientName}>{nextAppointment.customerName}</span>
                    <span className={styles.clientService}>{services.find(s=>s.id===nextAppointment.serviceId)?.name || 'Serviço'}</span>
                    <span className={styles.clientTime}>
                      <CalendarDays size={12} /> {new Date(nextAppointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • 40 minutos
                    </span>
                  </div>
                </div>
                <div className={`${styles.statusBadge} ${styles.statusConfirmed}`}>
                  Confirmado
                </div>
              </div>
            ) : (
              <div className={styles.nextApptCard} style={{ justifyContent: 'center', color: '#71717a' }}>
                Nenhum atendimento próximo.
              </div>
            )}
          </div>

          {/* Faturamento da Semana */}
          <div className={styles.splitCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className={styles.splitTitle}>Faturamento da semana</div>
              <span style={{ fontSize: '0.75rem', color: '#71717a' }}>Semana atual ▾</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>{formatCurrency(totalEarningsToday * 5.5)}</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700 }}>
                ▲ 18,2%
                <span style={{ color: '#a1a1aa', fontWeight: 500, fontSize: '0.65rem' }}>vs semana anterior</span>
              </div>
            </div>
            
            {/* Chart placeholder */}
            <div style={{ height: '100px', width: '100%', marginTop: '1rem', background: 'linear-gradient(to top, rgba(34, 197, 94, 0.1), transparent)', position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
               <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0 }}>
                 <path d="M0 35 Q 15 25, 30 30 T 50 15 T 70 20 T 85 5 T 100 10" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
               </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#a1a1aa', fontSize: '0.65rem' }}>
              <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
            </div>
          </div>

          {/* Ações rápidas */}
          <div>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle} style={{ fontSize: '1rem' }}>Atalhos rápidos</span>
            </div>
            <div className={styles.quickActionsGrid}>
              <button onClick={() => router.push('/dashboard/agenda')} className={styles.quickActionCard} style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)' }}>
                <Plus size={24} color="#16a34a" />
                <span className={styles.quickActionTitle}>Novo Agendamento</span>
              </button>
              <button onClick={() => router.push('/dashboard/clientes')} className={styles.quickActionCard} style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
                <UserPlus size={24} color="#3b82f6" />
                <span className={styles.quickActionTitle}>Novo Cliente</span>
              </button>
              <button onClick={() => router.push('/dashboard/servicos')} className={styles.quickActionCard} style={{ backgroundColor: 'rgba(168, 85, 247, 0.05)' }}>
                <Scissors size={24} color="#a855f7" />
                <span className={styles.quickActionTitle}>Novo Serviço</span>
              </button>
              <button onClick={() => alert('Módulo de vendas em breve!')} className={styles.quickActionCard} style={{ backgroundColor: 'rgba(234, 179, 8, 0.05)' }}>
                <Banknote size={24} color="#eab308" />
                <span className={styles.quickActionTitle}>Registrar Venda</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
