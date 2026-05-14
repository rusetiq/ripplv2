"use client";

import { useState } from "react";
import { LOG_CATEGORIES, LogAction, CURRENT_USER } from "@/lib/data";
import { ArrowLeft, Minus, Plus, Check, Train, Salad, Zap, Droplets, Recycle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "categories" | "actions" | "confirm" | "success";
const CAT_ICON: Record<string, typeof Train> = { transport: Train, food: Salad, energy: Zap, water: Droplets, waste: Recycle };
const card: React.CSSProperties = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--card-shadow)" };

export default function LogTab({ onLogged }: { onLogged: (pts: number, co2: number) => void }) {
  const [step, setStep] = useState<Step>("categories");
  const [cat, setCat] = useState<(typeof LOG_CATEGORIES)[0] | null>(null);
  const [act, setAct] = useState<LogAction | null>(null);
  const [qty, setQty] = useState(1);

  function reset() { setStep("categories"); setCat(null); setAct(null); setQty(1); }
  function confirm() { if (!act) return; setStep("success"); onLogged(act.points * qty, act.co2 * qty); setTimeout(reset, 2800); }

  const CatIcon = cat ? (CAT_ICON[cat.id] || Recycle) : Recycle;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ padding: "24px 24px 8px", display: "flex", alignItems: "center", gap: 12 }}>
        <AnimatePresence>
          {step !== "categories" && step !== "success" && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => step === "actions" ? reset() : setStep("actions")}
              style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface)", border: "1px solid var(--border)", flexShrink: 0 }}>
              <ArrowLeft size={16} color="var(--text-1)" />
            </motion.button>
          )}
        </AnimatePresence>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-3)" }}>
            {step === "categories" ? "Log Impact" : step === "actions" ? cat?.label : step === "confirm" ? "Review" : ""}
          </p>
          <h2 style={{ fontSize: 22, fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
            {step === "categories" ? "What did you do?" : step === "actions" ? "Pick one" : step === "confirm" ? "How many?" : ""}
          </h2>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "categories" && (
          <motion.div key="cat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: "20px 20px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {LOG_CATEGORIES.map((c, i) => {
              const Icon = CAT_ICON[c.id] || Recycle;
              return (
                <button key={c.id} onClick={() => { setCat(c); setStep("actions"); }}
                  className="anim-enter" style={{ ...card, padding: 20, textAlign: "left", animationDelay: `${i * 40}ms`, transition: "transform 0.15s", cursor: "pointer" }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", marginBottom: 16 }}>
                    <Icon size={22} />
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>{c.label}</p>
                  <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>{c.actions.length} actions</p>
                </button>
              );
            })}
          </motion.div>
        )}

        {step === "actions" && cat && (
          <motion.div key="act" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            style={{ padding: "20px 20px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
            {cat.actions.map((a, i) => (
              <button key={a.id} onClick={() => { setAct(a); setStep("confirm"); }}
                className="anim-enter" style={{ ...card, padding: 16, display: "flex", alignItems: "center", gap: 14, textAlign: "left", width: "100%", animationDelay: `${i * 30}ms`, cursor: "pointer" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
                  <CatIcon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", background: "var(--accent-soft)", padding: "2px 8px", borderRadius: 6 }}>+{a.points}</span>
                    <span style={{ fontSize: 12, color: "var(--text-3)" }}>{a.co2} kg CO₂</span>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {step === "confirm" && act && (
          <motion.div key="conf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: "20px 20px 32px", display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ ...card, boxShadow: "var(--card-shadow-lg)", padding: 28, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--accent-soft)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", marginBottom: 16 }}>
                <CatIcon size={28} />
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent)", marginBottom: 4 }}>{cat?.label}</p>
              <p style={{ fontSize: 20, fontFamily: "var(--font-display)", color: "var(--text-1)", textAlign: "center", marginBottom: 24 }}>{act.name}</p>

              <div style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-3)", textAlign: "center", marginBottom: 14 }}>Quantity</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Minus size={18} color="var(--text-1)" />
                  </button>
                  <span style={{ fontSize: 32, fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--text-1)", width: 40, textAlign: "center" }}>{qty}</span>
                  <button onClick={() => setQty(Math.min(10, qty + 1))} style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Plus size={18} color="var(--text-1)" />
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
                <div style={{ textAlign: "center", padding: 14, borderRadius: 14, background: "var(--accent-soft)" }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "var(--accent)" }}>+{act.points * qty}</p>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", marginTop: 4 }}>Points</p>
                </div>
                <div style={{ textAlign: "center", padding: 14, borderRadius: 14, background: "var(--surface)", border: "1px solid var(--border-subtle)" }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)" }}>{(act.co2 * qty).toFixed(1)}</p>
                  <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-3)", marginTop: 4 }}>kg CO₂</p>
                </div>
              </div>
            </div>

            <button onClick={confirm} style={{ width: "100%", marginTop: 16, padding: 16, borderRadius: 16, fontSize: 15, fontWeight: 700, color: "#fff", background: "var(--accent)", boxShadow: "0 4px 16px rgba(13,148,136,0.2)", cursor: "pointer" }}>
              Log Impact
            </button>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "80px 32px", textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--accent-soft)", border: "2px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Check size={36} color="var(--accent)" strokeWidth={3} />
            </div>
            <h2 style={{ fontSize: 26, fontFamily: "var(--font-display)", color: "var(--text-1)", marginBottom: 8 }}>Logged.</h2>
            <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.6 }}>
              {(act?.co2 ?? 0) * qty} kg CO₂ saved · {(act?.points ?? 0) * qty} pts earned
            </p>
            <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: "var(--gold)", background: "var(--gold-soft)", padding: "6px 14px", borderRadius: 100 }}>
              {CURRENT_USER.streak + 1} day streak
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
