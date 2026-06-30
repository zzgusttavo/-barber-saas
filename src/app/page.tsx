import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', color: '#ffb800' }}>Barber SaaS</h1>
      <p style={{ fontSize: '1.25rem', color: '#888', maxWidth: '600px', marginBottom: '3rem' }}>
        O sistema completo para gestão da sua barbearia. Controle sua agenda, financeiro e atenda seus clientes com inteligência artificial via WhatsApp.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link 
          href="/barbeiro" 
          style={{ padding: '1rem 2rem', backgroundColor: '#ffb800', color: '#000', fontWeight: 700, borderRadius: '8px', textDecoration: 'none', fontSize: '1.125rem' }}
        >
          Acessar Painel (Dono)
        </Link>
        <Link 
          href="/agendar/salaomodelo" 
          style={{ padding: '1rem 2rem', backgroundColor: '#222', color: '#fff', border: '1px solid #444', fontWeight: 600, borderRadius: '8px', textDecoration: 'none', fontSize: '1.125rem' }}
        >
          Visão do Cliente (Agendar)
        </Link>
      </div>
    </div>
  );
}
