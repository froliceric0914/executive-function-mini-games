import { useEffect, useRef, useState } from 'react'
import { NumberKeypad } from '../components/NumberKeypad'
import type { TrialResult } from '../types/session'
import type { GameProgress } from '../types/game'
import { buildSession, createSequence, displayDuration, expectedAnswer, MISSES_BEFORE_LEVEL_CHOICE, requiredSuccessesForSpan, STARTING_SPAN } from '../games/BackwardDigitSpan/logic'
import { gameStorageService } from '../services/gameStorageService'
import '../styles/levelChoice.css'

const GAME = 'backward-digit-span' as const
type Phase = 'loading' | 'ready' | 'showing' | 'answering' | 'saving' | 'feedback' | 'success-choice' | 'miss-choice'

export function Training({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [span, setSpan] = useState(STARTING_SPAN)
  const [sequence, setSequence] = useState<number[]>([])
  const [answer, setAnswer] = useState('')
  const [trials, setTrials] = useState<TrialResult[]>([])
  const [lastCorrect, setLastCorrect] = useState(false)
  const [successfulAttemptsAtSpan, setSuccessfulAttemptsAtSpan] = useState(0)
  const [missesAtSpan, setMissesAtSpan] = useState(0)
  const [warning, setWarning] = useState<string>()
  const startedAt = useRef(0)
  const answerStartedAt = useRef(0)
  const sessionId = useRef<string>()
  const lastAttemptId = useRef<number>()

  useEffect(() => {
    gameStorageService.getProgress(GAME).then((progress) => {
      setSpan(progress.currentSpanLength)
      setSuccessfulAttemptsAtSpan(progress.currentSuccessStreak)
      setPhase('ready')
    }).catch(() => {
      setWarning('Saved progress could not be loaded. You can still try again.')
      setPhase('ready')
    })
  }, [])

  useEffect(() => {
    if (phase !== 'showing') return
    const timer = window.setTimeout(() => { answerStartedAt.current = performance.now(); setPhase('answering') }, displayDuration(span))
    return () => window.clearTimeout(timer)
  }, [phase, span, sequence])

  const beginRound = (nextSpan = span) => {
    setSpan(nextSpan); setAnswer(''); setSequence(createSequence(nextSpan)); setPhase('showing')
  }

  const start = async () => {
    try {
      const session = await gameStorageService.startSession(GAME, span)
      sessionId.current = session.id
      startedAt.current = Date.now()
      setTrials([]); setMissesAtSpan(0); setWarning(undefined); beginRound(span)
    } catch {
      setWarning('Training could not be started because local history storage is unavailable. Please try again.')
    }
  }

  const progressFor = (currentSpanLength: number, currentSuccessStreak: number): GameProgress => ({
    currentSpanLength, currentSuccessStreak, lastSessionId: sessionId.current, lastPlayedAt: new Date().toISOString(),
  })

  const submit = async () => {
    if (answer.length !== sequence.length || !sessionId.current) return
    setPhase('saving')
    const correct = answer === expectedAnswer(sequence)
    const responseTimeMs = performance.now() - answerStartedAt.current
    const nextStreak = correct ? successfulAttemptsAtSpan + 1 : 0
    const requiredSuccesses = requiredSuccessesForSpan(span)
    const nextTrials = [...trials, { span, correct, responseTimeMs }]

    const result = await gameStorageService.saveAttempt({
      game: GAME, sessionId: sessionId.current, timestamp: new Date(), spanLength: span,
      sequence: [...sequence], userAnswer: answer.split('').map(Number), correct, responseTimeMs,
      successStreak: nextStreak, difficultyChanged: false,
    })
    if (result.saved) {
      lastAttemptId.current = result.id
      try {
        await gameStorageService.updateProgress(GAME, progressFor(span, nextStreak))
        setWarning(undefined)
      } catch {
        setWarning('The attempt was saved, but progress restoration could not be refreshed.')
      }
    } else {
      setWarning('This attempt has not been saved yet. It is queued for another save attempt during this session.')
    }

    setTrials(nextTrials); setLastCorrect(correct)
    setSuccessfulAttemptsAtSpan(nextStreak)
    if (correct && nextStreak >= requiredSuccesses) setPhase('success-choice')
    else if (!correct) {
      const nextMisses = missesAtSpan + 1
      setMissesAtSpan(nextMisses)
      setPhase(nextMisses >= MISSES_BEFORE_LEVEL_CHOICE ? 'miss-choice' : 'feedback')
    } else setPhase('feedback')
  }

  const chooseSpan = async (nextSpan: number, changed: boolean) => {
    if (changed && lastAttemptId.current) {
      try { await gameStorageService.markDifficultyChanged(lastAttemptId.current) } catch { setWarning('The difficulty changed, but that detail could not be saved.') }
    }
    setSuccessfulAttemptsAtSpan(0); setMissesAtSpan(0)
    try { await gameStorageService.updateProgress(GAME, progressFor(nextSpan, 0)) } catch { setWarning('Progress changed, but the quick-restore cache could not be refreshed.') }
    beginRound(nextSpan)
  }

  const exit = async () => {
    if (sessionId.current) {
      try {
        await gameStorageService.retryUnsavedAttempts()
        await gameStorageService.endSession(sessionId.current, buildSession(startedAt.current, trials), span)
      } catch {
        setWarning('Some training data could not be saved. Please try exiting again.')
        return
      }
    }
    onExit()
  }

  return <main className="page training-page">
    <button className="close-training" onClick={exit} aria-label="Exit training">×</button>
    <div className="training-header"><div><p className="eyebrow">Backward Digit Span</p><h1>{phase === 'ready' || phase === 'loading' ? 'Ready to focus?' : `Span ${span}`}</h1></div>{!['ready', 'loading'].includes(phase) && <span className="failure-count">Misses {missesAtSpan}/{MISSES_BEFORE_LEVEL_CHOICE}</span>}</div>
    {warning && <p className="storage-warning" role="status">{warning}</p>}
    {phase === 'loading' && <section className="ready-panel"><p>Restoring your progress…</p></section>}
    {phase === 'ready' && <section className="ready-panel"><div className="digit-preview">5 8 2 9</div><h2>Remember, then reverse</h2><p>Watch the digits. When they disappear, enter them in reverse order. You’ll resume at span {span}.</p><button className="primary-button" onClick={start}>Start Session</button></section>}
    {phase === 'showing' && <section className="game-panel showing"><p>Remember these digits</p><div className="digits" aria-live="polite">{sequence.join(' ')}</div><div className="progress-line" /></section>}
    {phase === 'answering' && <section className="game-panel"><p>Enter the digits in reverse</p><div className="answer-display" aria-live="polite">{answer ? answer.split('').join(' ') : <span>—</span>}</div><p className="digit-count">{answer.length} of {sequence.length} digits</p><NumberKeypad onDigit={(digit) => answer.length < sequence.length && setAnswer(answer + digit)} onDelete={() => setAnswer(answer.slice(0, -1))} onSubmit={submit} submitDisabled={answer.length !== sequence.length} /></section>}
    {phase === 'saving' && <section className="feedback-panel"><p>Saving attempt…</p></section>}
    {phase === 'feedback' && <section className="feedback-panel"><div className={lastCorrect ? 'feedback-icon correct' : 'feedback-icon incorrect'}>{lastCorrect ? '✓' : '×'}</div><h2>{lastCorrect ? 'Correct' : 'Not quite'}</h2><p>{lastCorrect ? `${successfulAttemptsAtSpan} of ${requiredSuccessesForSpan(span)} successful attempts at this span.` : <>The answer was <strong>{expectedAnswer(sequence).split('').join(' ')}</strong></>}</p><button className="primary-button" onClick={() => beginRound(span)}>Next Round</button></section>}
    {phase === 'success-choice' && <ChoiceDialog title="Ready to increase?" body={`You completed ${requiredSuccessesForSpan(span)} successful ${requiredSuccessesForSpan(span) === 1 ? 'attempt' : 'attempts'} at span ${span}.`} stayLabel={`Stay at ${span}`} increaseLabel={`Increase to ${span + 1}`} onStay={() => chooseSpan(span, false)} onIncrease={() => chooseSpan(span + 1, true)} />}
    {phase === 'miss-choice' && <ChoiceDialog title={`${MISSES_BEFORE_LEVEL_CHOICE} misses at this span`} body={`Would you like to practise at ${span} digits or move up to ${span + 1} digits?`} stayLabel={`Stay at ${span}`} increaseLabel={`Increase to ${span + 1}`} onStay={() => chooseSpan(span, false)} onIncrease={() => chooseSpan(span + 1, true)} />}
  </main>
}

function ChoiceDialog({ title, body, stayLabel, increaseLabel, onStay, onIncrease }: { title: string; body: string; stayLabel: string; increaseLabel: string; onStay: () => void; onIncrease: () => void }) {
  return <div className="level-choice-backdrop"><section className="level-choice" role="dialog" aria-modal="true" aria-labelledby="level-choice-title"><p className="eyebrow">Choose your challenge</p><h2 id="level-choice-title">{title}</h2><p>{body}</p><div className="level-choice-actions"><button className="secondary-button" onClick={onStay}>{stayLabel}</button><button className="primary-button" onClick={onIncrease}>{increaseLabel}</button></div></section></div>
}
