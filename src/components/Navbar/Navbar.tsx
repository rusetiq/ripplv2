"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className={styles.inner}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>◎</span>
          <span className={styles.logoText}>rippl</span>
        </div>
        <div className={styles.links}>
          <a href="#feed" className={styles.link}>Feed</a>
          <a href="#impact" className={styles.link}>Impact</a>
          <a href="#boards" className={styles.link}>Boards</a>
          <a href="#actions" className={styles.link}>Actions</a>
        </div>
        <div className={styles.cta}>
          <button className={styles.ctaBtn} id="nav-join-btn">Join the ripple</button>
        </div>
      </div>
    </motion.nav>
  );
}
