'use client';

import React, { useState, useEffect } from 'react';
import { Users, Phone, CalendarDays } from 'lucide-react';

export default function ClientesPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [appRes, srvRes] = await Promise.all([
          fetch('/api/appointments'),
          fetch('/api/services')
        ]);
        const appData = await appRes.json();
        const srvData = await srvRes.json();

        if(Array.isArray(appData)) setAppointments(appData);
        if(Array.isArray(srvData)) setServices(srvData);
      } catch(e) {
        console.error("Failed to load data", e);
      }
    };
    loadData();
  }, []);

  // Compute unique clients
  const clientMap = new Map<string, any>();
  appointments.forEach(app => {
    const srv = services.find(s => s.id === app.serviceId);
    const price = srv ? Number(srv.price) : 0;
    
    if (clientMap.has(app.customerPhone)) {
      const existing = clientMap.get(app.customerPhone);
      clientMap.set(app.customerPhone, {
        ...existing,
        visits: existing.visits + 1,
        totalSpent: existing.totalSpent + price,
        lastVisit: app.date > existing.lastVisit ? app.date : existing.lastVisit
      });
    } else {
      clientMap.set(app.customerPhone, {
        name: app.customerName,
        phone: app.customerPhone,
        visits: 1,
        totalSpent: price,
        lastVisit: app.date
      });
    }
  });

  const clients = Array.from(clientMap.values()).sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
  
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div style={{ paddingBottom: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b', marginBottom: '1.5rem' }}>Meus Clientes</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#71717a' }}>
            <Users size={16} /> <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Total</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{clients.length}</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#16a34a' }}>
            <CalendarDays size={16} /> <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Média/mês</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{Math.ceil(appointments.length / 30)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {clients.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#71717a', padding: '2rem' }}>Nenhum cliente cadastrado ainda.</div>
        ) : (
          clients.map((c, i) => (
            <div key={i} style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, overflow: 'hidden' }}>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#18181b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{c.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#71717a', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <Phone size={12} /> {c.phone}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#16a34a' }}>{formatCurrency(c.totalSpent)}</div>
                <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{c.visits} {c.visits === 1 ? 'visita' : 'visitas'}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
