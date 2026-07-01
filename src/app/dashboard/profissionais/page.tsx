'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Scissors } from 'lucide-react';


export default function ProfissionaisPage() {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', specialty: '' });

  // Carrega da API ao iniciar
  useEffect(() => {
    fetch('/api/barbers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBarbers(data);
      })
      .catch(console.error);
  }, []);

  const handleAddBarber = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      return alert('Nome, email e senha são obrigatórios.');
    }
    try {
      const res = await fetch('/api/barbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setBarbers([...barbers, { ...data, status: 'Ativo', specialty: formData.specialty || 'Geral' }]);
        setIsModalOpen(false);
        setFormData({ name: '', phone: '', email: '', password: '', specialty: '' });
      } else {
        alert(data.error || 'Erro ao criar barbeiro');
      }
    } catch (e) {
      alert('Erro de conexão ao criar barbeiro');
    }
  };

  const handleDeleteBarber = async (id: string) => {
    if (!confirm("Tem certeza que deseja desativar este profissional?")) return;
    try {
      const res = await fetch(`/api/barbers?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBarbers(barbers.filter(b => b.id !== id));
      }
    } catch(e) {
      alert("Erro ao remover profissional.");
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
                        <button className={styles.actionButton} onClick={() => handleDeleteBarber(barber.id)}>
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
            label="E-mail (Login)" 
            placeholder="barbeiro@email.com" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <Input 
            label="Senha" 
            type="password"
            placeholder="***" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <Input 
            label="Especialidade" 
            placeholder="Ex: Degrade, Barba" 
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
