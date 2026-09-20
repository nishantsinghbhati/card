import React, { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { weddingData } from '../data/weddingData';
import styles from './Story.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function Story() {
  const sectionRef = useRef(null);
  const textColRef = useRef(null);
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);

  const timerTimeoutRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const hasStartedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);

  const storyImages = weddingData.story;

  useEffect(() => {
    storyImages.forEach((item) => {
      const img = new Image();
      img.src = item.image;
    });
  }, [storyImages]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(el);

    return () => observer.unobserve(el);
  }, []);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % storyImages.length);
  }, [storyImages.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + storyImages.length) % storyImages.length);
  }, [storyImages.length]);

  const startAutoPlay = useCallback(() => {
    if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (hasStartedRef.current) {
      timerIntervalRef.current = setInterval(nextSlide, 3500);
    } else {
      timerTimeoutRef.current = setTimeout(() => {
        nextSlide();
        hasStartedRef.current = true;
        timerIntervalRef.current = setInterval(nextSlide, 3500);
      }, 1000);
    }
  }, [nextSlide]);

  const stopAutoPlay = useCallback(() => {
    if (timerTimeoutRef.current) clearTimeout(timerTimeoutRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, []);

  useEffect(() => {
    if (isInView) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return stopAutoPlay;
  }, [isInView, startAutoPlay, stopAutoPlay]);

  // Position cards in 3D carousel
  useEffect(() => {
    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const offset = window.innerWidth <= 900 ? 60 : 120;
      let diff = idx - activeIndex;

      if (diff > 1) diff -= storyImages.length;
      if (diff < -1) diff += storyImages.length;

      let x = 0;
      let scale = 1;
      let opacity = 1;
      let zIndex = 3;

      if (diff === 0) {
        x = 0;
        scale = 1;
        opacity = 1;
        zIndex = 3;
      } else if (diff === 1) {
        x = offset;
        scale = 0.85;
        opacity = 0.55;
        zIndex = 2;
      } else if (diff === -1) {
        x = -offset;
        scale = 0.85;
        opacity = 0.55;
        zIndex = 2;
      } else {
        x = 0;
        scale = 0.5;
        opacity = 0;
        zIndex = 1;
      }

      gsap.to(el, {
        x,
        scale,
        opacity,
        zIndex,
        duration: 0.6,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });
  }, [activeIndex, storyImages.length]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        carouselRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%'
          }
        }
      );

      gsap.fromTo(
        textColRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    stopAutoPlay();
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    const diff = dragStartXRef.current - e.clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    isDraggingRef.current = false;
    startAutoPlay();
  };

  const handlePointerLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      startAutoPlay();
    }
  };

  return (
    <section className={styles.storySection} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.imageCol}>
          <div
            className={styles.carouselContainer}
            ref={carouselRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
          >
            {storyImages.map((item, idx) => (
              <div
                key={idx}
                ref={(el) => (cardRefs.current[idx] = el)}
                className={styles.imageWrapper}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className={styles.image}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.textCol} ref={textColRef}>
          <h2 className={styles.title}>Our Story</h2>
          <p className={styles.paragraph}>
            Two souls, two families, and one beautiful journey guided by love, tradition, and sacred blessings.
          </p>
          <p className={styles.paragraph}>
            With hearts full of gratitude, we embark on this sacred path together—cherishing each joyful moment, celebrating shared dreams, and honoring the timeless heritage that binds us.
          </p>
          <p className={styles.paragraph}>
            Blessed by the enduring love, wisdom, and warm guidance of our beloved parents and elders, we celebrate a union founded on mutual respect, joyful companionship, and profound devotion.
          </p>
          <p className={styles.paragraph}>
            As we begin this auspicious new chapter, we cannot wait to celebrate the beginning of our forever with the family and friends who mean the most to us!
          </p>
        </div>
      </div>
    </section>
  );
}
