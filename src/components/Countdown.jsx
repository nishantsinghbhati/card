import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { weddingData } from '../data/weddingData';
import styles from './Countdown.module.css';

gsap.registerPlugin(ScrollTrigger);

function FlipDigit({ label, value }) {
  const digitRef = useRef(null);
  const [displayedValue, setDisplayedValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value === prevValueRef.current) return;
    const el = digitRef.current;
    if (!el) {
      setDisplayedValue(value);
      prevValueRef.current = value;
      return;
    }

    gsap.to(el, {
      y: -20,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        setDisplayedValue(value);
        gsap.fromTo(
          el,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' }
        );
      }
    });

    prevValueRef.current = value;
  }, [value]);

  const formatted = String(displayedValue).padStart(2, '0');

  return (
    <div className={styles.card}>
      <div className={styles.digitWrap}>
        <span ref={digitRef} className={styles.digit}>
          {formatted}
        </span>
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export default function Countdown() {
  const sectionRef = useRef(null);
  const targetTime = useRef(new Date(weddingData.couple.weddingDateISO).getTime());

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%'
        }
      }
    );

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetTime.current - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.countdownSection} ref={sectionRef}>
      <div className={styles.container}>
        <h2 className={styles.title}>The Big Day Approaches</h2>
        <div className={styles.cardsContainer}>
          <FlipDigit label="Days" value={timeLeft.days} />
          <FlipDigit label="Hours" value={timeLeft.hours} />
          <FlipDigit label="Minutes" value={timeLeft.minutes} />
          <FlipDigit label="Seconds" value={timeLeft.seconds} />
        </div>
      </div>
    </section>
  );
}
