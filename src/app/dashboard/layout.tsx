'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './layout.module.css';
import { Home, CalendarDays, Users, User, Plus, LogOut, FileText, Banknote, Scissors, Settings, Crown } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

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
      {/* Sidebar - Desktop Only */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.avatarLogo}>
            <User size={24} color="#16a34a" />
          </div>
          <div className={styles.brandInfo}>
            <span className={styles.brandName}>{session?.user?.name?.split(' ')[0] || 'Gustavo'}</span>
            <span className={styles.brandSubtitle}>Profissional</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/dashboard" className={`${styles.sidebarItem} ${pathname === '/dashboard' ? styles.sidebarItemActive : ''}`}>
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/agenda" className={`${styles.sidebarItem} ${pathname.startsWith('/dashboard/agenda') ? styles.sidebarItemActive : ''}`}>
            <CalendarDays size={20} />
            <span>Agenda</span>
          </Link>
          <Link href="/dashboard/clientes" className={`${styles.sidebarItem} ${pathname.startsWith('/dashboard/clientes') ? styles.sidebarItemActive : ''}`}>
            <Users size={20} />
            <span>Clientes</span>
          </Link>
          <Link href="/dashboard/servicos" className={`${styles.sidebarItem} ${pathname.startsWith('/dashboard/servicos') ? styles.sidebarItemActive : ''}`}>
            <Scissors size={20} />
            <span>Serviços</span>
          </Link>
          
          <div className={styles.sidebarDivider}></div>

          <Link href="#" onClick={(e) => { e.preventDefault(); alert('Em breve!'); }} className={styles.sidebarItem}>
            <Banknote size={20} />
            <span>Meu Caixa</span>
          </Link>
          <Link href="#" onClick={(e) => { e.preventDefault(); alert('Em breve!'); }} className={styles.sidebarItem}>
            <FileText size={20} />
            <span>Relatórios</span>
          </Link>
          <Link href="/dashboard/configuracoes" className={`${styles.sidebarItem} ${pathname.startsWith('/dashboard/configuracoes') ? styles.sidebarItemActive : ''}`}>
            <Settings size={20} />
            <span>Configurações</span>
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.premiumCard}>
            <Crown size={24} color="#16a34a" />
            <span className={styles.premiumTitle}>Seu plano</span>
            <span className={styles.premiumText}>Premium</span>
            <span className={styles.premiumSubtitle}>Renova em 25/08</span>
            <Link href="/dashboard/assinatura" className={styles.premiumLink}>Gerenciar assinatura →</Link>
          </div>

          <button onClick={() => window.location.href = '/api/auth/signout'} className={styles.logoutButton}>
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

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
          <button className={styles.fabButton} onClick={() => router.push('/dashboard/agenda')}>
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
