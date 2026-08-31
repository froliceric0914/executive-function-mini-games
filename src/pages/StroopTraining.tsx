import { useState } from 'react'
import { colorDetails, createStroopTrial, isStroopAnswerCorrect, STROOP_COLORS, STROOP_ROUNDS, type StroopColorId } from '../games/Stroop/logic'

type Phase = 'ready' | 'playing' | 'feedback' | 'complete'

export function StroopTraining({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('ready')
  const [trial, setTrial] = useState(createStroopTrial)
  const [round, setRound] = useState(1)
  const [correctCount, setCorrectCount] = useState(0)
  const [lastCorrect, setLastCorrect] = useState(false)

  const start = () => {
    setRound(1)
    setCorrectCount(0)
    setTrial(createStroopTrial())
    setPhase('playing')
  }

  const answer = (choice: StroopColorId) => {
    const correct = isStroopAnswerCorrect(trial, choice)
    setLastCorrect(correct)
    if (correct) setCorrectCount((count) => count + 1)
    setPhase('feedback')
  }

  const continueGame = () => {
    if (round >= STROOP_ROUNDS) {
      setPhase('complete')
      return
    }
    setRound((value) => value + 1)
    setTrial(createStroopTrial())
    setPhase('playing')
  }

  const finalScore = correctCount

  return <main className="page training-page stroop-page">
    <button className="close-training" onClick={onExit} aria-label="Exit Color–Word Focus">×</button>
    <div className="training-header"><div><p className="eyebrow">Inhibition control</p><h1>Color–Word Focus</h1></div>{phase !== 'ready' && <span className="failure-count">{Math.min(round, STROOP_ROUNDS)}/{STROOP_ROUNDS}</span>}</div>

    {phase === 'ready' && <section className="ready-panel stroop-ready"><div className="stroop-example"><span style={{ color: colorDetails('blue').value }}>RED</span></div><h2>Name the ink color</h2><p>Ignore what the word says. Choose the color the word is displayed in. Take a moment—accuracy matters more than speed.</p><button className="primary-button" onClick={start}>Start Prototype</button></section>}

    {phase === 'playing' && <section className="game-panel stroop-trial"><p>Choose the ink color</p><div className="stroop-word" style={{ color: colorDetails(trial.ink).value }} aria-label={`${colorDetails(trial.word).label}, shown in a colored ink`}>{colorDetails(trial.word).label.toUpperCase()}</div><div className="stroop-choices">{STROOP_COLORS.map((color) => <button key={color.id} onClick={() => answer(color.id)}><span className="color-dot" style={{ background: color.value }} />{color.label}</button>)}</div></section>}

    {phase === 'feedback' && <section className="feedback-panel calm-feedback"><div className={lastCorrect ? 'feedback-icon correct' : 'feedback-icon incorrect'}>{lastCorrect ? '✓' : '—'}</div><h2>{lastCorrect ? 'That’s it' : 'Next one'}</h2><p>{lastCorrect ? 'You selected the ink color.' : <>The ink color was <strong>{colorDetails(trial.ink).label}</strong>.</>}</p><button className="primary-button" onClick={continueGame}>{round === STROOP_ROUNDS ? 'See Summary' : 'Continue'}</button></section>}

    {phase === 'complete' && <section className="feedback-panel calm-feedback"><div className="success-mark">{finalScore}</div><h2>Prototype complete</h2><p>You identified {finalScore} of {STROOP_ROUNDS} ink colors. Results are not saved yet while this game is in development.</p><button className="primary-button" onClick={start}>Try Again</button><button className="text-button" onClick={onExit}>Back to games</button></section>}
  </main>
}
