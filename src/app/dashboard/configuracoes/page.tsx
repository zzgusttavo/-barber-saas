'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Settings, CheckCircle2, Share2, Link as LinkIcon, Camera, Copy, LogOut, Plus, UserCog, ChevronRight } from 'lucide-react';

export default function ConfiguracoesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [waStatus, setWaStatus] = useState('loading');
  const [waQR, setWaQR] = useState<string | null>(null);
  const [waPairingCode, setWaPairingCode] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [isPairing, setIsPairing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const ownerName = session?.user?.name || "Proprietário";
  const slug = (session?.user as any)?.slug || "minha-barbearia";
  const domainOrigin = typeof window !== 'undefined' ? window.location.origin : "";

  useEffect(() => {
    const checkWaStatus = async () => {
      try {
        const res = await fetch('/api/wa-proxy');
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
    return () => clearInterval(interval);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${domainOrigin}/agendar/${slug}`);
    alert('Link copiado!');
  };

  const requestPairingCode = async () => {
    if (!phoneInput) return alert('Digite seu número de WhatsApp com DDD');
    setIsPairing(true);
    try {
      const res = await fetch('/api/wa-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput })
      });
      const data = await res.json();
      if (data.code) setWaPairingCode(data.code);
    } catch (err) {
      alert('Erro ao gerar código. O robô está ligado?');
    }
    setIsPairing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ paddingBottom: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b', marginBottom: '1.5rem' }}>Perfil & Sistema</h1>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', backgroundColor: '#fff', padding: '2rem 1rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <label style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}>
          {profileImage ? (
             <img src={profileImage} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
             <Camera size={24} color="#71717a" />
          )}
          <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#16a34a', padding: '0.25rem', borderRadius: '50%', border: '2px solid #fff' }}>
             <Plus size={12} color="#fff" strokeWidth={3} />
          </div>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
        </label>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{ownerName}</h2>
        <span style={{ color: '#71717a', fontSize: '0.875rem' }}>Proprietário</span>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCog size={18} /> Equipe & Profissionais
        </h3>
        <p style={{ color: '#71717a', fontSize: '0.875rem', marginBottom: '1rem' }}>Adicione ou gerencie os barbeiros que atendem no seu negócio.</p>
        
        <button onClick={() => router.push('/dashboard/profissionais')} style={{ width: '100%', backgroundColor: '#f4f4f5', color: '#18181b', padding: '1rem', borderRadius: '8px', border: 'none', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          Gerenciar Profissionais <ChevronRight size={16} color="#71717a" />
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a' }}>
          <Settings size={18} /> WhatsApp Robô
        </h3>
        {waStatus === 'connected' ? (
          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #16a34a', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle2 size={32} color="#16a34a" />
            <div>
              <div style={{ fontWeight: 700, color: '#16a34a' }}>Conectado</div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>Robô respondendo ativamente.</div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#71717a', fontSize: '0.875rem', marginBottom: '1rem' }}>Conecte seu robô pelo QR Code ou pelo seu celular:</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left' }}>
              <div style={{ border: '1px solid #e4e4e7', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Opção 1: Ler QR Code</h4>
                {waQR ? (
                  <img src={waQR} alt="QR Code" style={{ width: 150, height: 150, borderRadius: '8px', margin: '0 auto', display: 'block' }} />
                ) : (
                  <div style={{ width: 150, height: 150, border: '1px dashed #d4d4d8', borderRadius: '8px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Gerando...</div>
                )}
              </div>

              <div style={{ border: '1px solid #e4e4e7', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Opção 2: Código no Celular</h4>
                
                {waPairingCode ? (
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                     <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '4px', color: '#18181b', margin: '1rem 0' }}>{waPairingCode}</div>
                     <p style={{ fontSize: '0.75rem', color: '#71717a' }}>Abra o WhatsApp &gt; Aparelhos Conectados &gt; Conectar com número de telefone</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                    <input 
                      type="text" 
                      placeholder="Ex: 11999999999" 
                      value={phoneInput} 
                      onChange={(e) => setPhoneInput(e.target.value)}
                      style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e4e4e7', width: '100%', outline: 'none' }}
                    />
                    <button 
                      onClick={requestPairingCode}
                      disabled={isPairing}
                      style={{ backgroundColor: '#18181b', color: '#fff', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', width: '100%' }}
                    >
                      {isPairing ? 'Gerando...' : 'Gerar Código (8 letras)'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Share2 size={18} /> Divulgar App
        </h3>
        <p style={{ color: '#71717a', fontSize: '0.875rem', marginBottom: '1rem' }}>Compartilhe o link do seu app no WhatsApp ou Instagram.</p>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'Agende seu horário', url: `${domainOrigin}/agendar/${slug}` });
            } else {
              alert('Compartilhamento direto indisponível. Copie o link.');
            }
          }} style={{ flex: 1, backgroundColor: '#22c55e', color: '#fff', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <Share2 size={18} />
            Compartilhar
          </button>
          <button onClick={handleCopyLink} style={{ backgroundColor: '#f4f4f5', color: '#18181b', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <Copy size={16} /> Copiar
          </button>
        </div>
      </div>

    </div>
  );
}
