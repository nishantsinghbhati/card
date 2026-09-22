import React, { useRef, useEffect, memo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { weddingData } from '../data/weddingData';
import styles from './Timeline.module.css';

gsap.registerPlugin(ScrollTrigger);

function MapButton({ query, label = 'VIEW ON MAPS' }) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
      {label}
    </a>
  );
}

const EventCard = memo(({ event, isFirst }) => {
  return (
    <div className={styles.cardWrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.eventTitle}>{event.title}</h3>
          <p className={styles.date}>{event.date}</p>
          <p className={styles.time}>{event.time}</p>
        </div>

        {event.image && (
          <div className={styles.imageWrapper}>
            <img
              src={event.image}
              alt={event.title}
              className={styles.eventImage}
              loading={isFirst ? 'eager' : 'lazy'}
              decoding="async"
              width="600"
              height="400"
            />
          </div>
        )}

        <div className={styles.cardFooter}>
          <div className={styles.venueSection}>
            <div className={styles.venueNameWrapper}>
              <p className={styles.venueLabel}>VENUE</p>
              <p className={styles.venueName}>{event.venue}</p>
            </div>

            {event.address && (
              <p className={styles.venueStreet}>{event.address}</p>
            )}

            <p className={styles.venueCountry}>{event.city}</p>

            <div className={styles.mapWrap}>
              <MapButton query={event.query} label="VIEW ON MAPS" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default memo(function Timeline() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(`.${styles.card}`);
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%'
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const events = weddingData.events;

  return (
    <section className={styles.timelineSection} ref={sectionRef}>
      <h2 className={styles.title}>Wedding Events</h2>
      <div className={styles.timelineContainer}>
        {events.map((event, idx) => (
          <React.Fragment key={event.id}>
            <EventCard event={event} isFirst={idx === 0} />
            {idx < events.length - 1 && (
              <div className={styles.eventDivider}>
                <div className={styles.dividerLine} />
                <span className={styles.dividerKhanda}>✤</span>
                <div className={styles.dividerLineRight} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
});
