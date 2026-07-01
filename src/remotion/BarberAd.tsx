import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';

// ==========================================
// UTILS
// ==========================================
const useFloat = (frame: number, amplitude = 15, speed = 30, offset = 0) => {
  return Math.sin((frame + offset) / speed) * amplitude;
};

// ==========================================
// SCENE 1: A Dor (Frames 0 - 180)
// ==========================================
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance Animation
  const scale = spring({
    frame,
    fps: 60,
    config: { damping: 12, stiffness: 100 },
  });

  // Antigravity Floating Icons
  const float1 = useFloat(frame, 20, 40, 0);
  const float2 = useFloat(frame, 25, 45, 20);
  const float3 = useFloat(frame, 15, 35, 40);
  
  return (
    <AbsoluteFill style={{ background: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
      {/* Floating Red Notification Icons */}
      <div style={{ position: 'absolute', top: '20%', left: '15%', transform: `translateY(${float1}px)`, background: '#ff4757', width: 60, height: 60, borderRadius: 30, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: 30, fontWeight: 'bold', boxShadow: '0 10px 20px rgba(255,71,87,0.4)' }}>1</div>
      <div style={{ position: 'absolute', top: '70%', right: '20%', transform: `translateY(${float2}px)`, background: '#ff4757', width: 80, height: 80, borderRadius: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: 40, fontWeight: 'bold', boxShadow: '0 10px 20px rgba(255,71,87,0.4)' }}>3</div>
      <div style={{ position: 'absolute', bottom: '15%', left: '30%', transform: `translateY(${float3}px)`, background: '#ff4757', width: 50, height: 50, borderRadius: 25, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: 24, fontWeight: 'bold', boxShadow: '0 10px 20px rgba(255,71,87,0.4)' }}>5</div>

      <h1 style={{
        fontSize: 70,
        fontWeight: 900,
        color: '#ffffff',
        textAlign: 'center',
        padding: '0 40px',
        transform: `scale(${scale})`,
        fontFamily: 'system-ui, sans-serif'
      }}>
        Sua agenda ainda vive no <span style={{ color: '#2ed573' }}>WhatsApp?</span>
      </h1>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 2: A Solução e a Marca (Frames 180 - 420)
// ==========================================
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Transition Circle
  const circleScale = spring({ frame, fps: 60, config: { damping: 20, stiffness: 80 } });
  
  // Dashboard Floating (Antigravity)
  const dashboardY = useFloat(frame, 15, 45, 0);
  const dashboardEnter = spring({ frame: frame - 30, fps: 60, config: { damping: 14 } });
  const dashboardOpacity = interpolate(dashboardEnter, [0, 1], [0, 1]);
  const dashboardYOffset = interpolate(dashboardEnter, [0, 1], [100, 0]);

  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden', alignItems: 'center' }}>
      {/* Fast Transition */}
      <div style={{
        position: 'absolute',
        width: 3000,
        height: 3000,
        borderRadius: '50%',
        background: '#0a0a0a',
        transform: `scale(${circleScale})`,
        zIndex: 0
      }} />

      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingTop: 100 }}>
        <h1 style={{ color: '#00ff88', fontSize: 60, fontWeight: 900, fontFamily: 'system-ui, sans-serif', margin: 0, textShadow: '0 0 20px rgba(0,255,136,0.5)' }}>
          AGENDA BARBER
        </h1>
        <p style={{ color: '#fff', fontSize: 35, textAlign: 'center', maxWidth: 800, marginTop: 20, fontFamily: 'system-ui, sans-serif' }}>
          Sua barbearia merece mais clientes e menos bagunça.
        </p>

        {/* Isometric Dashboard Recreated */}
        <div style={{
          marginTop: 150,
          opacity: dashboardOpacity,
          transform: `perspective(1000px) rotateX(15deg) rotateY(-15deg) translateY(${dashboardYOffset + dashboardY}px)`,
          width: 800,
          height: 500,
          background: '#1e1e1e',
          borderRadius: 20,
          border: '2px solid rgba(0,255,136,0.3)',
          boxShadow: '-30px 40px 60px rgba(0,0,0,0.8), 0 0 40px rgba(0,255,136,0.1)',
          display: 'flex',
          flexDirection: 'column',
          padding: 20
        }}>
          {/* Header Mock */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: 15 }}>
            <div style={{ width: 150, height: 20, background: '#333', borderRadius: 10 }} />
            <div style={{ width: 40, height: 40, background: '#00ff88', borderRadius: '50%' }} />
          </div>
          {/* Content Mock */}
          <div style={{ display: 'flex', gap: 20, marginTop: 20, flex: 1 }}>
            <div style={{ flex: 2, background: '#2a2a2a', borderRadius: 10, padding: 20 }}>
               <div style={{ width: '40%', height: 20, background: '#444', borderRadius: 5, marginBottom: 20 }} />
               {Array.from({ length: 4 }).map((_, i) => (
                 <div key={i} style={{ width: '100%', height: 40, background: '#333', borderRadius: 5, marginBottom: 10 }} />
               ))}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
               <div style={{ flex: 1, background: '#00ff88', borderRadius: 10, opacity: 0.9 }} />
               <div style={{ flex: 1, background: '#2a2a2a', borderRadius: 10 }} />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 3: A Visão do Profissional (Frames 420 - 780)
