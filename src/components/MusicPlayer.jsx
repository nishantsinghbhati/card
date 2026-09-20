import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import styles from './MusicPlayer.module.css';

export default function MusicPlayer({ opened }) {
  const audioRef = useRef(null);
  const buttonRef = useRef(null);
  const recordRef = useRef(null);
  const rotationTween = useRef(null);

  useEffect(() => {
    const rot = gsap.to(recordRef.current, {
      rotation: 360,
      duration: 8,
      ease: 'none',
      repeat: -1,
      paused: true
    });
    rotationTween.current = rot;
    gsap.set(buttonRef.current, { opacity: 0, y: 60 });

    return () => {
      rot.kill();
    };
  }, []);

  useEffect(() => {
    if (!opened) return;

    gsap.to(buttonRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    });

    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0;
      audio
        .play()
        .then(() => {
          gsap.to(audio, { volume: 0.5, duration: 2 });
          rotationTween.current && rotationTween.current.play();
        })
        .catch((err) => {
          console.log('Audio autoplay prevented:', err);
        });
    }
  }, [opened]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().then(() => {
        rotationTween.current && rotationTween.current.play();
      });
    } else {
      audio.pause();
      rotationTween.current && rotationTween.current.pause();
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/assets/music.mp3" loop preload="auto" />
      <button
        ref={buttonRef}
        className={styles.player}
        onClick={toggleMusic}
        aria-label="Toggle background music"
        title="Toggle Music"
      >
        <img
          ref={recordRef}
          src="/assets/gold-record.png"
          alt="Music Disc"
          loading="lazy"
          className={styles.record}
        />
      </button>
    </>
  );
}
