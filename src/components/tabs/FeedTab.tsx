"use client";

import { useState } from "react";
import { FEED_ACTIONS, CURRENT_USER, USERS, Action } from "@/lib/data";
import { Waves, MessageCircle, Flame, Train, Salad, Sun, Recycle, Droplets, Plus } from "lucide-react";

const COLORS = ["#0D9488", "#7C3AED", "#D97706", "#2563EB", "#DC2626"];
const ICON_MAP: Record<string, typeof Train> = { transport: Train, food: Salad, energy: Sun, waste: Recycle, water: Droplets };

const card: React.CSSProperties = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--card-shadow)", padding: 20, marginLeft: 20, marginRight: 20 };
const innerBox: React.CSSProperties = { background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 12, marginBottom: 14 };
const pill: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 100, fontSize: 12, fontWeight: 700, background: "var(--accent-soft)", color: "var(--accent)" };

function Avatar({ letter, color, size = 38 }: { letter: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.42, flexShrink: 0 }}>
      {letter}
    </div>
  );
}

function StoryDot({ user, index, onTap }: { user: (typeof USERS)[0]; index: number; onTap?: () => void }) {
  const isMe = user.id === "me";
  const c = COLORS[index % COLORS.length];
  return (
    <button onClick={onTap} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 64, flexShrink: 0, background: "none" }}>
      <div style={{ padding: 2.5, borderRadius: "50%", background: user.loggedToday ? `linear-gradient(135deg, ${c}, var(--gold))` : "var(--border)" }}>
        <div style={{ padding: 2, borderRadius: "50%", background: "var(--bg)" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 }}>
            {isMe && !user.loggedToday ? <Plus size={20} /> : user.avatar}
          </div>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: isMe ? "var(--accent)" : "var(--text-3)", width: "100%", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {isMe ? "You" : user.name.split(" ")[0]}
      </span>
    </button>
  );
}

function FeedCard({ action, index, onRipple }: { action: Action; index: number; onRipple: (id: string) => void }) {
  const [pop, setPop] = useState(false);
  const idx = USERS.findIndex((u) => u.id === action.userId);
  const c = COLORS[(idx >= 0 ? idx : 0) % COLORS.length];
  const TypeIcon = ICON_MAP[action.type] || Recycle;

  function handleRipple() {
    if (action.rippled) return;
    setPop(true);
    setTimeout(() => setPop(false), 400);
    onRipple(action.id);
  }

  return (
    <div className="anim-enter" style={{ animationDelay: `${index * 60}ms` }}>
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <Avatar letter={action.user.avatar} color={c} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>{action.user.name.split(" ")[0]}</span>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>{action.timestamp}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Flame size={11} color="var(--gold)" fill="var(--gold)" />
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{action.user.streak}d streak</span>
            </div>
          </div>
          <div style={pill}>+{action.points}</div>
        </div>

        <div style={innerBox}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
            <TypeIcon size={20} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{action.name}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginTop: 2 }}>{action.co2} kg CO₂</p>
          </div>
        </div>

        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-2)", marginBottom: 14, paddingLeft: 12, borderLeft: "2px solid var(--accent)" }}>
          {action.context}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 20, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
          <button onClick={handleRipple} style={{ display: "flex", alignItems: "center", gap: 6, color: action.rippled ? "var(--accent)" : "var(--text-3)", transition: "color 0.2s" }}>
            <Waves size={18} strokeWidth={2.5} style={{ transform: pop ? "scale(1.25)" : "scale(1)", transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)" }} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>{action.ripples}</span>
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-3)" }}>
            <MessageCircle size={18} strokeWidth={2.5} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>{action.comments}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeedTab({ onOpenLog }: { onOpenLog: () => void }) {
  const [actions, setActions] = useState(FEED_ACTIONS);
  const storyUsers = [{ ...CURRENT_USER, id: "me" as const }, ...USERS.filter((u) => u.id !== "me")];

  function handleRipple(id: string) {
    setActions((p) => p.map((a) => a.id === id ? { ...a, rippled: true, ripples: a.ripples + 1 } : a));
  }

  return (
    <div>
      <div style={{ padding: "24px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 28, fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--text-1)", lineHeight: 1 }}>rippl</h1>
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" }}>Dubai</span>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 24px 16px" }} className="no-scrollbar">
        {storyUsers.map((u, i) => <StoryDot key={u.id} user={u} index={i} onTap={u.id === "me" ? onOpenLog : undefined} />)}
      </div>

      <div style={{ height: 1, margin: "0 24px 16px", background: "var(--border)" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 24 }}>
        {actions.map((a, i) => <FeedCard key={a.id} action={a} index={i} onRipple={handleRipple} />)}
      </div>
    </div>
  );
}
