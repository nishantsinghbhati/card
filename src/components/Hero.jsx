import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { weddingData } from '../data/weddingData';
import styles from './Hero.module.css';

export default function Hero({ onOpen, onAnimationComplete, onVideoReady }) {
  const [opened, setOpened] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const namesContainerRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const hasTriggeredOpen = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let readyNotified = false;

    const notifyReady = (trigger) => {
      if (!readyNotified) {
        readyNotified = true;
        setTimeout(() => {
          onVideoReady && onVideoReady();
        }, 50);
      }
    };

    const handleLoadedMetadata = () => {
      setVideoLoaded(true);
    };

    const handleLoadedData = () => {
      setVideoLoaded(true);
      notifyReady('loadeddata');
    };

    const handlePlaying = () => {
      setVideoLoaded(true);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('playing', handlePlaying);

    const timeout = setTimeout(() => {
      notifyReady('timeout');
    }, 4500);

    if (video.readyState >= 2) {
      handleLoadedData();
    }

    return () => {
      clearTimeout(timeout);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('playing', handlePlaying);
    };
  }, [onVideoReady]);

  useEffect(() => {
    if (showNames && namesContainerRef.current) {
      const ctx = gsap.context(() => {
        gsap.timeline()
          .fromTo(
            namesContainerRef.current.children,
            {
              opacity: 0,
              y: 40,
              scale: 0.9,
              clipPath: 'polygon(-50% 150%, 150% 150%, 150% 150%, -50% 150%)'
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              clipPath: 'polygon(-50% -50%, 150% -50%, 150% 150%, -50% 150%)',
              duration: 1.5,
              stagger: 0.4,
              ease: 'power3.out',
              clearProps: 'clipPath'
            }
          )
          .fromTo(
            scrollIndicatorRef.current,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              onComplete: () => {
                onAnimationComplete && onAnimationComplete();
              }
            },
            '+=1'
          );
      });

      return () => ctx.revert();
    }
  }, [showNames, onAnimationComplete]);

  const handleTapToBegin = () => {
    if (hasTriggeredOpen.current) return;
    hasTriggeredOpen.current = true;
    setOpened(true);
    onOpen && onOpen();

    const video = videoRef.current;
    if (video) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Video play interrupted:', err);
          setShowNames(true);
        });
      }
    } else {
      setShowNames(true);
    }

    // Safety fallback to reveal names after 5.5s video duration
    const nameTimer = setTimeout(() => {
      setShowNames(true);
    }, 5500);

    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        onComplete: () => {
          if (overlayRef.current) overlayRef.current.style.display = 'none';
        }
      });
    }

    return () => clearTimeout(nameTimer);
  };

  return (
    <section className={styles.hero} onClick={opened ? undefined : handleTapToBegin}>
      <video
        ref={videoRef}
        className={styles.videoBackground}
        src="/videos/hero.mp4"
        muted
        playsInline
        preload="auto"
        poster="/assets/hero-poster.webp"
        onTimeUpdate={() => {
          if (videoRef.current && !showNames && opened && videoRef.current.currentTime >= 4.8) {
            setShowNames(true);
          }
        }}
      />

      <img
        src="/assets/hero-poster.webp"
        alt="Wedding Portal Opening"
        className={`${styles.posterImage} ${videoLoaded ? styles.posterHidden : ''}`}
      />

      <div ref={overlayRef} className={styles.overlay}>
        <div className={styles.tapButton}>
          <span className={styles.tapText}>Tap to Begin</span>
          <div className={styles.tapIcon}>
            <img
              src="/assets/as_seal.webp"
              alt="Ashpreet & Simrat Seal"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>

      <div
        className={styles.namesWrapper}
        style={{ pointerEvents: showNames ? 'auto' : 'none' }}
      >
        <div className={styles.namesPositioner}>
          <div ref={namesContainerRef} className={styles.namesContainer}>
            <h2 className={styles.name}>{weddingData.couple.groom}</h2>
            <span className={styles.weds}>Weds</span>
            <h2 className={styles.name}>{weddingData.couple.bride}</h2>
          </div>
        </div>
      </div>

      <div
        ref={scrollIndicatorRef}
        className={styles.scrollIndicator}
        style={{ opacity: 0, pointerEvents: 'none' }}
      >
        <div className={styles.scrollIndicatorContent}>
          <span className={styles.scrollText}>Scroll Down</span>
          <div className={styles.scrollArrow}>↓</div>
        </div>
      </div>
    </section>
  );
}
