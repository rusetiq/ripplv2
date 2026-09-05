import { useState } from 'react'
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Minus,
  Menu,
  Sparkles,
  Check,
  Crown,
  Building2,
  Camera,
  Globe,
  Award,
  Leaf,
  ShieldCheck,
} from 'lucide-react'
import LiquidLogo from './components/LiquidLogo'
import { DotNumber } from './components/DotNumber'
import './landing.css'

const questions = [
  ['What is Rippl?', 'Rippl is a modern climate habit platform that turns everyday sustainable actions into verified environmental impact. Log actions, prove them with AI photo verification, and build a measurable personal and community impact record.'],
  ['How does the AI photo verification work?', 'When you log an action, such as taking the Dubai Metro or eating a plant-based meal, you capture a photo. Our vision AI validates the authenticity of the action in seconds, calculates carbon and water savings, and credits your account.'],
  ['Are the impact calculations scientifically calibrated?', 'Yes. All carbon and water savings are calibrated against the GHG Protocol standards, DEWA local utility emission factors, and peer-reviewed life cycle assessments for consumer transit and nutrition.'],
  ['What can I do with my earned points?', 'Earned impact points can be redeemed for discounts at curated UAE sustainable partners, zero-waste grocers, and eco-cafes, or used to sponsor verified mangrove planting across UAE coastal reserves.'],
  ['Can I explore the platform before creating an account?', 'Yes. You can explore the community feed, leaderboards, and impact stats immediately. Sign in with Google whenever you are ready to log your first verified action.'],
]

