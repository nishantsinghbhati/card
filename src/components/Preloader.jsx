import React, { useState, useEffect, useMemo } from 'react';
import styles from './Preloader.module.css';

export default function Preloader({ onComplete, videoReady }) {
  const [hidden, setHidden] = useState(false);

  const particles = useMemo(() => 
    Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 5 + 5}s`,
      animationDelay: `${Math.random() * 5}s`,
      width: `${Math.random() * 4 + 2}px`,
      height: `${Math.random() * 4 + 2}px`
    })),
    []
  );

  useEffect(() => {
    if (videoReady) {
      setHidden(true);
      const timer = setTimeout(() => {
        onComplete && onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [videoReady, onComplete]);

  return (
    <div className={`${styles.preloaderContainer} ${hidden ? styles.hidden : ''}`}>
      <div className={styles.particles}>
        {particles.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: p.left,
              width: p.width,
              height: p.height,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay
            }}
          />
        ))}
      </div>
      <div className={styles.contentWrapper}>
        <img
          src="/assets/as_seal.webp"
          alt="Ashpreet & Simrat Emblem"
          className={styles.logo}
        />
        <div className={styles.loaderLine} />
      </div>
    </div>
  );
}