// ==========================================
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEnter = spring({ frame, fps: 60, config: { damping: 14 } });
  
  // Antigravity for cards jumping out (Z-axis)
  const card1Enter = spring({ frame: frame - 20, fps: 60, config: { damping: 12, stiffness: 100 } });
  const card2Enter = spring({ frame: frame - 40, fps: 60, config: { damping: 12, stiffness: 100 } });
  const card3Enter = spring({ frame: frame - 60, fps: 60, config: { damping: 12, stiffness: 100 } });

  const card1Float = useFloat(frame, 10, 40, 0);
  const card2Float = useFloat(frame, 15, 35, 20);
  const card3Float = useFloat(frame, 12, 45, 40);

  // Chart Animation
  const chartProgress = interpolate(frame - 80, [0, 60], [1000, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#f5f6fa', fontFamily: 'system-ui, sans-serif', alignItems: 'center' }}>
      <div style={{ position: 'absolute', top: 120, opacity: titleEnter }}>
        <h2 style={{ fontSize: 50, color: '#2f3640', fontWeight: 'bold', margin: 0 }}>Bom dia, Gustavo 👋</h2>
        <p style={{ fontSize: 30, color: '#718093', margin: '10px 0 0 0' }}>Seu controle em tempo real.</p>
      </div>

      {/* Floating UI Cards */}
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', perspective: 1200 }}>
        
        {/* Card 1: Faturamento */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '10%',
          width: 400,
          background: '#fff',
          borderRadius: 25,
          padding: 30,
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          transform: `scale(${card1Enter}) translateZ(100px) translateY(${card1Float}px) rotateY(10deg)`
        }}>
          <h3 style={{ fontSize: 24, color: '#7f8fa6', margin: 0 }}>Faturamento Hoje</h3>
          <h1 style={{ fontSize: 60, color: '#2f3640', margin: '10px 0 0 0' }}>R$ 1.240</h1>
          {/* Animated SVG Chart */}
          <svg width="100%" height="80" viewBox="0 0 340 80" style={{ marginTop: 20 }}>
             <path 
               d="M 0 70 Q 50 20 100 50 T 200 30 T 340 10" 
               fill="transparent" 
               stroke="#00ff88" 
               strokeWidth="8" 
               strokeLinecap="round"
               strokeDasharray="1000"
               strokeDashoffset={chartProgress}
             />
          </svg>
        </div>

        {/* Card 2: Agendamentos */}
        <div style={{
          position: 'absolute',
          top: '55%',
          right: '10%',
          width: 350,
          background: '#2f3640',
          borderRadius: 25,
          padding: 30,
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          transform: `scale(${card2Enter}) translateZ(150px) translateY(${card2Float}px) rotateY(-10deg)`
        }}>
          <h3 style={{ fontSize: 24, color: '#fff', margin: 0 }}>Agendamentos</h3>
          <h1 style={{ fontSize: 60, color: '#00ff88', margin: '10px 0 0 0' }}>24</h1>
          <p style={{ color: '#fff', fontSize: 20, opacity: 0.7, margin: 0 }}>+4 novos hoje</p>
        </div>

        {/* Card 3: Avaliação */}
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '25%',
          width: 300,
          background: '#fff',
          borderRadius: 25,
          padding: 30,
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          transform: `scale(${card3Enter}) translateZ(50px) translateY(${card3Float}px) rotateZ(-5deg)`
        }}>
          <h3 style={{ fontSize: 24, color: '#7f8fa6', margin: 0 }}>Avaliação</h3>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
            <h1 style={{ fontSize: 60, color: '#fbc531', margin: 0 }}>4.9</h1>
            <span style={{ fontSize: 40, marginLeft: 10 }}>⭐</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 4: A Visão do Cliente (Frames 780 - 1140)
