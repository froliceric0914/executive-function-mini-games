import type { Session } from '../types/session'
import { SessionCard } from '../components/SessionCard'

export function Home({ latest, onStart }: { latest?: Session, onStart: () => void }) {
  return <main className="page home-page">
    <div className="brand-mark">EF</div>
    <p className="eyebrow">Daily cognitive practice</p>
    <h1>Executive Function<br />Mini Games</h1>
    <p className="intro">Short, focused exercises for personal training and performance tracking.</p>
    <button className="primary-button" onClick={onStart}>Start Training</button>
    <section className="recent-section">
      {latest ? <SessionCard session={latest} recent /> : <div className="empty-card"><strong>No sessions yet</strong><span>Your first result will appear here.</span></div>}
    </section>
    <p className="disclaimer">For personal training only. Not a medical diagnosis.</p>
  </main>
}
