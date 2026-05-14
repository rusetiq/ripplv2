"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import styles from "./B2BSection.module.css";

const METRICS = [
  { label: "Tonnes CO₂ Avoided", value: "48.2t", unit: "this quarter", color: "#2ECC87" },
  { label: "Employee Participation", value: "73%", unit: "workforce active", color: "#5BBFDE" },
  { label: "ESG Score Impact", value: "+12pts", unit: "vs last quarter", color: "#C8A97E" },
  { label: "Verified Actions", value: "24,810", unit: "logged & validated", color: "#A78BFA" },
];

const PARTNERS = [
  { name: "ADNOC", desc: "Net Zero 2050 commitment" },
  { name: "Emirates", desc: "Sustainable aviation target" },
  { name: "Aldar", desc: "Green real estate portfolio" },
  { name: "Majid Al Futtaim", desc: "Retail ESG reporting" },
];

export default function B2BSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className={styles.section} ref={ref}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <motion.div
            className={styles.left}
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className={styles.label}>For Enterprises</span>
            <h2 className={styles.title}>
              Your ESG report<br />
              <span className={styles.accent}>backed by behavior.</span>
            </h2>
            <p className={styles.desc}>
              UAE companies now have ESG reporting obligations.
              Rippl gives your workforce an engagement product with real behavioral data attached.
              Show regulators exactly how your employees moved the needle — in verified actions, not surveys.
            </p>
            <div className={styles.bullets}>
              {[
                "Real-time employee sustainability dashboard",
                "Aggregated CO₂ impact per team, department, office",
                "Verified action data for regulatory reporting",
                "Brand partnership tie-ins (Careem, Kibsons, Goumbook)",
              ].map((b, i) => (
                <motion.div
                  key={i}
                  className={styles.bullet}
                  initial={{ opacity: 0, x: -12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                >
                  <span className={styles.bulletDot}>▹</span>
                  <span>{b}</span>
                </motion.div>
              ))}
            </div>
            <div className={styles.partners}>
              {PARTNERS.map((p) => (
                <div key={p.name} className={styles.partner}>
                  <span className={styles.partnerName}>{p.name}</span>
                  <span className={styles.partnerDesc}>{p.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className={styles.dashboard}
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <div className={styles.dashboardHeader}>
              <div className={styles.dashboardDots}>
                <span /><span /><span />
              </div>
              <span className={styles.dashboardTitle}>Corporate Dashboard · Q1 2025</span>
            </div>

            <div className={styles.metricsGrid}>
              {METRICS.map((m, i) => (
                <motion.div
                  key={m.label}
                  className={styles.metric}
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                >
                  <span className={styles.metricVal} style={{ color: m.color }}>{m.value}</span>
                  <span className={styles.metricLabel}>{m.label}</span>
                  <span className={styles.metricUnit}>{m.unit}</span>
                </motion.div>
              ))}
            </div>

            <div className={styles.chartArea}>
              <p className={styles.chartLabel}>Weekly Team Activity</p>
              <div className={styles.chart}>
                {[40, 65, 48, 82, 71, 90, 76].map((h, i) => (
                  <motion.div
                    key={i}
                    className={styles.bar}
                    initial={{ scaleY: 0 }}
                    animate={inView ? { scaleY: 1 } : {}}
                    transition={{ delay: 0.6 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className={styles.chartDays}>
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} className={styles.chartDay}>{d}</span>
                ))}
              </div>
            </div>

            <div className={styles.dashboardNote}>
              All data aggregated and anonymized · GDPR compliant
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
