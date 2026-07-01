'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Scissors } from 'lucide-react';

// Array vazio para não criar profissionais falsos no localStorage
const initialBarbers: any[] = [];

export default function ProfissionaisPage() {
  const [barbers, setBarbers] = useState(initialBarbers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', specialty: '' });

  // Carrega do localStorage ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem('@barbersaas:barbers');
    if (saved) {
      setBarbers(JSON.parse(saved));
    }
  }, []);

  // Salva no localStorage quando altera
  useEffect(() => {
    if (barbers !== initialBarbers || barbers.length > 0) {
      localStorage.setItem('@barbersaas:barbers', JSON.stringify(barbers));
    }
  }, [barbers]);

  const handleAddBarber = () => {
    // Em um cenário real, aqui seria uma chamada API com o Prisma
    if (formData.name) {
      setBarbers([
        ...barbers,
        {
          id: Math.random().toString(),
          name: formData.name,
          phone: formData.phone,
          status: 'Ativo',
          specialty: formData.specialty || 'Geral'
        }
      ]);
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', specialty: '' });
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={`${styles.title} text-gradient`}>Profissionais</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie os barbeiros da sua barbearia.</p>
        </div>
        <Button variant="accent" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Novo Profissional
        </Button>
      </div>

      <Card glass>
        <CardContent style={{ padding: 0 }}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Especialidade</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {barbers.map((barber) => (
                  <tr key={barber.id}>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Scissors size={14} color="var(--text-secondary)" />
                        </div>
                        {barber.name}
                      </div>
                    </td>
                    <td>{barber.specialty}</td>
                    <td>{barber.phone}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${barber.status === 'Ativo' ? styles.statusActive : styles.statusInactive}`}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }}></span>
                        {barber.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                        <button className={styles.actionButton} aria-label="Editar" onClick={() => alert('Edição em breve')}>
                          <Edit2 size={16} />
                        </button>
                        <button className={styles.actionButton} aria-label="Remover" onClick={() => {
                          if (confirm(`Deseja realmente remover ${barber.name}?`)) {
                            setBarbers(barbers.filter(b => b.id !== barber.id));
                          }
                        }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {barbers.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                      Nenhum profissional cadastrado.
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
        title="Adicionar Profissional"
      >
        <div className={styles.formGrid}>
          <Input 
            label="Nome Completo" 
            placeholder="Ex: João Ferreira" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            autoFocus
          />
          <Input 
            label="Telefone / WhatsApp" 
            placeholder="(00) 00000-0000" 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          <Input 
            label="Especialidade Principal (Opcional)" 
            placeholder="Ex: Especialista em Degradê" 
            value={formData.specialty}
            onChange={(e) => setFormData({...formData, specialty: e.target.value})}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
          <Button variant="accent" onClick={handleAddBarber} disabled={!formData.name}>
            Salvar Profissional
          </Button>
        </div>
      </Modal>
    </div>
  );
}
