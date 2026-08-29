import { describe, expect, it } from 'vitest'
import { displayDuration, PRESENTATION_TIMING, requiredSuccessesForSpan } from './logic'

describe('Backward Digit Span progression', () => {
  it('requires one successful attempt before span five', () => {
    expect(requiredSuccessesForSpan(3)).toBe(1)
    expect(requiredSuccessesForSpan(4)).toBe(1)
  })

  it('requires two successful attempts at even spans', () => {
    expect(requiredSuccessesForSpan(6)).toBe(2)
  })

  it('requires three successful attempts at odd spans from five digits', () => {
    expect(requiredSuccessesForSpan(5)).toBe(3)
  })

  it('keeps full-sequence presentation timing configurable', () => {
    expect(PRESENTATION_TIMING.minimumMs).toBeGreaterThan(0)
    expect(PRESENTATION_TIMING.perDigitMs).toBeGreaterThan(0)
    expect(displayDuration(5)).toBe(5 * PRESENTATION_TIMING.perDigitMs)
  })
})
