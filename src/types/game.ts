import type { Session } from './session'

export type GameId = 'backward-digit-span'

export interface GameAttempt {
  id?: number
  game: GameId
  sessionId: string
  timestamp: Date
  spanLength: number
  sequence: number[]
  userAnswer: number[]
  correct: boolean
  responseTimeMs: number
  successStreak: number
  difficultyChanged: boolean
}

export interface TrainingSession {
  id: string
  game: GameId
  startedAt: Date
  endedAt?: Date
  startingSpan: number
  endingSpan?: number
  summary?: Session
}

export interface GameProgress {
  currentSpanLength: number
  currentSuccessStreak: number
  lastSessionId?: string
  lastPlayedAt?: string
}

export interface GameStats {
  totalAttempts: number
  correctAttempts: number
  accuracy: number
  maxSpan: number
  averageResponseTimeMs: number
}
