import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { weddingData } from '../data/weddingData';
import styles from './FamilyDetails.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function FamilyDetails() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.familyCard}`,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const { groomSide, brideSide } = weddingData.families;

  return (
    <section className={styles.familySection} ref={sectionRef}>
      <h2 className={styles.title}>With Blessings From</h2>
      <div className={styles.container}>
        {/* GROOM'S FAMILY (FIRST) */}
        <div className={styles.familyCard}>
          <h3 className={styles.sideTitle}>{groomSide.sideTitle}</h3>
          
          <div className={styles.relationGroup}>
            <h4>Grand Parents</h4>
            <p>{groomSide.grandparents[0]}</p>
            <p>{groomSide.grandparents[1]}</p>
          </div>

          <div className={styles.relationGroup}>
            <h4>Parents</h4>
            <p>{groomSide.parents[0]}</p>
            <p>{groomSide.parents[1]}</p>
          </div>
        </div>

        {/* BRIDE'S FAMILY (SECOND) */}
        <div className={styles.familyCard}>
          <h3 className={styles.sideTitle}>{brideSide.sideTitle}</h3>
          
          <div className={styles.relationGroup}>
            <h4>Grand Parents</h4>
            <p>{brideSide.grandparents[0]}</p>
            <p>{brideSide.grandparents[1]}</p>
          </div>

          <div className={styles.relationGroup}>
            <h4>Parents</h4>
            <p>{brideSide.parents[0]}</p>
            <p>{brideSide.parents[1]}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
