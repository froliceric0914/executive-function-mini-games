import { useTranslation } from 'react-i18next'
import { LANGUAGE_STORAGE_KEY, type SupportedLanguage } from '../i18n'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const activeLanguage: SupportedLanguage = i18n.resolvedLanguage === 'zh-CN' ? 'zh-CN' : 'en'

  const selectLanguage = (language: SupportedLanguage) => {
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, language) } catch { /* Language still changes for this visit. */ }
    void i18n.changeLanguage(language)
  }

  return <div className="language-switcher" aria-label={t('common.language')}>
    <button className={activeLanguage === 'en' ? 'active' : ''} onClick={() => selectLanguage('en')} lang="en">EN</button>
    <span aria-hidden="true">|</span>
    <button className={activeLanguage === 'zh-CN' ? 'active' : ''} onClick={() => selectLanguage('zh-CN')} lang="zh-CN">中文</button>
  </div>
}
