import type { Session } from '../types/session'
import { SessionCard } from '../components/SessionCard'
import { useTranslation } from 'react-i18next'

const plannedGames = [
  { titleKey: 'home.goNoGo', skillKey: 'home.responseControl' },
  { titleKey: 'home.taskSwitching', skillKey: 'home.cognitiveFlexibility' },
  { titleKey: 'home.spatialNBack', skillKey: 'home.workingMemoryUpdating' },
]

export function Home({ latest, onStartDigitSpan, onStartStroop }: { latest?: Session, onStartDigitSpan: () => void, onStartStroop: () => void }) {
  const { t } = useTranslation()
  return <main className="page home-page">
    <div className="brand-mark">EF</div>
    <p className="eyebrow">{t('home.eyebrow')}</p>
    <h1>{t('home.title').split('\n').map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h1>
    <p className="intro">{t('home.intro')}</p>
    <section className="game-library" aria-labelledby="game-library-title">
      <div className="section-heading"><div><p className="eyebrow">{t('home.library')}</p><h2 id="game-library-title">{t('home.chooseGame')}</h2></div><span>{t('home.gameCount', { count: 5 })}</span></div>
      <button className="game-option available" onClick={onStartDigitSpan}><span className="game-symbol">↶</span><span><strong>{t('games.digitSpan.title')}</strong><small>{t('home.workingMemory')} · {t('home.available')}</small></span><span className="game-arrow">›</span></button>
      <button className="game-option prototype" onClick={onStartStroop}><span className="game-symbol">A</span><span><strong>{t('games.stroop.title')}</strong><small>{t('home.inhibitionControl')} · {t('home.prototype')}</small></span><span className="game-arrow">›</span></button>
      <div className="planned-games">{plannedGames.map((game) => <div className="game-option planned" key={game.titleKey}><span className="game-symbol">·</span><span><strong>{t(game.titleKey)}</strong><small>{t(game.skillKey)} · {t('home.planned')}</small></span></div>)}</div>
    </section>
    <section className="recent-section">
      {latest ? <SessionCard session={latest} recent /> : <div className="empty-card"><strong>{t('home.noSessions')}</strong><span>{t('home.firstResult')}</span></div>}
    </section>
    <p className="disclaimer">{t('home.disclaimer')}</p>
  </main>
}
