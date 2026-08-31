import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { colorDetails, createStroopTrial, isStroopAnswerCorrect, STROOP_COLORS, STROOP_ROUNDS, type StroopColorId } from '../games/Stroop/logic'

type Phase = 'ready' | 'playing' | 'feedback' | 'complete'

export function StroopTraining({ onExit }: { onExit: () => void }) {
  const { t } = useTranslation()
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
  const colorLabel = (id: StroopColorId) => t(`games.stroop.colors.${id}`)

  return <main className="page training-page stroop-page">
    <button className="close-training" onClick={onExit} aria-label={t('games.stroop.exit')}>×</button>
    <div className="training-header"><div><p className="eyebrow">{t('games.stroop.skill')}</p><h1>{t('games.stroop.title')}</h1></div>{phase !== 'ready' && <span className="failure-count">{Math.min(round, STROOP_ROUNDS)}/{STROOP_ROUNDS}</span>}</div>

    {phase === 'ready' && <section className="ready-panel stroop-ready"><div className="stroop-example"><span style={{ color: colorDetails('blue').value }}>RED</span></div><h2>{t('games.stroop.nameInk')}</h2><p>{t('games.stroop.instructions')}</p><button className="primary-button" onClick={start}>{t('games.stroop.start')}</button></section>}

    {phase === 'playing' && <section className="game-panel stroop-trial"><p>{t('games.stroop.chooseInk')}</p><div className="stroop-word" style={{ color: colorDetails(trial.ink).value }} aria-label={t('games.stroop.stimulusLabel', { word: colorLabel(trial.word) })}>{colorLabel(trial.word).toLocaleUpperCase()}</div><div className="stroop-choices">{STROOP_COLORS.map((color) => <button key={color.id} onClick={() => answer(color.id)}><span className="color-dot" style={{ background: color.value }} />{colorLabel(color.id)}</button>)}</div></section>}

    {phase === 'feedback' && <section className="feedback-panel calm-feedback"><div className={lastCorrect ? 'feedback-icon correct' : 'feedback-icon incorrect'}>{lastCorrect ? '✓' : '—'}</div><h2>{lastCorrect ? t('games.stroop.correctTitle') : t('games.stroop.nextTitle')}</h2><p>{lastCorrect ? t('games.stroop.correctBody') : t('games.stroop.inkWas', { color: colorLabel(trial.ink) })}</p><button className="primary-button" onClick={continueGame}>{round === STROOP_ROUNDS ? t('games.stroop.seeSummary') : t('common.continue')}</button></section>}

    {phase === 'complete' && <section className="feedback-panel calm-feedback"><div className="success-mark">{finalScore}</div><h2>{t('games.stroop.completeTitle')}</h2><p>{t('games.stroop.completeBody', { score: finalScore, total: STROOP_ROUNDS })}</p><button className="primary-button" onClick={start}>{t('common.tryAgain')}</button><button className="text-button" onClick={onExit}>{t('games.stroop.backToGames')}</button></section>}
  </main>
}
