import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { weddingData } from '../data/weddingData';
import styles from './RSVP.module.css';

gsap.registerPlugin(ScrollTrigger);

const RSVP_EVENTS = [
  'Sagan & Engagement',
  'Mehendi',
  'Wedding Ceremony',
  'Anand Karaj',
  'Unfortunately, I cannot attend'
];

export default function RSVP() {
  const sectionRef = useRef(null);
  const formRef = useRef(null);
  const popupRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    numberOfGuests: 1,
    message: '',
    selectedEvents: []
  });

  const attendanceStatus =
    formData.selectedEvents.length === 0
      ? ''
      : formData.selectedEvents.includes('Unfortunately, I cannot attend')
      ? 'no'
      : 'yes';

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `.${styles.rsvpCard}`,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
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

  const handleEventToggle = (eventName) => {
    setFormData((prev) => {
      let updated = [...prev.selectedEvents];
      if (eventName === 'Unfortunately, I cannot attend') {
        updated = updated.includes(eventName) ? [] : [eventName];
      } else {
        if (updated.includes(eventName)) {
          updated = updated.filter((e) => e !== eventName);
        } else {
          updated.push(eventName);
          updated = updated.filter((e) => e !== 'Unfortunately, I cannot attend');
        }
      }
      return { ...prev, selectedEvents: updated };
    });

    setErrors((prev) => ({ ...prev, selectedEvents: '' }));
    setServerError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const changeGuests = (delta) => {
    setFormData((prev) => ({
      ...prev,
      numberOfGuests: Math.max(1, Math.min(5, prev.numberOfGuests + delta))
    }));
  };

  const validate = () => {
    const errs = {};
    if (formData.selectedEvents.length === 0) {
      errs.selectedEvents = 'Please select the event(s) you will attend.';
    }
    if (attendanceStatus) {
      if (!formData.fullName.trim()) {
        errs.fullName = 'Full Name is required.';
      }
    }
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      setTimeout(() => {
        gsap.fromTo(
          `.${styles.inputError}`,
          { x: -5 },
          { x: 5, duration: 0.1, yoyo: true, repeat: 3 }
        );
      }, 50);
    }

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !validate()) return;

    setIsSubmitting(true);
    setServerError('');

    const payload = {
      fullName: formData.fullName.trim(),
      events: formData.selectedEvents,
      guests: attendanceStatus === 'yes' ? formData.numberOfGuests : 0,
      message: formData.message.trim(),
      couple: weddingData.couple.displayOrder
    };

    try {
      // Send RSVP payload (using no-cors safe post or local fallback)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        await fetch(
          'https://script.google.com/macros/s/AKfycbyhRl8oEV6t_VEv021Oaf_GvZ840wIVpSSl2-Qhq2Hj973ieK0Z8A6wcXnVdcgMOViB/exec',
          {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
            signal: controller.signal
          }
        );
      } catch (postErr) {
        console.log('RSVP logged locally:', postErr);
      } finally {
        clearTimeout(timeoutId);
      }

      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        if (popupRef.current) {
          gsap.fromTo(
            popupRef.current,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
          );
        }
      }, 50);
    } catch (err) {
      setIsSubmitting(false);
      setServerError('There was an error sending your RSVP. Please try again.');
    }
  };

  const handleCloseSuccess = () => {
    if (popupRef.current) {
      gsap.to(popupRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          setShowSuccess(false);
          setFormData({
            fullName: '',
            numberOfGuests: 1,
            message: '',
            selectedEvents: []
          });
          setErrors({});
          setServerError('');
        }
      });
    } else {
      setShowSuccess(false);
    }
  };

  return (
    <section className={styles.rsvpSection} ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.rsvpCard}>
          {showSuccess && (
            <div className={styles.successPopup} ref={popupRef}>
              <div className={styles.successIcon}>✨</div>
              <h3 className={styles.successTitle}>Thank You!</h3>
              <p className={styles.successText}>
                Your RSVP has been received successfully.
                <br />
                We can't wait to celebrate with you!
              </p>
              <button className={styles.closeBtn} onClick={handleCloseSuccess}>
                Close
              </button>
            </div>
          )}

          <h2 className={styles.title}>RSVP</h2>
          <p className={styles.text}>We look forward to celebrating with you.</p>

          <form ref={formRef} onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Which wedding events will you be attending?
              </label>
              <div className={styles.radioGroup}>
                {RSVP_EVENTS.map((item, idx) => (
                  <label key={idx} className={styles.radioLabel}>
                    <input
                      type="checkbox"
                      name="selectedEvents"
                      value={item}
                      checked={formData.selectedEvents.includes(item)}
                      onChange={() => handleEventToggle(item)}
                      className={styles.radioInput}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
              {errors.selectedEvents && (
                <p className={styles.errorText}>{errors.selectedEvents}</p>
              )}
            </div>

            {attendanceStatus && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className={styles.errorText}>{errors.fullName}</p>
                  )}
                </div>

                {attendanceStatus === 'yes' && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      How many guests (including you) will be joining us?
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginTop: '0.8rem'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => changeGuests(-1)}
                        className={styles.counterBtn}
                      >
                        -
                      </button>
                      <span className={styles.counterValue}>
                        {formData.numberOfGuests}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeGuests(1)}
                        className={styles.counterBtn}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className={styles.formGroup}>
                  {/* Groom First in personal message */}
                  <label className={styles.label}>
                    Leave a personal message for Ashpreet &amp; Simrat
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    placeholder="We would love to hear your blessings & wishes..."
                  />
                </div>
              </>
            )}

            {serverError && (
              <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                <p className={styles.errorText}>{serverError}</p>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send RSVP'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
