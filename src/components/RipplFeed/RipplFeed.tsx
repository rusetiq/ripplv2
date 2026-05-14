"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import styles from "./RipplFeed.module.css";

const FEED = [
  {
    id: 1,
    handle: "@sara_ad",
    avatar: "S",
    color: "#2ECC87",
    action: "Skipped meat",
    emoji: "🥗",
    pts: 30,
    ago: "3h ago",
    city: "Abu Dhabi",
    ripples: 12,
    streak: 7,
    comment: "Day 7! Who's challenging me to go plant-based this week?",
  },
  {
    id: 2,
    handle: "@khalid.ae",
    avatar: "K",
    color: "#5BBFDE",
    action: "Metro to work",
    emoji: "🚇",
    pts: 40,
    ago: "5h ago",
    city: "Dubai",
    ripples: 28,
    streak: 14,
    comment: null,
  },
  {
    id: 3,
    handle: "@rusetiq",
    avatar: "R",
    color: "#C8A97E",
    action: "Reusable cup",
    emoji: "☕",
    pts: 10,
    ago: "just now",
    city: "Dubai",
    ripples: 5,
    streak: 3,
    comment: null,
  },
  {
    id: 4,
    handle: "@layla.eco",
    avatar: "L",
    color: "#FF6B35",
    action: "Air-dried clothes",
    emoji: "🌬️",
    pts: 15,
    ago: "1h ago",
    city: "Sharjah",
    ripples: 9,
    streak: 21,
    comment: "AC off, laundry line up — Sharjah heat doing the work 🌞",
  },
  {
    id: 5,
    handle: "@ahmed.dxb",
    avatar: "A",
    color: "#2ECC87",
    action: "Plant-based meal",
    emoji: "🌱",
    pts: 35,
    ago: "2h ago",
    city: "Dubai",
    ripples: 18,
    streak: 5,
    comment: null,
  },
];

function FeedCard({ item, index }: { item: (typeof FEED)[0]; index: number }) {
  const [rippled, setRippled] = useState(false);
  const [rippleCount, setRippleCount] = useState(item.ripples);

  const handleRipple = () => {
    if (!rippled) {
      setRippled(true);
      setRippleCount((c) => c + 1);
    }
  };

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.cardTop}>
        <div className={styles.avatar} style={{ background: item.color + "22", borderColor: item.color + "44" }}>
          <span style={{ color: item.color }}>{item.avatar}</span>
        </div>
        <div className={styles.meta}>
          <span className={styles.handle}>{item.handle}</span>
          <span className={styles.city}>📍 {item.city}</span>
        </div>
        <span className={styles.ago}>{item.ago}</span>
      </div>

      <div className={styles.action}>
        <span className={styles.emoji}>{item.emoji}</span>
        <div className={styles.actionInfo}>
          <span className={styles.actionName}>{item.action}</span>
          <span className={styles.pts}>+{item.pts} pts</span>
        </div>
        {item.streak > 0 && (
          <div className={styles.streak}>
            <span>🔥</span>
            <span>{item.streak}d</span>
          </div>
        )}
      </div>

      {item.comment && (
        <p className={styles.comment}>{item.comment}</p>
      )}

      <div className={styles.cardActions}>
        <button
          className={`${styles.rippleBtn} ${rippled ? styles.rippled : ""}`}
          onClick={handleRipple}
          id={`ripple-btn-${item.id}`}
        >
          <span className={styles.rippleBtnIcon}>◎</span>
          <span>{rippleCount}</span>
        </button>
        <button className={styles.challengeBtn} id={`challenge-btn-${item.id}`}>Challenge</button>
      </div>
    </motion.div>
  );
}

export default function RipplFeed() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className={styles.section} id="feed" ref={ref}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <span className={styles.label}>The Rippl Feed</span>
        <h2 className={styles.title}>Actions, not articles.</h2>
        <p className={styles.desc}>
          A real-time stream of sustainable choices from your city.
          React with a ripple. Issue a challenge. Keep the streak alive.
        </p>
      </motion.div>

      <div className={styles.feedGrid}>
        <div className={styles.feedCol}>
          {FEED.map((item, i) => (
            <FeedCard key={item.id} item={item} index={i} />
          ))}
        </div>

        <motion.div
          className={styles.sidebar}
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>🏆 Top Ripplers This Week</h3>
            {[
              { rank: 1, handle: "@layla.eco", pts: 840, city: "Sharjah" },
              { rank: 2, handle: "@khalid.ae", pts: 760, city: "Dubai" },
              { rank: 3, handle: "@sara_ad", pts: 690, city: "Abu Dhabi" },
              { rank: 4, handle: "@ahmed.dxb", pts: 580, city: "Dubai" },
              { rank: 5, handle: "@noor.uae", pts: 510, city: "Ajman" },
            ].map((u) => (
              <div key={u.rank} className={styles.rankRow}>
                <span className={`${styles.rank} ${u.rank === 1 ? styles.gold : u.rank === 2 ? styles.silver : u.rank === 3 ? styles.bronze : ""}`}>
                  #{u.rank}
                </span>
                <div className={styles.rankInfo}>
                  <span className={styles.rankHandle}>{u.handle}</span>
                  <span className={styles.rankCity}>{u.city}</span>
                </div>
                <span className={styles.rankPts}>{u.pts} pts</span>
              </div>
            ))}
          </div>

          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>⚡ Active Challenges</h3>
            <div className={styles.challengeItem}>
              <p className={styles.challengeText}>
                <strong>@layla.eco</strong> challenged <strong>@sara_ad</strong>
              </p>
              <p className={styles.challengeDesc}>7-day plant-based streak · 4 days left</p>
              <div className={styles.challengeBar}>
                <div className={styles.challengeProgress} style={{ width: "57%" }} />
              </div>
            </div>
            <div className={styles.challengeItem}>
              <p className={styles.challengeText}>
                <strong>@khalid.ae</strong> challenged <strong>@ahmed.dxb</strong>
              </p>
              <p className={styles.challengeDesc}>Metro-only commute · 2 days left</p>
              <div className={styles.challengeBar}>
                <div className={styles.challengeProgress} style={{ width: "71%" }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
