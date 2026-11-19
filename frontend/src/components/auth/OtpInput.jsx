import { useEffect, useRef } from 'react'

// Six-box one-time-code input. `value` is a string of digits ("4821"); `onChange` receives the new string.
// Supports typing, backspace/delete, arrow keys, pasting a whole code, and SMS autofill.
export default function OtpInput({ value, onChange, onEnter, length = 6, disabled = false, invalid = false, autoFocus = false, idPrefix = 'otp' }) {
  const refs = useRef([])
  const digits = Array.from({ length }, (_, i) => value[i] || '')

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus()
  }, [autoFocus])

  const clean = (text) => String(text || '').replace(/\D/g, '')
  const focusAt = (i) => {
    const el = refs.current[Math.max(0, Math.min(length - 1, i))]
    el?.focus()
    el?.select?.()
  }
  // Fill from box i onwards, keeping the code contiguous (never leaves a gap).
  const fillFrom = (i, text) => {
    const next = (value.slice(0, Math.min(i, value.length)) + text).slice(0, length)
    onChange(next)
    focusAt(Math.min(next.length, length - 1))
  }

  const handleChange = (i, e) => {
    // nativeEvent.data is just the character that was typed; fall back to the box value for paste/autofill.
    const inserted = clean(e.nativeEvent?.data ?? e.target.value)
    if (!inserted) return
    if (inserted.length > 1) return fillFrom(i, inserted)
    const pos = Math.min(i, value.length)
    onChange((value.slice(0, pos) + inserted + value.slice(pos + 1)).slice(0, length))
    focusAt(pos + 1)
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[i]) onChange(value.slice(0, i) + value.slice(i + 1))
      else if (i > 0) {
        onChange(value.slice(0, i - 1) + value.slice(i))
        focusAt(i - 1)
      }
    } else if (e.key === 'Delete') {
      e.preventDefault()
      if (digits[i]) onChange(value.slice(0, i) + value.slice(i + 1))
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusAt(i - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusAt(i + 1)
    } else if (e.key === 'Enter') {
      e.preventDefault() // do not submit the signup form from here
      onEnter?.()
    }
  }

  const handlePaste = (i, e) => {
    e.preventDefault()
    const text = clean(e.clipboardData?.getData('text'))
    if (text) fillFrom(i, text)
  }

  return (
    <div role="group" aria-label="One-time password" className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}>
      {digits.map((digit, i) => (
        <input
          key={i}
          id={`${idPrefix}-${i}`}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={digit}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          className={`h-12 w-full min-w-0 rounded-xl border bg-white text-center text-lg font-bold text-navy-900 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:text-xl ${
            invalid
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
              : digit
                ? 'border-brand-300 focus:border-brand-500 focus:ring-brand-100'
                : 'border-navy-200 focus:border-brand-500 focus:ring-brand-100'
          }`}
        />
      ))}
    </div>
  )
}