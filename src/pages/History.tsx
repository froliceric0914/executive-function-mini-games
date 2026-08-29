import type { Session } from '../types/session'
import { SessionCard } from '../components/SessionCard'

export function History({ sessions, loading = false }: { sessions: Session[]; loading?: boolean }) {
  return <main className="page">
    <p className="eyebrow">Your progress</p><h1>History</h1>
    {loading ? <div className="empty-card history-empty"><span>Loading history…</span></div> : sessions.length ? <div className="history-list">{sessions.map((session) => <SessionCard session={session} key={session.id} />)}</div> : <div className="empty-card history-empty"><strong>No history yet</strong><span>Complete a training session to see it here.</span></div>}
  </main>
}
