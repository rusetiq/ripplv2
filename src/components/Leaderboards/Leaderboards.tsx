"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import styles from "./Leaderboards.module.css";

const CITIES = [
  {
    name: "Dubai",
    emoji: "🏙️",
    color: "#5BBFDE",
    users: [
      { rank: 1, handle: "@khalid.ae", pts: 2840, badge: "🔥", streak: 14 },
      { rank: 2, handle: "@ahmed.dxb", pts: 2580, badge: "", streak: 5 },
      { rank: 3, handle: "@noura.d", pts: 2210, badge: "🌱", streak: 9 },
      { rank: 4, handle: "@faisal99", pts: 1980, badge: "", streak: 3 },
      { rank: 5, handle: "@rasha.uae", pts: 1820, badge: "", streak: 6 },
    ],
    neighborhood: "Al Quoz vs Downtown",
  },
  {
    name: "Abu Dhabi",
    emoji: "🌊",
    color: "#2ECC87",
    users: [
      { rank: 1, handle: "@sara_ad", pts: 3190, badge: "🏆", streak: 21 },
      { rank: 2, handle: "@mariam.ad", pts: 2760, badge: "🔥", streak: 11 },
      { rank: 3, handle: "@yousef.k", pts: 2320, badge: "", streak: 7 },
      { rank: 4, handle: "@hessa.ae", pts: 2040, badge: "🌱", streak: 8 },
      { rank: 5, handle: "@sultan77", pts: 1670, badge: "", streak: 2 },
    ],
    neighborhood: "Khalidiyah vs Corniche",
  },
  {
    name: "Sharjah",
    emoji: "🌅",
    color: "#C8A97E",
    users: [
      { rank: 1, handle: "@layla.eco", pts: 2940, badge: "🌱", streak: 30 },
      { rank: 2, handle: "@talib.s", pts: 2110, badge: "", streak: 4 },
      { rank: 3, handle: "@shaikha.r", pts: 1890, badge: "🔥", streak: 12 },
      { rank: 4, handle: "@basim.ae", pts: 1650, badge: "", streak: 5 },
      { rank: 5, handle: "@nour.s", pts: 1340, badge: "", streak: 3 },
    ],
    neighborhood: "Al Majaz vs Al Khan",
  },
];

const BADGES = [
  { icon: "🏜️", name: "Desert Saver", desc: "30-day water streak", rarity: "Rare" },
  { icon: "⚡", name: "Zero Idle", desc: "No car idling for a week", rarity: "Uncommon" },
  { icon: "🌙", name: "Iftar Impact", desc: "Sustainable choices through Ramadan", rarity: "Epic" },
  { icon: "🚇", name: "Metro Mile", desc: "30 transit trips logged", rarity: "Common" },
  { icon: "🥗", name: "Green Plate", desc: "21-day meat-free streak", rarity: "Rare" },
  { icon: "♻️", name: "Loop Closer", desc: "50 zero-waste actions", rarity: "Uncommon" },
];

export default function Leaderboards() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className={styles.section} id="boards" ref={ref}>
      <div className={styles.inner}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.label}>Leaderboards</span>
          <h2 className={styles.title}>Your city is<br />watching.</h2>
          <p className={styles.desc}>
            Neighborhood vs neighborhood. Friend vs friend.
            The same competitive mechanic that made Strava segments addictive — for the planet.
          </p>
        </motion.div>

        <div className={styles.cityGrid}>
          {CITIES.map((city, ci) => (
            <motion.div
              key={city.name}
              className={styles.cityCard}
              style={{ "--city-color": city.color } as React.CSSProperties}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: ci * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.cityHeader}>
                <div className={styles.cityName}>
                  <span className={styles.cityEmoji}>{city.emoji}</span>
                  <span style={{ color: city.color }}>{city.name}</span>
                </div>
                <span className={styles.cityNeighborhood}>{city.neighborhood}</span>
              </div>

              <div className={styles.cityUsers}>
                {city.users.map((u) => (
                  <div key={u.rank} className={`${styles.userRow} ${u.rank === 1 ? styles.topUser : ""}`}>
                    <span className={`${styles.userRank} ${u.rank === 1 ? styles.first : ""}`}
                      style={u.rank === 1 ? { color: city.color } : {}}>
                      {u.rank === 1 ? "▲" : `#${u.rank}`}
                    </span>
                    <span className={styles.userHandle}>{u.handle}</span>
                    {u.badge && <span className={styles.userBadge}>{u.badge}</span>}
                    <div className={styles.userRight}>
                      {u.streak > 0 && <span className={styles.userStreak}>🔥{u.streak}d</span>}
                      <span className={styles.userPts} style={u.rank === 1 ? { color: city.color } : {}}>
                        {u.pts.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className={styles.badgesSection}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h3 className={styles.badgesTitle}>Earn culturally-specific badges</h3>
          <div className={styles.badgesGrid}>
            {BADGES.map((b, i) => (
              <motion.div
                key={b.name}
                className={styles.badge}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.06, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <span className={styles.badgeIcon}>{b.icon}</span>
                <span className={styles.badgeName}>{b.name}</span>
                <span className={styles.badgeDesc}>{b.desc}</span>
                <span className={`${styles.badgeRarity} ${styles[b.rarity.toLowerCase()]}`}>{b.rarity}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
