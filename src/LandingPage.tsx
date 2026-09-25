import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Check,
} from 'lucide-react'
import LiquidLogo from './components/LiquidLogo'
import ParticleWordmark from './components/ParticleLogo'
import { DotNumber } from './components/DotNumber'
import './landing.css'

const questions = [
  ['what is rippl?', 'rippl is a modern climate habit platform that turns everyday sustainable actions into verified environmental impact. log actions, prove them with ai photo verification, and build a measurable personal and community impact record.'],
  ['how does the ai photo verification work?', 'when you log an action, such as taking the dubai metro or eating a plant-based meal, you capture a photo. our vision ai validates the authenticity of the action in seconds, calculates carbon and water savings, and credits your account.'],
  ['are the impact calculations scientifically calibrated?', 'yes. all carbon and water savings are calibrated against the ghg protocol standards, dewa local utility emission factors, and peer-reviewed life cycle assessments for consumer transit and nutrition.'],
  ['what can i do with my earned points?', 'earned impact points can be redeemed for discounts at curated uae sustainable partners, zero-waste grocers, and eco-cafes, or used to sponsor verified mangrove planting across uae coastal reserves.'],
  ['can i explore the platform before creating an account?', 'yes. you can explore the community feed, leaderboards, and impact stats immediately. sign in with google whenever you are ready to log your first verified action.'],
]

