'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Erro Fatal Global</h2>
          <p style={{ marginBottom: '2rem', maxWidth: '400px', wordWrap: 'break-word', color: '#a1a1aa' }}>
            {error.message || 'Erro desconhecido'}
          </p>
          <p style={{ marginBottom: '2rem', maxWidth: '400px', wordWrap: 'break-word', fontSize: '0.8rem', color: '#52525b', textAlign: 'left' }}>
            {error.stack}
          </p>
          <button
            onClick={() => reset()}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold' }}
          >
            Tentar novamente
          </button>
          <button
            onClick={() => window.location.href = '/api/auth/signout'}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3f3f46', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', marginTop: '1rem' }}
          >
            Sair e limpar cache
          </button>
        </div>
      </body>
    </html>
  );
}
