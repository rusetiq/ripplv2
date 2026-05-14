"use client";

import { useState } from "react";
import { IMPACT_DATA } from "@/lib/data";
import { Leaf, Droplets, Car, Utensils, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

const card: React.CSSProperties = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--card-shadow)" };

function WeekBar({ day, pts, max, today, delay }: { day: string; pts: number; max: number; today: boolean; delay: number }) {
  const pct = max > 0 ? (pts / max) * 100 : 0;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ width: "100%", height: 80, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }}>
        <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(pct, pts > 0 ? 8 : 3)}%` }}
          transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", borderRadius: "4px 4px 0 0", background: today ? "var(--accent)" : pts > 0 ? "var(--accent-soft)" : "var(--border-subtle)" }}
        />
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color: today ? "var(--accent)" : "var(--text-3)" }}>{day}</span>
    </div>
  );
}

function Arc({ pct }: { pct: number }) {
  const r = 42; const circ = Math.PI * r; const dash = (pct / 100) * circ;
  return (
    <svg width="96" height="56" viewBox="0 0 96 56" style={{ flexShrink: 0 }}>
      <path d="M 6 50 A 42 42 0 0 1 90 50" fill="none" stroke="var(--border)" strokeWidth="7" strokeLinecap="round" />
      <motion.path d="M 6 50 A 42 42 0 0 1 90 50" fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={`${circ} ${circ}`} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} />
      <text x="48" y="44" textAnchor="middle" fill="var(--text-1)" fontSize="14" fontWeight="700" fontFamily="'Bricolage Grotesque', sans-serif">{pct}%</text>
    </svg>
  );
}

export default function ImpactTab() {
  const [showAll, setShowAll] = useState(false);
  const { badges, uaeContext, weeklyHistory, totalCO2, treesEquivalent, drivingKmAvoided, waterSavedLiters, mealsOffset } = IMPACT_DATA;
  const maxPts = Math.max(...weeklyHistory.map((d) => d.points));
  const weekTotal = weeklyHistory.reduce((s, d) => s + d.points, 0);

  const stats = [
    { Icon: Leaf, val: treesEquivalent, unit: "trees", label: "absorbed", color: "var(--accent)" },
    { Icon: Car, val: drivingKmAvoided, unit: "km", label: "not driven", color: "#2563EB" },
    { Icon: Droplets, val: `${waterSavedLiters.toLocaleString()}L`, unit: "", label: "conserved", color: "#2563EB" },
    { Icon: Utensils, val: mealsOffset, unit: "meals", label: "offset", color: "#7C3AED" },
  ];

  const BADGE_ICONS: Record<string, typeof Leaf> = { b1: Droplets, b2: Leaf, b3: Car, b4: Utensils, b5: Leaf, b6: Leaf };

  return (
    <div>
      <div style={{ padding: "24px 24px 8px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-3)" }}>All time</p>
        <h2 style={{ fontSize: 22, fontFamily: "var(--font-display)", color: "var(--text-1)" }}>Your Impact</h2>
      </div>

      <div style={{ padding: "16px 20px 20px" }}>
        <div style={{ ...card, boxShadow: "var(--card-shadow-lg)", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 6 }}>CO₂ Avoided</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 38, fontFamily: "var(--font-display)", color: "var(--text-1)", lineHeight: 1 }}>{totalCO2}</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: "var(--accent)" }}>kg</span>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: "var(--accent)", background: "var(--accent-soft)", padding: "4px 10px", borderRadius: 100, display: "inline-block" }}>
                {uaeContext.userContributionRank} of UAE
              </div>
            </div>
            <Arc pct={uaeContext.currentProgress} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-1)", background: "var(--border)", padding: "3px 6px", borderRadius: 4 }}>UAE</span>
            <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
              Net Zero <strong style={{ color: "var(--text-1)" }}>2050</strong> · Transport <strong style={{ color: "var(--accent)" }}>−23%</strong> by 2030
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.05 }}
            style={{ ...card, padding: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: s.color, marginBottom: 10 }}>
              <s.Icon size={16} />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</span>
              {s.unit && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)" }}>{s.unit}</span>}
            </div>
            <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ ...card, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>This week</p>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", background: "var(--accent-soft)", padding: "4px 10px", borderRadius: 100 }}>{weekTotal} pts</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
            {weeklyHistory.map((d, i) => <WeekBar key={d.day} day={d.day} pts={d.points} max={maxPts} today={i === 5} delay={i * 0.04} />)}
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, padding: "0 4px" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>Badges</p>
          <button onClick={() => setShowAll(!showAll)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>
            {showAll ? "Less" : `All ${badges.length}`}
            {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {badges.slice(0, showAll ? badges.length : 3).map((b) => {
            const BIcon = BADGE_ICONS[b.id] || Leaf;
            return (
              <div key={b.id} style={{ ...card, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", opacity: b.unlocked ? 1 : 0.35, border: b.unlocked ? "1.5px solid var(--accent)" : card.border }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: b.unlocked ? "var(--accent-soft)" : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", color: b.unlocked ? "var(--accent)" : "var(--text-3)", marginBottom: 8 }}>
                  <BIcon size={18} />
                </div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.3 }}>{b.name}</p>
                <p style={{ fontSize: 9, color: "var(--text-3)", marginTop: 2, lineHeight: 1.3 }}>{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
