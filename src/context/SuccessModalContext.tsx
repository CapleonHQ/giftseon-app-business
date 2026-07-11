'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import SuccessModal from '@/components/common/SuccessModal'

type SuccessModalState = {
  isOpen: boolean
  message: string
  title?: string
}

type SuccessModalContextValue = {
  openSuccess: (payload: { message: string; title?: string }) => void
  closeSuccess: () => void
}

const SuccessModalContext = createContext<SuccessModalContextValue | undefined>(
  undefined
)

export const SuccessModalProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [state, setState] = useState<SuccessModalState>({
    isOpen: false,
    message: '',
  })

  const openSuccess = useCallback(
    ({ message, title }: { message: string; title?: string }) => {
      setState({ isOpen: true, message, title })
    },
    []
  )

  const closeSuccess = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const value = useMemo(
    () => ({ openSuccess, closeSuccess }),
    [openSuccess, closeSuccess]
  )

  return (
    <SuccessModalContext.Provider value={value}>
      {children}
      <SuccessModal
        isOpen={state.isOpen}
        message={state.message}
        title={state.title}
        onClose={closeSuccess}
      />
    </SuccessModalContext.Provider>
  )
}

export const useSuccessModal = () => {
  const context = useContext(SuccessModalContext)
  if (!context) {
    throw new Error('useSuccessModal must be used within SuccessModalProvider')
  }
  return context
}