export default function LandingPage() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)

  return (
    <main className="rippl-landing">
      <a className="landing-skip" href="#how-it-works">Skip to content</a>

      <div className="landing-nav-wrapper">
        <header className="landing-nav">
          <a className="wordmark" href="/" aria-label="Rippl home">
            <span className="rippl-brand-mark" aria-hidden="true" />
            rippl
          </a>

          <nav aria-label="Main navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#community-proof">Community proof</a>
            <a href="#pricing">Pricing</a>
            <a href="#questions">FAQs</a>
          </nav>

          <div className="flex items-center gap-3">
            <a className="nav-app-btn" href="/app">
              <span>Open app</span>
              <ArrowUpRight size={15} />
            </a>

            <details className="mobile-navigation">
              <summary aria-label="Navigation menu">
                <Menu size={20} />
              </summary>
              <nav aria-label="Mobile navigation">
                <a href="#how-it-works" onClick={e => e.currentTarget.closest('details')?.removeAttribute('open')}>How it works</a>
                <a href="#features" onClick={e => e.currentTarget.closest('details')?.removeAttribute('open')}>Features</a>
                <a href="#community-proof" onClick={e => e.currentTarget.closest('details')?.removeAttribute('open')}>Community proof</a>
                <a href="#pricing" onClick={e => e.currentTarget.closest('details')?.removeAttribute('open')}>Pricing</a>
                <a href="#questions" onClick={e => e.currentTarget.closest('details')?.removeAttribute('open')}>FAQs</a>
                <a href="/app" className="font-semibold text-blue-600">Open app</a>
              </nav>
            </details>
          </div>
        </header>
      </div>

      <section className="landing-hero">
        <div className="hero-copy">
          <div className="landing-badge">
            <Sparkles size={13} />
            <span>UAE Verified Climate Community</span>
          </div>

          <h1>
            Good habits.<br />
            <span>Big ripples.</span>
          </h1>

          <p className="hero-description">
            A calmer, more rewarding way to turn everyday sustainability choices into real environmental impact. Log actions, prove them with AI photo verification, and watch your ripple compound.
          </p>

          <div className="hero-actions">
            <a href="/app" className="landing-btn-white">
              <span>Start your ripple</span>
              <ArrowUpRight size={17} />
            </a>
            <a href="#how-it-works" className="landing-btn-secondary">
              <span>See how it works</span>
              <ArrowRight size={15} />
            </a>
          </div>

          <div className="hero-stats-strip">
            <div className="hero-stat-card aurora-card">
              <div className="flex items-baseline gap-1.5">
                <DotNumber value="12.4k" />
                <span className="hero-stat-unit">kg</span>
              </div>
              <p className="hero-stat-label">CO₂ offset</p>
            </div>

            <div className="hero-stat-card sapphire-card">
              <div className="flex items-baseline gap-1.5">
                <DotNumber value="38.2k" />
                <span className="hero-stat-unit">L</span>
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
          One conscious choice.<br />
          <strong>A measurable difference across the Emirates.</strong>
        </p>
        <span>
          For you. For your city.<br />
          For future generations.
        </span>
        <a href="#how-it-works" aria-label="Discover how Rippl works">
          <ArrowRight size={22} />
        </a>
      </div>

      <section id="how-it-works" className="landing-section">
        <div className="landing-section-header">
          <span className="landing-tag">step-by-step workflow</span>
          <h2 className="landing-title">Less friction. More tangible impact.</h2>
          <p className="landing-subtitle">
            No complex carbon calculators or tedious forms. Just quick photo verification that connects directly to certified environmental metrics.
          </p>
        </div>

        <div className="steps-grid">
          <article className="step-card">
            <div>
              <div className="step-num-card aurora-card">
                <DotNumber value="01" />
              </div>
              <h3>Choose your action</h3>
              <p>Pick from curated everyday choices: take the Dubai Metro, choose a plant-based lunch, refill a water canister, or conserve energy at home.</p>
            </div>
          </article>

          <article className="step-card">
            <div>
              <div className="step-num-card solar-card">
                <DotNumber value="02" />
              </div>
              <h3>Snap photo proof</h3>
              <p>Capture real photographic evidence. Our multimodal AI instantly validates your action, calculates carbon & water savings, and credits your streak.</p>
            </div>
          </article>

          <article className="step-card">
            <div>
              <div className="step-num-card sapphire-card">
                <DotNumber value="03" />
              </div>
              <h3>Build your ripple</h3>
              <p>Convert your earned impact points into UAE eco-brand vouchers, tree planting contributions, and climb corporate and regional leaderboards.</p>
            </div>
          </article>
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="landing-section-header">
          <span className="landing-tag">built for modern changemakers</span>
          <h2 className="landing-title">Every feature designed with intention.</h2>
          <p className="landing-subtitle">
            Drawing inspiration from calm mineral aesthetics and radiant energy cards, Rippl makes climate action feel inspiring, elegant, and habit-forming.
          </p>
        </div>

        <div className="features-grid">
          <div className="expressive-card aurora-card">
            <div className="feature-top">
              <div className="feature-icon-box">
                <Globe size={22} color="#ffffff" />
              </div>
              <span className="pricing-badge">emissions intelligence</span>
            </div>
            <div className="feature-number-pill">
              <DotNumber value="1.8k" />
              <span className="feature-hero-unit">kg CO₂ avg / citizen</span>
            </div>
            <h3 className="text-[22px] font-medium tracking-tight mb-2">Precision carbon & water accounting</h3>
            <p className="text-[13px] leading-relaxed opacity-90">
              Every habit is calibrated against verified GHG Protocol and UAE DEWA benchmarks, transforming daily routines into audit-ready metrics.
            </p>
          </div>

          <div className="expressive-card solar-card">
            <div className="feature-top">
              <div className="feature-icon-box">
                <Camera size={22} color="#ffffff" />
              </div>
              <span className="pricing-badge">vision intelligence</span>
            </div>
            <div className="feature-number-pill">
              <DotNumber value="99.2%" />
              <span className="feature-hero-unit">verification accuracy</span>
            </div>
            <h3 className="text-[22px] font-medium tracking-tight mb-2">Multimodal AI photo verification</h3>
            <p className="text-[13px] leading-relaxed opacity-90">
              No honour system guesswork. Real computer vision inspects receipts, metro cards, and meals to ensure authentic community integrity.
            </p>
          </div>

          <div className="expressive-card sapphire-card">
            <div className="feature-top">
              <div className="feature-icon-box">
                <Award size={22} color="#ffffff" />
              </div>
              <span className="pricing-badge">community momentum</span>
            </div>
            <div className="feature-number-pill">
              <DotNumber value="500+" />
              <span className="feature-hero-unit">pts per challenge</span>
            </div>
            <h3 className="text-[22px] font-medium tracking-tight mb-2">Live leaderboards & corporate leagues</h3>
            <p className="text-[13px] leading-relaxed opacity-90">
              Compete alongside friends, departments, and leading UAE organizations in real-time eco streaks and weekly impact milestones.
            </p>
          </div>

          <div className="expressive-card forest-card">
            <div className="feature-top">
              <div className="feature-icon-box">
                <Leaf size={22} color="#ffffff" />
              </div>
              <span className="pricing-badge">tangible restoration</span>
            </div>
            <div className="feature-number-pill">
              <DotNumber value="100%" />
              <span className="feature-hero-unit">certified mangrove credits</span>
            </div>
            <h3 className="text-[22px] font-medium tracking-tight mb-2">Rewards, perks & mangrove planting</h3>
            <p className="text-[13px] leading-relaxed opacity-90">
              Turn earned impact points into discounts at sustainable cafes, zero-waste grocers, or plant certified mangroves in UAE coastal reserves.
            </p>
          </div>
        </div>
      </section>

      <section id="community-proof" className="landing-section">
        <div className="landing-section-header">
          <span className="landing-tag">genuine evidence</span>
          <h2 className="landing-title">Verified habits in the wild.</h2>
          <p className="landing-subtitle">
            See recent authentic actions verified by our community across Dubai, Abu Dhabi, and Sharjah.
          </p>
        </div>

        <div className="evidence-grid">
          <div className="evidence-card">
            <div className="evidence-img-box">
              <img src="/assets/plates/bike-evidence.png" alt="Metro transit evidence" loading="lazy" />
            </div>
            <div className="evidence-card-content">
              <div className="evidence-user-strip">
                <div className="evidence-user-strip-left">
                  <div className="evidence-avatar">R</div>
                  <span className="evidence-username">@rashid.dxb</span>
                </div>
                <span className="evidence-verified-pill">
                  <ShieldCheck size={12} />
                  <span>verified</span>
                </span>
              </div>
              <h4 className="evidence-action-title">Dubai Metro Red Line Commute</h4>
              <span className="evidence-meta-pill">-4.2 kg CO₂ saved</span>
            </div>
          </div>

          <div className="evidence-card">
            <div className="evidence-img-box">
              <img src="/assets/plates/meal-evidence.png" alt="Plant-based meal evidence" loading="lazy" />
            </div>
            <div className="evidence-card-content">
              <div className="evidence-user-strip">
                <div className="evidence-user-strip-left">
                  <div className="evidence-avatar">M</div>
                  <span className="evidence-username">@mariam_eco</span>
                </div>
                <span className="evidence-verified-pill">
                  <ShieldCheck size={12} />
                  <span>verified</span>
                </span>
              </div>
              <h4 className="evidence-action-title">Organic Mediterranean Lunch</h4>
              <span className="evidence-meta-pill">-1.8 kg CO₂ · +240L H₂O</span>
            </div>
          </div>

          <div className="evidence-card">
            <div className="evidence-img-box flex items-center justify-center p-8 bg-slate-900">
              <img src="/assets/sustainability-icons/green-transport.png" alt="Clean transit icon" className="max-h-[140px] w-auto object-contain" loading="lazy" />
            </div>
            <div className="evidence-card-content">
              <div className="evidence-user-strip">
                <div className="evidence-user-strip-left">
                  <div className="evidence-avatar">K</div>
                  <span className="evidence-username">@khalid_green</span>
                </div>
                <span className="evidence-verified-pill">
                  <ShieldCheck size={12} />
                  <span>verified</span>
                </span>
              </div>
              <h4 className="evidence-action-title">Zero-Emission E-Bike Transit</h4>
              <span className="evidence-meta-pill">-3.1 kg CO₂ saved</span>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="landing-section">
        <div className="landing-section-header">
          <span className="landing-tag">membership & tiers</span>
          <h2 className="landing-title">Simple, transparent AED pricing.</h2>
          <p className="landing-subtitle">
            Start completely free, or unlock premium certified ESG reporting, priority AI verification, and direct monthly carbon offsetting.
          </p>
        </div>

        <div className="pricing-grid">
          <div className="expressive-card twilight-card pricing-card">
            <div>
              <span className="pricing-badge">standard plan</span>
              <h3 className="pricing-plan-title">Free Tier</h3>
              <p className="pricing-plan-desc">For individual citizens building daily green routines across the Emirates.</p>

              <div className="pricing-price-row">
                <div className="pricing-number-card">
                  <DotNumber value="0" />
                </div>
                <span className="pricing-price-currency">AED</span>
                <span className="pricing-price-period">/ forever</span>
              </div>

              <div className="pricing-features-list">
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>Unlimited eco action logging</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>AI photo proof verification</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>Community leaderboard access</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>UAE eco partner vouchers</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>Personal impact dashboard</span>
                </div>
              </div>
            </div>

            <a href="/app" className="pricing-btn-white">
              <span>Get started free</span>
              <ArrowRight size={14} />
            </a>
          </div>

          <div className="expressive-card aurora-card pricing-card">
            <div>
              <div className="flex items-center justify-between">
                <span className="pricing-badge">most popular</span>
                <Crown size={18} color="#ffffff" />
              </div>
              <h3 className="pricing-plan-title">Rippl Supporter</h3>
              <p className="pricing-plan-desc">Direct monthly carbon offsetting, verified partner perks, and certified personal ESG reporting.</p>

              <div className="pricing-price-row">
                <div className="pricing-number-card">
                  <DotNumber value="20" />
                </div>
                <span className="pricing-price-currency">AED</span>
                <span className="pricing-price-period">/ month</span>
              </div>

              <div className="pricing-features-list">
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>Monthly certified carbon offset credit</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>Unlimited priority AI verifications</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>Certified personal ESG reporting</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>100% ad-free platform experience</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>Exclusive premium partner rewards</span>
                </div>
              </div>
            </div>

            <a href="/app" className="pricing-btn-white">
              <span>Subscribe for 20 AED</span>
              <ArrowRight size={14} />
            </a>
          </div>

          <div className="expressive-card sapphire-card pricing-card">
            <div>
              <div className="flex items-center justify-between">
                <span className="pricing-badge">organizations</span>
                <Building2 size={18} color="#ffffff" />
              </div>
              <h3 className="pricing-plan-title">Corporate & Teams</h3>
              <p className="pricing-plan-desc">Turn company culture into measurable Scope 3 emissions reduction with audit-ready proof.</p>

              <div className="pricing-price-row">
                <div className="pricing-number-card">
                  <DotNumber value="45" />
                </div>
                <span className="pricing-price-currency">AED</span>
                <span className="pricing-price-period">/ seat / month</span>
              </div>

              <div className="pricing-features-list">
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>Company-wide Scope 3 commute tracking</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>Department challenges & leaderboards</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>GHG Protocol & TCFD audit reports</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>Single Sign-On & HRIS integration</span>
                </div>
                <div className="pricing-feature-item">
                  <div className="pricing-feature-check"><Check size={11} strokeWidth={2.8} /></div>
                  <span>Dedicated sustainability account lead</span>
                </div>
              </div>
            </div>

            <a href="/app" className="pricing-btn-white">
              <span>Explore Corporate</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      <section id="questions" className="landing-section">
        <div className="landing-section-header">
          <span className="landing-tag">frequently asked</span>
          <h2 className="landing-title">A few good questions.</h2>
          <p className="landing-subtitle">Everything you need to know about tracking, verification, and community impact.</p>
        </div>

        <div className="faq-list">
          {questions.map(([question, answer], i) => (
            <article key={question} className="faq-card">
              <h3>
                <button
                  type="button"
                  className="faq-trigger"
                  aria-expanded={openQuestion === i}
                  aria-controls={`answer-${i}`}
                  onClick={() => setOpenQuestion(openQuestion === i ? null : i)}
                >
                  <span>{question}</span>
                  {openQuestion === i ? <Minus size={18} /> : <Plus size={18} />}
                </button>
              </h3>
              {openQuestion === i && (
                <div id={`answer-${i}`} className="faq-answer">
                  <p>{answer}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <a className="wordmark" href="/">
          <span className="rippl-brand-mark" aria-hidden="true" />
          rippl
        </a>
        <p>Good for you. Better for the planet.</p>
        <span>© {new Date().getFullYear()} Rippl Inc. UAE.</span>
        <a href="/app" className="landing-btn-secondary">
          <span>Open app</span>
          <ArrowUpRight size={15} />
        </a>
      </footer>
    </main>
  )
}
