import type { Session } from '../types/session'
import { formatPercent, formatSeconds, formatSessionDate } from '../utils/format'

export function SessionCard({ session, recent = false }: { session: Session, recent?: boolean }) {
  return <article className="session-card">
    <div className="session-card-top"><strong>{recent ? 'Most recent' : formatSessionDate(session.completedAt)}</strong>{recent && <span>{formatSessionDate(session.completedAt, true)}</span>}</div>
    <div className="metrics-row">
      <div><span>Max span</span><strong>{session.maxSuccessfulSpan}</strong></div>
      <div><span>Accuracy</span><strong>{formatPercent(session.accuracy)}</strong></div>
      <div><span>Avg response</span><strong>{formatSeconds(session.averageResponseTimeMs)}</strong></div>
    </div>
  </article>
}
