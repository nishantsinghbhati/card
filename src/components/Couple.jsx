import React, { useRef, useEffect, memo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { weddingData } from '../data/weddingData';
import styles from './Couple.module.css';

gsap.registerPlugin(ScrollTrigger);

const Couple = memo(() => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray(`.${styles.animateBlock}`);
      gsap.fromTo(
        blocks,
        { opacity: 0, y: 40, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          stagger: 0.15,
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

  const groomParents = `${weddingData.families.groomSide.parents[1]} & ${weddingData.families.groomSide.parents[0]}`;
  const brideParents = `${weddingData.families.brideSide.parents[1]} & ${weddingData.families.brideSide.parents[0]}`;

  return (
    <section className={styles.coupleSection} ref={sectionRef}>
      <div className={styles.container}>
        <div className={`${styles.ekOnkar} ${styles.animateBlock}`}>ੴ</div>
        <div className={`${styles.shabad} ${styles.animateBlock}`}>
          ਸਤਿਗੁਰੂ ਦਾਤੇ ਕਾਜਿ ਰਚਾਇਆ ਆਪਣੀ ਮੇਹਰ ਕਰਾਈ।
          <br />
          ਦਾਸਾਂ ਕਾਰਜ ਆਪ ਸਵਾਰੇ ਇਹ ਉਸ ਦੀ ਵਡਿਆਈ॥
        </div>
        <h2 className={`${styles.heading} ${styles.animateBlock}`}>
          We Cordially Invite You
        </h2>
        <p className={`${styles.paragraph} ${styles.animateBlock}`}>
          Together with our beloved families,
          <br />
          we request the honour of your gracious
          <br />
          presence to celebrate the wedding of
        </p>

        {/* GROOM FIRST */}
        <div className={styles.animateBlock}>
          <h1 className={styles.name}>{weddingData.couple.groom}</h1>
          <p className={styles.relationLabel}>Son of</p>
          <p className={styles.parentsName}>{groomParents}</p>
        </div>

        <div className={`${styles.withText} ${styles.animateBlock}`}>With</div>

        {/* BRIDE SECOND */}
        <div className={styles.animateBlock}>
          <h1 className={styles.name}>{weddingData.couple.bride}</h1>
          <p className={styles.relationLabel}>Daughter of</p>
          <p className={styles.parentsName}>{brideParents}</p>
        </div>
      </div>
    </section>
  );
});

export default Couple;
