"use client";

import { TabId } from "./AppShell";
import { Home, Plus, Trophy, BarChart3, User } from "lucide-react";

const TABS: { id: TabId; label: string; Icon: typeof Home }[] = [
  { id: "feed", label: "Feed", Icon: Home },
  { id: "leaderboard", label: "Rank", Icon: Trophy },
  { id: "log", label: "Log", Icon: Plus },
  { id: "impact", label: "Impact", Icon: BarChart3 },
  { id: "profile", label: "You", Icon: User },
];

export default function BottomNav({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", padding: "8px 8px 10px" }}>
      {TABS.map(({ id, label, Icon }) => {
        const on = active === id;
        const isLog = id === "log";

        if (isLog) {
          return (
            <button key={id} onClick={() => onChange(id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: on ? "var(--accent)" : "var(--card)",
                border: `1.5px solid ${on ? "var(--accent)" : "var(--border)"}`,
                boxShadow: on ? "0 4px 16px rgba(13,148,136,0.3)" : "var(--card-shadow)",
                color: on ? "#fff" : "var(--accent)",
                transition: "all 0.2s",
              }}>
                <Icon size={22} strokeWidth={2.5} />
              </div>
            </button>
          );
        }

        return (
          <button key={id} onClick={() => onChange(id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "6px 12px", color: on ? "var(--accent)" : "var(--text-3)", transition: "color 0.2s",
          }}>
            <Icon size={20} strokeWidth={on ? 2.5 : 2} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.03em" }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
