'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Employee } from '@/types/Employee'

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Adaeze Okonkwo',
    tag: '@adaeze',
    email: 'adaeze.okonkwo@acme.com',
    phone: '08031234567',
    department: 'Engineering',
    role: 'Senior Software Engineer',
    dateOfJoining: '2021-03-14',
    dateOfBirth: '1994-06-02',
    profileCompletion: 'Complete',
    interestsSet: true,
    source: 'tag',
    giftHistory: [
      { id: 'gh-1', occasion: 'Birthday Gift', date: '2025-06-02', amount: 25000, status: 'Delivered' },
      { id: 'gh-2', occasion: 'Work Anniversary', date: '2025-03-14', amount: 20000, status: 'Claimed' },
    ],
  },
  {
    id: 'emp-2',
    name: 'Chinedu Balogun',
    tag: '@chinedu_b',
    email: 'chinedu.balogun@acme.com',
    phone: '08022345678',
    department: 'Sales',
    role: 'Account Manager',
    dateOfJoining: '2022-09-01',
    dateOfBirth: '1990-11-20',
    profileCompletion: 'Incomplete',
    interestsSet: false,
    source: 'spreadsheet',
    giftHistory: [
      { id: 'gh-3', occasion: 'Welcome / Onboarding', date: '2022-09-01', amount: 15000, status: 'Delivered' },
    ],
  },
  {
    id: 'emp-3',
    name: 'Ngozi Umeh',
    tag: '@ngoziu',
    email: 'ngozi.umeh@acme.com',
    phone: '08033456789',
    department: 'Marketing',
    role: 'Marketing Lead',
    dateOfJoining: '2020-01-20',
    dateOfBirth: '1992-01-15',
    profileCompletion: 'Complete',
    interestsSet: true,
    source: 'manual',
    giftHistory: [
      { id: 'gh-4', occasion: 'Birthday Gift', date: '2025-01-15', amount: 30000, status: 'Claimed' },
      { id: 'gh-5', occasion: 'Performance Bonus', date: '2025-04-10', amount: 100000, status: 'Delivered' },
    ],
  },
  {
    id: 'emp-4',
    name: 'Emeka Nwosu',
    email: 'emeka.nwosu@acme.com',
    phone: '08044567890',
    department: 'Finance',
    role: 'Financial Analyst',
    dateOfJoining: '2023-05-10',
    dateOfBirth: '1996-09-28',
    profileCompletion: 'Incomplete',
    interestsSet: false,
    source: 'manual',
    giftHistory: [],
  },
  {
    id: 'emp-5',
    name: "Funmilayo Adewale",
    tag: '@funmi_a',
    email: 'funmilayo.adewale@acme.com',
    phone: '08055678901',
    department: 'Human Resources',
    role: 'HR Business Partner',
    dateOfJoining: '2019-11-04',
    dateOfBirth: '1988-03-30',
    profileCompletion: 'Complete',
    interestsSet: true,
    source: 'tag',
    giftHistory: [
      { id: 'gh-6', occasion: 'Work Anniversary', date: '2025-11-04', amount: 25000, status: 'Pending' },
    ],
  },
  {
    id: 'emp-6',
    name: 'Tobi Fashola',
    email: 'tobi.fashola@acme.com',
    phone: '08066789012',
    department: 'Engineering',
    role: 'Product Designer',
    dateOfJoining: '2024-02-19',
    dateOfBirth: '1997-12-05',
    profileCompletion: 'Incomplete',
    interestsSet: false,
    source: 'spreadsheet',
    giftHistory: [],
  },
  {
    id: 'emp-7',
    name: 'Blessing Effiong',
    tag: '@blessing_e',
    email: 'blessing.effiong@acme.com',
    phone: '08077890123',
    department: 'Operations',
    role: 'Operations Manager',
    dateOfJoining: '2018-07-23',
    dateOfBirth: '1985-08-19',
    profileCompletion: 'Complete',
    interestsSet: true,
    source: 'tag',
    giftHistory: [
      { id: 'gh-7', occasion: 'Compensation', date: '2025-05-01', amount: 50000, status: 'Delivered' },
    ],
  },
  {
    id: 'emp-8',
    name: 'Ibrahim Suleiman',
    email: 'ibrahim.suleiman@acme.com',
    phone: '08088901234',
    department: 'Sales',
    role: 'Sales Executive',
    dateOfJoining: '2023-10-16',
    dateOfBirth: '1993-04-11',
    profileCompletion: 'Incomplete',
    interestsSet: false,
    source: 'manual',
    giftHistory: [],
  },
]

let idCounter = MOCK_EMPLOYEES.length + 1

export type NewEmployeeInput = Omit<
  Employee,
  'id' | 'profileCompletion' | 'interestsSet' | 'giftHistory'
> & { profileCompletion?: Employee['profileCompletion'] }

type EmployeesContextValue = {
  employees: Employee[]
  addEmployees: (inputs: NewEmployeeInput[]) => Employee[]
  updateEmployee: (id: string, updates: Partial<Employee>) => void
  removeEmployees: (ids: string[]) => void
  getEmployee: (id: string) => Employee | undefined
}

const EmployeesContext = createContext<EmployeesContextValue | undefined>(undefined)

export const EmployeesProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES)

  const addEmployees = useCallback((inputs: NewEmployeeInput[]) => {
    const created: Employee[] = inputs.map((input) => ({
      ...input,
      id: `emp-${idCounter++}`,
      profileCompletion: input.profileCompletion ?? 'Incomplete',
      interestsSet: false,
      giftHistory: [],
    }))
    setEmployees((prev) => [...created, ...prev])
    return created
  }, [])

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
  }, [])

  const removeEmployees = useCallback((ids: string[]) => {
    const idSet = new Set(ids)
    setEmployees((prev) => prev.filter((e) => !idSet.has(e.id)))
  }, [])

  const getEmployee = useCallback(
    (id: string) => employees.find((e) => e.id === id),
    [employees]
  )

  const value = useMemo(
    () => ({ employees, addEmployees, updateEmployee, removeEmployees, getEmployee }),
    [employees, addEmployees, updateEmployee, removeEmployees, getEmployee]
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
