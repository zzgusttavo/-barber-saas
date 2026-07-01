'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle2, ChevronLeft, ChevronRight, CalendarClock
} from 'lucide-react';
import styles from '../dashboard.module.css';

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  
  const [selectedFilterDate, setSelectedFilterDate] = useState(new Date().toDateString());
  const [filterBarberId, setFilterBarberId] = useState('all');

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
        if(Array.isArray(barData)) setTeam(barData);
      } catch(e) {
        console.error("Failed to load data", e);
      }
    };
    loadData();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      if (res.ok) {
        setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'completed' } : a));
      }
    } catch (e) {
      alert("Erro ao concluir agendamento");
    }
  };

  const getNextDays = () => {
    const days = [];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        dayName: dayNames[d.getDay()],
        dayNumber: d.getDate(),
        fullDateStr: d.toDateString()
      });
    }
    return days;
  };
  const nextDays = getNextDays();

  const filteredAppointments = appointments.filter(a => {
    const aDate = new Date(a.dateObj);
    aDate.setHours(0,0,0,0);
    const selDate = new Date(selectedFilterDate);
    selDate.setHours(0,0,0,0);
    
    if (aDate.getTime() !== selDate.getTime()) return false;
    if (filterBarberId !== 'all' && a.barberId !== filterBarberId) return false;
    return true;
  });

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div style={{ paddingBottom: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b', marginBottom: '1.5rem' }}>Agenda</h1>

      {team.length > 0 && (
        <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid rgba(0,0,0,0.05)' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#71717a', marginBottom: '0.5rem', display: 'block' }}>Filtrar por Profissional</label>
          <select 
            value={filterBarberId} 
            onChange={(e) => setFilterBarberId(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none' }}
          >
            <option value="all">Todos os Profissionais</option>
            {team.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem', scrollBehavior: 'smooth' }}>
        {nextDays.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelectedFilterDate(d.fullDateStr)}
            style={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '70px',
              borderRadius: '12px',
              border: selectedFilterDate === d.fullDateStr ? '2px solid #22c55e' : '1px solid rgba(0,0,0,0.05)',
              backgroundColor: selectedFilterDate === d.fullDateStr ? 'rgba(34, 197, 94, 0.1)' : '#fff',
              color: selectedFilterDate === d.fullDateStr ? '#16a34a' : '#71717a',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{d.dayName}</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{d.dayNumber}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#71717a', padding: '2rem' }}>
            Nenhum agendamento para este dia.
          </div>
        ) : (
          filteredAppointments.map(app => {
            const srv = services.find(s => s.id === app.serviceId);
            const barber = team.find(b => b.id === app.barberId);
            
            return (
              <div key={app.id} style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 700 }}>
                    <Clock size={16} />
                    {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(app.dateObj)}
                  </div>
                  <div style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: app.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: app.status === 'completed' ? '#16a34a' : '#d97706' }}>
                    {app.status === 'completed' ? 'FINALIZADO' : 'AGUARDANDO'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#18181b' }}>{app.client?.name || 'Cliente'}</div>
                    <div style={{ fontSize: '0.875rem', color: '#71717a' }}>{srv?.name || 'Serviço'} {barber && `• ${barber.name}`}</div>
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#16a34a' }}>
                    {formatCurrency(Number(srv?.price || 0))}
                  </div>
                </div>

                {app.status !== 'completed' && (
                  <button 
                    style={{ width: '100%', backgroundColor: '#16a34a', color: '#fff', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                    onClick={() => handleComplete(app.id)}
                  >
                    <CheckCircle2 size={16} />
                    Marcar como Concluído
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
