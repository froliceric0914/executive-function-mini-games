import { useState } from 'react'
import { Home } from './pages/Home'
import { Training } from './pages/Training'
import { History } from './pages/History'
import { getSessions } from './utils/storage'
import type { Session } from './types/session'

type Page = 'home' | 'training' | 'history'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [sessions, setSessions] = useState(getSessions)
  const complete = (session: Session) => { localStorage.setItem('executive-function-mini-games:sessions', JSON.stringify([session, ...sessions])); setSessions([session, ...sessions]) }
  return <div className="app-shell">
    {page === 'home' && <Home latest={sessions[0]} onStart={() => setPage('training')} />}
    {page === 'training' && <Training onComplete={complete} />}
    {page === 'history' && <History sessions={sessions} />}
    {page !== 'training' && <nav className="bottom-nav" aria-label="Main navigation"><button className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}><span>⌂</span>Home</button><button className={page === 'history' ? 'active' : ''} onClick={() => setPage('history')}><span>◷</span>History</button></nav>}
    {page === 'training' && <button className="close-training" onClick={() => setPage('home')} aria-label="Exit training">×</button>}
  </div>
}
