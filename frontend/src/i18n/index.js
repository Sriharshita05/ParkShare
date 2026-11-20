import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import hi from './locales/hi.json'
import te from './locales/te.json'
import pa from './locales/pa.json'

// Add a language here (plus a locales/<code>.json file) and it shows up in the selector automatically.
export const LANGUAGES = [
  { code: 'en', native: 'English', english: 'English', locale: 'en-IN' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi', locale: 'hi-IN' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu', locale: 'te-IN' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi', locale: 'pa-IN' },
]
export const STORAGE_KEY = 'parkshare-lang'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, hi: { translation: hi }, te: { translation: te }, pa: { translation: pa } },
    supportedLngs: LANGUAGES.map((l) => l.code),
    fallbackLng: 'en', // anything missing in another language falls back to English
    load: 'languageOnly',
    // English by default; after that, only the visitor's own saved choice is used.
    detection: { order: ['localStorage'], lookupLocalStorage: STORAGE_KEY, caches: ['localStorage'] },
    interpolation: { escapeValue: false }, // React already escapes
    react: { useSuspense: false },
    initImmediate: false, // older i18next versions
    initAsync: false, // newer i18next versions: translations are bundled, so load them synchronously
  })

// Keep <html lang="..."> in step, for screen readers, hyphenation and the right fonts.
const syncHtmlLang = (lng) => {
  if (typeof document !== 'undefined') document.documentElement.lang = (lng || 'en').split('-')[0]
}
syncHtmlLang(i18n.language)
i18n.on('languageChanged', syncHtmlLang)

export const localeOf = (lng = i18n.language) => LANGUAGES.find((l) => l.code === (lng || 'en').split('-')[0])?.locale || 'en-IN'

export default i18n