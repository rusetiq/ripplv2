"use client";

import { useState } from "react";
import { USERS } from "@/lib/data";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";

type Scope = "friends" | "dubai" | "uae";
const COLORS = ["#0D9488", "#7C3AED", "#D97706", "#2563EB", "#DC2626"];
const card: React.CSSProperties = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--card-shadow)" };

export default function LeaderboardTab() {
  const [scope, setScope] = useState<Scope>("friends");
  const sorted = [...USERS].sort((a, b) => b.points - a.points);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const LABELS: Record<Scope, string> = { friends: "Friends", dubai: "Dubai", uae: "UAE" };
  const podium = [top3[1], top3[0], top3[2]];
  const heights = [96, 130, 76];
  const ranks = [2, 1, 3];
  const medals = ["2nd", "1st", "3rd"];

  return (
    <div>
      <div style={{ padding: "24px 24px 8px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-3)" }}>This week</p>
        <h2 style={{ fontSize: 22, fontFamily: "var(--font-display)", color: "var(--text-1)" }}>Leaderboard</h2>
      </div>

      <div style={{ padding: "12px 24px 20px" }}>
        <div style={{ display: "flex", padding: 4, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)" }}>
          {(["friends", "dubai", "uae"] as Scope[]).map((s) => (
            <button key={s} onClick={() => setScope(s)} style={{
              flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: scope === s ? "var(--accent)" : "transparent",
              color: scope === s ? "#fff" : "var(--text-3)",
              transition: "all 0.2s",
            }}>
              {LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 24px 24px", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, height: 220 }}>
        {podium.map((user, i) => {
          if (!user) return <div key={i} style={{ flex: 1 }} />;
          const rank = ranks[i];
          const isMe = user.id === "me";
          const idx = USERS.indexOf(user);
          const c = COLORS[(idx >= 0 ? idx : 0) % COLORS.length];
          const isFirst = rank === 1;

          return (
            <motion.div key={user.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div style={{ position: "relative", marginBottom: 8 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, boxShadow: isFirst ? `0 0 0 3px var(--bg), 0 0 0 5px ${c}` : "var(--card-shadow)" }}>
                  {user.avatar}
                </div>
                <span style={{ position: "absolute", top: -6, right: -4, fontSize: 10, fontWeight: 800, background: isFirst ? "var(--accent)" : "var(--surface)", color: isFirst ? "#fff" : "var(--text-2)", padding: "1px 5px", borderRadius: 6, border: "1px solid var(--border)" }}>
                  {medals[i]}
                </span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: isMe ? "var(--accent)" : "var(--text-1)", marginBottom: 6, textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {isMe ? "You" : user.name.split(" ")[0]}
              </p>
              <div style={{
                width: "100%", height: heights[i], borderRadius: "14px 14px 0 0",
                background: isFirst ? "var(--accent-soft)" : "var(--surface)",
                border: `1px solid ${isFirst ? "var(--accent)" : "var(--border)"}`, borderBottom: "none",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 12,
              }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: isFirst ? "var(--accent)" : "var(--text-1)" }}>{user.weeklyPoints}</span>
                <span style={{ fontSize: 10, color: "var(--text-3)" }}>pts</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        {rest.map((user, i) => {
          const rank = i + 4;
          const isMe = user.id === "me";
          const idx = USERS.indexOf(user);
          const c = COLORS[(idx >= 0 ? idx : 0) % COLORS.length];
          return (
            <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.04 }}
              style={{ ...card, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, border: isMe ? "1.5px solid var(--accent)" : card.border }}>
              <span style={{ fontSize: 13, fontWeight: 700, width: 18, textAlign: "center", color: isMe ? "var(--accent)" : "var(--text-3)" }}>{rank}</span>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{user.avatar}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: isMe ? "var(--accent)" : "var(--text-1)" }}>{isMe ? "You" : user.name.split(" ")[0]}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <Flame size={10} color="var(--gold)" fill="var(--gold)" />
                  <span style={{ fontSize: 11, color: "var(--text-3)" }}>{user.streak}d</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: isMe ? "var(--accent)" : "var(--text-1)" }}>{user.points.toLocaleString()}</p>
                <p style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)" }}>pts</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
