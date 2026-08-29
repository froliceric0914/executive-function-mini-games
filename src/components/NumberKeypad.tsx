interface Props {
  onDigit: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
  submitDisabled: boolean
}

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

export function NumberKeypad({ onDigit, onDelete, onSubmit, submitDisabled }: Props) {
  return <div className="keypad" aria-label="Number keypad">
    {keys.map((key) => <button key={key} className="key" onClick={() => onDigit(key)}>{key}</button>)}
    <button className="key key-action" onClick={onDelete} aria-label="Delete last digit">⌫</button>
    <button className="key" onClick={() => onDigit('0')}>0</button>
    <button className="key key-submit" onClick={onSubmit} disabled={submitDisabled} aria-label="Submit answer">✓</button>
  </div>
}
