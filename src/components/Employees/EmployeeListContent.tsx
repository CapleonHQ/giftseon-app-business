'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, Eye, Gift, Trash2, ChevronLeft, ChevronRight, X, UserPlus } from 'lucide-react'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import EmptyState from '@/components/Dashboard/EmptyState'
import EmployeeProfileDrawer from './EmployeeProfileDrawer'
import SendGiftModal from './SendGiftModal'
import SuccessModal from '@/components/Profile/SuccessModal'
import { useEmployees } from '@/context/EmployeesContext'
import type { Employee } from '@/types/Employee'
import { formatDate } from '@/lib/utils/dateTime'

const PER_PAGE = 10

const COMPLETION_STYLES: Record<string, string> = {
  Complete: 'bg-success-50 text-success-500',
  Incomplete: 'bg-warning-50 text-warning-500',
}

export default function EmployeeListContent() {
  const router = useRouter()
  const { employees, removeEmployees } = useEmployees()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilter, setShowFilter] = useState(false)
  const [filterDept, setFilterDept] = useState('All Departments')
  const [filterStatus, setFilterStatus] = useState('All Status')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const MENU_WIDTH = 176 // w-44

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sendGiftOpen, setSendGiftOpen] = useState(false)
  const [sendGiftTargets, setSendGiftTargets] = useState<string[]>([])
  const [removeTargets, setRemoveTargets] = useState<string[] | null>(null)
  const [showRemoveSuccess, setShowRemoveSuccess] = useState(false)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // The menu is portaled and positioned from the trigger button's on-screen
  // coordinates — close it on scroll/resize rather than tracking every
  // scroll to reposition, since the table body itself also scrolls
  // horizontally and could otherwise leave the menu misaligned.
  useEffect(() => {
    if (!openMenu) return
    const close = () => { setOpenMenu(null); setMenuPosition(null) }
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [openMenu])

  const departments = useMemo(
    () => ['All Departments', ...Array.from(new Set(employees.map((e) => e.department)))],
    [employees]
  )

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.tag || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchDept = filterDept === 'All Departments' || e.department === filterDept
    const matchStatus = filterStatus === 'All Status' || e.profileCompletion === filterStatus
    return matchSearch && matchDept && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const isEmpty = employees.length === 0

  const safeDate = (value: string) => {
    try {
      return formatDate(value)
    } catch {
      return value
    }
  }

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const pageIds = paginated.map((e) => e.id)
      const allSelected = pageIds.every((id) => prev.has(id)) && pageIds.length > 0
      const next = new Set(prev)
      if (allSelected) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const openSendGift = (ids: string[]) => {
    setSendGiftTargets(ids)
    setSendGiftOpen(true)
  }

  const confirmRemove = () => {
    if (!removeTargets) return
    removeEmployees(removeTargets)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      removeTargets.forEach((id) => next.delete(id))
      return next
    })
    setRemoveTargets(null)
    setShowRemoveSuccess(true)
  }

  const allOnPageSelected = paginated.length > 0 && paginated.every((e) => selectedIds.has(e.id))

  return (
    <div className='flex flex-col'>
      <DashboardHeader title='Employees' />
      <div className='p-6 lg:p-8'>
        {isEmpty ? (
          <div className='flex flex-col items-center justify-center rounded-xl border border-grey-100 bg-white py-24'>
            <EmptyState message='No employees added yet! Add your team to start automating gifting.' />
            <button
              onClick={() => router.push('/employees/new')}
              className='mt-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all'
              style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
            >
              Add employees
            </button>
          </div>
        ) : (
          <div className='rounded-xl border border-grey-100 bg-white'>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b border-grey-100 px-5 py-4'>
              <p className='text-sm font-semibold text-blackish'>{filtered.length} Employees</p>
              <div className='flex flex-wrap items-center gap-3'>
                <div className='flex items-center gap-2 rounded-lg border border-grey-200 bg-grey-50/50 px-3 py-2'>
                  <Search className='h-4 w-4 text-grey-400' />
                  <input
                    type='text'
                    placeholder='Search name or @tag'
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                    className='w-32 bg-transparent text-sm text-blackish outline-none placeholder:text-grey-400 lg:w-48'
                  />
                </div>
                <div className='relative'>
                  <button
                    onClick={() => setShowFilter(!showFilter)}
                    className='flex items-center gap-1.5 rounded-lg border border-grey-200 px-3 py-2 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'
                  >
                    <SlidersHorizontal className='h-4 w-4' />
                    Filters
                  </button>
                  {showFilter && (
                    <div className='absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-grey-100 bg-white p-5 shadow-lg'>
                      <div className='flex items-center justify-between mb-4'>
                        <h4 className='text-sm font-semibold text-blackish'>Filter</h4>
                        <button onClick={() => setShowFilter(false)} className='text-grey-400 hover:text-blackish'>
                          <X className='h-4 w-4' />
                        </button>
                      </div>
                      <div className='mb-4'>
                        <p className='mb-2 text-sm font-medium text-blackish'>Department</p>
                        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className='form-input text-sm'>
                          {departments.map((d) => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className='mb-5'>
                        <p className='mb-2 text-sm font-medium text-blackish'>Profile Status</p>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className='form-input text-sm'>
                          <option>All Status</option>
                          <option>Complete</option>
                          <option>Incomplete</option>
                        </select>
                      </div>
                      <div className='flex gap-3'>
                        <button onClick={() => { setFilterDept('All Departments'); setFilterStatus('All Status'); setShowFilter(false) }} className='flex-1 rounded-lg border border-grey-200 py-2 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'>Reset</button>
                        <button onClick={() => { setCurrentPage(1); setShowFilter(false) }} className='flex-1 rounded-lg py-2 text-sm font-medium text-white transition-all' style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}>Apply</button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openSendGift([])}
                  className='flex items-center gap-1.5 rounded-lg border border-grey-200 px-4 py-2 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'
                >
                  <Gift className='h-4 w-4' />
                  Send a Gift
                </button>
                <button
                  onClick={() => router.push('/employees/new')}
                  className='flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all'
                  style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
                >
                  <UserPlus className='h-4 w-4' />
                  Add employees
                </button>
              </div>
            </div>

            {selectedIds.size > 0 && (
              <div className='flex items-center gap-3 border-b border-grey-100 bg-grey-50/50 px-5 py-2.5'>
                <span className='text-xs font-medium text-grey-600'>{selectedIds.size} selected</span>
                <button
                  onClick={() => openSendGift(Array.from(selectedIds))}
                  className='flex items-center gap-1.5 rounded-lg border border-grey-200 bg-white px-3 py-1.5 text-xs font-medium text-grey-600 hover:bg-grey-50'
                >
                  <Gift className='h-3.5 w-3.5' /> Send Gift
                </button>
                <button
                  onClick={() => setRemoveTargets(Array.from(selectedIds))}
                  className='flex items-center gap-1.5 rounded-lg border border-error-200 bg-white px-3 py-1.5 text-xs font-medium text-error-500 hover:bg-error-50'
                >
                  <Trash2 className='h-3.5 w-3.5' /> Remove
                </button>
              </div>
            )}

            <div className='overflow-x-auto'>
              <table className='w-full text-left text-sm'>
                <thead>
                  <tr className='border-b border-grey-100 text-xs text-grey-400'>
                    <th className='px-5 py-3 font-medium'>
                      <input type='checkbox' checked={allOnPageSelected} onChange={toggleAll} className='h-4 w-4 rounded border-grey-300 accent-primary-500' />
                    </th>
                    <th className='px-3 py-3 font-medium'>Name</th>
                    <th className='px-3 py-3 font-medium'>@tag</th>
                    <th className='px-3 py-3 font-medium'>Department</th>
                    <th className='px-3 py-3 font-medium'>Role</th>
                    <th className='px-3 py-3 font-medium'>Date of Joining</th>
                    <th className='px-3 py-3 font-medium'>Date of Birth</th>
                    <th className='px-3 py-3 font-medium'>Profile</th>
                    <th className='px-3 py-3 font-medium'>Gifting history</th>
                    <th className='px-3 py-3 font-medium'></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((employee) => (
                    <tr key={employee.id} className='border-b border-grey-50 hover:bg-grey-50/30 transition-colors'>
                      <td className='px-5 py-3'>
                        <input type='checkbox' checked={selectedIds.has(employee.id)} onChange={() => toggleOne(employee.id)} className='h-4 w-4 rounded border-grey-300 accent-primary-500' />
                      </td>
                      <td className='px-3 py-3'>
                        <div className='flex items-center gap-2.5'>
                          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-600'>
                            {employee.name.charAt(0)}
                          </div>
                          <span className='font-medium text-blackish'>{employee.name}</span>
                        </div>
                      </td>
                      <td className='px-3 py-3 text-grey-500'>{employee.tag || '—'}</td>
                      <td className='px-3 py-3 text-grey-600'>{employee.department}</td>
                      <td className='px-3 py-3 text-grey-600'>{employee.role}</td>
                      <td className='px-3 py-3 text-grey-600'>{safeDate(employee.dateOfJoining)}</td>
                      <td className='px-3 py-3 text-grey-600'>{safeDate(employee.dateOfBirth)}</td>
                      <td className='px-3 py-3'>
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${COMPLETION_STYLES[employee.profileCompletion]}`}>
                          {employee.profileCompletion}
                        </span>
                      </td>
                      <td className='px-3 py-3 text-grey-600'>{employee.giftHistory.length}</td>
                      <td className='relative px-3 py-3'>
                        <button
                          onClick={(e) => {
                            if (openMenu === employee.id) {
                              setOpenMenu(null)
                              setMenuPosition(null)
                              return
                            }
                            const rect = e.currentTarget.getBoundingClientRect()
                            setMenuPosition({ top: rect.bottom + 4, left: rect.right - MENU_WIDTH })
                            setOpenMenu(employee.id)
                          }}
                          className='rounded p-1 text-grey-400 hover:bg-grey-100 hover:text-blackish'
                        >
                          <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                            <circle cx='8' cy='4' r='1' fill='currentColor' /><circle cx='8' cy='8' r='1' fill='currentColor' /><circle cx='8' cy='12' r='1' fill='currentColor' />
                          </svg>
                        </button>
                        {openMenu === employee.id && menuPosition && createPortal(
                          <div
                            ref={menuRef}
                            style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left, width: MENU_WIDTH }}
                            className='z-50 rounded-lg border border-grey-100 bg-white py-1 shadow-lg'
                          >
                            <button
                              onClick={() => { setOpenMenu(null); setMenuPosition(null); setActiveEmployee(employee) }}
                              className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-grey-600 hover:bg-grey-50 transition-colors'
                            >
                              <Eye className='h-4 w-4' />
                              View profile
                            </button>
                            <button
                              onClick={() => { setOpenMenu(null); setMenuPosition(null); openSendGift([employee.id]) }}
                              className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-grey-600 hover:bg-grey-50 transition-colors'
                            >
                              <Gift className='h-4 w-4' />
                              Send a gift
                            </button>
                            <button
                              onClick={() => { setOpenMenu(null); setMenuPosition(null); setRemoveTargets([employee.id]) }}
                              className='flex w-full items-center gap-2 px-4 py-2.5 text-sm text-error-500 hover:bg-error-50 transition-colors'
                            >
                              <Trash2 className='h-4 w-4' />
                              Remove
                            </button>
                          </div>,
                          document.body
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='flex items-center justify-between border-t border-grey-100 px-5 py-3'>
              <p className='text-xs text-grey-400'>Showing {Math.min((currentPage - 1) * PER_PAGE + 1, filtered.length)}-{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length}</p>
              <div className='flex items-center gap-2'>
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className='rounded-lg border border-grey-200 p-1.5 text-grey-400 hover:bg-grey-50 disabled:opacity-40'>
                  <ChevronLeft className='h-4 w-4' />
                </button>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg border border-primary-200 bg-primary-50 text-sm font-medium text-primary-500'>{currentPage}</div>
                <span className='text-xs text-grey-400'>of {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className='rounded-lg border border-grey-200 p-1.5 text-grey-400 hover:bg-grey-50 disabled:opacity-40'>
                  <ChevronRight className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <EmployeeProfileDrawer employee={activeEmployee} onClose={() => setActiveEmployee(null)} />

      <SendGiftModal
        open={sendGiftOpen}
        onClose={() => setSendGiftOpen(false)}
        initialEmployeeIds={sendGiftTargets}
      />

      {removeTargets && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl'>
            <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-error-50'>
              <Trash2 className='h-5 w-5 text-error-500' />
            </div>
            <h3 className='text-lg font-semibold text-blackish'>
              Remove {removeTargets.length} employee{removeTargets.length === 1 ? '' : 's'}?
            </h3>
            <p className='mt-1 text-sm text-grey-400'>
              They&apos;ll be removed from your gifting list and any automated rules. This can&apos;t be undone.
            </p>
            <div className='mt-5 flex gap-3'>
              <button onClick={() => setRemoveTargets(null)} className='flex-1 rounded-lg border border-grey-200 py-2.5 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'>Cancel</button>
              <button onClick={confirmRemove} className='flex-1 rounded-lg bg-error-500 py-2.5 text-sm font-medium text-white hover:bg-error-600 transition-colors'>Remove</button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal open={showRemoveSuccess} onClose={() => setShowRemoveSuccess(false)} message='Selected employees have been removed.' />
    </div>
  )
}
