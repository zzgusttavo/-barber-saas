'use client';

import React, { useState, useEffect } from 'react';
import styles from './agendamento.module.css';
import { 
  Menu, Bell, Settings, MapPin, Globe, Share2,
  Scissors, User, CheckCircle2, Phone, ChevronLeft, ChevronRight, X, Sun, Moon, Camera, Key
} from 'lucide-react';

const mockBarbers = [
  { id: '1', name: 'Carlos Eduardo' },
  { id: '2', name: 'Marcos Silva' },
  { id: '3', name: 'Rafael Costa' },
];

const MustacheIcon = ({ size, color, style, ...props }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color || "currentColor"} style={style} {...props}>
    <path d="M2.38 12.5C3.36 10.87 5.76 9.4 8.5 9.4C10.5 9.4 12 10.6 12 11.8C12 10.6 13.5 9.4 15.5 9.4C18.24 9.4 20.64 10.87 21.62 12.5C21.75 12.7 21.57 12.93 21.35 12.87C19 12.2 16.5 12.9 15.5 14C15.3 14.2 15 14.2 14.8 14C13.5 12.5 12.5 12.5 12 12.5C11.5 12.5 10.5 12.5 9.2 14C9 14.2 8.7 14.2 8.5 14C7.5 12.9 5 12.2 2.65 12.87C2.43 12.93 2.25 12.7 2.38 12.5Z" />
  </svg>
);

const ComboIcon = ({ size, ...props }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', height: size }}>
    <Scissors size={size * 0.75} {...props} />
    <MustacheIcon size={size * 0.75} {...props} />
  </div>
);

const mockServices = [
  { id: '1', name: 'Corte Degradê', icon: Scissors, price: 45 },
  { id: '2', name: 'Social', icon: Scissors, price: 40 },
  { id: '3', name: 'Corte e Barba', icon: ComboIcon, price: 75 },
  { id: '4', name: 'Barba', icon: MustacheIcon, price: 35 },
];

const mockTimes = ['09:00', '09:40', '10:20', '11:00', '11:40', '13:00', '13:40', '14:20', '15:00', '15:40', '16:20', '17:00', '17:40', '18:20', '19:00', '19:40'];

