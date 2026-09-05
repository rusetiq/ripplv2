import { ArrowUpRight, ArrowRight, Plus, Minus, Menu } from 'lucide-react'
import { useState } from 'react'
import LiquidLogo from './components/LiquidLogo'
import './landing.css'

const questions = [
  ['What is Rippl?', 'Rippl helps you turn everyday sustainable choices into a personal impact record. Log actions, verify them with a photo, and follow your progress alongside a community doing the same.'],
  ['How do I track an action?', 'Open the app, choose an action, and add your photo evidence. Once verified, the action contributes to your points and estimated carbon and water savings.'],
  ['Do small actions really make a difference?', 'Taking public transport, reusing what you have, or choosing a plant-based meal can reduce your footprint. Rippl helps you see how those repeated choices add up over time.'],
  ['Can I explore before signing up?', 'Yes. You can browse the community first. Sign in with Google when you’re ready to log actions and keep your own impact record.'],
]
export default function LandingPage() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)
  return <main className="rippl-landing">
    <a className="landing-skip" href="#how-it-works">Skip to content</a>
    <header className="landing-nav">
      <a className="wordmark" href="/" aria-label="Rippl home"><span className="rippl-brand-mark" aria-hidden="true"/>rippl</a>
      <nav aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#the-ripple-effect">The ripple effect</a><a href="#questions">FAQs</a></nav>
      <details className="mobile-navigation"><summary aria-label="Navigation menu"><Menu size={20}/></summary><nav aria-label="Mobile navigation"><a href="#how-it-works" onClick={event => event.currentTarget.closest('details')?.removeAttribute('open')}>How it works</a><a href="#the-ripple-effect" onClick={event => event.currentTarget.closest('details')?.removeAttribute('open')}>The ripple effect</a><a href="#questions" onClick={event => event.currentTarget.closest('details')?.removeAttribute('open')}>FAQs</a></nav></details>
      <a className="nav-app" href="/app">Open app <ArrowUpRight size={17}/></a>
    </header>
    <section className="landing-hero">
      <div className="hero-copy">
        <h1>Good habits.<br/><span>Big ripples.</span></h1>
        <p className="hero-description">A better world starts with what you do today.<br className="desktop-break"/> Track your actions. See your impact. Keep it going.</p>
        <a href="/app" className="landing-cta">Start your ripple <ArrowUpRight size={21}/></a>
      </div>
      <div className="hero-art"><LiquidLogo/></div>
    </section>
    <div className="belief-strip"><p>One better choice.<br/><strong>A world of possibility.</strong></p><span>For you. For everyone.<br/>For the planet.</span><a href="#how-it-works" aria-label="Discover how Rippl works"><ArrowRight size={25}/></a></div>
    <section id="how-it-works" className="how-section">
      <div className="section-intro"><h2>Less overthinking.<br/>More doing.</h2><p>You don’t have to change everything.<br/>Just start with one thing.</p></div>
      <div className="steps">
        <article><span className="step-number">01</span><div><h3>Make a small move.</h3><p>Take the train. Refill your bottle. Go plant-based.<br/>Choose an action that fits your day.</p></div></article>
        <article><span className="step-number">02</span><div><h3>Make it count.</h3><p>Log it with a photo. Build a record of your<br/>carbon and water savings, one action at a time.</p></div></article>
        <article><span className="step-number">03</span><div><h3>Keep the ripple going.</h3><p>Build your streak, earn points, and find<br/>a community moving in the same direction.</p></div></article>
      </div>
    </section>
    <section id="the-ripple-effect" className="ripple-section"><div className="ripple-visual" aria-hidden="true"><div/><div/><div/><div/><span>you</span></div><div className="ripple-copy"><h2>It starts with you.<br/>It doesn’t end there.</h2><p>That bike ride. That reusable cup. That one choice you almost didn’t make. Together, small actions become something bigger.</p><p>Rippl makes your progress visible, so doing good feels as good as it should.</p><a href="/app" className="text-link">Find your community <ArrowUpRight size={19}/></a></div></section>
    <section id="questions" className="faq-section"><h2>A few good<br/>questions.</h2><div className="faq-list">{questions.map(([question, answer], i) => <article key={question}><h3><button aria-expanded={openQuestion === i} aria-controls={`answer-${i}`} onClick={() => setOpenQuestion(openQuestion === i ? null : i)}>{question}{openQuestion === i ? <Minus size={18}/> : <Plus size={18}/>}</button></h3><div id={`answer-${i}`} hidden={openQuestion !== i}><p>{answer}</p></div></article>)}</div></section>
    <footer className="landing-footer"><a className="wordmark" href="/"><span className="rippl-brand-mark" aria-hidden="true"/>rippl</a><p>Good for you. Better for the planet.</p><span>© {new Date().getFullYear()} Rippl</span><a href="/app">Open app <ArrowUpRight size={16}/></a></footer>
  </main>
}
