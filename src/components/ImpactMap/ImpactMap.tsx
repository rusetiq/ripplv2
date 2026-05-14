"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import styles from "./ImpactMap.module.css";

const SECTORS = [
  {
    id: "transport",
    label: "Transport",
    icon: "🚇",
    target: "23% reduction by 2030",
    progress: 8,
    userContrib: "4,821 Ripplers saved 2.1t CO₂ this week in Dubai",
    color: "#5BBFDE",
    actions: ["Metro instead of car", "Carpooling (3+ people)", "Electric vehicle"],
  },
  {
    id: "food",
    label: "Food & Diet",
    icon: "🌱",
    target: "18% reduction by 2030",
    progress: 12,
    userContrib: "1,203 plant-based meals logged today across the UAE",
    color: "#2ECC87",
    actions: ["Skip meat (one meal)", "Choose plant-based", "Reduce food waste"],
  },
  {
    id: "energy",
    label: "Energy",
    icon: "⚡",
    target: "44% from renewables by 2050",
    progress: 19,
    userContrib: "AC above 24°C saved est. 0.4 kg CO₂ per household",
    color: "#C8A97E",
    actions: ["AC above 24°C", "Air-dry clothes", "Solar adoption"],
  },
  {
    id: "water",
    label: "Water",
    icon: "💧",
    target: "UAE-specific scarcity multiplier",
    progress: 31,
    userContrib: "Desalination is energy-intensive — every drop counts more here",
    color: "#FF6B35",
    actions: ["< 5 min shower", "Reuse greywater", "Fix leaks"],
  },
];

export default function ImpactMap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [active, setActive] = useState(SECTORS[0]);

  return (
    <section className={styles.section} id="impact" ref={ref}>
      <div className={styles.inner}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.label}>UAE Net Zero 2050</span>
          <h2 className={styles.title}>Your action, their number.</h2>
          <p className={styles.desc}>
            Every action you log is mapped to published UAE government sector targets.
            Not abstract trees. Real commitments your government has made — and that you&apos;re helping keep.
          </p>
        </motion.div>

        <div className={styles.grid}>
          <motion.div
            className={styles.sectorNav}
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {SECTORS.map((s) => (
              <button
                key={s.id}
                className={`${styles.sectorBtn} ${active.id === s.id ? styles.active : ""}`}
                style={{ "--accent": s.color } as React.CSSProperties}
                onClick={() => setActive(s)}
                id={`sector-${s.id}`}
              >
                <span className={styles.sectorIcon}>{s.icon}</span>
                <span className={styles.sectorLabel}>{s.label}</span>
                {active.id === s.id && <span className={styles.sectorActive} />}
              </button>
            ))}
          </motion.div>

          <motion.div
            className={styles.detail}
            key={active.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.detailHeader}>
              <span className={styles.detailIcon}>{active.icon}</span>
              <div>
                <h3 className={styles.detailTitle}>{active.label}</h3>
                <p className={styles.detailTarget}>UAE Target: {active.target}</p>
              </div>
            </div>

            <div className={styles.progressWrap}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>Current Progress</span>
                <span className={styles.progressVal} style={{ color: active.color }}>{active.progress}%</span>
              </div>
              <div className={styles.progressBar}>
                <motion.div
                  className={styles.progressFill}
                  style={{ background: active.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${active.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                />
              </div>
              <p className={styles.progressNote}>toward sector target</p>
            </div>

            <div className={styles.rippleStat}>
              <span className={styles.rippleStatIcon}>◎</span>
              <p className={styles.rippleStatText}>{active.userContrib}</p>
            </div>

            <div className={styles.actionsList}>
              <p className={styles.actionsLabel}>Actions in this category:</p>
              <div className={styles.actionTags}>
                {active.actions.map((a) => (
                  <span key={a} className={styles.tag} style={{ borderColor: active.color + "40", color: active.color }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className={styles.mapPanel}
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className={styles.mapCard}>
              <p className={styles.mapLabel}>Dubai</p>
              <div className={styles.mapBar}>
                <div className={styles.mapBarFill} style={{ width: "68%", background: "#5BBFDE" }} />
                <span className={styles.mapBarVal}>68% of target pace</span>
              </div>
            </div>
            <div className={styles.mapCard}>
              <p className={styles.mapLabel}>Abu Dhabi</p>
              <div className={styles.mapBar}>
                <div className={styles.mapBarFill} style={{ width: "72%", background: "#2ECC87" }} />
                <span className={styles.mapBarVal}>72% of target pace</span>
              </div>
            </div>
            <div className={styles.mapCard}>
              <p className={styles.mapLabel}>Sharjah</p>
              <div className={styles.mapBar}>
                <div className={styles.mapBarFill} style={{ width: "54%", background: "#C8A97E" }} />
                <span className={styles.mapBarVal}>54% of target pace</span>
              </div>
            </div>
            <div className={styles.mapCard}>
              <p className={styles.mapLabel}>Ajman</p>
              <div className={styles.mapBar}>
                <div className={styles.mapBarFill} style={{ width: "41%", background: "#FF6B35" }} />
                <span className={styles.mapBarVal}>41% of target pace</span>
              </div>
            </div>
            <div className={styles.mapNote}>
              City-level impact toward UAE Net Zero 2050 sector targets
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
