import type { Session, TrialResult } from '../../types/session'

export const STARTING_SPAN = 3
export const MAX_FAILURES = 3

export function createSequence(span: number): number[] {
  return Array.from({ length: span }, () => Math.floor(Math.random() * 10))
}

export function expectedAnswer(sequence: number[]) {
  return sequence.slice().reverse().join('')
}

export function displayDuration(span: number) {
  return Math.max(1800, span * 550)
}

export function buildSession(startedAt: number, trials: TrialResult[]): Session {
  const correctTrials = trials.filter((trial) => trial.correct)
  const responseTotal = trials.reduce((sum, trial) => sum + trial.responseTimeMs, 0)
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    completedAt: new Date().toISOString(),
    totalTrials: trials.length,
    correctTrials: correctTrials.length,
    incorrectTrials: trials.length - correctTrials.length,
    accuracy: trials.length ? (correctTrials.length / trials.length) * 100 : 0,
    maxSuccessfulSpan: Math.max(0, ...correctTrials.map((trial) => trial.span)),
    averageResponseTimeMs: trials.length ? responseTotal / trials.length : 0,
    durationMs: Date.now() - startedAt,
  }
}
