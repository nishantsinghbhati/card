import React, { useState, useRef, useEffect, useCallback, Suspense, lazy } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import Preloader from './components/Preloader';
import Hero from './components/Hero';
import MusicPlayer from './components/MusicPlayer';

const Couple = lazy(() => import('./components/Couple'));
const ScratchCard = lazy(() => import('./components/ScratchCard'));
const Countdown = lazy(() => import('./components/Countdown'));
const Story = lazy(() => import('./components/Story'));
const Timeline = lazy(() => import('./components/Timeline'));
const FamilyDetails = lazy(() => import('./components/FamilyDetails'));
const RSVP = lazy(() => import('./components/RSVP'));
const Footer = lazy(() => import('./components/Footer'));

gsap.registerPlugin(ScrollTrigger);

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
ScrollTrigger.clearScrollMemory('manual');
window.scrollTo(0, 0);

export default function App() {
  const [opened, setOpened] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const lenisRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true
    });
    lenis.stop();
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const ticker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0, 0);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const handleAnimationComplete = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.start();
    }
  }, []);

  return (
    <>
      {!preloaderDone && (
        <Preloader
          videoReady={videoReady}
          onComplete={() => setPreloaderDone(true)}
        />
      )}

      <main>
        <Hero
          onVideoReady={() => setVideoReady(true)}
          onOpen={() => setOpened(true)}
          onAnimationComplete={handleAnimationComplete}
        />

        {preloaderDone && (
          <Suspense fallback={<div style={{ height: '100vh' }} />}>
            <Couple />
            <ScratchCard />
            <Countdown />
            <Story />
            <Timeline />
            <FamilyDetails />
            <RSVP />
            <Footer />
          </Suspense>
        )}

        <MusicPlayer opened={opened} />
      </main>
    </>
  );
}
