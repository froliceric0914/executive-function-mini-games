import { useCallback, useEffect, useState } from 'react'
import { Home } from './pages/Home'
import { Training } from './pages/Training'
import { StroopTraining } from './pages/StroopTraining'
import { History } from './pages/History'
import { gameStorageService } from './services/gameStorageService'
import type { Session } from './types/session'

type Page = 'home' | 'digit-span' | 'stroop' | 'history'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const loadSessions = useCallback(async () => {
    try {
      await gameStorageService.initialize()
      setSessions(await gameStorageService.getSessions('backward-digit-span'))
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { void loadSessions().catch(() => undefined) }, [loadSessions])
  const exitTraining = async () => { try { await loadSessions() } finally { setPage('home') } }
  return <div className="app-shell">
    {page === 'home' && <Home latest={sessions[0]} onStartDigitSpan={() => setPage('digit-span')} onStartStroop={() => setPage('stroop')} />}
    {page === 'digit-span' && <Training onExit={exitTraining} />}
    {page === 'stroop' && <StroopTraining onExit={() => setPage('home')} />}
    {page === 'history' && <History sessions={sessions} loading={loading} />}
    {!['digit-span', 'stroop'].includes(page) && <nav className="bottom-nav" aria-label="Main navigation"><button className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}><span>⌂</span>Home</button><button className={page === 'history' ? 'active' : ''} onClick={() => setPage('history')}><span>◷</span>History</button></nav>}
  </div>
}
