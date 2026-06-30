import React from 'react';
import styles from './dashboard.module.css';
import { Card, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { 
  CalendarCheck, 
  Users, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  BarChart3,
  Scissors
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>
          Overview.
        </h1>
        <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Hoje, 10:42
        </div>
      </div>

      <Tabs defaultValue="hoje">
        <TabsList>
          <TabsTrigger value="hoje" icon={<Clock size={16} style={{ marginRight: 6 }} />}>
            Hoje
          </TabsTrigger>
          <TabsTrigger value="desempenho" icon={<BarChart3 size={16} style={{ marginRight: 6 }} />}>
            Desempenho (Mês)
          </TabsTrigger>
          <TabsTrigger value="equipe" icon={<Users size={16} style={{ marginRight: 6 }} />}>
            Equipe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hoje">
          <div className={styles.grid}>
            <Card>
              <CardContent className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricTitle}>Agendamentos Hoje</span>
                  <CalendarCheck className={styles.metricIcon} size={24} />
                </div>
                <div className={styles.metricValue}>12</div>
                <div className={styles.metricSubtext}>
                  <TrendingUp size={16} style={{ marginRight: 4, color: 'var(--success-color)' }} />
                  <span style={{ color: 'var(--success-color)' }}>+2 em relação a ontem</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricTitle}>Serviços Concluídos</span>
                  <Scissors className={styles.metricIcon} size={24} />
                </div>
                <div className={styles.metricValue}>04</div>
                <div className={styles.metricSubtext}>
                  Faltam 8 agendamentos
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricTitle}>Faturamento Previsto</span>
                  <TrendingUp className={styles.metricIcon} size={24} />
                </div>
                <div className={styles.metricValue}>640<span style={{ fontSize: '1.5rem', marginLeft: '0.25rem', color: 'var(--text-secondary)' }}>BRL</span></div>
                <div className={styles.metricSubtext}>
                  Para o dia de hoje
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className={styles.sectionTitle}>
              Próximos Atendimentos
            </h2>
            
            <div className={styles.appointmentsList}>
              {[
                { client: 'Carlos Eduardo', service: 'Corte Degradê + Barba', time: '10:30', price: 'R$ 80', status: 'Agora' },
                { client: 'Felipe Santos', service: 'Só Corte', time: '11:15', price: 'R$ 45', status: 'Confirmado' },
                { client: 'João Silva', service: 'Corte Infantil', time: '13:00', price: 'R$ 40', status: 'Confirmado' },
              ].map((apt, i) => (
                <div key={i} className={styles.appointmentItem}>
                  <div className={styles.clientInfo}>
                    <span className={styles.clientName}>{apt.client}</span>
                    <span className={styles.serviceInfo}>{apt.service} • {apt.price}</span>
                  </div>
                  <div className={styles.timeInfo}>
                    <div className={styles.time}>
                      {apt.time}
                    </div>
                    <div className={`${styles.status} ${apt.status === 'Agora' ? styles.statusAgora : ''}`}>
                      {apt.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className={styles.viewAllButton}>
              Ver agenda completa <ChevronRight size={18} />
            </button>
          </div>
        </TabsContent>

        <TabsContent value="desempenho">
          <Card style={{ padding: '6rem 3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <BarChart3 size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Gráficos em Desenvolvimento</h3>
            <p style={{ fontSize: '1.125rem' }}>O desempenho mensal estará disponível nesta aba após os primeiros 30 dias de uso.</p>
          </Card>
        </TabsContent>

        <TabsContent value="equipe">
          <Card style={{ padding: '6rem 3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Users size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Gestão de Equipe</h3>
            <p style={{ fontSize: '1.125rem' }}>Acompanhe os cortes realizados por cada profissional da barbearia.</p>
          </Card>
        </TabsContent>
      </Tabs>
      
    </div>
  );
}
