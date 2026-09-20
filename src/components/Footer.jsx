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

      <div className={styles.socialContainer}>
        <a
          href="https://www.instagram.com/aarambhinvites?igsh=MWV4bmp5NHczcmM3eg=="
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialIcon}
          aria-label="Instagram"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </a>

        <a
          href="https://aarambhinvites.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.socialIcon}
          aria-label="Aarambh Invites Website"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </a>
      </div>

      <div className={styles.divider} />
      <div className={styles.madeWithLove}>Made with ❤️ by Aarambh Invites</div>
    </footer>
  );
}