// ==========================================
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = spring({ frame, fps: 60, config: { damping: 14 } });
  const scrollY = interpolate(frame, [60, 180], [0, -300], { extrapolateRight: 'clamp' });

  // Staggering Elements
  const dateCardEnter = spring({ frame: frame - 100, fps: 60, config: { damping: 12 } });
  const timeButton1Enter = spring({ frame: frame - 120, fps: 60, config: { damping: 12 } });
  const timeButton2Enter = spring({ frame: frame - 130, fps: 60, config: { damping: 12 } });
  
  // Click Simulation on "09:00"
  const clickScale = spring({ frame: frame - 180, fps: 60, config: { damping: 10 } });
  const circleOpacity = interpolate(frame, [180, 190, 200], [0, 0.5, 0], { extrapolateRight: 'clamp' });
  const buttonBg = frame > 190 ? '#00ff88' : '#2a2a2a';
  const buttonTextColor = frame > 190 ? '#000' : '#fff';

  return (
    <AbsoluteFill style={{ background: '#111', fontFamily: 'system-ui, sans-serif', alignItems: 'center', overflow: 'hidden' }}>
      <h2 style={{ fontSize: 50, color: '#fff', fontWeight: 'bold', marginTop: 100, opacity: titleOp }}>
        O cliente agenda sozinho
      </h2>
      
      {/* Mobile Booking Interface Container */}
      <div style={{
        marginTop: 50,
        width: 800,
        height: 1200,
        background: '#1a1a1a',
        borderRadius: 40,
        border: '10px solid #333',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: 40, borderBottom: '1px solid #333', background: '#1a1a1a', position: 'absolute', top: 0, width: '100%', zIndex: 10 }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: 45, textAlign: 'center' }}>Barbearia do Gustavo</h2>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '160px 40px 40px 40px', transform: `translateY(${scrollY}px)` }}>
          
          <h3 style={{ color: '#fff', fontSize: 35, marginBottom: 20 }}>1. Escolha o profissional</h3>
          <div style={{ background: '#2a2a2a', padding: 30, borderRadius: 20, display: 'flex', alignItems: 'center', marginBottom: 60 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#555', marginRight: 20 }} />
            <span style={{ color: '#fff', fontSize: 35 }}>Gustavo (Especialista)</span>
          </div>

          <h3 style={{ color: '#fff', fontSize: 35, marginBottom: 20 }}>2. Escolha o serviço</h3>
          <div style={{ background: '#2a2a2a', padding: 30, borderRadius: 20, display: 'flex', justifyContent: 'space-between', marginBottom: 60 }}>
            <span style={{ color: '#fff', fontSize: 35 }}>Corte + Barba</span>
            <span style={{ color: '#00ff88', fontSize: 35 }}>R$ 70</span>
          </div>

          <h3 style={{ color: '#fff', fontSize: 35, marginBottom: 20 }}>3. Escolha a data</h3>
          <div style={{ display: 'flex', gap: 20, marginBottom: 60 }}>
            <div style={{ 
              background: '#00ff88', 
              color: '#000', 
              padding: '20px 30px', 
              borderRadius: 20, 
              textAlign: 'center',
              transform: `scale(${dateCardEnter})`
            }}>
              <div style={{ fontSize: 25, fontWeight: 'bold' }}>HOJE</div>
              <div style={{ fontSize: 45, fontWeight: 900 }}>14</div>
            </div>
          </div>

          <h3 style={{ color: '#fff', fontSize: 35, marginBottom: 20 }}>4. Escolha o horário</h3>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{
              background: buttonBg,
              color: buttonTextColor,
              padding: '20px 40px',
              borderRadius: 20,
              fontSize: 35,
              fontWeight: 'bold',
              transform: `scale(${timeButton1Enter})`,
              transition: 'background 0.2s',
              position: 'relative'
            }}>
              09:00
              {/* Click Effect */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${clickScale})`,
                width: 100,
                height: 100,
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '50%',
                opacity: circleOpacity,
                pointerEvents: 'none'
              }} />
            </div>
            <div style={{
              background: '#2a2a2a',
              color: '#fff',
              padding: '20px 40px',
              borderRadius: 20,
              fontSize: 35,
              fontWeight: 'bold',
              transform: `scale(${timeButton2Enter})`
            }}>
              09:30
            </div>
          </div>

        </div>

        {/* Bottom CTA Glow */}
        <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: 40, background: 'linear-gradient(transparent, #1a1a1a 80%)' }}>
          <div style={{
            background: frame > 190 ? '#00ff88' : '#333',
            color: frame > 190 ? '#000' : '#888',
            padding: 30,
            borderRadius: 20,
            textAlign: 'center',
            fontSize: 40,
            fontWeight: 'bold',
            boxShadow: frame > 190 ? '0 0 40px rgba(0,255,136,0.4)' : 'none',
            transition: 'all 0.3s'
          }}>
            Continuar -&gt;
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ==========================================
// SCENE 5: A Oferta Irrecusável (Frames 1140 - 1500)
// ==========================================
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleEnter = spring({ frame, fps: 60, config: { damping: 14 } });
  
  const priceEnter = spring({ frame: frame - 40, fps: 60, config: { damping: 12, stiffness: 100 } });
  const priceY = interpolate(priceEnter, [0, 1], [300, 0]);

  const buttonEnter = spring({ frame: frame - 80, fps: 60, config: { damping: 12 } });
  // Continuous Pulse
  const buttonPulse = Math.sin((frame - 80) / 10) * 0.05 + 1;
  const finalScale = interpolate(buttonEnter, [0, 1], [0, buttonPulse]);

  return (
    <AbsoluteFill style={{ background: '#0a0a0a', fontFamily: 'system-ui, sans-serif', alignItems: 'center', justifyContent: 'center', padding: 50 }}>
      
      <h1 style={{
        fontSize: 65,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 900,
        transform: `scale(${titleEnter})`,
        marginBottom: 80
      }}>
        Tudo o que sua barbearia precisa<br />em um único sistema.
      </h1>

      <h2 style={{
        fontSize: 40,
        color: '#a4b0be',
        textAlign: 'center',
        transform: `scale(${priceEnter})`,
        margin: 0
      }}>
        Invista na sua barbearia pelo preço de um café.
      </h2>

      <div style={{
        background: '#1e272e',
        padding: '40px 80px',
        borderRadius: 40,
        marginTop: 40,
        marginBottom: 100,
        transform: `translateY(${priceY}px)`,
        border: '2px solid rgba(255,255,255,0.1)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'baseline',
        gap: 10
      }}>
        <span style={{ fontSize: 50, color: '#00ff88', fontWeight: 'bold' }}>R$</span>
        <span style={{ fontSize: 120, color: '#fff', fontWeight: 900 }}>49</span>
        <span style={{ fontSize: 40, color: '#a4b0be' }}>/mês</span>
      </div>

      <div style={{
        background: '#00ff88',
        color: '#000',
        padding: '35px 80px',
        borderRadius: 50,
        fontSize: 50,
        fontWeight: 900,
        transform: `scale(${finalScale})`,
        boxShadow: '0 0 50px rgba(0,255,136,0.6)',
        cursor: 'pointer'
      }}>
        Teste Grátis por 7 dias
      </div>

    </AbsoluteFill>
  );
};

// ==========================================
// MAIN COMPOSITION
// ==========================================
export const BarberAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      
      <Sequence from={0} durationInFrames={180}>
        <Scene1 />
      </Sequence>
      
      <Sequence from={180} durationInFrames={240}>
        <Scene2 />
      </Sequence>

      <Sequence from={420} durationInFrames={360}>
        <Scene3 />
      </Sequence>

      <Sequence from={780} durationInFrames={360}>
        <Scene4 />
      </Sequence>

      <Sequence from={1140} durationInFrames={360}>
        <Scene5 />
      </Sequence>

    </AbsoluteFill>
  );
};
