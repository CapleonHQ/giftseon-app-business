import { request } from './client'
import type { Employee } from '@/types/Employee'

export interface BackendContact {
  id: string
  userId: string
  name: string
  phone?: string
  email?: string
  giftseonTag?: string
  department?: string
  role?: string
  dateOfJoining?: string
  dateOfBirth?: string
  linkedUserId?: string
  createdAt: string
  updatedAt: string
}

/**
 * profileCompletion/interestsSet/giftHistory have no dedicated backend query
 * yet — defaulted here (known display gap, not blocking).
 */
const toEmployee = (contact: BackendContact): Employee => ({
  id: contact.id,
  name: contact.name,
  tag: contact.giftseonTag,
  email: contact.email ?? '',
  phone: contact.phone ?? '',
  department: contact.department ?? '',
  role: contact.role ?? '',
  dateOfJoining: contact.dateOfJoining ?? '',
  dateOfBirth: contact.dateOfBirth ?? '',
  profileCompletion: 'Incomplete',
  interestsSet: Boolean(contact.linkedUserId),
  giftHistory: [],
  source: contact.giftseonTag ? 'tag' : 'manual',
})

export interface CreateEmployeePayload {
  name: string
  phone?: string
  email?: string
  department?: string
  role?: string
  dateOfJoining?: string
  dateOfBirth?: string
}

export interface EmployeeListQuery {
  search?: string
  department?: string
  page?: number
  limit?: number
}

export interface EmployeeListResult {
  total: number
  page: number
  limit: number
  data: Employee[]
}

export const listEmployees = async (query?: EmployeeListQuery): Promise<EmployeeListResult> => {
  const result = await request<{ total: number; page: number; limit: number; data: BackendContact[] }>({
    method: 'GET',
    url: '/employees',
    params: query,
  })
  return { ...result, data: result.data.map(toEmployee) }
}

export const createEmployee = async (payload: CreateEmployeePayload) =>
  toEmployee(await request<BackendContact>({ method: 'POST', url: '/employees', data: payload }))

export const getEmployee = async (id: string) =>
  toEmployee(await request<BackendContact>({ method: 'GET', url: `/employees/${id}` }))

export const updateEmployee = async (id: string, payload: Partial<CreateEmployeePayload>) =>
  toEmployee(await request<BackendContact>({ method: 'PUT', url: `/employees/${id}`, data: payload }))

export const removeEmployees = (contactIds: string[]) =>
  request<{ removed: number }>({ method: 'POST', url: '/employees/remove', data: { contactIds } })

export interface AddEmployeesByTagPayload {
  tags: string[]
  department?: string
  role?: string
  dateOfJoining?: string
}

export const addEmployeesByTags = async (payload: AddEmployeesByTagPayload) => {
  const result = await request<{
    created: BackendContact[]
    resolvedCount: number
    unresolvedCount: number
  }>({ method: 'POST', url: '/employees/by-tags', data: payload })
  return { ...result, created: result.created.map(toEmployee) }
}

export interface BulkImportRow {
  name: string
  phone?: string
  email?: string
  role?: string
  department?: string
  dateOfJoining?: string
  dateOfBirth?: string
}

export const bulkImportEmployees = async (rows: BulkImportRow[]) => {
  const result = await request<{ created: number; skipped: number; contacts: BackendContact[] }>({
    method: 'POST',
    url: '/employees/bulk-import',
    data: { rows },
  })
  return { ...result, contacts: result.contacts.map(toEmployee) }
}
