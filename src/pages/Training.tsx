import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NumberKeypad } from '../components/NumberKeypad'
import type { TrialResult } from '../types/session'
import type { GameProgress } from '../types/game'
import { buildSession, createSequence, displayDuration, expectedAnswer, MISSES_BEFORE_LEVEL_CHOICE, requiredSuccessesForSpan, STARTING_SPAN } from '../games/BackwardDigitSpan/logic'
import { gameStorageService } from '../services/gameStorageService'
import '../styles/levelChoice.css'

const GAME = 'backward-digit-span' as const
type Phase = 'loading' | 'ready' | 'showing' | 'answering' | 'saving' | 'feedback' | 'success-choice' | 'miss-choice'

export function Training({ onExit }: { onExit: () => void }) {
  const { t } = useTranslation()
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
      setWarning('games.digitSpan.loadError')
      setPhase('ready')
    })
  }, [])

  useEffect(() => {
    if (phase !== 'showing') return
    const timer = window.setTimeout(() => {
      answerStartedAt.current = performance.now()
      setPhase('answering')
    }, displayDuration(span))
    return () => window.clearTimeout(timer)
  }, [phase, span])

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
      setWarning('games.digitSpan.startError')
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
        setWarning('games.digitSpan.progressRefreshError')
      }
    } else {
      setWarning('games.digitSpan.queuedSave')
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
      try { await gameStorageService.markDifficultyChanged(lastAttemptId.current) } catch { setWarning('games.digitSpan.difficultySaveError') }
    }
    setSuccessfulAttemptsAtSpan(0); setMissesAtSpan(0)
    try { await gameStorageService.updateProgress(GAME, progressFor(nextSpan, 0)) } catch { setWarning('games.digitSpan.progressChangeError') }
    beginRound(nextSpan)
  }

  const exit = async () => {
    if (sessionId.current) {
      try {
        await gameStorageService.retryUnsavedAttempts()
        await gameStorageService.endSession(sessionId.current, buildSession(startedAt.current, trials), span)
      } catch {
        setWarning('games.digitSpan.exitSaveError')
        return
      }
    }
    onExit()
  }

  const isMemoryPhase = phase === 'showing'

  return <main className="page training-page">
    <button className="close-training" onClick={exit} aria-label={t('games.digitSpan.exit')}>×</button>
    <div className="training-header"><div><p className="eyebrow">{t('games.digitSpan.title')}</p><h1>{phase === 'ready' || phase === 'loading' ? t('games.digitSpan.readyTitle') : t('games.digitSpan.span', { span })}</h1></div>{!['ready', 'loading'].includes(phase) && !isMemoryPhase && <span className="failure-count">{t('games.digitSpan.misses', { count: missesAtSpan, total: MISSES_BEFORE_LEVEL_CHOICE })}</span>}</div>
    {warning && <p className="storage-warning" role="status">{t(warning)}</p>}
    {phase === 'loading' && <section className="ready-panel"><p>{t('games.digitSpan.restoring')}</p></section>}
    {phase === 'ready' && <section className="ready-panel"><div className="digit-preview">5 8 2 9</div><h2>{t('games.digitSpan.rememberReverse')}</h2><p>{t('games.digitSpan.instructions', { span })}</p><button className="primary-button" onClick={start}>{t('games.digitSpan.startSession')}</button></section>}
    {phase === 'showing' && <section className="game-panel showing"><p>{t('games.digitSpan.rememberDigits')}</p><div className="digits" aria-live="polite">{sequence.join(' ')}</div><div className="progress-line" style={{ animationDuration: `${displayDuration(span)}ms` }} /></section>}
    {phase === 'answering' && <section className="game-panel"><p>{t('games.digitSpan.enterReverse')}</p><div className="answer-display" aria-live="polite">{answer ? answer.split('').join(' ') : <span>—</span>}</div><p className="digit-count">{t('games.digitSpan.digitCount', { count: answer.length, total: sequence.length })}</p><NumberKeypad onDigit={(digit) => answer.length < sequence.length && setAnswer(answer + digit)} onDelete={() => setAnswer(answer.slice(0, -1))} onSubmit={submit} submitDisabled={answer.length !== sequence.length} /></section>}
    {phase === 'saving' && <section className="feedback-panel"><p>{t('games.digitSpan.saving')}</p></section>}
    {phase === 'feedback' && <section className="feedback-panel calm-feedback"><div className={lastCorrect ? 'feedback-icon correct' : 'feedback-icon incorrect'}>{lastCorrect ? '✓' : '—'}</div><h2>{lastCorrect ? t('games.digitSpan.correct') : t('games.digitSpan.nextOne')}</h2><p>{lastCorrect ? t('games.digitSpan.successProgress', { count: successfulAttemptsAtSpan, total: requiredSuccessesForSpan(span) }) : <>{t('games.digitSpan.reverseWas')} <strong>{expectedAnswer(sequence).split('').join(' ')}</strong></>}</p><button className="primary-button" onClick={() => beginRound(span)}>{t('common.continue')}</button></section>}
    {phase === 'success-choice' && <ChoiceDialog eyebrow={t('games.digitSpan.chooseChallenge')} title={t('games.digitSpan.readyIncrease')} body={t('games.digitSpan.completedAttempts', { count: requiredSuccessesForSpan(span), span })} stayLabel={t('games.digitSpan.stay', { span })} increaseLabel={t('games.digitSpan.increase', { span: span + 1 })} onStay={() => chooseSpan(span, false)} onIncrease={() => chooseSpan(span + 1, true)} />}
    {phase === 'miss-choice' && <ChoiceDialog eyebrow={t('games.digitSpan.chooseChallenge')} title={t('games.digitSpan.missesTitle', { count: MISSES_BEFORE_LEVEL_CHOICE })} body={t('games.digitSpan.missesChoice', { span, nextSpan: span + 1 })} stayLabel={t('games.digitSpan.stay', { span })} increaseLabel={t('games.digitSpan.increase', { span: span + 1 })} onStay={() => chooseSpan(span, false)} onIncrease={() => chooseSpan(span + 1, true)} />}
  </main>
}

function ChoiceDialog({ eyebrow, title, body, stayLabel, increaseLabel, onStay, onIncrease }: { eyebrow: string; title: string; body: string; stayLabel: string; increaseLabel: string; onStay: () => void; onIncrease: () => void }) {
  return <div className="level-choice-backdrop"><section className="level-choice" role="dialog" aria-modal="true" aria-labelledby="level-choice-title"><p className="eyebrow">{eyebrow}</p><h2 id="level-choice-title">{title}</h2><p>{body}</p><div className="level-choice-actions"><button className="secondary-button" onClick={onStay}>{stayLabel}</button><button className="primary-button" onClick={onIncrease}>{increaseLabel}</button></div></section></div>
}
