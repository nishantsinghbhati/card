import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { weddingData } from '../data/weddingData';
import styles from './ScratchCard.module.css';

gsap.registerPlugin(ScrollTrigger);

const createAmbientParticles = () =>
  Array.from({ length: 30 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    animationDuration: `${15 + Math.random() * 20}s`,
    animationDelay: `-${Math.random() * 20}s`,
    width: `${Math.random() * 4 + 2}px`,
    height: `${Math.random() * 4 + 2}px`,
    backgroundColor: i % 2 === 0 ? '#C9A24A' : '#FDF2A9',
    opacity: Math.random() * 0.5 + 0.2,
    boxShadow: '0 0 4px rgba(255,255,255,0.8)'
  }));

export default function ScratchCard() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const scratchCanvasRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const instructionRef = useRef(null);
  const heartBorderRef = useRef(null);

  const [hasShimmer, setHasShimmer] = useState(false);
  const [ambientParticles] = useState(createAmbientParticles);

  const isCompletedRef = useRef(false);
  const isScratchingRef = useRef(false);
  const lastPointRef = useRef(null);
  const scratchedPixelsRef = useRef(new Set());
  const triggeredShimmerRef = useRef(false);
  const fallingParticlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const listenersRef = useRef([]);

  const preventTouch = (e) => {
    if (e.touches && e.touches.length > 0 && !isCompletedRef.current) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%'
          }
        }
      );

      gsap.fromTo(
        cardRef.current,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%'
          }
        }
      );
    });

    const scratchCanvas = scratchCanvasRef.current;
    const particleCanvas = particleCanvasRef.current;
    if (!scratchCanvas || !particleCanvas) return;

    const scratchCtx = scratchCanvas.getContext('2d', { willReadFrequently: true });
    const particleCtx = particleCanvas.getContext('2d');

    const parentWidth = scratchCanvas.parentElement.getBoundingClientRect().width || 350;
    const width = parentWidth;
    const height = parentWidth;
    if (cardRef.current) cardRef.current.style.height = `${height}px`;

    const dpr = window.devicePixelRatio || 1;
    scratchCanvas.width = width * dpr;
    scratchCanvas.height = height * dpr;
    scratchCtx.scale(dpr, dpr);

    const pRect = particleCanvas.getBoundingClientRect();
    particleCanvas.width = pRect.width * dpr;
    particleCanvas.height = pRect.height * dpr;
    particleCtx.scale(dpr, dpr);

    // Create golden foil texture buffer
    const goldBuffer = document.createElement('canvas');
    goldBuffer.width = scratchCanvas.width;
    goldBuffer.height = scratchCanvas.height;
    const goldCtx = goldBuffer.getContext('2d');
    goldCtx.scale(dpr, dpr);

    const grad = goldCtx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#D4AF37');
    grad.addColorStop(0.3, '#E6C27A');
    grad.addColorStop(0.5, '#C9A227');
    grad.addColorStop(0.7, '#FDF2A9');
    grad.addColorStop(1, '#AA771C');
    goldCtx.fillStyle = grad;
    goldCtx.fillRect(0, 0, width, height);

    goldCtx.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < width * height * 0.05; i++) {
      goldCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
      goldCtx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
    }
    goldCtx.globalCompositeOperation = 'source-over';

    // Mask buffer for scratching
    const maskBuffer = document.createElement('canvas');
    maskBuffer.width = scratchCanvas.width;
    maskBuffer.height = scratchCanvas.height;
    const maskCtx = maskBuffer.getContext('2d');
    maskCtx.scale(dpr, dpr);

    let time = 0;
    const render = () => {
      time += 0.016;

      if (!isCompletedRef.current) {
        scratchCtx.clearRect(0, 0, width, height);
        scratchCtx.globalCompositeOperation = 'source-over';
        scratchCtx.drawImage(goldBuffer, 0, 0, width * dpr, height * dpr, 0, 0, width, height);
        scratchCtx.globalCompositeOperation = 'destination-out';
        scratchCtx.drawImage(maskBuffer, 0, 0, width * dpr, height * dpr, 0, 0, width, height);
      }

      particleCtx.clearRect(0, 0, pRect.width, pRect.height);

      let hasActiveParticles = false;
      fallingParticlesRef.current.forEach((p) => {
        if (p.alpha > 0) {
          hasActiveParticles = true;
          p.x += p.vx;
          p.y += p.vy;

          if (p.type === 'falling') {
            p.x += Math.sin(time * 5 + p.y * 0.01) * 0.5;
            if (p.y > pRect.height * 0.2) p.alpha -= 0.02;
          } else {
            p.y -= 0.1;
            p.x += Math.sin(time + p.y) * 0.3;
            p.alpha -= p.decay;
          }

          p.rotation += p.rotSpeed;
          particleCtx.save();
          particleCtx.translate(p.x, p.y);
          particleCtx.rotate((p.rotation * Math.PI) / 180);
          particleCtx.globalAlpha = Math.max(0, p.alpha);
          particleCtx.fillStyle = p.color;
          particleCtx.beginPath();
          particleCtx.moveTo(-p.size, -p.size * 0.5);
          particleCtx.lineTo(p.size * 0.8, -p.size);
          particleCtx.lineTo(p.size, p.size * 0.8);
          particleCtx.lineTo(-p.size * 0.5, p.size);
          particleCtx.closePath();
          particleCtx.fill();
          particleCtx.restore();
        }
      });

      if (!isCompletedRef.current || hasActiveParticles) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    const getPos = (e) => {
      const rect = scratchCanvas.getBoundingClientRect();
      let clientX = e.clientX;
      let clientY = e.clientY;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleStart = (e) => {
      if (isCompletedRef.current) return;
      isScratchingRef.current = true;
      const pt = getPos(e);
      lastPointRef.current = pt;
      scratch(pt.x, pt.y, pt.x, pt.y);
      if (heartBorderRef.current) heartBorderRef.current.style.animation = 'none';
    };

    let moveCounter = 0;
    const handleMove = (e) => {
      if (!isScratchingRef.current || isCompletedRef.current) return;
      const pt = getPos(e);
      const prev = lastPointRef.current || pt;
      scratch(pt.x, pt.y, prev.x, prev.y);
      lastPointRef.current = pt;
      moveCounter++;
      if (moveCounter % 5 === 0) checkProgress();
    };

    const scratch = (x, y, px, py) => {
      const radius = Math.min(width, height) * 0.1;
      const grad = maskCtx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.4, 'rgba(0,0,0,0.8)');
      grad.addColorStop(0.8, 'rgba(0,0,0,0.2)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.fillStyle = grad;
      maskCtx.beginPath();
      maskCtx.arc(x, y, radius, 0, Math.PI * 2, false);
      maskCtx.fill();

      const dist = Math.hypot(x - px, y - py);
      const step = radius * 0.2;
      if (dist > step) {
        const count = Math.floor(dist / step);
        for (let i = 0; i < count; i++) {
          const ix = px + (x - px) * (i / count);
          const iy = py + (y - py) * (i / count);
          const stepGrad = maskCtx.createRadialGradient(ix, iy, 0, ix, iy, radius);
          stepGrad.addColorStop(0, 'rgba(0,0,0,1)');
          stepGrad.addColorStop(0.4, 'rgba(0,0,0,0.8)');
          stepGrad.addColorStop(0.8, 'rgba(0,0,0,0.2)');
          stepGrad.addColorStop(1, 'rgba(0,0,0,0)');
          maskCtx.fillStyle = stepGrad;
          maskCtx.beginPath();
          maskCtx.arc(ix, iy, radius, 0, Math.PI * 2, false);
          maskCtx.fill();
        }
      }

      const gridStep = Math.max(1, Math.floor(dist / (width / 10)));
      for (let i = 0; i <= gridStep; i++) {
        const ix = px + (x - px) * (i / gridStep);
        const iy = py + (y - py) * (i / gridStep);
        const gx = Math.floor((ix / width) * 10);
        const gy = Math.floor((iy / height) * 10);
        if (gx >= 1 && gx <= 8 && gy >= 1 && gy <= 8) {
          scratchedPixelsRef.current.add(`${gx},${gy}`);
        }
      }

      if (!animFrameRef.current) animFrameRef.current = requestAnimationFrame(render);
    };

    const checkProgress = () => {
      if (isCompletedRef.current) return;
      const count = scratchedPixelsRef.current.size;
      if (count > 10 && !triggeredShimmerRef.current) {
        triggeredShimmerRef.current = true;
        setHasShimmer(true);
      }
      if (count > 16) {
        triggerComplete();
      }
    };

    const handleEnd = () => {
      if (!isScratchingRef.current || isCompletedRef.current) return;
      isScratchingRef.current = false;
      lastPointRef.current = null;
      checkProgress();
    };

    const triggerComplete = () => {
      if (!isCompletedRef.current) {
        isCompletedRef.current = true;
        gsap.to(scratchCanvas, { opacity: 0, duration: 1.2, ease: 'power2.inOut' });
        if (instructionRef.current) {
          gsap.to(instructionRef.current, { opacity: 0, duration: 1, ease: 'power2.inOut' });
        }

        const revealItems = cardRef.current.querySelectorAll(`.${styles.revealItem}`);
        gsap.to(revealItems, {
          opacity: 1,
          scale: 1,
          duration: 1.5,
          stagger: 0.2,
          ease: 'elastic.out(1, 0.5)'
        });

        // Generate burst of gold sparkles
        for (let i = 0; i < 700; i++) {
          fallingParticlesRef.current.push(createGoldSparkle(pRect.width, pRect.height));
        }

        if (!animFrameRef.current) animFrameRef.current = requestAnimationFrame(render);
      }
    };

    const createGoldSparkle = (w, h) => {
      const colors = ['#D4AF37', '#FDF2A9', '#FFFFFF', '#C9A227'];
      return {
        type: 'falling',
        x: Math.random() * w,
        y: -Math.random() * h,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 5 + 3,
        size: Math.random() * 5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.5,
        decay: 0,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 20
      };
    };

    const addEvent = (el, type, handler, opts) => {
      el.addEventListener(type, handler, opts);
      listenersRef.current.push({ el, type, handler, opts });
    };

    addEvent(scratchCanvas, 'mousedown', handleStart);
    addEvent(scratchCanvas, 'mousemove', handleMove);
    addEvent(scratchCanvas, 'mouseup', handleEnd);
    addEvent(scratchCanvas, 'mouseleave', handleEnd);

    addEvent(
      scratchCanvas,
      'touchstart',
      (e) => {
        preventTouch(e);
        handleStart(e);
      },
      { passive: false }
    );
    addEvent(
      scratchCanvas,
      'touchmove',
      (e) => {
        preventTouch(e);
        handleMove(e);
      },
      { passive: false }
    );
    addEvent(scratchCanvas, 'touchend', handleEnd, { passive: true });
    addEvent(scratchCanvas, 'touchcancel', handleEnd, { passive: true });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      listenersRef.current.forEach(({ el, type, handler, opts }) => {
        el.removeEventListener(type, handler, opts);
      });
      listenersRef.current = [];
      ctx.revert();
    };
  }, []);

  return (
    <section className={styles.scratchSection} ref={sectionRef}>
      <div className={styles.header}>
        <h4 className={styles.headingSmall}>A Special Surprise</h4>
        <h2 className={styles.headingSub}>Scratch the heart to reveal our wedding date</h2>
      </div>

      <div className={styles.container}>
        <div className={styles.ambientDecor}>
          {ambientParticles.map((p, i) => (
            <div key={i} className={styles.ambientParticle} style={p} />
          ))}
        </div>

        <div className={styles.card} ref={cardRef}>
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <clipPath id="heartClip" clipPathUnits="objectBoundingBox">
                <path d="M 0.5 0.889 C 0.256 0.692, 0.05 0.475, 0.05 0.282 C 0.05 0.136, 0.156 0.05, 0.29 0.05 C 0.378 0.05, 0.454 0.10, 0.5 0.172 C 0.546 0.10, 0.622 0.05, 0.71 0.05 C 0.844 0.05, 0.95 0.136, 0.95 0.282 C 0.95 0.475, 0.744 0.692, 0.5 0.889 Z" />
              </clipPath>
            </defs>
          </svg>

          <div className={styles.heartBackground}>
            <svg viewBox="0 0 100 100" className={styles.heartSvg} preserveAspectRatio="none">
              <path
                d="M 50 88.9 C 25.6 69.2, 5 47.5, 5 28.2 C 5 13.6, 15.6 5, 29 5 C 37.8 5, 45.4 10, 50 17.2 C 54.6 10, 62.2 5, 71 5 C 84.4 5, 95 13.6, 95 28.2 C 95 47.5, 74.4 69.2, 50 88.9 Z"
                fill="#ffffff"
              />
            </svg>
          </div>

          <div className={styles.revealedContent}>
            <div className={styles.revealItem}>
              <h2 className={styles.dateText}>
                1 &amp; 2<br />
                November<br />
                2026
              </h2>
            </div>
          </div>

          <div className={styles.canvasWrapper}>
            {hasShimmer && <div className={styles.shimmerOverlay} />}
            <svg
              ref={heartBorderRef}
              viewBox="0 0 100 100"
              className={styles.heartBorder}
              preserveAspectRatio="none"
            >
              <path
                d="M 50 88.9 C 25.6 69.2, 5 47.5, 5 28.2 C 5 13.6, 15.6 5, 29 5 C 37.8 5, 45.4 10, 50 17.2 C 54.6 10, 62.2 5, 71 5 C 84.4 5, 95 13.6, 95 28.2 C 95 47.5, 74.4 69.2, 50 88.9 Z"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <canvas ref={scratchCanvasRef} className={styles.scratchCanvas} />
          </div>

          <canvas ref={particleCanvasRef} className={styles.particleCanvas} />
        </div>

        <div className={styles.instructionWrapper} ref={instructionRef}>
          <h3 className={styles.instructionText}>Scratch to reveal! ✨</h3>
          <svg
            className={styles.handIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5" />
            <path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5" />
            <path d="M14 10.5v-1.5a1.5 1.5 0 0 1 3 0v2.5" />
            <path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47" />
          </svg>
        </div>
      </div>
    </section>
  );
}
