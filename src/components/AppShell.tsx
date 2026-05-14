"use client";

import { useState, useEffect } from "react";
import BottomNav from "./BottomNav";
import FeedTab from "./tabs/FeedTab";
import LogTab from "./tabs/LogTab";
import LeaderboardTab from "./tabs/LeaderboardTab";
import ImpactTab from "./tabs/ImpactTab";
import ProfileTab from "./tabs/ProfileTab";
import { AnimatePresence, motion } from "framer-motion";

export type TabId = "feed" | "log" | "leaderboard" | "impact" | "profile";

export default function AppShell() {
  const [tab, setTab] = useState<TabId>("feed");
  const [toast, setToast] = useState<string | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  function handleLogged(pts: number, co2: number) {
    setToast(`+${pts} pts · ${co2.toFixed(1)} kg CO₂`);
    setTimeout(() => setToast(null), 3000);
  }

  const S = {
    wrapper: { minHeight: "100dvh", background: "var(--bg)", display: "flex", justifyContent: "center", transition: "background-color 0.3s" } as React.CSSProperties,
    frame: { width: "100%", maxWidth: 430, position: "relative" as const, display: "flex", flexDirection: "column" as const, minHeight: "100dvh" } as React.CSSProperties,
    main: { flex: 1, overflowY: "auto" as const, paddingBottom: 88 } as React.CSSProperties,
    nav: { position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, zIndex: 50, background: "var(--glass)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid var(--border)" } as React.CSSProperties,
    toast: { position: "fixed" as const, top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 200, background: "var(--accent)", color: "#fff", padding: "12px 20px", borderRadius: 14, fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(13,148,136,0.25)", whiteSpace: "nowrap" as const } as React.CSSProperties,
  };

  return (
    <div style={S.wrapper}>
      <div style={S.frame}>
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={S.toast}>
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        <main style={S.main} className="no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
              {tab === "feed" && <FeedTab onOpenLog={() => setTab("log")} />}
              {tab === "log" && <LogTab onLogged={handleLogged} />}
              {tab === "leaderboard" && <LeaderboardTab />}
              {tab === "impact" && <ImpactTab />}
              {tab === "profile" && <ProfileTab isDark={dark} onToggleDark={() => setDark(!dark)} />}
            </motion.div>
          </AnimatePresence>
        </main>

        <div style={S.nav}>
          <BottomNav active={tab} onChange={setTab} />
          <div style={{ height: "env(safe-area-inset-bottom)" }} />
        </div>
      </div>
    </div>
  );
}
