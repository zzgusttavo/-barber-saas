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
  const [editingBarberId, setEditingBarberId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', specialty: '', avatar: '' });

  // Carrega da API ao iniciar
  useEffect(() => {
    fetch('/api/barbers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBarbers(data);
      })
      .catch(console.error);
  }, []);

  const handleSaveBarber = async () => {
    if (!formData.name || !formData.email || (!editingBarberId && !formData.password)) {
      return alert('Nome, email e senha são obrigatórios.');
    }
    try {
      const isEdit = !!editingBarberId;
      const res = await fetch('/api/barbers', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: editingBarberId, ...formData } : formData)
      });
      const data = await res.json();
      if (res.ok) {
        if (isEdit) {
          setBarbers(barbers.map(b => b.id === editingBarberId ? { ...b, ...data, specialty: formData.specialty || 'Geral', avatar: formData.avatar } : b));
        } else {
          setBarbers([...barbers, { ...data, status: 'Ativo', specialty: formData.specialty || 'Geral', avatar: formData.avatar }]);
        }
        setIsModalOpen(false);
        setEditingBarberId(null);
        setFormData({ name: '', phone: '', email: '', password: '', specialty: '', avatar: '' });
      } else {
        alert(data.error || 'Erro ao salvar barbeiro');
      }
    } catch (e) {
      alert('Erro de conexão ao salvar barbeiro');
    }
  };

  const handleEditClick = (barber: any) => {
    setEditingBarberId(barber.id);
    setFormData({
      name: barber.name || '',
      phone: barber.phone || '',
      email: barber.email || '',
      password: '', // Não preencher a senha existente
      specialty: barber.specialty || '',
      avatar: barber.avatar || ''
    });
    setIsModalOpen(true);
  };

  const openNewBarberModal = () => {
    setEditingBarberId(null);
    setFormData({ name: '', phone: '', email: '', password: '', specialty: '', avatar: '' });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB max
        alert("A imagem deve ter no máximo 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
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
        <Button variant="accent" onClick={openNewBarberModal}>
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
                        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {barber.avatar ? (
                            <img src={barber.avatar} alt={barber.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Scissors size={14} color="var(--text-secondary)" />
                          )}
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
                        <button className={styles.actionButton} aria-label="Editar" onClick={() => handleEditClick(barber)}>
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
        title={editingBarberId ? "Editar Profissional" : "Adicionar Profissional"}
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
            label="Senha (Deixe em branco para não alterar)" 
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Foto do Barbeiro</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Scissors size={24} color="var(--text-tertiary)" />
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
              />
            </div>
          </div>
        </div>
        <div className={styles.modalButtons}>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)} className={styles.modalCancelBtn}>Cancelar</Button>
          <Button variant="accent" onClick={handleSaveBarber} disabled={!formData.name} className={styles.modalSaveBtn}>
            {editingBarberId ? "Salvar Alterações" : "Salvar Profissional"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
