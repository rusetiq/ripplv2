"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import styles from "./Footer.module.css";

const MARQUEE_TEXT = "Log the action · Start the streak · Close the loop · UAE Net Zero 2050 · ";

export default function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <footer className={styles.footer} ref={ref}>
      <div className={styles.marqueeWrap}>
        <div className={styles.marquee}>
          {[...Array(3)].map((_, i) => (
            <span key={i} className={styles.marqueeText}>{MARQUEE_TEXT}</span>
          ))}
        </div>
      </div>

      <div className={styles.inner}>
        <motion.div
          className={styles.cta}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className={styles.ctaTitle}>Keep the streak alive.</h2>
          <p className={styles.ctaDesc}>
            2 million people in the UAE get in a car alone every morning.
            Not because they don&apos;t care — because nobody&apos;s watching.
          </p>
          <div className={styles.ctaActions}>
            <button className={styles.primaryBtn} id="footer-join-btn">Join the ripple →</button>
            <button className={styles.secondaryBtn} id="footer-corporate-btn">Corporate access</button>
          </div>
        </motion.div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>◎</span>
            <span className={styles.logoText}>rippl</span>
          </div>
          <div className={styles.links}>
            <a href="#feed">Feed</a>
            <a href="#impact">Impact</a>
            <a href="#boards">Leaderboards</a>
            <a href="#actions">Actions</a>
          </div>
          <div className={styles.meta}>
            <span className={styles.metaTag}>🇦🇪 Built for the UAE</span>
            <span className={styles.copy}>© 2025 Rippl. Net Zero 2050.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
