import type { Session } from '../types/session'
import { SessionCard } from '../components/SessionCard'

export function History({ sessions }: { sessions: Session[] }) {
  return <main className="page">
    <p className="eyebrow">Your progress</p><h1>History</h1>
    {sessions.length ? <div className="history-list">{sessions.map((session) => <SessionCard session={session} key={session.id} />)}</div> : <div className="empty-card history-empty"><strong>No history yet</strong><span>Complete a training session to see it here.</span></div>}
  </main>
}
