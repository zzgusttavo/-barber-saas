'use client';

import React, { useState, useEffect } from 'react';
import styles from './barbeiro.module.css';
import { 
  User, Clock, CheckCircle2, Menu,
  Calendar, Wallet, Settings, Link, Camera, Scissors, Trash2, Share2
} from 'lucide-react';

export default function AppDonoPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  const [selectedFilterDate, setSelectedFilterDate] = useState(new Date().toDateString());
  
  // Detecção de Mobile para Setup do WhatsApp
  const [isMobile, setIsMobile] = useState(false);
  const [usePairingCode, setUsePairingCode] = useState(false);
  const [phoneForPairing, setPhoneForPairing] = useState('');
  const [waQR, setWaQR] = useState<string | null>(null);
  const [waCode, setWaCode] = useState<string | null>(null);
  const [waStatus, setWaStatus] = useState('loading'); // loading, pending, connected

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(mobile);
      setUsePairingCode(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Polling do WhatsApp Status (Microserviço)
    const checkWaStatus = async () => {
      try {
        const res = await fetch('http://localhost:3005/qr');
        if (res.ok) {
          const data = await res.json();
          setWaStatus(data.status);
          if (data.qr) setWaQR(data.qr);
        }
      } catch (err) {
        setWaStatus('error');
      }
    };
    
    checkWaStatus();
    const interval = setInterval(checkWaStatus, 3000);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(interval);
    };
  }, []);

  const handleRequestPairingCode = async () => {
    if (!phoneForPairing) return alert('Digite seu número de WhatsApp com o DDD (Ex: 11999999999)');
    
    try {
      const res = await fetch('http://localhost:3005/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '55' + phoneForPairing.replace(/[^0-9]/g, '') }) // Forçando Brasil 55 para o MVP
      });
      const data = await res.json();
      if (data.code) {
        setWaCode(data.code);
      } else {
        alert('Erro ao gerar código. Certifique-se que o robô está rodando.');
      }
    } catch (err) {
      alert('Erro de conexão com o robô de WhatsApp.');
    }
  };

  // Modal de Equipe
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [team, setTeam] = useState([
    { id: 1, name: 'Carlos Eduardo (Dono)', hasPhoto: false },
    { id: 2, name: 'Marcos Silva', hasPhoto: false },
    { id: 3, name: 'Lucas Oliveira', hasPhoto: false }
  ]);

  // Mock de Serviços (temporário até integrarmos o BD real)
  const [services, setServices] = useState<any[]>([]);

  // Load real data
  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          const mapped = data.map(app => ({
            id: app.id,
            time: new Date(app.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            dateObj: new Date(app.date),
            client: app.client?.name || 'Cliente',
            service: app.service?.name || 'Serviço',
            price: app.service?.price || 0,
            status: app.status.toLowerCase()
          }));
          setAppointments(mapped);
        }
      })
      .catch(err => console.error(err));

    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setServices(data);
      })
      .catch(err => console.error(err));
  }, []);

  // Configuração Visual de Horários
  const [workingDays, setWorkingDays] = useState([false, true, true, true, true, true, true]); // Dom(0) a Sab(6)
  const weekDayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const toggleDay = (index: number) => {
    const newDays = [...workingDays];
    newDays[index] = !newDays[index];
    setWorkingDays(newDays);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleComplete = async (id: string) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      setAppointments(prev => 
        prev.map(app => app.id === id ? { ...app, status: 'completed' } : app)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const todayStr = new Date().toDateString();
  const currentMonthNum = new Date().getMonth();

  // Faturamento apenas de HOJE
  const totalEarningsToday = appointments
    .filter(a => a.status === 'completed' && a.dateObj.toDateString() === todayStr)
    .reduce((acc, curr) => acc + curr.price, 0);

  // Faturamento do MÊS
  const totalEarningsMonth = appointments
    .filter(a => a.status === 'completed' && a.dateObj.getMonth() === currentMonthNum)
    .reduce((acc, curr) => acc + curr.price, 0);

  // Agendamentos baseados na data SELECIONADA no filtro (em vez de sempre HOJE)
  const todaysAppointments = appointments.filter(a => a.dateObj.toDateString() === selectedFilterDate);

  const generateDays = () => {
    const days = [];
    const date = new Date();
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    for (let i = 0; i < 7; i++) {
      days.push({
        dayName: i === 0 ? 'Hoje' : dayNames[date.getDay()],
        dayNumber: date.getDate(),
        fullDateStr: date.toDateString()
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  };
  const nextDays = generateDays();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsDrawerOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("barbeiro.com/salaomodelo");
    alert("Link copiado para a área de transferência!");
  };

  return (
    <div className={styles.container}>
      {/* Menu Lateral (Drawer) - No PC será o Sidebar Esquerdo */}
      <div className={`${styles.drawerOverlay} ${isDrawerOpen ? styles.open : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      <div className={`${styles.drawer} ${isDrawerOpen ? styles.open : ''}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerAvatar}>
            <User size={32} />
          </div>
          <div>
            <div className={styles.drawerName}>Carlos Eduardo</div>
            <div className={styles.drawerRole}>Dono da Barbearia</div>
          </div>
        </div>

        <div className={styles.menuList}>
          <button className={`${styles.menuItem} ${activeTab === 'agenda' ? styles.active : ''}`} onClick={() => handleTabChange('agenda')}>
            <Calendar size={20} /> Agenda de Hoje
          </button>
          <button className={`${styles.menuItem} ${activeTab === 'caixa' ? styles.active : ''}`} onClick={() => handleTabChange('caixa')}>
            <Wallet size={20} /> Meu Caixa
          </button>
          <button className={`${styles.menuItem} ${activeTab === 'perfil' ? styles.active : ''}`} onClick={() => handleTabChange('perfil')}>
            <User size={20} /> Meu Perfil
          </button>
          <button className={`${styles.menuItem} ${activeTab === 'servicos' ? styles.active : ''}`} onClick={() => handleTabChange('servicos')}>
            <Scissors size={20} /> Meus Serviços
          </button>
          <button className={`${styles.menuItem} ${activeTab === 'config' ? styles.active : ''}`} onClick={() => handleTabChange('config')}>
            <Settings size={20} /> Configurações
          </button>
        </div>
      </div>

      {/* --- WRAPPER PRINCIPAL DO CONTEÚDO (No PC fica à direita do Sidebar) --- */}
      <div className={styles.mainWrapper}>
        {/* Header com Hambúrguer (Mobile) */}
        <div className={styles.header}>
          <button className={styles.menuBtn} onClick={() => setIsDrawerOpen(true)}>
            <Menu size={28} />
          </button>
          <div className={styles.drawerAvatar} style={{ width: 40, height: 40, border: 'none' }}>
            <User size={24} />
          </div>
        </div>

        {/* Cartão de Faturamento Fixo no Topo */}
        <div className={styles.earningsCard}>
          <span className={styles.earningsTitle}>Faturamento de Hoje</span>
          <span className={styles.earningsValue}>{formatCurrency(totalEarningsToday)}</span>
        </div>

        {/* --- CONTEÚDO DINÂMICO (Muda com base na Tab) --- */}
      
      {activeTab === 'agenda' && (
        <>
          <div className={styles.dateFilter}>
            {nextDays.map((d, i) => (
              <div 
                key={i} 
                className={`${styles.datePill} ${d.fullDateStr === selectedFilterDate ? styles.datePillSelected : ''}`}
                onClick={() => setSelectedFilterDate(d.fullDateStr)}
              >
                <span className={styles.dateDayName}>{d.dayName}</span>
                <span className={styles.dateNumber}>{d.dayNumber}</span>
              </div>
            ))}
          </div>

          <div className={styles.content}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Agenda de Hoje</h2>
            </div>

            <div className={styles.agendaList}>
              {todaysAppointments.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--theme-text-muted)', marginTop: '2rem' }}>
                  Nenhum agendamento para hoje.
                </div>
              )}
              {todaysAppointments.map((app) => (
                <div key={app.id} className={`${styles.appointmentCard} ${app.status === 'completed' ? styles.completedCard : ''}`}>
                  <div className={styles.cardHeader}>
                    <div className={styles.timeBlock}>
                      <Clock size={20} />
                      {app.time}
                    </div>
                    <div className={`${styles.statusBadge} ${app.status === 'completed' ? styles.completed : ''}`}>
                      {app.status === 'completed' ? 'FINALIZADO' : 'AGUARDANDO'}
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div>
                      <div className={styles.clientName}>{app.client}</div>
                      <div className={styles.serviceInfo}>{app.service}</div>
                    </div>
                    <div className={styles.priceInfo}>
                      {formatCurrency(app.price)}
                    </div>
                  </div>

                  {app.status === 'pending' && (
                    <button 
                      className={`${styles.actionButton} ${styles.btnPrimary}`}
                      onClick={() => handleComplete(app.id)}
                    >
                      <CheckCircle2 size={20} />
                      Marcar como Concluído
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'servicos' && (
        <div className={styles.content}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Meus Serviços</h2>
            <button 
              style={{ background: 'var(--theme-accent)', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
              onClick={() => alert("Adicionar novo serviço!")}
            >
              + NOVO
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
            {services.map(service => (
              <div key={service.id} style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--theme-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)' }}>Nome do Serviço</label>
                    <input 
                      className={styles.inputField} 
                      defaultValue={service.name} 
                      style={{ fontWeight: 600, fontSize: '1rem', padding: '0.75rem' }}
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)' }}>Preço (R$)</label>
                    <input 
                      className={styles.inputField} 
                      defaultValue={service.price} 
                      type="number"
                      style={{ fontWeight: 600, fontSize: '1rem', padding: '0.75rem', textAlign: 'center' }}
                    />
                  </div>
                </div>
                
                <button 
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', padding: '0.5rem' }}
                  onClick={() => alert(`Remover ${service.name}?`)}
                >
                  <Trash2 size={16} /> Remover Serviço
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className={styles.content}>
          <h2 className={styles.sectionTitle}>Configurações da Barbearia</h2>

          {/* Setup de WhatsApp - Self Service */}
          <div className={styles.inputGroup} style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--theme-card)', borderRadius: '12px', border: '1px solid var(--theme-accent)' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: '#25D366', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={20} /> Conectar WhatsApp (Robô)
            </h3>
            
            {waStatus === 'connected' ? (
              <div style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)', padding: '1.5rem', borderRadius: '8px', border: '1px solid #25D366', textAlign: 'center' }}>
                <CheckCircle2 size={48} color="#25D366" style={{ marginBottom: '1rem' }} />
                <h4 style={{ color: '#25D366', fontSize: '1.25rem', marginBottom: '0.5rem' }}>WhatsApp Conectado!</h4>
                <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.875rem' }}>O robô já está disparando mensagens automáticas e respondendo seus clientes.</p>
              </div>
            ) : waStatus === 'error' ? (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #ef4444', textAlign: 'center' }}>
                <p style={{ color: '#ef4444' }}>⚠️ Microserviço do WhatsApp offline. Verifique se o servidor na porta 3005 está rodando.</p>
              </div>
            ) : (
              <>
                {usePairingCode ? (
                  // VISÃO MOBILE (CÓDIGO DE PAREAMENTO)
                  <>
                    <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                      Como você está no celular, use o <strong>Código de Conexão</strong>:<br/><br/>
                      1. Digite seu número abaixo e clique em Gerar Código<br/>
                      2. Abra o WhatsApp &gt; Aparelhos Conectados<br/>
                      3. Toque em "Conectar com número de telefone"<br/>
                      4. Digite o código de 8 dígitos que aparecerá
                    </p>
                    
                    {!waCode ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <input 
                          type="tel" 
                          placeholder="Ex: 11999999999" 
                          className={styles.inputField} 
                          value={phoneForPairing}
                          onChange={(e) => setPhoneForPairing(e.target.value)}
                        />
                        <button 
                          className={styles.primaryButton} 
                          style={{ backgroundColor: '#25D366', color: '#000', margin: 0 }}
                          onClick={handleRequestPairingCode}
                        >
                          GERAR CÓDIGO DE 8 DÍGITOS
                        </button>
                      </div>
                    ) : (
                      <div style={{ backgroundColor: '#111', padding: '1rem', borderRadius: '8px', border: '1px dashed #25D366', marginBottom: '1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '4px', color: '#25D366' }}>{waCode}</span>
                        <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Aguardando você digitar o código no WhatsApp...</p>
                      </div>
                    )}
                    
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--theme-text-muted)', fontSize: '0.75rem', textDecoration: 'underline', marginBottom: '0', cursor: 'pointer', width: '100%' }}
                      onClick={() => setUsePairingCode(false)}
                    >
                      Prefiro usar o QR Code
                    </button>
                  </>
                ) : (
                  // VISÃO PC (QR CODE)
                  <>
                    <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                      1. Abra o WhatsApp no celular da barbearia<br/>
                      2. Vá em Configurações &gt; Aparelhos Conectados<br/>
                      3. Aponte a câmera para o QR Code abaixo
                    </p>
                    <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'center', marginBottom: '1rem', alignSelf: 'center', width: '100%' }}>
                      {waQR ? (
                        <img src={waQR} alt="QR Code Real" style={{ width: '200px', height: '200px' }} />
                      ) : (
                        <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', border: '1px dashed #ccc' }}>Gerando QR Code...</div>
                      )}
                    </div>
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--theme-text-muted)', fontSize: '0.75rem', textDecoration: 'underline', marginBottom: '0', cursor: 'pointer', width: '100%' }}
                      onClick={() => setUsePairingCode(true)}
                    >
                      Estou usando o celular (Gerar Código)
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          <div className={styles.inputGroup} style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--theme-card)', borderRadius: '12px', border: '1px solid rgba(255, 184, 0, 0.2)' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--theme-accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Share2 size={20} /> Divulgar Aplicativo
            </h3>
            <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.4 }}>
              Envie este link no WhatsApp dos seus clientes ou coloque na bio do Instagram para eles agendarem sozinhos!
            </p>
            <button 
              className={styles.primaryButton}
              style={{ backgroundColor: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: 'none', marginBottom: 0 }}
              onClick={() => {
                const msg = encodeURIComponent("Olá! Agora nossa barbearia tem aplicativo próprio. Agende seu horário sem filas pelo nosso link oficial:\n\n👉 http://localhost:3000/agendar/teste");
                window.open(`https://wa.me/?text=${msg}`, '_blank');
              }}
            >
              COMPARTILHAR NO WHATSAPP
            </button>
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Nome do Estabelecimento</label>
            <input className={styles.inputField} defaultValue="Salão Modelo" />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>WhatsApp (Contato)</label>
            <input className={styles.inputField} type="tel" defaultValue="(11) 99999-9999" placeholder="Aparecerá no app do cliente" />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Endereço (Localização)</label>
            <input className={styles.inputField} defaultValue="Av. Paulista, 1000 - SP" placeholder="Aparecerá no app do cliente" />
          </div>

          <div className={styles.inputGroup} style={{ marginBottom: '1.5rem', alignItems: 'center' }}>
            <label className={styles.inputLabel} style={{ width: '100%', textAlign: 'center', marginBottom: '1rem' }}>Foto do Salão</label>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div 
                style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: 'var(--theme-card)', border: '2px solid var(--theme-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                onClick={() => alert("Abrir galeria do celular...")}
              >
                <Camera size={32} color="var(--theme-text-muted)" />
              </div>
              <span style={{ color: 'var(--theme-accent)', fontWeight: 600, fontSize: '0.875rem' }}>Alterar Foto</span>
            </div>
          </div>

          <div className={styles.inputGroup} style={{ marginBottom: '2rem' }}>
            <label className={styles.inputLabel}>Dias de Funcionamento</label>
            <div className={styles.workingDaysGrid}>
              {weekDayNames.map((day, idx) => (
                <button 
                  key={idx}
                  className={`${styles.workingDayBtn} ${workingDays[idx] ? styles.active : ''}`}
                  onClick={() => toggleDay(idx)}
                >
                  {day}
                </button>
              ))}
            </div>
            
            <div style={{ marginTop: '1.25rem' }}>
              <label className={styles.inputLabel}>Horário Comercial</label>
              <div className={styles.timeRow}>
                <span>Das</span>
                <input type="time" className={styles.timeInput} defaultValue="09:00" />
                <span>até</span>
                <input type="time" className={styles.timeInput} defaultValue="19:00" />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <label className={styles.inputLabel}>Pausa para o Almoço (Agenda Fechada)</label>
              <div className={styles.timeRow}>
                <span>Das</span>
                <input type="time" className={styles.timeInput} defaultValue="12:00" />
                <span>até</span>
                <input type="time" className={styles.timeInput} defaultValue="13:00" />
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Gerenciar Equipe</label>
            <button 
              className={styles.actionButton} 
              style={{ backgroundColor: 'var(--theme-card)', color: 'var(--theme-accent)', border: '1px solid var(--theme-accent)' }}
              onClick={() => setIsTeamModalOpen(true)}
            >
              <Scissors size={20} /> Ver Barbeiros ({team.length})
            </button>
          </div>

          <div className={styles.copyLinkBox}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--theme-accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Link size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Link Público da Barbearia</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--theme-text-muted)' }}>barbeiro.com/salaomodelo</div>
            </div>
            <button 
              className={`${styles.actionButton} ${styles.btnPrimary}`} 
              style={{ marginTop: '0.5rem' }}
              onClick={handleCopyLink}
            >
              COPIAR LINK
            </button>
          </div>
        </div>
      )}

      {activeTab === 'caixa' && (
        <div className={styles.content}>
          <h2 className={styles.sectionTitle}>Fechamento do Caixa</h2>
          <p style={{ color: 'var(--theme-text-muted)', marginBottom: '1.5rem' }}>Histórico financeiro consolidado.</p>
          
          <div className={styles.appointmentCard} style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--theme-accent)' }}>Resumo de Hoje</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--theme-text-muted)' }}>Cortes Finalizados</span>
              <span style={{ fontWeight: 700 }}>{todaysAppointments.filter(a => a.status === 'completed').length} cortes</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontWeight: 700, color: 'var(--theme-accent)' }}>Total de Hoje</span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--theme-accent)' }}>{formatCurrency(totalEarningsToday)}</span>
            </div>
          </div>

          <div className={styles.appointmentCard}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--theme-success)' }}>Resumo do Mês</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--theme-text-muted)' }}>Cortes Finalizados</span>
              <span style={{ fontWeight: 700 }}>{appointments.filter(a => a.status === 'completed' && a.dateObj.getMonth() === currentMonthNum).length} cortes</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontWeight: 700, color: 'var(--theme-success)' }}>Faturamento Bruto</span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--theme-success)' }}>{formatCurrency(totalEarningsMonth)}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'perfil' && (
        <div className={styles.content}>
          <h2 className={styles.sectionTitle}>Meu Perfil</h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: 'var(--theme-card)', border: '2px solid var(--theme-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={32} color="var(--theme-text-muted)" />
            </div>
            <span style={{ color: 'var(--theme-accent)', fontWeight: 600, fontSize: '0.875rem' }}>Alterar Foto</span>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Seu Nome</label>
            <input className={styles.inputField} defaultValue="Carlos Eduardo" />
          </div>
        </div>
      )}

      {/* Modal de Gerenciamento de Equipe */}
      {isTeamModalOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100 }} onClick={() => setIsTeamModalOpen(false)} />
          <div style={{ position: 'fixed', top: '10%', left: '5%', right: '5%', bottom: '10%', backgroundColor: 'var(--theme-bg)', zIndex: 101, borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Sua Equipe</h2>
              <button onClick={() => setIsTeamModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--theme-text-muted)', cursor: 'pointer' }}>
                <span style={{ fontSize: '1.5rem' }}>×</span>
              </button>
            </div>

            <button 
              className={styles.primaryButton}
              style={{ width: '100%', marginBottom: '1.5rem', padding: '0.75rem', borderRadius: '8px' }}
              onClick={() => alert("Abrir formulário de cadastro de barbeiro...")}
            >
              + Adicionar Novo Barbeiro
            </button>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
              {team.map(member => (
                <div key={member.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--theme-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  
                  {/* Foto Idêntica ao resto do app */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div 
                      style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: 'var(--theme-bg)', border: '2px solid var(--theme-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      onClick={() => alert(`Escolher foto para ${member.name}...`)}
                    >
                      <Camera size={32} color="var(--theme-text-muted)" />
                    </div>
                    <span style={{ color: 'var(--theme-accent)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Adicionar Foto</span>
                  </div>
                  
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input 
                      className={styles.inputField} 
                      defaultValue={member.name} 
                      style={{ textAlign: 'center', fontWeight: 700, fontSize: '1rem', padding: '0.75rem' }}
                    />
                    <button 
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', padding: '0.5rem' }}
                      onClick={() => alert(`Remover ${member.name}?`)}
                    >
                      <Trash2 size={16} /> Remover Barbeiro
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </>
      )}

      </div> {/* Fechamento do mainWrapper */}
    </div>
  );
}