export default function LandingPage() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const pageRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.documentElement.classList.add('landing-page-active')
    document.body.classList.add('landing-page-active')
    return () => {
      document.documentElement.classList.remove('landing-page-active')
      document.body.classList.remove('landing-page-active')
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    })

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const closeOnOutside = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  useEffect(() => {
    const page = pageRef.current
    if (!page || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const items = page.querySelectorAll('.landing-section-header, .step-card, .features-grid > *, .pricing-card, .footer-top, .footer-signature')
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.08 })
    items.forEach((item, i) => {
      item.classList.add('landing-reveal')
        ; (item as HTMLElement).style.setProperty('--reveal-delay', `${(i % 3) * 75}ms`)
      observer.observe(item)
    })
    return () => {
      observer.disconnect()
      items.forEach(item => item.classList.remove('landing-reveal', 'is-revealed'))
    }
  }, [])

  return (
    <main className="rippl-landing" ref={pageRef}>
      <a className="landing-skip" href="#how-it-works">skip to content</a>

      <div className="landing-nav-wrapper">
        <header ref={navRef} className={`reference-nav ${menuOpen ? 'is-open' : ''}`}>
          <div className="reference-nav-top">
            <a className="contrast-logo" href="/" aria-label="rippl home">
              <span className="rippl-brand-mark" aria-hidden="true" />
            </a>
            <button ref={menuButtonRef} type="button" className="reference-menu-toggle" aria-label={menuOpen ? 'close navigation' : 'open navigation'} aria-expanded={menuOpen} aria-controls="landing-menu" onClick={() => setMenuOpen(value => !value)}>
              <Plus size={38} strokeWidth={1.5} />
            </button>
          </div>
          <div className="reference-menu" id="landing-menu" inert={!menuOpen}>
            <nav aria-label="main navigation" onClick={() => setMenuOpen(false)}>
              <div><h2>product</h2><a href="#features">features</a><a href="/app/terms">terms</a><a href="/app/privacy">privacy policy</a></div>
              <div><h2>developer</h2><a href="https://rusetiq.github.io/" target="_blank" rel="noreferrer">portfolio</a><a href="https://www.linkedin.com/in/rusetiq/" target="_blank" rel="noreferrer">linkedin</a><a href="https://instagram.com/rusetiq/" target="_blank" rel="noreferrer">instagram</a></div>
            </nav>
          </div>
        </header>
      </div>

      <section className="landing-hero">
        <div className="hero-copy">
          <h1>
            <span className="hero-title-lead">good habits.</span><br />
            <span className="hero-title-second">
              <span>big</span>
              <span className="hero-title-gradient">ripples.</span>
            </span>
          </h1>

          <p className="hero-description">
            a calmer, more rewarding way to turn everyday sustainability choices into real environmental impact. log actions, prove them with ai photo verification, and watch your ripple compound.
          </p>

          <div className="hero-actions">
            <a href="/app" className="landing-btn-white">
              <span>start your ripple</span>
              <ArrowUpRight size={17} />
            </a>
            <a href="#how-it-works" className="landing-btn-secondary">
              <span>see how it works</span>
              <ArrowRight size={15} />
            </a>
          </div>

          <div className="hero-stats-strip">
            <div className="hero-stat-card aurora-card">
              <div className="flex items-baseline gap-1.5">
                <DotNumber value="12.4k" />
                <span className="hero-stat-unit">kg</span>
              </div>
              <p className="hero-stat-label">co₂ offset</p>
            </div>

            <div className="hero-stat-card sapphire-card">
              <div className="flex items-baseline gap-1.5">
                <DotNumber value="38.2k" />
                <span className="hero-stat-unit">l</span>
              </div>
              <p className="hero-stat-label">water saved</p>
            </div>

            <div className="hero-stat-card solar-card">
              <div className="flex items-baseline gap-1.5">
                <DotNumber value="84%" />
                <span className="hero-stat-unit">rate</span>
              </div>
              <p className="hero-stat-label">verified habits</p>
            </div>
          </div>
        </div>

        <div className="hero-art">
          <LiquidLogo />
        </div>
      </section>

      <div className="belief-strip">
        <p>
          one conscious choice.<br />
          <strong>a measurable difference across the emirates.</strong>
        </p>
        <span>
          for you. for your city.<br />
          for future generations.
        </span>
        <a href="#how-it-works" aria-label="discover how rippl works">
          <ArrowRight size={22} />
        </a>
      </div>

      <section id="how-it-works" className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-title">less friction. more tangible impact.</h2>
          <p className="landing-subtitle">
            no complex carbon calculators or tedious forms. just quick photo verification that connects directly to certified environmental metrics.
          </p>
        </div>

        <div className="steps-grid">
          <article className="step-card">
            <div>
              <div className="step-num-card aurora-card">
                <DotNumber value="01" />
              </div>
              <h3>choose your action</h3>
              <p>pick from curated everyday choices: take the dubai metro, choose a plant-based lunch, refill a water canister, or conserve energy at home.</p>
            </div>
          </article>

          <article className="step-card">
            <div>
              <div className="step-num-card solar-card">
                <DotNumber value="02" />
              </div>
              <h3>snap photo proof</h3>
              <p>capture real photographic evidence. our multimodal ai instantly validates your action, calculates carbon & water savings, and credits your streak.</p>
            </div>
          </article>

          <article className="step-card">
            <div>
              <div className="step-num-card sapphire-card">
                <DotNumber value="03" />
              </div>
              <h3>build your ripple</h3>
              <p>convert your earned impact points into uae eco-brand vouchers, tree planting contributions, and climb corporate and regional leaderboards.</p>
            </div>
          </article>
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-title">every feature designed with intention.</h2>
          <p className="landing-subtitle">
            drawing inspiration from calm mineral aesthetics and radiant energy cards, rippl makes climate action feel inspiring, elegant, and habit-forming.
          </p>
        </div>

        <div className="features-grid">
          <div className="expressive-card aurora-card">
            <h3 className="text-[24px] font-normal tracking-tight mb-3">precision carbon & water accounting</h3>
            <p className="text-[14px] leading-relaxed opacity-90">
              every habit is calibrated against verified ghg protocol and uae dewa benchmarks, transforming daily routines into audit-ready metrics.
            </p>
          </div>

          <div className="expressive-card solar-card">
            <h3 className="text-[24px] font-normal tracking-tight mb-3">multimodal ai photo verification</h3>
            <p className="text-[14px] leading-relaxed opacity-90">
              no honour system guesswork. real computer vision inspects receipts, metro cards, and meals to ensure authentic community integrity.
            </p>
          </div>

          <div className="expressive-card sapphire-card">
            <h3 className="text-[24px] font-normal tracking-tight mb-3">live leaderboards & corporate leagues</h3>
            <p className="text-[14px] leading-relaxed opacity-90">
              compete alongside friends, departments, and leading uae organizations in real-time eco streaks and weekly impact milestones.
            </p>
          </div>

          <div className="expressive-card forest-card">
            <h3 className="text-[24px] font-normal tracking-tight mb-3">rewards, perks & mangrove planting</h3>
            <p className="text-[14px] leading-relaxed opacity-90">
              turn earned impact points into discounts at sustainable cafes, zero-waste grocers, or plant certified mangroves in uae coastal reserves.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-title">simple, transparent aed pricing.</h2>
          <p className="landing-subtitle">
            start completely free, or unlock premium certified esg reporting, priority ai verification, and direct monthly carbon offsetting.
          </p>
        </div>

        <div className="pricing-grid">
          <div className="expressive-card twilight-card pricing-card">
            <div>
              <h3 className="pricing-plan-title">free tier</h3>
              <p className="pricing-plan-desc">for individual citizens building daily green routines across the emirates.</p>

              <div className="pricing-price-row">
                <span className="pricing-number">
                  <DotNumber value="0" />
                </span>
                <span className="pricing-price-currency">aed</span>
                <span className="pricing-price-period">/ forever</span>
              </div>

              <div className="pricing-features-list">
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>unlimited eco action logging</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>ai photo proof verification</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>community leaderboard access</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>uae eco partner vouchers</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>personal impact dashboard</span>
                </div>
              </div>
            </div>

            <a href="/app" className="pricing-btn-white">
              <span>get started free</span>
              <ArrowRight size={14} />
            </a>
          </div>

          <div className="expressive-card aurora-card pricing-card">
            <div>
              <h3 className="pricing-plan-title">rippl supporter</h3>
              <p className="pricing-plan-desc">direct monthly carbon offsetting, verified partner perks, and certified personal esg reporting.</p>

              <div className="pricing-price-row">
                <span className="pricing-number">
                  <DotNumber value="20" />
                </span>
                <span className="pricing-price-currency">aed</span>
                <span className="pricing-price-period">/ month</span>
              </div>

              <div className="pricing-features-list">
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>monthly certified carbon offset credit</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>unlimited priority ai verifications</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>certified personal esg reporting</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>100% ad-free platform experience</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>exclusive premium partner rewards</span>
                </div>
              </div>
            </div>

            <a href="/app" className="pricing-btn-white">
              <span>subscribe for 20 aed</span>
              <ArrowRight size={14} />
            </a>
          </div>

          <div className="expressive-card sapphire-card pricing-card">
            <div>
              <h3 className="pricing-plan-title">corporate & teams</h3>
              <p className="pricing-plan-desc">turn company culture into measurable scope 3 emissions reduction with audit-ready proof.</p>

              <div className="pricing-price-row">
                <span className="pricing-number">
                  <DotNumber value="45" />
                </span>
                <span className="pricing-price-currency">aed</span>
                <span className="pricing-price-period">/ seat / month</span>
              </div>

              <div className="pricing-features-list">
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>company-wide scope 3 commute tracking</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>department challenges & leaderboards</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>ghg protocol & tcfd audit reports</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>single sign-on & hris integration</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>dedicated sustainability account lead</span>
                </div>
              </div>
            </div>

            <a href="/app" className="pricing-btn-white">
              <span>explore corporate</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      <section id="questions" className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-title">a few good questions.</h2>
          <p className="landing-subtitle">everything you need to know about tracking, verification, and community impact.</p>
        </div>

        <div className="faq-list">
          {questions.map(([question, answer], i) => (
            <article key={question} className={`faq-card ${openQuestion === i ? 'is-open' : ''}`}>
              <h3>
                <button
                  type="button"
                  id={`faq-trigger-${i}`}
                  className="faq-trigger"
                  aria-expanded={openQuestion === i}
                  aria-controls={`faq-answer-${i}`}
                  onClick={() => setOpenQuestion(openQuestion === i ? null : i)}
                >
                  <span>{question}</span>
                  <span className="faq-icon-wrap" aria-hidden="true">
                    <Plus size={18} className="faq-plus-icon" />
                  </span>
                </button>
              </h3>
              <div
                id={`faq-answer-${i}`}
                className="faq-answer-wrapper"
                role="region"
                aria-labelledby={`faq-trigger-${i}`}
              >
                <div className="faq-answer-inner">
                  <p>{answer}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="landing-footer fancy-footer">
        <div className="footer-glow" aria-hidden="true" />
        <ParticleWordmark />
      </footer>
    </main>
  )
}
