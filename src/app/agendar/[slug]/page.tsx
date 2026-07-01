'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import styles from './agendamento.module.css';
import { 
  Menu, Bell, Settings, MapPin, Globe, Share2,
  Scissors, User, CheckCircle2, Phone, ChevronLeft, ChevronRight, X, Sun, Moon, Camera, Key, Check, Star, Trophy, Calendar, Clock, ArrowRight
} from 'lucide-react';

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

const mockTimes = ['09:00', '09:40', '10:20', '11:00', '11:40', '13:00', '13:40', '14:20', '15:00', '15:40', '16:20', '17:00', '17:40', '18:20', '19:00', '19:40'];

export default function AgendamentoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { data: session, status } = useSession();
  const isClientLogged = (session?.user as any)?.role === 'CLIENT' && (session?.user as any)?.slug === slugStr;
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authData, setAuthData] = useState({ username: '', password: '', whatsapp: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClientLoginModalOpen, setIsClientLoginModalOpen] = useState(false);
  const [clientLoginData, setClientLoginData] = useState({ whatsapp: '', password: '' });
  const [clientAppointments, setClientAppointments] = useState<any[]>([]);
  
  const [slugStr, setSlugStr] = useState("");
  const [businessName, setBusinessName] = useState("Carregando...");
  const [businessPhone, setBusinessPhone] = useState("5562998430017");
  
  useEffect(() => {
    params.then(p => {
      setSlugStr(p.slug);
      
      fetch(`/api/barbershops/${p.slug}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setBusinessName("Barbearia não encontrada");
          } else {
            setBusinessName(data.name);
            if (data.phone) setBusinessPhone(data.phone);
          }
        })
        .catch(() => {
          setBusinessName("Erro ao carregar");
        });

      fetch(`/api/barbers?slug=${p.slug}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setBarbers(data);
        });

      fetch(`/api/services?slug=${p.slug}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const withIcons = data.map((s: any) => ({
              ...s,
              icon: s.name.toLowerCase().includes('barba') && s.name.toLowerCase().includes('corte') ? ComboIcon : (s.name.toLowerCase().includes('barba') ? MustacheIcon : Scissors)
            }));
            setServices(withIcons);
          }
        });
    });
  }, [params]);

  useEffect(() => {
    if (selectedBarber && selectedDate && slugStr) {
      setBookedTimes([]); // Clear while loading
      fetch(`/api/appointments?slug=${slugStr}&date=${selectedDate}&barberId=${selectedBarber}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const booked = data.map(app => {
              const d = new Date(app.date);
              return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            });
            setBookedTimes(booked);
          }
        });
    }
  }, [selectedBarber, selectedDate, slugStr]);
  
  useEffect(() => {
    if (isClientLogged && slugStr) {
      // Carregar agendamentos do cliente
      // Como a rota /api/appointments já filtra pelo usuário logado se não passar barbershop
      fetch(`/api/appointments`)
        .then(res => res.json())
        .then(data => {
           if(Array.isArray(data)) {
             // O endpoint /api/appointments já pode ser usado, mas precisamos garantir que ele retorne só do cliente
             // Por simplificação no MVP, vamos buscar e filtrar no frontend se necessário, mas o ideal é no backend.
             const mine = data.filter(a => a.clientId === (session?.user as any).id);
             setClientAppointments(mine);
           }
        });
    }
  }, [isClientLogged, slugStr, session]);

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('client-login', {
      whatsapp: clientLoginData.whatsapp,
      password: clientLoginData.password,
      slug: slugStr,
      redirect: false,
    });

    if (res?.error) {
      alert(res.error);
    } else {
      setIsClientLoginModalOpen(false);
      alert('Login realizado com sucesso!');
    }
  };
  
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
            slug: slugStr,
            barberId: selectedBarber,
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

  const workingDays = [false, true, true, true, true, true, true]; 

  const generateAvailableDays = () => {
    const days = [];
    const date = new Date();
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
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

  React.useEffect(() => {
    if (nextDays.length > 0 && !nextDays.find(d => d.fullDate === selectedDate)) {
      setSelectedDate(nextDays[0].fullDate);
    }
  }, []);

  const handleDateSelect = (dateString: string) => {
    setSelectedDate(dateString);
    setSelectedTime(null);
  };

  if (isSuccess) {
    const serviceName = selectedService ? services.find(s => s.id === selectedService)?.name : 'Corte';
    const message = encodeURIComponent(`Olá! Acabei de fazer um agendamento pelo app.\n\n✂️ Serviço: ${serviceName}\n📅 Data: ${selectedDate} às ${selectedTime}\n👤 Cliente: ${authData.username}`);
    const cleanShopPhone = businessPhone.replace(/[^0-9]/g, '');
    const whatsappLink = `https://wa.me/${cleanShopPhone}?text=${message}`;

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className={styles.topIcon} onClick={() => setIsMenuOpen(true)}><Menu size={24} /></button>
        {status === 'authenticated' && isClientLogged ? (
          <button 
            onClick={() => setClientTab(clientTab === 'agendar' ? 'meus_agendamentos' : 'agendar')}
            style={{ background: 'var(--theme-accent)', color: '#000', border: 'none', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {clientTab === 'agendar' ? 'Meus Agendamentos' : 'Agendar Novo'}
          </button>
        ) : (
          <button 
            onClick={() => setIsClientLoginModalOpen(true)}
            style={{ background: 'rgba(255,184,0,0.1)', color: 'var(--theme-accent)', border: '1px solid var(--theme-accent)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Login
          </button>
        )}
      </div>
      <div className={styles.topIconGroup}>
        {isClientLogged && (
           <button className={styles.topIcon} onClick={() => signOut()} title="Sair"><User size={24} /></button>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <BackgroundPattern />
      {renderTopNav()}

      {/* Modal de Login de Cliente */}
      {isClientLoginModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '400px', backgroundColor: '#1a1a1a' }}>
            <div className={styles.modalHeader}>
              <h3>Entrar na Área do Cliente</h3>
              <button onClick={() => setIsClientLoginModalOpen(false)} className={styles.closeBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleClientLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>WhatsApp</label>
                <input 
                  type="text" 
                  value={clientLoginData.whatsapp}
                  onChange={(e) => setClientLoginData({...clientLoginData, whatsapp: e.target.value})}
                  className={styles.modalInput}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Senha (criada no agendamento)</label>
                <input 
                  type="password" 
                  value={clientLoginData.password}
                  onChange={(e) => setClientLoginData({...clientLoginData, password: e.target.value})}
                  className={styles.modalInput}
                  placeholder="Sua senha"
                  required
                />
              </div>
              <button type="submit" className={styles.primaryButton} style={{ marginTop: '1rem' }}>
                Entrar
              </button>
            </form>
          </div>
        </div>
      )}

      {clientTab === 'meus_agendamentos' && isClientLogged && (
        <div style={{ padding: '1rem', marginTop: '4rem', width: '100%', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Calendar size={24} color="var(--theme-accent)" /> Seus Agendamentos
           </h2>
           {clientAppointments.length === 0 ? (
             <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ color: '#a1a1aa' }}>Nenhum agendamento encontrado.</p>
             </div>
           ) : (
             clientAppointments.map(app => (
               <div key={app.id} style={{ backgroundColor: '#18181b', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{app.service?.name}</div>
                    <div style={{ color: 'var(--theme-accent)', fontWeight: 700 }}>R$ {app.service?.price}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#a1a1aa', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} /> {new Date(app.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} /> {new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        backgroundColor: app.status === 'PENDING' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        color: app.status === 'PENDING' ? '#eab308' : '#22c55e'
                      }}>
                        {app.status === 'PENDING' ? 'Agendado' : 'Concluído'}
                      </span>
                    </div>
                  </div>
               </div>
             ))
           )}
        </div>
      )}

      {clientTab === 'agendar' && (
        <>
          <div className={styles.heroSection}>
            <div className={styles.logoWrapper}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--theme-accent)' }}>
                {businessName.charAt(0).toUpperCase()}
              </div>
            </div>

        <div className={styles.socialRow}>
          <a 
            href={`https://wa.me/${businessPhone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialBtn} 
            style={{ textDecoration: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </a>
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

        <h1 className={styles.shopName}>{businessName}</h1>
        <div className={styles.shopSubtitle}>BARBEARIA PREMIUM</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', color: 'var(--theme-text-muted)', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#eab308' }}>
            <Star size={16} fill="#eab308" /> 4,9
          </div>
          <span>(386 avaliações)</span>
          <span>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: 8, height: 8, backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
            Aberto até 20h
          </div>
        </div>
      </div>

      <div className={styles.contentBlock}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className={styles.blockTitle} style={{ margin: 0 }}><User size={20} color="var(--theme-accent)" /> 1. Escolha o profissional</h2>
          <span style={{ color: 'var(--theme-accent)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Ver todos</span>
        </div>
        {barbers.length === 0 && <div style={{color:'var(--theme-text-muted)'}}>Nenhum profissional cadastrado.</div>}
        
        {barbers.length === 1 ? (
          <div 
            className={`${styles.barberCardSingle} ${selectedBarber === barbers[0].id ? styles.barberCardSingleSelected : ''}`}
            onClick={() => { setSelectedBarber(barbers[0].id); setSelectedTime(null); }}
          >
            {selectedBarber === barbers[0].id && <div className={styles.checkCircle}><Check size={16} strokeWidth={3} /></div>}
            <div className={styles.barberAvatar} style={{ width: 80, height: 80 }}>
              <img src="https://i.pravatar.cc/150?img=11" alt={barbers[0].name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span className={styles.barberName} style={{ textAlign: 'left', fontSize: '1.2rem', marginBottom: '0.25rem' }}>{barbers[0].name}</span>
              <span className={styles.barberTitleSingle}>Barbeiro Premium</span>
              <div className={styles.barberStatsSingle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Star size={14} color="#eab308" fill="#eab308" /> <span style={{ color: '#fff', fontWeight: 700 }}>4,9</span> (386 avaliações)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Trophy size={14} color="var(--theme-text-muted)" /> +4.000 cortes realizados
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.barberScroll}>
            {barbers.map((barber, index) => (
              <div 
                key={barber.id}
                className={`${styles.barberCard} ${selectedBarber === barber.id ? styles.barberCardSelected : ''}`}
                onClick={() => { setSelectedBarber(barber.id); setSelectedTime(null); }}
              >
                {selectedBarber === barber.id && <div className={styles.checkCircle}><Check size={14} strokeWidth={3} /></div>}
                <div className={styles.barberAvatar}>
                  <img src={`https://i.pravatar.cc/150?img=${11 + index}`} alt={barber.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span className={styles.barberName}>{barber.name}</span>
                  <span className={styles.barberTitle}>Barbeiro</span>
                  <div className={styles.barberStats}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Star size={12} color="#eab308" fill="#eab308" /> <span style={{ color: '#fff', fontWeight: 700 }}>4,{9-index}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Trophy size={12} color="var(--theme-text-muted)" /> +{4-index}.{3+index}00 cortes
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.contentBlock}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className={styles.blockTitle} style={{ margin: 0 }}><Scissors size={20} color="var(--theme-accent)" /> 2. Escolha o serviço</h2>
          <span style={{ color: 'var(--theme-accent)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Ver todos</span>
        </div>
        {services.length === 0 && <div style={{color:'var(--theme-text-muted)'}}>Nenhum serviço cadastrado.</div>}
        <div className={styles.serviceScroll}>
          {services.map((service) => {
            const Icon = service.icon || Scissors;
            return (
              <div 
                key={service.id} 
                className={`${styles.serviceCard} ${selectedService === service.id ? styles.serviceCardSelected : ''}`}
                onClick={() => setSelectedService(service.id)}
              >
                {selectedService === service.id && <div className={styles.checkCircle}><Check size={14} strokeWidth={3} /></div>}
                <div className={styles.serviceIconWrapper}>
                  <Icon size={32} strokeWidth={1.25} />
                </div>
                <div className={styles.serviceName}>{service.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--theme-text-muted)', fontSize: '0.8rem' }}>
                  <Clock size={12} /> {service.duration || '40'} min
                </div>
                <div style={{ fontWeight: 700, marginTop: '0.25rem', color: 'var(--theme-accent)', fontSize: '1.1rem' }}>{formatCurrency(service.price)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.contentBlock}>
        <h2 className={styles.blockTitle} style={{ marginBottom: '1.5rem' }}><Calendar size={20} color="var(--theme-accent)" /> 3. Escolha a data</h2>
        
        <div className={styles.dateFilter}>
          {nextDays.map((d, i) => (
            <div 
              key={d.fullDate} 
              className={`${styles.datePill} ${selectedDate === d.fullDate ? styles.datePillSelected : ''}`}
              onClick={() => handleDateSelect(d.fullDate)}
            >
              <span className={styles.dateDayName}>{d.dayName}</span>
              <span className={styles.dateNumber}>{String(d.dayNumber).padStart(2, '0')}</span>
              <span className={styles.dateMonthName}>JUL</span>
              {selectedDate === d.fullDate && <div className={styles.dateActiveDot}></div>}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.contentBlock}>
        <h2 className={styles.blockTitle} style={{ marginBottom: '1.5rem' }}><Clock size={20} color="var(--theme-accent)" /> 4. Escolha o horário</h2>
        {selectedBarber ? (
          <div className={styles.timeGrid}>
            {mockTimes.map((time) => {
              const disabled = bookedTimes.includes(time);
              return (
                <div 
                  key={time}
                  className={`${styles.timeSlot} ${selectedTime === time ? styles.timeSlotSelected : ''}`}
                  style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
                  onClick={() => !disabled && setSelectedTime(time)}
                >
                  <span className={styles.timeText}>{time}</span>
                  <span className={`${styles.timeStatus} ${disabled ? styles.timeStatusUnavailable : ''}`}>{disabled ? 'Indisponível' : 'Disponível'}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--theme-text-muted)', padding: '2rem 0' }}>
            Selecione um profissional primeiro para ver os horários.
          </div>
        )}
      </div>

      <div className={styles.footerActions}>
        <div className={styles.footerSummary}>
          <div className={styles.footerAvatar}>
            {selectedBarber ? (
              <img src="https://i.pravatar.cc/150?img=11" alt="Barber" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <Scissors size={20} color="var(--theme-text-muted)" />
            )}
          </div>
          <div className={styles.footerInfo}>
            <span className={styles.footerTitle}>Resumo do agendamento</span>
            <span className={styles.footerService}>
              {selectedBarber ? barbers.find(b=>b.id===selectedBarber)?.name : 'Profissional'} • {selectedService ? services.find(s=>s.id===selectedService)?.name : 'Serviço'}
            </span>
            <span className={styles.footerDetails}>
              <Clock size={10} /> 40 min • <Calendar size={10} /> {selectedDate ? selectedDate.split('-')[2] : '--'} JUL • <Clock size={10} /> {selectedTime || '--:--'}
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className={styles.footerPriceCol}>
            <span className={styles.footerPrice}>{selectedService ? formatCurrency(services.find(s=>s.id===selectedService)?.price || 0) : 'R$ 0,00'}</span>
            <span className={styles.footerPriceLabel}>Valor total</span>
          </div>
          <button 
            className={styles.primaryButton} 
            disabled={!isFormComplete}
            onClick={handleOpenAuth}
          >
            Continuar <ArrowRight size={18} />
          </button>
        </div>
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
              <input className={styles.inputField} defaultValue={authData.username || "Cliente"} />
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
