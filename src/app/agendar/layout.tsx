import React from 'react';
import MobileSimulator from '@/components/ui/MobileSimulator';

export default function AgendarLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileSimulator>
      {children}
    </MobileSimulator>
  );
}
