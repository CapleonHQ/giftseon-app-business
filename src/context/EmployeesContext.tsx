'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Employee, EmployeeGiftHistoryItem } from '@/types/Employee'
import * as employeesApi from '@/lib/api/employees'
import * as giftsApi from '@/lib/api/gifts'

export const GIFT_HISTORY_QUERY_KEY = ['employees', 'gift-history'] as const

const GIFT_STATUS_MAP: Record<string, EmployeeGiftHistoryItem['status']> = {
  pending: 'Pending',
  claimed: 'Claimed',
  fulfilled: 'Delivered',
  expired: 'Failed',
  cancelled: 'Failed',
}

const toGiftHistoryItem = (gift: giftsApi.BackendGift): EmployeeGiftHistoryItem => ({
  id: gift.id,
  occasion: (gift.metadata?.occasion as string) || 'Gift',
  date: gift.createdAt,
  amount: Number(gift.amount) || 0,
  status: GIFT_STATUS_MAP[gift.status] ?? 'Pending',
})

export type NewEmployeeInput = Omit<
  Employee,
  'id' | 'profileCompletion' | 'interestsSet' | 'giftHistory'
> & { profileCompletion?: Employee['profileCompletion'] }

export interface AddByTagResult {
  resolvedCount: number
  unresolvedCount: number
  duplicateCount: number
}

export interface BulkImportResult {
  created: number
  skipped: number
}

type EmployeesContextValue = {
  employees: Employee[]
  isLoading: boolean
  addEmployees: (inputs: NewEmployeeInput[]) => Promise<Employee[]>
  addEmployeesByTag: (
    tags: string[],
    opts: { department?: string; role?: string; dateOfJoining?: string }
  ) => Promise<AddByTagResult>
  bulkImportEmployees: (rows: employeesApi.BulkImportRow[]) => Promise<BulkImportResult>
  updateEmployee: (id: string, updates: Partial<Employee>) => void
  removeEmployees: (ids: string[]) => void
  getEmployee: (id: string) => Employee | undefined
}

const EmployeesContext = createContext<EmployeesContextValue | undefined>(undefined)

const EMPLOYEES_QUERY_KEY = ['employees'] as const

export const EmployeesProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: () => employeesApi.listEmployees({ limit: 100 }),
  })

  const { data: giftHistoryByEmployee } = useQuery({
    queryKey: GIFT_HISTORY_QUERY_KEY,
    queryFn: giftsApi.getGiftHistoryByEmployee,
  })

  const employees = useMemo(() => {
    const rows = data?.data ?? []
    if (!giftHistoryByEmployee) return rows
    return rows.map((employee) => ({
      ...employee,
      giftHistory: (giftHistoryByEmployee[employee.id] ?? []).map(toGiftHistoryItem),
    }))
  }, [data, giftHistoryByEmployee])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY })

  const addEmployeesMutation = useMutation({
    mutationFn: async (inputs: NewEmployeeInput[]) =>
      Promise.all(inputs.map((input) => employeesApi.createEmployee(input))),
    onSuccess: invalidate,
  })

  const addByTagMutation = useMutation({
    mutationFn: employeesApi.addEmployeesByTags,
    onSuccess: invalidate,
  })

  const bulkImportMutation = useMutation({
    mutationFn: employeesApi.bulkImportEmployees,
    onSuccess: invalidate,
  })

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<NewEmployeeInput> }) =>
      employeesApi.updateEmployee(id, updates),
    onSuccess: invalidate,
  })

  const removeEmployeesMutation = useMutation({
    mutationFn: employeesApi.removeEmployees,
    onSuccess: invalidate,
  })

  const addEmployees = async (inputs: NewEmployeeInput[]) => addEmployeesMutation.mutateAsync(inputs)

  const addEmployeesByTag: EmployeesContextValue['addEmployeesByTag'] = async (tags, opts) => {
    const result = await addByTagMutation.mutateAsync({ tags, ...opts })
    return {
      resolvedCount: result.resolvedCount,
      unresolvedCount: result.unresolvedCount,
      duplicateCount: result.duplicateCount,
    }
  }

  const bulkImportEmployees = async (rows: employeesApi.BulkImportRow[]) => {
    const result = await bulkImportMutation.mutateAsync(rows)
    return { created: result.created, skipped: result.skipped }
  }

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    updateEmployeeMutation.mutate({ id, updates })
  }

  const removeEmployees = (ids: string[]) => {
    removeEmployeesMutation.mutate(ids)
  }

  const getEmployee = (id: string) => employees.find((e) => e.id === id)

  const value = useMemo<EmployeesContextValue>(
    () => ({
      employees,
      isLoading,
      addEmployees,
      addEmployeesByTag,
      bulkImportEmployees,
      updateEmployee,
      removeEmployees,
      getEmployee,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [employees, isLoading]
  )

  return <EmployeesContext.Provider value={value}>{children}</EmployeesContext.Provider>
}

export const useEmployees = () => {
  const ctx = useContext(EmployeesContext)
  if (!ctx) throw new Error('useEmployees must be used within EmployeesProvider')
  return ctx
}
