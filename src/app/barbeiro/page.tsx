'use client';

import React, { useState, useEffect } from 'react';
import styles from './barbeiro.module.css';
import { 
  User, Clock, CheckCircle2, Menu,
  Calendar, Wallet, Settings, Link, Camera, Scissors, Trash2, Share2,
  CreditCard, ShieldCheck, Zap, AlertTriangle, X
} from 'lucide-react';
import { useSession } from "next-auth/react";

export default function AppDonoPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('agenda');
  const [selectedFilterDate, setSelectedFilterDate] = useState(new Date().toDateString());
  const [filterBarberId, setFilterBarberId] = useState('all');

  // Subscription state (dados reais do MP)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelStep, setCancelStep] = useState(1);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>({
    plan: 'Pro',
    price: 49.90,
    status: 'pending',
    nextBilling: '—',
    startDate: '—',
    features: [
      'App de Agendamento para Clientes',
      'Painel de Gestão Completo',
      'Múltiplos Barbeiros / Profissionais',
      'Robô de WhatsApp Automático',
      'Confirmações e Lembretes por WhatsApp',
      'Relatório de Caixa (Dia e Mês)',
      'Link Público da Barbearia',
      'Suporte via WhatsApp',
    ]
  });

  
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

  // Buscar status real da assinatura do MP
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/subscriptions/status')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          const mpStatus = data.mpSubscriptionStatus;
          // Mapear status do MP para labels amigáveis
          const statusMap: Record<string, string> = {
            authorized: 'ativo',
            paused: 'pausado',
            cancelled: 'cancelado',
            pending: 'pendente',
          };
          setSubscriptionData((prev: any) => ({
            ...prev,
            status: statusMap[mpStatus] || mpStatus || 'pendente',
            nextBilling: data.mpNextBillingDate
              ? new Date(data.mpNextBillingDate).toLocaleDateString('pt-BR')
              : '—',
            startDate: data.createdAt
              ? new Date(data.createdAt).toLocaleDateString('pt-BR')
              : '—',
          }));
        }
      })
      .catch(err => console.error('Erro ao buscar status da assinatura:', err));
  }, [status]);

  // Cancelamento real no Mercado Pago
  const handleRealCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscriptionData((prev: any) => ({ ...prev, status: 'cancelado' }));
        setCancelStep(3);
      } else {
        alert(data.error || 'Erro ao cancelar. Tente novamente.');
      }
    } catch (err) {
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setIsCancelling(false);
    }
  };

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
          <button className={`${styles.menuItem} ${activeTab === 'assinatura' ? styles.active : ''}`} onClick={() => handleTabChange('assinatura')} style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            <CreditCard size={20} /> Assinatura
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

      {/* =========================================
          ABA DE ASSINATURA
          ========================================= */}
      {activeTab === 'assinatura' && (
        <div className={styles.content}>
          <h2 className={styles.sectionTitle}>Minha Assinatura</h2>

          {/* Card do Plano Atual */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,184,0,0.15) 0%, rgba(255,184,0,0.05) 100%)',
            border: '1px solid var(--theme-accent)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.06 }}>
              <Zap size={120} color="var(--theme-accent)" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'var(--theme-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={22} color="#000" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>Plano {subscriptionData.plan}</div>
                  <div style={{ color: 'var(--theme-text-muted)', fontSize: '0.8rem' }}>Acesso completo</div>
                </div>
              </div>
              <div style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                backgroundColor: subscriptionData.status === 'ativo' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                color: subscriptionData.status === 'ativo' ? '#22c55e' : '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {subscriptionData.status === 'ativo' ? '● Ativo' : '● Cancelado'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--theme-accent)' }}>
                R$ {subscriptionData.price.toFixed(2).replace('.', ',')}
              </span>
              <span style={{ color: 'var(--theme-text-muted)', fontSize: '0.9rem' }}>/mês</span>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--theme-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Próxima cobrança</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{subscriptionData.nextBilling}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--theme-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Cliente desde</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{subscriptionData.startDate}</div>
              </div>
            </div>
          </div>

          {/* Benefícios Incluídos */}
          <div style={{ backgroundColor: 'var(--theme-card)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <ShieldCheck size={20} color="var(--theme-accent)" />
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>O que está incluído no seu plano</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {subscriptionData.features.map(feature => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle2 size={13} color="#22c55e" />
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--theme-text)' }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico de Pagamentos (simulado) */}
          <div style={{ backgroundColor: 'var(--theme-card)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <CreditCard size={20} color="var(--theme-accent)" />
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Histórico de Pagamentos</span>
            </div>
            {[
              { date: new Date().toLocaleDateString('pt-BR'), value: 49.90, status: 'Pago' },
            ].map((payment, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Plano Pro – {payment.date}</div>
                  <div style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.1rem' }}>✓ {payment.status}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>R$ {payment.value.toFixed(2).replace('.', ',')}</div>
              </div>
            ))}
          </div>

          {/* Botão Cancelar */}
          <div style={{ borderTop: '1px solid rgba(239,68,68,0.2)', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--theme-text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
              O cancelamento é efetivo ao final do período pago. Você não será cobrado novamente após cancelar.
            </p>
            <button
              onClick={() => setIsCancelModalOpen(true)}
              style={{ width: '100%', padding: '0.875rem', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Cancelar Assinatura
            </button>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento */}
      {isCancelModalOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 200 }} onClick={() => { setIsCancelModalOpen(false); setCancelStep(1); }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '420px', backgroundColor: 'var(--theme-bg)', zIndex: 201, borderRadius: '20px', padding: '2rem', border: '1px solid rgba(239,68,68,0.3)' }}>
            
            <button onClick={() => { setIsCancelModalOpen(false); setCancelStep(1); }} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--theme-text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            {cancelStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={32} color="#ef4444" />
                </div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Tem certeza?</h2>
                <p style={{ color: 'var(--theme-text-muted)', lineHeight: 1.6 }}>
                  Ao cancelar, você perderá acesso ao app de agendamentos, ao robô de WhatsApp e a todos os recursos ao final do período atual.
                </p>
                <div style={{ backgroundColor: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '1rem', width: '100%', textAlign: 'left' }}>
                  <p style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: 600, marginBottom: '0.5rem' }}>Você vai perder:</p>
                  {['App de agendamento dos seus clientes', 'Robô de WhatsApp automático', 'Painel de caixa e relatórios', 'Suporte prioritário'].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: 'var(--theme-text-muted)', fontSize: '0.875rem' }}>
                      <span style={{ color: '#ef4444' }}>✕</span> {item}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setCancelStep(2)}
                  style={{ width: '100%', padding: '0.875rem', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Continuar com o cancelamento
                </button>
                <button
                  onClick={() => { setIsCancelModalOpen(false); setCancelStep(1); }}
                  className={styles.primaryButton}
                  style={{ margin: 0, width: '100%' }}
                >
                  Manter minha assinatura
                </button>
              </div>
            )}

            {cancelStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Nos conte o motivo</h2>
                <p style={{ color: 'var(--theme-text-muted)', fontSize: '0.875rem' }}>Sua opinião é importante para melhorarmos o sistema.</p>
                {['Está caro demais', 'Não estou usando', 'Faltam funcionalidades', 'Preferi outro sistema', 'Problemas técnicos', 'Outro motivo'].map(reason => (
                  <button
                    key={reason}
                    onClick={() => setCancelReason(reason)}
                    style={{ padding: '0.875rem 1rem', borderRadius: '10px', border: cancelReason === reason ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', backgroundColor: cancelReason === reason ? 'rgba(239,68,68,0.1)' : 'var(--theme-card)', color: cancelReason === reason ? '#ef4444' : 'var(--theme-text)', fontWeight: cancelReason === reason ? 700 : 400, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                  >
                    {reason}
                  </button>
                ))}
                <button
                  disabled={!cancelReason || isCancelling}
                  onClick={handleRealCancel}
                  style={{ padding: '0.875rem', backgroundColor: cancelReason ? '#ef4444' : 'rgba(239,68,68,0.2)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: cancelReason ? 'pointer' : 'not-allowed', marginTop: '0.5rem', opacity: cancelReason && !isCancelling ? 1 : 0.5 }}
                >
                  {isCancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
                </button>
              </div>
            )}

            {cancelStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
                <CheckCircle2 size={56} color="#22c55e" />
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Cancelamento Registrado</h2>
                <p style={{ color: 'var(--theme-text-muted)', lineHeight: 1.6 }}>
                  Sua assinatura foi cancelada. Você continua com acesso total até o fim do período pago. Sentiremos sua falta! 😢
                </p>
                <button
                  onClick={() => { setIsCancelModalOpen(false); setCancelStep(1); }}
                  className={styles.primaryButton}
                  style={{ margin: 0, width: '100%' }}
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </>
      )}

      </div>
    </div>
  );
}
