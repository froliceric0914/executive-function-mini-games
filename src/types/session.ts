export interface TrialResult {
  span: number
  correct: boolean
  responseTimeMs: number
}

export interface Session {
  id: string
  completedAt: string
  totalTrials: number
  correctTrials: number
  incorrectTrials: number
  accuracy: number
  maxSuccessfulSpan: number
  averageResponseTimeMs: number
  durationMs: number
}
