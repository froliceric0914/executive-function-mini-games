import type { Session } from '../types/session'
import { SessionCard } from '../components/SessionCard'

const plannedGames = [
  { title: 'Go/No-Go', skill: 'Response control' },
  { title: 'Task Switching', skill: 'Cognitive flexibility' },
  { title: 'Spatial N-back', skill: 'Working-memory updating' },
]

export function Home({ latest, onStartDigitSpan, onStartStroop }: { latest?: Session, onStartDigitSpan: () => void, onStartStroop: () => void }) {
  return <main className="page home-page">
    <div className="brand-mark">EF</div>
    <p className="eyebrow">Daily cognitive practice</p>
    <h1>Executive Function<br />Mini Games</h1>
    <p className="intro">Short, focused exercises for personal training and performance tracking.</p>
    <section className="game-library" aria-labelledby="game-library-title">
      <div className="section-heading"><div><p className="eyebrow">Training library</p><h2 id="game-library-title">Choose a mini game</h2></div><span>5 games</span></div>
      <button className="game-option available" onClick={onStartDigitSpan}><span className="game-symbol">↶</span><span><strong>Backward Digit Span</strong><small>Working memory · Available</small></span><span className="game-arrow">›</span></button>
      <button className="game-option prototype" onClick={onStartStroop}><span className="game-symbol">A</span><span><strong>Color–Word Focus</strong><small>Inhibition control · Prototype</small></span><span className="game-arrow">›</span></button>
      <div className="planned-games">{plannedGames.map((game) => <div className="game-option planned" key={game.title}><span className="game-symbol">·</span><span><strong>{game.title}</strong><small>{game.skill} · Planned</small></span></div>)}</div>
    </section>
    <section className="recent-section">
      {latest ? <SessionCard session={latest} recent /> : <div className="empty-card"><strong>No sessions yet</strong><span>Your first result will appear here.</span></div>}
    </section>
    <p className="disclaimer">For personal training only. Not a medical diagnosis.</p>
  </main>
}
