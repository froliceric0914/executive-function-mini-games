interface Props {
  onDigit: (digit: string) => void
  onDelete: () => void
  onSubmit: () => void
  submitDisabled: boolean
}

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

export function NumberKeypad({ onDigit, onDelete, onSubmit, submitDisabled }: Props) {
  const { t } = useTranslation()
  return <div className="keypad" aria-label={t('keypad.label')}>
    {keys.map((key) => <button key={key} className="key" onClick={() => onDigit(key)}>{key}</button>)}
    <button className="key key-action" onClick={onDelete} aria-label={t('keypad.delete')}>⌫</button>
    <button className="key" onClick={() => onDigit('0')}>0</button>
    <button className="key key-submit" onClick={onSubmit} disabled={submitDisabled} aria-label={t('keypad.submit')}>✓</button>
  </div>
}
import { useTranslation } from 'react-i18next'
