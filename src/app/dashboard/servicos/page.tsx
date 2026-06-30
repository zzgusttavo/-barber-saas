'use client';

import React, { useState } from 'react';
import styles from '../profissionais/page.module.css'; // Reusing the same table styles
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

const initialServices = [
  { id: '1', name: 'Corte Degradê', price: 45, duration: 40 },
  { id: '2', name: 'Barba Terapia', price: 35, duration: 30 },
  { id: '3', name: 'Combo (Corte + Barba)', price: 70, duration: 70 },
  { id: '4', name: 'Pigmentação', price: 25, duration: 20 },
];

export default function ServicosPage() {
  const [services, setServices] = useState(initialServices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', duration: '' });

  const handleAddService = () => {
    if (formData.name && formData.price) {
      setServices([
        ...services,
        {
          id: Math.random().toString(),
          name: formData.name,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration) || 30
        }
      ]);
      setIsModalOpen(false);
      setFormData({ name: '', price: '', duration: '' });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={`${styles.title} text-gradient`}>Serviços</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie os cortes e os preços da barbearia.</p>
        </div>
        <Button variant="accent" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Novo Serviço
        </Button>
      </div>

      <Card glass>
        <CardContent style={{ padding: 0 }}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome do Serviço</th>
                  <th>Duração (Minutos)</th>
                  <th>Preço</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Tag size={14} color="var(--accent-color)" />
                        </div>
                        {service.name}
                      </div>
                    </td>
                    <td>{service.duration} min</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(service.price)}</td>
                    <td>
                      <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                        <button className={styles.actionButton} aria-label="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button className={styles.actionButton} aria-label="Remover">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                      Nenhum serviço cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Adicionar Serviço"
      >
        <div className={styles.formGrid}>
          <Input 
            label="Nome do Serviço" 
            placeholder="Ex: Corte Degradê" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            autoFocus
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Input 
              label="Preço (R$)" 
              type="number"
              placeholder="Ex: 45.00" 
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
            <Input 
              label="Duração (Minutos)" 
              type="number"
              placeholder="Ex: 40" 
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
          <Button variant="accent" onClick={handleAddService} disabled={!formData.name || !formData.price}>
            Salvar Serviço
          </Button>
        </div>
      </Modal>
    </div>
  );
}
