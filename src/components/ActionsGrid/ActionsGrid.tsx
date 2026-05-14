"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import styles from "./ActionsGrid.module.css";

const ACTIONS = [
  { cat: "Transport", icon: "🚇", label: "Took metro", pts: 40, co2: "1.2 kg", color: "#5BBFDE" },
  { cat: "Transport", icon: "🚗", label: "Carpooled (3+)", pts: 25, co2: "0.6 kg", color: "#5BBFDE" },
  { cat: "Food", icon: "🥗", label: "Skipped meat", pts: 30, co2: "0.9 kg", color: "#2ECC87" },
  { cat: "Food", icon: "🌱", label: "Plant-based meal", pts: 35, co2: "1.1 kg", color: "#2ECC87" },
  { cat: "Consumption", icon: "☕", label: "Reusable cup", pts: 10, co2: "0.08 kg", color: "#C8A97E" },
  { cat: "Consumption", icon: "♻️", label: "Refused plastic bag", pts: 8, co2: "0.05 kg", color: "#C8A97E" },
  { cat: "Energy", icon: "❄️", label: "AC above 24°C", pts: 20, co2: "0.4 kg", color: "#FF6B35" },
  { cat: "Energy", icon: "🌬️", label: "Air-dried clothes", pts: 15, co2: "0.3 kg", color: "#FF6B35" },
  { cat: "Water", icon: "🚿", label: "< 5 min shower", pts: 12, co2: "×UAE mult.", color: "#A78BFA" },
];



export default function ActionsGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className={styles.section} id="actions" ref={ref}>
      <div className={styles.inner}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.label}>Action System</span>
          <h2 className={styles.title}>Points weighted by<br />real carbon impact.</h2>
          <p className={styles.desc}>
            Not perception. Not vibes. Every action is calibrated to actual CO₂ equivalents
            — with a UAE-specific water scarcity multiplier because desalination is energy-intensive.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {ACTIONS.map((a, i) => (
            <motion.div
              key={i}
              className={styles.card}
              style={{ "--cat-color": a.color } as React.CSSProperties}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className={styles.cardTop}>
                <span className={styles.icon}>{a.icon}</span>
                <span className={styles.catTag} style={{ color: a.color, borderColor: a.color + "40" }}>
                  {a.cat}
                </span>
              </div>
              <p className={styles.actionLabel}>{a.label}</p>
              <div className={styles.cardBottom}>
                <span className={styles.pts}>+{a.pts} pts</span>
                <span className={styles.co2}>{a.co2} CO₂</span>
              </div>
              <div className={styles.shine} />
            </motion.div>
          ))}

          <motion.div
            className={styles.uaeCard}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <span className={styles.uaeFlag}>🇦🇪</span>
            <h3 className={styles.uaeTitle}>UAE Water Multiplier</h3>
            <p className={styles.uaeText}>
              Water scarcity is different here. Desalination is energy-intensive,
              so every litre saved carries more CO₂ weight than anywhere else in the world.
              Your shower streak matters more than you think.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
