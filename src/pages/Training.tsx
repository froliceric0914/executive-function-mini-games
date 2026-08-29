import { useEffect, useRef, useState } from 'react'
import { NumberKeypad } from '../components/NumberKeypad'
import type { Session, TrialResult } from '../types/session'
import { buildSession, createSequence, displayDuration, expectedAnswer, MAX_FAILURES, STARTING_SPAN } from '../games/BackwardDigitSpan/logic'
import { formatDuration, formatPercent, formatSeconds } from '../utils/format'

type Phase = 'ready' | 'showing' | 'answering' | 'feedback' | 'summary'

export function Training({ onComplete }: { onComplete: (session: Session) => void }) {
  const [phase, setPhase] = useState<Phase>('ready')
  const [span, setSpan] = useState(STARTING_SPAN)
  const [sequence, setSequence] = useState<number[]>([])
  const [answer, setAnswer] = useState('')
  const [trials, setTrials] = useState<TrialResult[]>([])
  const [lastCorrect, setLastCorrect] = useState(false)
  const [summary, setSummary] = useState<Session>()
  const startedAt = useRef(0)
  const answerStartedAt = useRef(0)

  useEffect(() => {
    if (phase !== 'showing') return
    const timer = window.setTimeout(() => { answerStartedAt.current = performance.now(); setPhase('answering') }, displayDuration(span))
    return () => window.clearTimeout(timer)
  }, [phase, span, sequence])

  const beginRound = (nextSpan = span) => {
    setSpan(nextSpan); setAnswer(''); setSequence(createSequence(nextSpan)); setPhase('showing')
  }
  const start = () => { startedAt.current = Date.now(); setTrials([]); beginRound(STARTING_SPAN) }
  const submit = () => {
    if (answer.length !== sequence.length) return
    const correct = answer === expectedAnswer(sequence)
    const nextTrials = [...trials, { span, correct, responseTimeMs: performance.now() - answerStartedAt.current }]
    setTrials(nextTrials); setLastCorrect(correct)
    if (nextTrials.filter((trial) => !trial.correct).length >= MAX_FAILURES) {
      const completed = buildSession(startedAt.current, nextTrials)
      setSummary(completed); onComplete(completed); setPhase('summary')
    } else {
      setPhase('feedback')
    }
  }

  if (phase === 'summary' && summary) return <main className="page training-page summary-page">
    <div className="success-mark">✓</div><p className="eyebrow">Session complete</p><h1>Nice work.</h1>
    <div className="summary-grid">
      <div><span>Max span</span><strong>{summary.maxSuccessfulSpan}</strong></div><div><span>Accuracy</span><strong>{formatPercent(summary.accuracy)}</strong></div>
      <div><span>Avg response</span><strong>{formatSeconds(summary.averageResponseTimeMs)}</strong></div><div><span>Duration</span><strong>{formatDuration(summary.durationMs)}</strong></div>
    </div>
    <p className="summary-note">{summary.correctTrials} correct out of {summary.totalTrials} trials</p>
    <button className="primary-button" onClick={start}>Train Again</button>
  </main>

  return <main className="page training-page">
    <div className="training-header"><div><p className="eyebrow">Backward Digit Span</p><h1>{phase === 'ready' ? 'Ready to focus?' : `Span ${span}`}</h1></div>{phase !== 'ready' && <span className="failure-count">Misses {trials.filter(t => !t.correct).length}/{MAX_FAILURES}</span>}</div>
    {phase === 'ready' && <section className="ready-panel"><div className="digit-preview">5 8 2 9</div><h2>Remember, then reverse</h2><p>Watch the digits. When they disappear, enter them in reverse order.</p><button className="primary-button" onClick={start}>Start Session</button></section>}
    {phase === 'showing' && <section className="game-panel showing"><p>Remember these digits</p><div className="digits" aria-live="polite">{sequence.join(' ')}</div><div className="progress-line" /></section>}
    {phase === 'answering' && <section className="game-panel"><p>Enter the digits in reverse</p><div className="answer-display" aria-live="polite">{answer ? answer.split('').join(' ') : <span>—</span>}</div><p className="digit-count">{answer.length} of {sequence.length} digits</p><NumberKeypad onDigit={(digit) => answer.length < sequence.length && setAnswer(answer + digit)} onDelete={() => setAnswer(answer.slice(0, -1))} onSubmit={submit} submitDisabled={answer.length !== sequence.length} /></section>}
    {phase === 'feedback' && <section className="feedback-panel"><div className={lastCorrect ? 'feedback-icon correct' : 'feedback-icon incorrect'}>{lastCorrect ? '✓' : '×'}</div><h2>{lastCorrect ? 'Correct' : 'Not quite'}</h2><p>{lastCorrect ? `Moving up to ${span + 1} digits.` : <>The answer was <strong>{expectedAnswer(sequence).split('').join(' ')}</strong></>}</p><button className="primary-button" onClick={() => beginRound(lastCorrect ? span + 1 : span)}>Next Round</button></section>}
  </main>
}
