'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './layout.module.css';
import { Home, CalendarDays, Users, User, Plus } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  if (status === 'loading') {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f5' }}>Carregando...</div>;
  }

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </main>
      
      {/* Bottom Navigation para Mobile First */}
      <nav className={styles.bottomNav}>
        <Link 
          href="/dashboard" 
          className={`${styles.navItem} ${pathname === '/dashboard' ? styles.navItemActive : ''}`}
        >
          <Home size={24} strokeWidth={pathname === '/dashboard' ? 2.5 : 2} />
          <span>Início</span>
        </Link>
        
        <Link 
          href="/dashboard/agenda" 
          className={`${styles.navItem} ${pathname.startsWith('/dashboard/agenda') ? styles.navItemActive : ''}`}
        >
          <CalendarDays size={24} strokeWidth={pathname.startsWith('/dashboard/agenda') ? 2.5 : 2} />
          <span>Agenda</span>
        </Link>

        {/* Botão Central Flutuante FAB */}
        <div className={styles.fabContainer}>
          <button className={styles.fabButton} onClick={() => alert('Abrir modal de ações rápidas!')}>
            <Plus size={32} strokeWidth={2.5} />
          </button>
        </div>
        
        <Link 
          href="/dashboard/clientes" 
          className={`${styles.navItem} ${pathname.startsWith('/dashboard/clientes') ? styles.navItemActive : ''}`}
        >
          <Users size={24} strokeWidth={pathname.startsWith('/dashboard/clientes') ? 2.5 : 2} />
          <span>Clientes</span>
        </Link>
        
        <Link 
          href="/dashboard/configuracoes" 
          className={`${styles.navItem} ${pathname.startsWith('/dashboard/configuracoes') ? styles.navItemActive : ''}`}
        >
          <User size={24} strokeWidth={pathname.startsWith('/dashboard/configuracoes') ? 2.5 : 2} />
          <span>Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
