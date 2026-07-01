import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';

// --- Scene 1: The Hook ---
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 12 } });
  const titleY = interpolate(titleProgress, [0, 1], [50, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  const scaleBg = interpolate(frame, [0, 90], [1, 1.1]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#0a0a0a' }}>
      {/* Dynamic Background */}
      <AbsoluteFill style={{
        background: 'radial-gradient(circle at center, #2c3e50 0%, #000 100%)',
        transform: `scale(${scaleBg})`,
        opacity: 0.8
      }} />
      
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <h1 style={{
          fontSize: 85,
          fontWeight: 900,
          color: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.1,
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          textShadow: '0 10px 30px rgba(0,0,0,0.8)',
          fontFamily: 'system-ui, sans-serif'
        }}>
          O SEU SALÃO<br />
          <span style={{ color: '#f39c12' }}>NO PRÓXIMO NÍVEL</span>
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// --- Scene 2: Problem & Solution ---
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const text1Progress = spring({ frame, fps, config: { damping: 12 } });
  const text2Progress = spring({ frame: frame - 45, fps, config: { damping: 12 } });

  const text1Op = interpolate(text1Progress, [0, 1], [0, 1]);
  const text2Op = interpolate(text2Progress, [0, 1], [0, 1]);
  const text2Y = interpolate(text2Progress, [0, 1], [40, 0]);

  return (
    <AbsoluteFill style={{ background: '#000', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <h2 style={{
        fontSize: 55,
        color: '#ff4757',
        textAlign: 'center',
        opacity: text1Op,
        fontFamily: 'system-ui, sans-serif',
        fontWeight: 'bold',
        marginBottom: 40
      }}>
        Cansado de perder tempo no WhatsApp?
      </h2>

      <div style={{
        opacity: text2Op,
        transform: `translateY(${text2Y}px)`,
        background: 'linear-gradient(135deg, #f39c12 0%, #d35400 100%)',
        padding: '30px 40px',
        borderRadius: 20,
        boxShadow: '0 20px 40px rgba(243, 156, 18, 0.4)'
      }}>
        <h2 style={{
          fontSize: 60,
          color: '#fff',
          textAlign: 'center',
          margin: 0,
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 900
        }}>
          Agendamentos 100% Automáticos
        </h2>
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 3: Features ---
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const features = [
    "📅 Agenda Inteligente",
    "🔔 Lembretes via WhatsApp",
    "📊 Controle Financeiro",
    "📱 App Exclusivo"
  ];

  return (
    <AbsoluteFill style={{ background: '#0a0a0a', padding: '100px 50px', fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ fontSize: 70, color: '#fff', fontWeight: 900, marginBottom: 80, textAlign: 'center' }}>
        Tudo o que você precisa
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {features.map((feat, index) => {
          const delay = index * 15;
          const prog = spring({ frame: frame - delay, fps, config: { damping: 12 } });
          const slideX = interpolate(prog, [0, 1], [-100, 0]);
          const op = interpolate(prog, [0, 1], [0, 1]);

          return (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '30px 40px',
              borderRadius: 20,
              fontSize: 45,
              color: '#fff',
              fontWeight: 'bold',
              transform: `translateX(${slideX}px)`,
              opacity: op,
              borderLeft: '8px solid #f39c12'
            }}>
              {feat}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// --- Scene 4: Call to Action ---
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = Math.sin(frame / 5) * 0.05 + 1;
  const slideUp = spring({ frame, fps, config: { damping: 12 } });
  const y = interpolate(slideUp, [0, 1], [100, 0]);
  const op = interpolate(slideUp, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ 
      background: 'linear-gradient(to bottom, #000 0%, #1a1a1a 100%)', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 40,
      fontFamily: 'system-ui, sans-serif' 
    }}>
      <h1 style={{
        fontSize: 80,
        fontWeight: 900,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
        opacity: op,
        transform: `translateY(${y}px)`
      }}>
        TESTE GRÁTIS HOJE!
      </h1>
      <p style={{
        fontSize: 40,
        color: '#aaa',
        marginBottom: 80,
        opacity: op,
        textAlign: 'center'
      }}>
        Transforme a gestão da sua Barbearia.
      </p>

      <div style={{
        background: '#f39c12',
        color: '#000',
        padding: '30px 80px',
        borderRadius: 50,
        fontSize: 50,
        fontWeight: 900,
        transform: `scale(${pulse}) translateY(${y}px)`,
        boxShadow: '0 0 50px rgba(243, 156, 18, 0.6)',
        opacity: op
      }}>
        LINK NA BIO
      </div>
    </AbsoluteFill>
  );
};


// --- Main Composition ---
export const BarberAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Sequence from={0} durationInFrames={90}>
        <Scene1 />
      </Sequence>
      
      <Sequence from={90} durationInFrames={120}>
        <Scene2 />
      </Sequence>

      <Sequence from={210} durationInFrames={120}>
        <Scene3 />
      </Sequence>

      <Sequence from={330} durationInFrames={120}>
        <Scene4 />
      </Sequence>
    </AbsoluteFill>
  );
};
