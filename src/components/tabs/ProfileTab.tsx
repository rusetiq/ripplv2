"use client";

import { useState } from "react";
import { CURRENT_USER, IMPACT_DATA } from "@/lib/data";
import { Settings, Flame, MapPin, ChevronRight, Bell, Shield, HelpCircle, LogOut, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

const card: React.CSSProperties = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--card-shadow)" };

export default function ProfileTab({ isDark, onToggleDark }: { isDark?: boolean; onToggleDark?: () => void }) {
  const [notifOn, setNotifOn] = useState(true);
  const u = CURRENT_USER;
  const { totalCO2, totalPoints } = IMPACT_DATA;
  const lvlPts = u.points % 500;
  const lvlPct = Math.round((lvlPts / 500) * 100);

  const menu = [
    { Icon: isDark ? Moon : Sun, label: isDark ? "Dark Mode" : "Light Mode", toggle: true, state: isDark, onToggle: onToggleDark },
    { Icon: Bell, label: "Notifications", toggle: true, state: notifOn, onToggle: () => setNotifOn(!notifOn) },
    { Icon: Shield, label: "Privacy" },
    { Icon: HelpCircle, label: "Help" },
    { Icon: LogOut, label: "Sign out", danger: true },
  ];

  return (
    <div>
      <div style={{ padding: "24px 24px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 22, fontFamily: "var(--font-display)", color: "var(--text-1)" }}>Profile</h2>
        <button style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Settings size={16} color="var(--text-2)" />
        </button>
      </div>

      <div style={{ padding: "16px 20px 20px" }}>
        <div style={{ ...card, boxShadow: "var(--card-shadow-lg)", padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 24 }}>{u.avatar}</div>
            <div style={{ position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: "50%", background: "var(--gold-soft)", border: "2px solid var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Flame size={11} color="var(--gold)" fill="var(--gold)" />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>{u.name}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
              <MapPin size={11} color="var(--text-3)" />
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>{u.city}, UAE</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--gold)", background: "var(--gold-soft)", padding: "3px 10px", borderRadius: 100 }}>{u.streak} day streak</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ ...card, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", overflow: "hidden" }}>
          {[
            { label: "Points", val: totalPoints.toLocaleString(), color: "var(--accent)" },
            { label: "CO₂", val: `${totalCO2}kg`, color: "#2563EB" },
            { label: "Rank", val: `#${u.rank}`, color: "#7C3AED" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
              style={{ textAlign: "center", padding: "16px 8px", borderRight: i < 2 ? "1px solid var(--border-subtle)" : "none" }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.val}</p>
              <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)" }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ ...card, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Level Progress</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)" }}>{lvlPts}/500</span>
          </div>
          <div style={{ height: 8, borderRadius: 100, background: "var(--surface)", overflow: "hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${lvlPct}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: "100%", borderRadius: 100, background: "linear-gradient(90deg, var(--accent), #7C3AED)" }} />
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px 24px" }}>
        <div style={{ ...card, overflow: "hidden", padding: 0 }}>
          {menu.map((item, i) => (
            <div key={item.label}>
              {i > 0 && <div style={{ height: 1, marginLeft: 52, background: "var(--border-subtle)" }} />}
              <button onClick={item.onToggle}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", color: item.danger ? "var(--danger)" : "var(--text-1)", transition: "background 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", color: item.danger ? "var(--danger)" : "var(--text-2)" }}>
                    <item.Icon size={16} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
                </div>
                {"toggle" in item && item.toggle ? (
                  <div style={{ width: 42, height: 24, borderRadius: 100, padding: 2, background: item.state ? "var(--accent)" : "var(--border)", transition: "background 0.25s", cursor: "pointer" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.15)", transition: "margin-left 0.25s", marginLeft: item.state ? 18 : 0 }} />
                  </div>
                ) : !item.danger ? (
                  <ChevronRight size={16} color="var(--text-3)" />
                ) : null}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
