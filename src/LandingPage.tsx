import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, Camera, Globe2, Leaf, ScanLine, Waves, Zap } from 'lucide-react'
import { useApp } from './App'

const ease = [0.25, 0.46, 0.45, 0.94] as const

const panels = [
  {
    tone: 'light',
    icon: Leaf,
    label: 'Sustainable action',
    title: 'Log what already happened.',
    text: 'Metro rides, refill habits, lower-waste meals, solar choices, and small daily wins become a verified impact record.',
  },
  {
    tone: 'dark',
    icon: Camera,
    label: 'AI proof check',
    title: 'Snap. Verify. Score.',
    text: 'Photo proof keeps the leaderboard honest without turning sustainability into paperwork.',
  },
  {
    tone: 'light',
    icon: Globe2,
    label: 'UAE momentum',
    title: 'Compete locally.',
    text: 'Ranks, streaks, badges, and rewards turn private habits into visible community progress.',
  },
]

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export function LandingPage() {
  const { signInWithGoogle } = useApp()

  return (
    <div className="landing-shell h-full w-full overflow-y-auto overflow-x-hidden bg-[#050807] text-[#f4f7ed]">
      <main className="landing-hero relative min-h-screen px-5 pb-10 pt-5 sm:px-8 lg:px-10">
        <motion.nav
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="landing-nav mx-auto flex w-full max-w-[1500px] items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#b7ff3c] text-[#07110d]">
              <Waves size={18} strokeWidth={2.2} />
            </span>
            <span className="font-body text-[22px] font-black tracking-[-0.04em]">RIPPL</span>
          </div>
          <div className="hidden items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] md:flex">
            <Leaf size={16} strokeWidth={1.8} />
            Made for verified impact
          </div>
          <button
            onClick={signInWithGoogle}
            className="rounded-full bg-[#f4f7ed] px-5 py-3 font-body text-[12px] font-black uppercase tracking-[0.08em] text-[#07110d] transition-transform active:scale-95 sm:px-7"
          >
            Get started
          </button>
        </motion.nav>

        <section className="relative z-10 mx-auto flex min-h-[calc(100vh-108px)] w-full max-w-[1500px] flex-col justify-between pb-28 pt-10 md:pb-32 md:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
          >
            <div className="mb-8 h-[6px] w-[118px] bg-[#b7ff3c]" />
            <h1 className="landing-title font-body font-black uppercase">
              <span>Sustainable</span>
              <span>Impact</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="landing-ticker mt-8"
            aria-hidden="true"
          >
            <div className="landing-ticker-track">
              {Array.from({ length: 2 }).map((_, group) => (
                <div className="landing-ticker-group" key={group}>
                  <span>Verified logs</span>
                  <i />
                  <span>Climate action</span>
                  <i />
                  <span>UAE leaderboard</span>
                  <i />
                  <span>Real rewards</span>
                  <i />
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mt-12 grid gap-8 md:grid-cols-[minmax(280px,500px)_1fr] md:items-end">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease }}
            >
              <p className="max-w-[500px] font-body text-[26px] font-medium leading-[1.05] tracking-[-0.04em] sm:text-[34px]">
                Turn everyday climate choices into proof people can see.
              </p>
              <p className="mt-6 max-w-[430px] font-body text-[15px] leading-relaxed text-[#b9c5b5] sm:text-[18px]">
                Rippl verifies sustainable actions with photo proof, then turns them into points, badges, streaks, and UAE leaderboards.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.34, ease }}
              className="flex flex-col items-start gap-5 md:items-end"
            >
              <button
                onClick={signInWithGoogle}
                className="landing-cta group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#b7ff3c] px-7 py-4 font-body text-[14px] font-black uppercase tracking-[0.08em] text-[#07110d] sm:w-auto"
              >
                <GoogleGlyph />
                Continue with Google
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
              <div className="hidden items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[#b9c5b5] md:flex">
                <ArrowDown size={24} />
                Discover more
              </div>
            </motion.div>
          </div>
        </section>
        <div className="landing-slant" aria-hidden="true" />
      </main>

      <section className="landing-panel-zone px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-[1500px] gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease }}
            className="landing-card landing-card-light"
          >
            <span className="landing-card-icon"><Zap size={25} /></span>
            <h2>Impact without the spreadsheet.</h2>
            <p>Clear points, simple proof, visible progress. The product stays useful after the first login.</p>
            <div className="mt-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#07110d]/55">
              <span className="h-2 w-2 rounded-full bg-[#2dde68]" />
              Net zero habits
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, delay: 0.08, ease }}
            className="landing-card landing-card-light landing-wide-card"
          >
            <ScanLine size={70} strokeWidth={1.1} className="mb-5 text-[#b7ff3c]" />
            <p className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#07110d]/45">Capabilities</p>
            <h2>See sustainable behavior differently.</h2>
            <p>AI-assisted photo checks confirm the action type before points hit the account.</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {['Metro', 'Refill', 'Energy', 'Waste', 'Food'].map((item) => (
                <span key={item} className="rounded-full bg-[#07110d]/7 px-4 py-2 font-body text-[13px] font-bold text-[#07110d]/65">{item}</span>
              ))}
            </div>
          </motion.article>
        </div>

        <div className="mx-auto mt-6 grid max-w-[1500px] gap-6 lg:grid-cols-3">
          {panels.map((panel, i) => {
            const Icon = panel.icon
            return (
              <motion.article
                key={panel.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: i * 0.06, ease }}
                className={`landing-card ${panel.tone === 'dark' ? 'landing-card-dark' : 'landing-card-light'}`}
              >
                <span className="landing-card-icon"><Icon size={25} /></span>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] opacity-55">{panel.label}</p>
                <h2>{panel.title}</h2>
                <p>{panel.text}</p>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8 lg:px-10">
        <div className="landing-final mx-auto max-w-[1500px]">
          <h2>Ready to make it count?</h2>
          <button
            onClick={signInWithGoogle}
            className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#b7ff3c] px-7 py-4 font-body text-[14px] font-black uppercase tracking-[0.08em] text-[#07110d] sm:w-auto"
          >
            <GoogleGlyph />
            Continue with Google
          </button>
        </div>
        
        <div className="mx-auto max-w-[1500px] mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="font-body text-[14px] font-bold uppercase tracking-widest text-[#b7ff3c]">Product</h4>
            <ul className="space-y-2 font-mono text-[11px] uppercase tracking-wider text-[#b9c5b5]">
              <li><button className="hover:text-white transition-colors">Premium Plan</button></li>
              <li><button className="hover:text-white transition-colors">Rewards Shop</button></li>
              <li><button className="hover:text-white transition-colors">Leaderboard</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-body text-[14px] font-bold uppercase tracking-widest text-[#b7ff3c]">Enterprise</h4>
            <ul className="space-y-2 font-mono text-[11px] uppercase tracking-wider text-[#b9c5b5]">
              <li><button className="hover:text-white transition-colors">ESG Dashboard</button></li>
              <li><button className="hover:text-white transition-colors">Brand Partners</button></li>
              <li><button className="hover:text-white transition-colors">Verification API</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-body text-[14px] font-bold uppercase tracking-widest text-[#b7ff3c]">Policy</h4>
            <ul className="space-y-2 font-mono text-[11px] uppercase tracking-wider text-[#b9c5b5]">
              <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-body text-[14px] font-bold uppercase tracking-widest text-[#b7ff3c]">Connect</h4>
            <ul className="space-y-2 font-mono text-[11px] uppercase tracking-wider text-[#b9c5b5]">
              <li><button className="hover:text-white transition-colors">Instagram</button></li>
              <li><button className="hover:text-white transition-colors">Twitter</button></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
