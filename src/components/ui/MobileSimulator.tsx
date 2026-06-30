'use client';

import React from 'react';
import styles from './MobileSimulator.module.css';

export default function MobileSimulator({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.simulatorWrapper}>
      <div className={styles.phoneBezel}>
        <div className={styles.notch}></div>
        <div className={styles.screen}>
          {children}
        </div>
      </div>
    </div>
  );
}
