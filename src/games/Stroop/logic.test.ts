import { describe, expect, it } from 'vitest'
import { createStroopTrial, isStroopAnswerCorrect, STROOP_COLORS, STROOP_TRIAL_MS } from './logic'

describe('Color–Word Focus', () => {
  it('has a positive configurable trial time limit', () => {
    expect(STROOP_TRIAL_MS).toBeGreaterThan(0)
  })

  it('creates an incongruent color-word trial', () => {
    const trial = createStroopTrial(() => 0)
    expect(trial.word).not.toBe(trial.ink)
    expect(STROOP_COLORS.some((color) => color.id === trial.word)).toBe(true)
    expect(STROOP_COLORS.some((color) => color.id === trial.ink)).toBe(true)
  })

  it('scores the ink color rather than the written word', () => {
    const trial = { word: 'red', ink: 'blue' } as const
    expect(isStroopAnswerCorrect(trial, 'blue')).toBe(true)
    expect(isStroopAnswerCorrect(trial, 'red')).toBe(false)
  })
})
