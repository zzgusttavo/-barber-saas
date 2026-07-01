'use client';

import React, { useState, useEffect } from 'react';
import { Scissors, Trash2, Plus, Edit2 } from 'lucide-react';

export default function ServicosPage() {
  const [services, setServices] = useState<any[]>([]);
  const [newService, setNewService] = useState({ name: '', price: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if(Array.isArray(data)) setServices(data);
      } catch(e) {
        console.error("Failed to load services", e);
      }
    };
    loadData();
  }, []);

  const handleAddService = async () => {
    if (!newService.name || !newService.price) {
      return alert('Preencha nome e valor do serviço.');
    }
    try {
      const priceVal = parseFloat(newService.price.replace(',', '.'));
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newService.name, price: priceVal, duration: 40 })
      });
      const data = await res.json();
      if (res.ok) {
        setServices([...services, data]);
        setNewService({ name: '', price: '' });
        setIsAdding(false);
      } else {
        alert(data.error || 'Erro ao criar serviço');
      }
    } catch (e) {
      alert('Erro de conexão ao criar serviço');
    }
  };

  const handleDeleteService = async (id: string) => {
    if(!confirm("Tem certeza que deseja excluir?")) return;
    try {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setServices(services.filter(s => s.id !== id));
      }
    } catch(e) {
      alert("Erro ao remover serviço.");
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b', margin: 0 }}>Serviços</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)' }}
        >
          <Plus size={24} />
        </button>
      </div>

      {isAdding && (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Novo Serviço</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
            <input 
              placeholder="Ex: Corte Degradê"
              value={newService.name}
              onChange={e => setNewService({...newService, name: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e4e4e7', outline: 'none', width: '100%' }}
            />
            <input 
              type="number"
              placeholder="Valor (R$)"
              value={newService.price}
              onChange={e => setNewService({...newService, price: e.target.value})}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e4e4e7', outline: 'none', width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              style={{ flex: 1, backgroundColor: '#f4f4f5', color: '#18181b', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setIsAdding(false)}
            >Cancelar</button>
            <button 
              style={{ flex: 1, backgroundColor: '#18181b', color: '#fff', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              onClick={handleAddService}
            >Salvar</button>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {services.length === 0 && !isAdding ? (
          <div style={{ textAlign: 'center', color: '#71717a', padding: '2rem' }}>
            <Scissors size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            Você ainda não tem serviços cadastrados.
          </div>
        ) : (
          services.map(service => (
            <div key={service.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#18181b', marginBottom: '0.25rem' }}>{service.name}</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#16a34a' }}>{formatCurrency(service.price)}</div>
              </div>
              <button 
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', width: 40, height: 40, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                onClick={() => handleDeleteService(service.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
