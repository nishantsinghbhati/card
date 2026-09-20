import React from 'react';
import { weddingData } from '../data/weddingData';
import styles from './Footer.module.css';

export default function Footer() {
  const { groomSide } = weddingData.families;

  return (
    <footer className={styles.footerSection}>
      <div className={styles.thankYouText}>Thank You</div>

      <div className={styles.contactsContainer}>
        <div className={styles.contactInfo}>
          <span className={styles.contactName}>{groomSide.parents[0]} &amp; Family</span>
          <span className={styles.contactSubtext}>With Warm Regards</span>
        </div>

        <div className={styles.contactInfo}>
          <span className={styles.contactName}>With Best Compliments</span>
          <span className={styles.contactSubtext}>Near &amp; Dear Ones</span>
        </div>
      </div>

      <div className={styles.divider} />
      <div className={styles.hashtag}>#SimAsh</div>
    </footer>
  );
}
