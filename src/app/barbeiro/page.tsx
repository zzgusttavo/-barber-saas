'use client';

import React, { useState, useEffect } from 'react';
import styles from './barbeiro.module.css';
import { 
  User, Clock, CheckCircle2, Menu,
  Calendar, Wallet, Settings, Link, Camera, Scissors, Trash2, Share2
} from 'lucide-react';
import { useSession } from "next-auth/react";

export default function AppDonoPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('agenda');
  const [selectedFilterDate, setSelectedFilterDate] = useState(new Date().toDateString());
  const [filterBarberId, setFilterBarberId] = useState('all');
  
  const [isMobile, setIsMobile] = useState(false);
  const [usePairingCode, setUsePairingCode] = useState(false);
  const [phoneForPairing, setPhoneForPairing] = useState('');
  const [waQR, setWaQR] = useState<string | null>(null);
  const [waCode, setWaCode] = useState<string | null>(null);
  const [waStatus, setWaStatus] = useState('loading');
  const [isLoaded, setIsLoaded] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [domainHost, setDomainHost] = useState("");
  const [domainOrigin, setDomainOrigin] = useState("");

  const { data: session, status } = useSession();

  // State for Teams and Services
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [team, setTeam] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  const [newBarber, setNewBarber] = useState({ name: '', email: '', password: '' });
  const [newService, setNewService] = useState({ name: '', price: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/';
      return;
    }

    if (status === 'authenticated' && session?.user) {
      setDomainHost(window.location.host);
      setDomainOrigin(window.location.origin);
      
      const user = session.user as any;
      setSlug(user.slug || "");
      setOwnerName(user.name || "");
      
      setIsLoaded(true);
    }
  }, [session, status]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(mobile);
      setUsePairingCode(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

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
        body: JSON.stringify({ phone: '55' + phoneForPairing.replace(/[^0-9]/g, '') })
      });
      const data = await res.json();
      if (data.code) {
        setWaCode(data.code);
      } else {
        alert('Erro ao gerar código.');
      }
    } catch (err) {
      alert('Erro de conexão com o robô.');
    }
  };

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
          id: app.id,
          time: new Date(app.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          dateObj: new Date(app.date),
          client: app.client?.name || 'Cliente',
          service: app.service?.name || 'Serviço',
          price: app.service?.price || 0,
          status: app.status.toLowerCase(),
          barberId: app.barberId
        })));
      }
      if(Array.isArray(srvData)) setServices(srvData);
      if(Array.isArray(barData)) setTeam(barData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: 'completed' } : app));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddService = async () => {
    if(!newService.name || !newService.price) return alert("Preencha nome e preço!");
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newService.name, price: newService.price })
      });
      if(res.ok) {
        setNewService({name: '', price: ''});
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao adicionar");
      }
    } catch(err) {
      alert("Erro de conexão");
    }
  };

  const handleDeleteService = async (id: string) => {
    if(!confirm("Tem certeza que deseja remover este serviço?")) return;
    await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleAddBarber = async () => {
    if(!newBarber.name || !newBarber.email || !newBarber.password) return alert("Preencha todos os campos!");
    try {
      const res = await fetch('/api/barbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBarber)
      });
      if(res.ok) {
        setNewBarber({name: '', email: '', password: ''});
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao adicionar");
      }
    } catch(err) {
      alert("Erro de conexão");
    }
  };

  const handleDeleteBarber = async (id: string) => {
    if(!confirm("Tem certeza que deseja desativar este profissional? Ele não poderá mais logar nem receber novos agendamentos.")) return;
    await fetch(`/api/barbers?id=${id}`, { method: 'DELETE' });
    loadData();
  };

  const [workingDays, setWorkingDays] = useState([false, true, true, true, true, true, true]);
  const weekDayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const toggleDay = (index: number) => {
    const newDays = [...workingDays];
    newDays[index] = !newDays[index];
    setWorkingDays(newDays);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const todayStr = new Date().toDateString();
  const currentMonthNum = new Date().getMonth();

  const totalEarningsToday = appointments
    .filter(a => a.status === 'completed' && a.dateObj.toDateString() === todayStr)
    .reduce((acc, curr) => acc + curr.price, 0);

  const totalEarningsMonth = appointments
    .filter(a => a.status === 'completed' && a.dateObj.getMonth() === currentMonthNum)
    .reduce((acc, curr) => acc + curr.price, 0);

  const todaysAppointments = appointments.filter(a => 
    a.dateObj.toDateString() === selectedFilterDate &&
    (filterBarberId === 'all' || a.barberId === filterBarberId)
  );

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
    const link = `${domainOrigin}/agendar/${slug}`;
    navigator.clipboard.writeText(link);
    alert(`Link copiado: ${link}`);
  };

  if (!isLoaded) return <div style={{ minHeight: '100vh', backgroundColor: 'var(--theme-bg)' }} />;

  return (
    <div className={styles.container}>
      <div className={`${styles.drawerOverlay} ${isDrawerOpen ? styles.open : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      <div className={`${styles.drawer} ${isDrawerOpen ? styles.open : ''}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerAvatar}>
            <User size={32} />
          </div>
          <div>
            <div className={styles.drawerName}>{ownerName}</div>
            <div className={styles.drawerRole}>Profissional</div>
          </div>
        </div>

        <div className={styles.menuList}>
          <button className={`${styles.menuItem} ${activeTab === 'agenda' ? styles.active : ''}`} onClick={() => handleTabChange('agenda')}>
            <Calendar size={20} /> Agenda
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

      <div className={styles.mainWrapper}>
        <div className={styles.header}>
          <button className={styles.menuBtn} onClick={() => setIsDrawerOpen(true)}>
            <Menu size={28} />
          </button>
          <div className={styles.drawerAvatar} style={{ width: 40, height: 40, border: 'none' }}>
            <User size={24} />
          </div>
        </div>

        <div className={styles.earningsCard}>
          <span className={styles.earningsTitle}>Faturamento de Hoje</span>
          <span className={styles.earningsValue}>{formatCurrency(totalEarningsToday)}</span>
        </div>
      
      {activeTab === 'agenda' && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--theme-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Filtrar por Profissional:</label>
            <select 
              value={filterBarberId} 
              onChange={(e) => setFilterBarberId(e.target.value)}
              className={styles.inputField}
              style={{ backgroundColor: 'var(--theme-card)' }}
            >
              <option value="all">Todos os Profissionais</option>
              {team.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

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
              <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Agenda</h2>
            </div>

            <div className={styles.agendaList}>
              {todaysAppointments.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--theme-text-muted)', marginTop: '2rem' }}>
                  Nenhum agendamento encontrado para o filtro atual.
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
                      <div className={styles.serviceInfo}>{app.service} <span style={{ opacity: 0.5 }}>• {team.find(b=>b.id === app.barberId)?.name}</span></div>
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
          </div>

          {/* Form Novo Serviço */}
          <div style={{ backgroundColor: 'var(--theme-card)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Cadastrar Novo Serviço</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input 
                className={styles.inputField} 
                placeholder="Ex: Degradê Navalhado"
                value={newService.name}
                onChange={e => setNewService({...newService, name: e.target.value})}
                style={{ flex: 2 }}
              />
              <input 
                className={styles.inputField} 
                type="number"
                placeholder="Valor (R$)"
                value={newService.price}
                onChange={e => setNewService({...newService, price: e.target.value})}
                style={{ flex: 1 }}
              />
            </div>
            <button className={styles.primaryButton} onClick={handleAddService}>Salvar Serviço</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
            {services.map(service => (
              <div key={service.id} style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--theme-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)' }}>Nome do Serviço</label>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{service.name}</div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)' }}>Preço (R$)</label>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{formatCurrency(service.price)}</div>
                  </div>
                </div>
                
                <button 
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', padding: '0.5rem' }}
                  onClick={() => handleDeleteService(service.id)}
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
                <p style={{ color: '#ef4444' }}>⚠️ Microserviço do WhatsApp offline.</p>
              </div>
            ) : (
              <>
                {usePairingCode ? (
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
                      <div style={{ backgroundColor: 'var(--theme-card)', padding: '1rem', borderRadius: '8px', border: '1px dashed #25D366', marginBottom: '1rem', textAlign: 'center' }}>
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
              Envie este link no WhatsApp dos seus clientes!
            </p>
            <button 
              className={styles.primaryButton}
              style={{ backgroundColor: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: 'none', marginBottom: 0 }}
              onClick={() => {
                const link = `${domainOrigin}/agendar/${slug}`;
                const msg = encodeURIComponent(`Olá! Agora nossa barbearia tem aplicativo próprio. Agende seu horário sem filas pelo nosso link oficial:\n\n👉 ${link}`);
                window.open(`https://wa.me/?text=${msg}`, '_blank');
              }}
            >
              COMPARTILHAR NO WHATSAPP
            </button>
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Gerenciar Equipe</label>
            <button 
              className={styles.actionButton} 
              style={{ backgroundColor: 'var(--theme-card)', color: 'var(--theme-accent)', border: '1px solid var(--theme-accent)' }}
              onClick={() => setIsTeamModalOpen(true)}
            >
              <Scissors size={20} /> Ver Profissionais Cadastrados ({team.length})
            </button>
          </div>

          <div className={styles.copyLinkBox}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--theme-accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Link size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Link Público da Barbearia</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--theme-text-muted)' }}>{domainHost}/agendar/{slug}</div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              <span style={{ fontWeight: 700, color: 'var(--theme-success)' }}>Faturamento Bruto</span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--theme-success)' }}>{formatCurrency(totalEarningsMonth)}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'perfil' && (
        <div className={styles.content}>
          <h2 className={styles.sectionTitle}>Meu Perfil</h2>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Seu Nome</label>
            <input className={styles.inputField} value={ownerName} onChange={(e) => setOwnerName(e.target.value)} disabled />
          </div>
        </div>
      )}

      {/* Modal de Gerenciamento de Equipe */}
      {isTeamModalOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100 }} onClick={() => setIsTeamModalOpen(false)} />
          <div style={{ position: 'fixed', top: '5%', left: '5%', right: '5%', bottom: '5%', backgroundColor: 'var(--theme-bg)', zIndex: 101, borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Sua Equipe</h2>
              <button onClick={() => setIsTeamModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--theme-text-muted)', cursor: 'pointer' }}>
                <span style={{ fontSize: '2rem' }}>×</span>
              </button>
            </div>

            <div style={{ backgroundColor: 'var(--theme-card)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Cadastrar Profissional</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input 
                  className={styles.inputField} placeholder="Nome do Barbeiro" 
                  value={newBarber.name} onChange={e => setNewBarber({...newBarber, name: e.target.value})}
                />
                <input 
                  className={styles.inputField} placeholder="Email (para Login)" type="email"
                  value={newBarber.email} onChange={e => setNewBarber({...newBarber, email: e.target.value})}
                />
                <input 
                  className={styles.inputField} placeholder="Senha provisória" type="text"
                  value={newBarber.password} onChange={e => setNewBarber({...newBarber, password: e.target.value})}
                />
                <button className={styles.primaryButton} style={{ marginTop: '0.5rem' }} onClick={handleAddBarber}>
                  Salvar Profissional
                </button>
              </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
              {team.map(member => (
                <div key={member.id} style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--theme-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{member.name}</div>
                    <div style={{ color: 'var(--theme-text-muted)', fontSize: '0.875rem' }}>Login: {member.email}</div>
                    <button 
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0', marginTop: '0.5rem' }}
                      onClick={() => handleDeleteBarber(member.id)}
                    >
                      <Trash2 size={16} /> Desativar Barbeiro
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </>
      )}

      </div>
    </div>
  );
}