export default function AgendamentoPage({ params }: { params: Promise<{ slug: string }> }) {
  const [barbers, setBarbers] = useState<any[]>(mockBarbers);
  const [services, setServices] = useState<any[]>(mockServices);

  useEffect(() => {
    fetch('/api/barbers').then(r => r.json()).then(data => setBarbers(data));
    fetch('/api/services').then(r => r.json()).then(data => {
      const withIcons = data.map((s: any) => ({
        ...s,
        icon: s.name.toLowerCase().includes('barba') && s.name.toLowerCase().includes('corte') ? ComboIcon : (s.name.toLowerCase().includes('barba') ? MustacheIcon : Scissors)
      }));
      setServices(withIcons);
    });
  }, []);

  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Custom Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authData, setAuthData] = useState({ username: '', password: '', whatsapp: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Tabs: 'agendar' | 'perfil' | 'config'
  const [clientTab, setClientTab] = useState('agendar');

  const BackgroundPattern = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: -1, overflow: 'hidden', background: 'radial-gradient(circle at 50% 30%, rgba(255, 184, 0, 0.04) 0%, #000000 80%)' }}>
      <Scissors size={80} color="#ffb800" style={{ position: 'absolute', top: '15%', left: '10%', opacity: 0.04, transform: 'rotate(25deg)' }} />
      <MustacheIcon size={100} color="#ffb800" style={{ position: 'absolute', top: '35%', right: '5%', opacity: 0.04, transform: 'rotate(-15deg)' }} />
      <Scissors size={120} color="#ffb800" style={{ position: 'absolute', top: '65%', left: '-5%', opacity: 0.04, transform: 'rotate(65deg)' }} />
      <MustacheIcon size={90} color="#ffb800" style={{ position: 'absolute', top: '80%', right: '15%', opacity: 0.04, transform: 'rotate(10deg)' }} />
    </div>
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const isFormComplete = selectedBarber && selectedService && selectedDate && selectedTime;

  const handleOpenAuth = () => {
    if (isFormComplete) {
      setIsAuthModalOpen(true);
    }
  };

  const handleRegisterAndBook = async () => {
    if (authData.username && authData.password && authData.whatsapp) {
      try {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientName: authData.username,
            whatsapp: authData.whatsapp,
            password: authData.password,
            date: selectedDate,
            time: selectedTime,
            serviceName: selectedService ? services.find(s => s.id === selectedService)?.name : 'Corte Padrão',
            price: selectedService ? services.find(s => s.id === selectedService)?.price : 0
          })
        });

        if (response.ok) {
          setIsAuthModalOpen(false);
          setIsSuccess(true);
          window.scrollTo(0, 0);
        } else {
          alert("Erro ao criar agendamento. Tente novamente.");
        }
      } catch (error) {
        console.error(error);
        alert("Erro de conexão.");
      }
    } else {
      alert("Por favor, preencha todos os campos obrigatórios (Nome, Senha e WhatsApp).");
    }
  };

  // Funções do Calendário Horizontal (Estilo App do Barbeiro)
  // Simulação: Barbeiro trabalha de Segunda a Sábado (Dom=0 é falso)
  const workingDays = [false, true, true, true, true, true, true]; 

  const generateAvailableDays = () => {
    const days = [];
    const date = new Date();
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    // Gerar os próximos 15 dias válidos (pulando os dias que ele não trabalha)
    let added = 0;
    while (added < 15) {
      if (workingDays[date.getDay()]) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const dateString = `${yyyy}-${mm}-${dd}`;

        days.push({
          dayName: added === 0 ? 'Hoje' : dayNames[date.getDay()],
          dayNumber: date.getDate(),
          fullDate: dateString
        });
        added++;
      }
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const nextDays = generateAvailableDays();

  // Se o selectedDate não for um dia válido inicial, pegamos o primeiro da lista
  React.useEffect(() => {
    if (nextDays.length > 0 && !nextDays.find(d => d.fullDate === selectedDate)) {
      setSelectedDate(nextDays[0].fullDate);
    }
  }, []);

  const handleDateSelect = (dateString: string) => {
    setSelectedDate(dateString);
    setSelectedTime(null); // Reseta o horário ao trocar o dia
  };

  if (isSuccess) {
    const serviceName = selectedService ? services.find(s => s.id === selectedService)?.name : 'Corte';
    const message = encodeURIComponent(`Olá! Acabei de fazer um agendamento pelo app.\n\n✂️ Serviço: ${serviceName}\n📅 Data: ${selectedDate} às ${selectedTime}\n👤 Cliente: ${authData.username}`);
    const whatsappLink = `https://wa.me/5511999999999?text=${message}`;

    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div className={styles.successIconAnim}>
          <CheckCircle2 size={100} color="var(--theme-accent)" style={{ marginBottom: '1.5rem' }} />
        </div>
        <div className={styles.successTextAnim} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <h1 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '1rem', lineHeight: 1.1 }}>Agendamento<br/>Confirmado!</h1>
          <p style={{ color: 'var(--theme-text-muted)', textAlign: 'center', marginBottom: '2.5rem', fontSize: '1.125rem' }}>
            Tudo certo, {authData.username.split(' ')[0]}! Te esperamos no dia {selectedDate} às {selectedTime}.
          </p>
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryButton}
            style={{ backgroundColor: '#25D366', color: '#fff', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}
          >
            AVISAR NO WHATSAPP
          </a>
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--theme-text-muted)', fontSize: '1rem', cursor: 'pointer', marginTop: '1.5rem', textDecoration: 'underline' }}
            onClick={() => window.location.reload()}
          >
            Fazer outro agendamento
          </button>
        </div>
      </div>
    );
  }

  const renderTopNav = () => (
    <div className={styles.topNav}>
      <button className={styles.topIcon} onClick={() => setIsMenuOpen(true)}><Menu size={24} /></button>
      <div className={styles.topIconGroup}>
        <button className={styles.topIcon} onClick={() => alert("Nenhuma nova notificação.")}><Bell size={24} /></button>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <BackgroundPattern />
      {renderTopNav()}

      {clientTab === 'agendar' && (
        <>
          <div className={styles.heroSection}>
            <div className={styles.logoWrapper}>
          <User size={48} color="var(--theme-accent)" />
        </div>

        {/* Referência aos dados configurados pelo dono */}
        <div className={styles.socialRow}>
          {/* Se configurou o WhatsApp, o botão aparece */}
          <a 
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialBtn} 
            style={{ textDecoration: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </a>

          {/* Se configurou o Endereço, o botão aparece */}
          <a 
            href="https://maps.google.com/?q=Av.+Paulista,+1000+-+SP"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialBtn} 
            style={{ textDecoration: 'none' }}
          >
            <MapPin size={20} />
          </a>
        </div>

        <h1 className={styles.shopName}>Salão Modelo</h1>
      </div>

      {/* Bloco 1: Barbeiro */}
      <div className={styles.contentBlock}>
        <h2 className={styles.blockTitle}>Escolha o Profissional</h2>
        <div className={styles.barberScroll}>
          {barbers.map(barber => (
            <div 
              key={barber.id}
              className={`${styles.barberCard} ${selectedBarber === barber.id ? styles.barberCardSelected : ''}`}
              onClick={() => setSelectedBarber(barber.id)}
            >
              <div className={styles.barberAvatar}>
                <User size={24} color={selectedBarber === barber.id ? '#000' : 'var(--theme-text-muted)'} />
              </div>
              <span className={styles.barberName}>{barber.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bloco 2: Serviço */}
      <div className={styles.contentBlock}>
        <h2 className={styles.blockTitle}>Escolha o Serviço</h2>
        <div className={styles.serviceGrid}>
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div 
                key={service.id} 
                className={`${styles.serviceCard} ${selectedService === service.id ? styles.serviceCardSelected : ''}`}
                onClick={() => setSelectedService(service.id)}
              >
                <div className={styles.serviceIconWrapper}>
                  <Icon size={48} strokeWidth={1.25} />
                </div>
                <div className={styles.serviceName}>{service.name}</div>
                <div style={{ fontWeight: 700, marginTop: '-0.5rem' }}>{formatCurrency(service.price)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bloco 3: Data e Hora */}
      <div className={styles.contentBlock}>
        <h2 className={styles.blockTitle}>Escolha o Horário</h2>
        
        {/* Filtro de Datas Horizontal */}
        <div className={styles.dateFilter}>
          {nextDays.map((d, i) => (
            <div 
              key={d.fullDate} 
              className={`${styles.datePill} ${selectedDate === d.fullDate ? styles.datePillSelected : ''}`}
              onClick={() => handleDateSelect(d.fullDate)}
            >
              <span className={styles.dateDayName}>{d.dayName}</span>
              <span className={styles.dateNumber}>{d.dayNumber}</span>
            </div>
          ))}
        </div>

        <div className={styles.timeGrid}>
          {mockTimes.map((time, idx) => {
            const disabled = idx === 2 || idx === 5;
            return (
              <div 
                key={time}
                className={`${styles.timeSlot} ${selectedTime === time ? styles.timeSlotSelected : ''}`}
                style={{ opacity: disabled ? 0.3 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                onClick={() => !disabled && setSelectedTime(time)}
              >
                {time}
              </div>
            )
          })}
        </div>
      </div>

          {/* Botão Fixo Inferior */}
          <div className={styles.footerActions}>
            <button 
              className={styles.primaryButton} 
              disabled={!isFormComplete}
              onClick={handleOpenAuth}
            >
              {isFormComplete ? 'AGENDAR HORÁRIO' : 'SELECIONE AS OPÇÕES'}
            </button>
          </div>
        </>
      )}

      {clientTab === 'perfil' && (
        <div style={{ padding: '6rem 1.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Meu Perfil</h2>
          
          <div style={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: 'var(--theme-card)', border: '2px solid var(--theme-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '1rem' }} onClick={() => alert("Abrir galeria...")}>
            <Camera size={40} color="var(--theme-text-muted)" />
          </div>
          <span style={{ color: 'var(--theme-accent)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '2rem', cursor: 'pointer' }}>Alterar Foto</span>

          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-text-muted)', fontSize: '0.875rem' }}>Nome Completo</label>
              <input className={styles.inputField} defaultValue="Cliente Exemplo" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-text-muted)', fontSize: '0.875rem' }}>E-mail (Opcional)</label>
              <input className={styles.inputField} type="email" placeholder="cliente@email.com" />
            </div>
            <button className={styles.primaryButton} style={{ marginTop: '1rem' }} onClick={() => alert("Perfil atualizado!")}>SALVAR ALTERAÇÕES</button>
          </div>
        </div>
      )}

      {clientTab === 'config' && (
        <div style={{ padding: '6rem 1.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Configurações de Acesso</h2>
          
          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-text-muted)', fontSize: '0.875rem' }}>Número do WhatsApp</label>
              <input className={styles.inputField} type="tel" defaultValue="(11) 99999-9999" />
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-text-muted)', fontSize: '0.875rem' }}>Senha Atual</label>
              <input className={styles.inputField} type="password" placeholder="Digite a senha atual" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--theme-text-muted)', fontSize: '0.875rem' }}>Nova Senha</label>
              <input className={styles.inputField} type="password" placeholder="Crie uma nova senha" />
            </div>
            <button className={styles.primaryButton} style={{ marginTop: '1rem' }} onClick={() => alert("Configurações atualizadas!")}>ATUALIZAR ACESSO</button>
          </div>
        </div>
      )}

      {/* Modal de Cadastro (Usuário e Senha) */}
      {isAuthModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Falta pouco!</h2>
              <button onClick={() => setIsAuthModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--theme-text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            
            <p style={{ color: 'var(--theme-text-muted)', marginBottom: '2rem' }}>
              Crie seu Usuário e Senha para confirmar o agendamento e acompanhar seu histórico.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <input 
                type="text" 
                placeholder="Como quer ser chamado?" 
                className={styles.inputField} 
                value={authData.username}
                onChange={(e) => setAuthData({...authData, username: e.target.value})}
              />
              <input 
                type="tel" 
                placeholder="WhatsApp (DDD + Número) *" 
                className={styles.inputField} 
                value={authData.whatsapp}
                onChange={(e) => setAuthData({...authData, whatsapp: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="Crie uma senha de acesso" 
                className={styles.inputField}
                value={authData.password}
                onChange={(e) => setAuthData({...authData, password: e.target.value})}
              />
            </div>

            <button 
              className={styles.primaryButton}
              style={{ width: '100%', marginBottom: 0 }}
              disabled={authData.username.length < 3 || authData.password.length < 4 || authData.whatsapp.length < 10}
              onClick={handleRegisterAndBook}
            >
              CRIAR CONTA E AGENDAR
            </button>
          </div>
        </div>
      )}

      {/* Drawer do Cliente */}
      {isMenuOpen && (
        <>
          <div className={styles.drawerOverlay} onClick={() => setIsMenuOpen(false)} />
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Opções</span>
              <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--theme-text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.drawerMenu}>
              <button className={styles.drawerItem} onClick={() => { setClientTab('agendar'); setIsMenuOpen(false); }}>
                <Scissors size={20} className={styles.drawerItemIcon} />
                <span>Agendar Horário</span>
              </button>

              <button className={styles.drawerItem} onClick={() => { setClientTab('perfil'); setIsMenuOpen(false); }}>
                <User size={20} className={styles.drawerItemIcon} />
                <span>Meu Perfil</span>
              </button>

              <button className={styles.drawerItem} onClick={() => { setClientTab('config'); setIsMenuOpen(false); }}>
                <Settings size={20} className={styles.drawerItemIcon} />
                <span>Configurações</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
