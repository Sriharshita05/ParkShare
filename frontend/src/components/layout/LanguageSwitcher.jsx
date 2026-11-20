import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { LANGUAGES } from '../../i18n'

// Globe button + dropdown. The choice is saved in localStorage by i18next and applies instantly, no reload.
export default function LanguageSwitcher({ className = '' }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)
  const listId = useId()
  const current = LANGUAGES.find((l) => l.code === (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0]) || LANGUAGES[0]

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown, { passive: true })
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Move keyboard focus to the selected option when the list opens.
  useEffect(() => {
    if (open) wrapRef.current?.querySelector('[aria-selected="true"]')?.focus()
  }, [open])

  const choose = (code) => {
    i18n.changeLanguage(code)
    setOpen(false)
    buttonRef.current?.focus()
  }

  const onListKeyDown = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = [...wrapRef.current.querySelectorAll('[role="option"]')]
    const i = items.indexOf(document.activeElement)
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${t('language.label')}: ${current.native}`}
        className={`inline-flex h-10 items-center gap-1.5 rounded-xl border bg-white px-2.5 text-sm font-semibold text-navy-700 shadow-soft transition hover:border-brand-300 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:px-3 ${
          open ? 'border-brand-400' : 'border-navy-100'
        }`}
      >
        <Globe className="h-[18px] w-[18px] shrink-0 text-brand-600" aria-hidden="true" />
        <span className="max-w-[6.5rem] truncate">{current.native}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-navy-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="animate-fade-up absolute right-0 z-50 mt-2 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-navy-100 bg-white p-1.5 shadow-card">
          <p className="px-3 pb-1.5 pt-2 text-[11px] font-bold uppercase tracking-wider text-navy-400">{t('language.select')}</p>
          <ul id={listId} role="listbox" aria-label={t('language.select')} onKeyDown={onListKeyDown} className="space-y-0.5">
            {LANGUAGES.map((l) => {
              const selected = l.code === current.code
              return (
                <li key={l.code} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    lang={l.code}
                    onClick={() => choose(l.code)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      selected ? 'bg-brand-50 text-brand-700' : 'text-navy-700 hover:bg-navy-50'
                    }`}
                  >
                    <span className="min-w-0 leading-tight">
                      <span className="block truncate text-sm font-bold">{l.native}</span>
                      <span className={`block text-xs ${selected ? 'text-brand-600' : 'text-navy-400'}`}>{l.english}</span>
                    </span>
                    {selected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}