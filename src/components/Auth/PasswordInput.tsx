'use client'

import { useState, useMemo } from 'react'
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react'

type PasswordRule = {
  label: string
  test: (v: string) => boolean
}

const RULES: PasswordRule[] = [
  { label: 'First capital letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'At least 1 symbol (?,%,&...)', test: (v) => /[^a-zA-Z0-9]/.test(v) },
]

type PasswordInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  showRules?: boolean
  error?: string
  name?: string
}

const PasswordInput = ({
  label,
  value,
  onChange,
  placeholder = 'Create your password',
  showRules = false,
  error,
  name,
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false)
  const [touched, setTouched] = useState(false)

  const results = useMemo(
    () => RULES.map((r) => ({ ...r, passed: r.test(value) })),
    [value]
  )

  const allPassed = results.every((r) => r.passed)
  const hasValue = value.length > 0
  const showError = touched && hasValue && !allPassed && showRules

  const borderColor = error
    ? 'border-error-500 ring-1 ring-error-500/20'
    : showError
      ? 'border-error-500 ring-1 ring-error-500/20'
      : hasValue && allPassed && showRules
        ? 'border-success-500 ring-1 ring-success-500/20'
        : 'border-grey-200 focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400/20'

  return (
    <div className='space-y-1.5'>
      <label className='block text-sm font-medium text-blackish'>{label}</label>
      <div className={`flex items-center rounded-lg border bg-white px-3.5 py-2.5 transition-colors ${borderColor}`}>
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          name={name}
          className='flex-1 bg-transparent text-sm text-blackish outline-none placeholder:text-grey-400'
        />
        <button
          type='button'
          onClick={() => setVisible(!visible)}
          className='ml-2 text-grey-400 hover:text-grey-600 transition-colors'
          tabIndex={-1}
        >
          {visible ? <EyeOff className='h-4.5 w-4.5' /> : <Eye className='h-4.5 w-4.5' />}
        </button>
      </div>

      {error && (
        <p className='flex items-center gap-1 text-xs text-error-500'>
          <AlertCircle className='h-3.5 w-3.5' />
          {error}
        </p>
      )}

      {showError && !error && (
        <p className='flex items-center gap-1 text-xs text-error-500'>
          <AlertCircle className='h-3.5 w-3.5' />
          Your password does not meet the criteria
        </p>
      )}

      {showRules && (
        <ul className='mt-1 space-y-0.5'>
          {results.map((r) => {
            const color =
              !hasValue
                ? 'text-grey-400'
                : r.passed
                  ? 'text-success-500'
                  : touched
                    ? 'text-error-500'
                    : 'text-grey-400'
            return (
              <li key={r.label} className={`flex items-center gap-1.5 text-xs ${color}`}>
                <Check className='h-3.5 w-3.5' />
                {r.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default PasswordInput
export { RULES as PASSWORD_RULES }
