'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Employee } from '@/types/Employee'
import * as employeesApi from '@/lib/api/employees'

export type NewEmployeeInput = Omit<
  Employee,
  'id' | 'profileCompletion' | 'interestsSet' | 'giftHistory'
> & { profileCompletion?: Employee['profileCompletion'] }

export interface AddByTagResult {
  resolvedCount: number
  unresolvedCount: number
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
    queryFn: () => employeesApi.listEmployees({ limit: 200 }),
  })
  const employees = useMemo(() => data?.data ?? [], [data])

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
    return { resolvedCount: result.resolvedCount, unresolvedCount: result.unresolvedCount }
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

export const MOCK_DIRECTORY = [
  { tag: '@adaeze', name: 'Adaeze Okonkwo', phone: '08031234567', email: 'adaeze.okonkwo@acme.com' },
  { tag: '@chinedu_b', name: 'Chinedu Balogun', phone: '08022345678', email: 'chinedu.balogun@acme.com' },
  { tag: '@tobifash', name: 'Tobi Fashola', phone: '08099887766', email: 'tobi.fashola@gmail.com' },
  { tag: '@amaka.j', name: 'Amaka Johnson', phone: '08011223344', email: 'amaka.johnson@gmail.com' },
]
