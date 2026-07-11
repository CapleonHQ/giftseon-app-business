'use client'

import { useRef, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react'

type OtpInputProps = {
  length?: number
  value: string
  onChange: (value: string) => void
}

const OtpInput = ({ length = 4, value, onChange }: OtpInputProps) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length)

  const focusInput = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, length - 1))
    inputsRef.current[clamped]?.focus()
  }, [length])

  const updateDigit = useCallback(
    (index: number, char: string) => {
      const arr = [...digits]
      arr[index] = char
      onChange(arr.join(''))
    },
    [digits, onChange]
  )

  const handleInput = useCallback(
    (index: number, inputValue: string) => {
      const char = inputValue.replace(/\D/g, '').slice(-1)
      if (!char) return
      updateDigit(index, char)
      if (index < length - 1) focusInput(index + 1)
    },
    [updateDigit, focusInput, length]
  )

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault()
        if (digits[index]) {
          updateDigit(index, '')
        } else if (index > 0) {
          updateDigit(index - 1, '')
          focusInput(index - 1)
        }
      } else if (e.key === 'ArrowLeft') {
        focusInput(index - 1)
      } else if (e.key === 'ArrowRight') {
        focusInput(index + 1)
      }
    },
    [digits, updateDigit, focusInput]
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
      if (pasted) {
        onChange(pasted.padEnd(length, '').slice(0, length))
        focusInput(Math.min(pasted.length, length - 1))
      }
    },
    [onChange, focusInput, length]
  )

  return (
    <div className='flex gap-3 justify-center'>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el }}
          type='text'
          inputMode='numeric'
          maxLength={1}
          value={digit}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className='h-14 w-14 rounded-lg border border-grey-200 bg-white text-center text-xl font-semibold text-blackish outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20'
        />
      ))}
    </div>
  )
}

export default OtpInput
