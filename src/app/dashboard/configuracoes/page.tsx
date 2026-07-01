'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Settings, CheckCircle2, Share2, Link as LinkIcon, Camera, Copy, LogOut } from 'lucide-react';

export default function ConfiguracoesPage() {
  const { data: session, status } = useSession();
  const [waStatus, setWaStatus] = useState('loading');
  const [waQR, setWaQR] = useState<string | null>(null);
  
  const ownerName = session?.user?.name || "Proprietário";
  const slug = (session?.user as any)?.slug || "minha-barbearia";
  const domainOrigin = typeof window !== 'undefined' ? window.location.origin : "";

  useEffect(() => {
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
    return () => clearInterval(interval);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${domainOrigin}/agendar/${slug}`);
    alert('Link copiado!');
  };

  return (
    <div style={{ paddingBottom: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b', marginBottom: '1.5rem' }}>Perfil & Sistema</h1>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', backgroundColor: '#fff', padding: '2rem 1rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', position: 'relative' }}>
          <Camera size={24} color="#71717a" />
          <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#16a34a', padding: '0.25rem', borderRadius: '50%', border: '2px solid #fff' }}>
             <Plus size={12} color="#fff" strokeWidth={3} />
          </div>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{ownerName}</h2>
        <span style={{ color: '#71717a', fontSize: '0.875rem' }}>Proprietário</span>
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
            <p style={{ color: '#71717a', fontSize: '0.875rem', marginBottom: '1rem' }}>Aponte seu WhatsApp para conectar o robô:</p>
            {waQR ? (
              <img src={waQR} alt="QR Code" style={{ width: 150, height: 150, borderRadius: '8px' }} />
            ) : (
              <div style={{ width: 150, height: 150, border: '1px dashed #d4d4d8', borderRadius: '8px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Gerando...</div>
            )}
          </div>
        )}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid rgba(0,0,0,0.02)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Share2 size={18} /> Divulgar App
        </h3>
        <p style={{ color: '#71717a', fontSize: '0.875rem', marginBottom: '1rem' }}>Compartilhe o link do seu app no WhatsApp ou Instagram.</p>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{ flex: 1, backgroundColor: '#22c55e', color: '#fff', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={16} /> Compartilhar
          </button>
          <button onClick={handleCopyLink} style={{ backgroundColor: '#f4f4f5', color: '#18181b', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <Copy size={16} /> Copiar
          </button>
        </div>
      </div>

    </div>
  );
}

const Plus = ({ size, color, strokeWidth }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
