'use client'

import { useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

type LogoutModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function LogoutModal({ open, onClose, onConfirm }: LogoutModalProps) {
  const handleConfirm = useCallback(() => {
    onConfirm()
    onClose()
  }, [onConfirm, onClose])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='max-w-sm p-6 text-center'>
        <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error-50'>
          <svg width='24' height='24' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M10.667 11.333L14 8L10.667 4.667' stroke='#cb1a14' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M14 8H6' stroke='#cb1a14' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
            <path d='M6 14H3.333C2.597 14 2 13.403 2 12.667V3.333C2 2.597 2.597 2 3.333 2H6' stroke='#cb1a14' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </div>
        <DialogTitle className='text-lg font-semibold text-blackish'>Log Out</DialogTitle>
        <DialogDescription className='text-sm text-grey-500'>
          Are you sure you want to log out?
        </DialogDescription>
        <div className='mt-4 flex flex-col gap-2.5'>
          <button
            onClick={handleConfirm}
            className='w-full rounded-xl py-3 text-sm font-medium text-white transition-colors'
            style={{ background: 'linear-gradient(to bottom, #dc6862, #cb1a14)' }}
          >
            Yes, Log Out
          </button>
          <button
            onClick={onClose}
            className='w-full rounded-xl border border-grey-200 bg-white py-3 text-sm font-medium text-blackish hover:bg-grey-50 transition-colors'
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
