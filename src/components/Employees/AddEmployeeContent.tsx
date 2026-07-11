'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, CheckCircle2, HelpCircle, Upload } from 'lucide-react'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import SuccessModal from '@/components/Profile/SuccessModal'
import { useEmployees, MOCK_DIRECTORY, type NewEmployeeInput } from '@/context/EmployeesContext'

const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'Finance', 'Human Resources', 'Operations', 'Customer Success']

type Method = 'manual' | 'tags'

export default function AddEmployeeContent() {
  const router = useRouter()
  const { employees, addEmployees } = useEmployees()
  const [method, setMethod] = useState<Method>('manual')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Manual form
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [department, setDepartment] = useState('')
  const [dateOfJoining, setDateOfJoining] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Tags form
  const [tags, setTags] = useState<string[]>([''])
  const [tagDept, setTagDept] = useState('')
  const [tagRole, setTagRole] = useState('')
  const [tagJoinDate, setTagJoinDate] = useState('')
  const [tagErrors, setTagErrors] = useState<Record<string, string>>({})

  const existingTags = new Set(employees.map((e) => e.tag).filter(Boolean))

  const resolveTag = useCallback((tag: string) => {
    const clean = tag.trim().toLowerCase()
    if (!clean) return null
    return MOCK_DIRECTORY.find((d) => d.tag.toLowerCase() === clean) || null
  }, [])

  const handleManualSubmit = () => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Full name is required'
    if (!phone.trim()) next.phone = 'Phone number is required'
    if (!email.trim()) next.email = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address'
    if (!role.trim()) next.role = 'Role is required'
    if (!department) next.department = 'Select a department'
    if (!dateOfJoining) next.dateOfJoining = 'Date of joining is required'
    if (!dateOfBirth) next.dateOfBirth = 'Date of birth is required'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const input: NewEmployeeInput = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: role.trim(),
      department,
      dateOfJoining,
      dateOfBirth,
      source: 'manual',
    }
    addEmployees([input])
    setSuccessMessage(`${name.trim()} has been added. They'll receive an onboarding invite to set up their Giftseon profile.`)
    setShowSuccess(true)
    setName(''); setPhone(''); setEmail(''); setRole(''); setDepartment(''); setDateOfJoining(''); setDateOfBirth('')
  }

  const handleTagsSubmit = () => {
    const cleanTags = tags.map((t) => t.trim()).filter(Boolean)
    const next: Record<string, string> = {}
    if (cleanTags.length === 0) next.tags = 'Add at least one @tag'
    if (!tagDept) next.department = 'Select a department'
    if (!tagRole.trim()) next.role = 'Role is required'
    if (!tagJoinDate) next.dateOfJoining = 'Date of joining is required'
    setTagErrors(next)
    if (Object.keys(next).length > 0) return

    const inputs: NewEmployeeInput[] = cleanTags.map((tag) => {
      const resolved = resolveTag(tag)
      return {
        name: resolved?.name || tag.replace('@', ''),
        tag: tag.startsWith('@') ? tag : `@${tag}`,
        email: resolved?.email || '',
        phone: resolved?.phone || '',
        role: tagRole.trim(),
        department: tagDept,
        dateOfJoining: tagJoinDate,
        dateOfBirth: '',
        source: 'tag',
        profileCompletion: resolved ? 'Complete' : 'Incomplete',
      }
    })
    addEmployees(inputs)
    const foundCount = inputs.filter((i) => i.profileCompletion === 'Complete').length
    setSuccessMessage(
      `${inputs.length} employee${inputs.length > 1 ? 's' : ''} added. ${foundCount} profile${foundCount === 1 ? '' : 's'} pulled in automatically from Giftseon${
        inputs.length - foundCount > 0 ? `, and ${inputs.length - foundCount} will get an onboarding invite since we couldn't find their tag.` : '.'
      }`
    )
    setShowSuccess(true)
    setTags(['']); setTagDept(''); setTagRole(''); setTagJoinDate('')
  }

  return (
    <div className='flex flex-col'>
      <DashboardHeader title='Add Employees' />
      <div className='p-6 lg:p-8'>
        <div className='mx-auto max-w-2xl'>
          {/* Method tabs */}
          <div className='mb-6 grid grid-cols-3 gap-3'>
            <button
              onClick={() => setMethod('manual')}
              className={`rounded-xl border-2 p-4 text-left transition-colors ${method === 'manual' ? 'border-primary-400 bg-primary-50/30' : 'border-grey-100 hover:border-grey-200'}`}
            >
              <p className='text-sm font-semibold text-blackish'>Add Individually</p>
              <p className='mt-1 text-xs text-grey-500'>Enter one employee&apos;s details manually.</p>
            </button>
            <button
              onClick={() => setMethod('tags')}
              className={`rounded-xl border-2 p-4 text-left transition-colors ${method === 'tags' ? 'border-primary-400 bg-primary-50/30' : 'border-grey-100 hover:border-grey-200'}`}
            >
              <p className='text-sm font-semibold text-blackish'>Giftseon @tags</p>
              <p className='mt-1 text-xs text-grey-500'>Add by @tag — we&apos;ll pull in their profile.</p>
            </button>
            <Link
              href='/employees/bulk-upload'
              className='rounded-xl border-2 border-grey-100 p-4 text-left transition-colors hover:border-grey-200'
            >
              <div className='flex items-center gap-1.5 text-sm font-semibold text-blackish'>
                <Upload className='h-3.5 w-3.5' /> Upload Spreadsheet
              </div>
              <p className='mt-1 text-xs text-grey-500'>Import a CSV of your whole team.</p>
            </Link>
          </div>

          {method === 'manual' && (
            <form onSubmit={(e) => { e.preventDefault(); handleManualSubmit() }} className='space-y-5 rounded-xl border border-grey-100 bg-white p-6'>
              <FormField label='Full Name' error={errors.name}>
                <input type='text' value={name} onChange={(e) => setName(e.target.value)} placeholder='Enter employee full name' className={`form-input ${errors.name ? 'border-error-400' : ''}`} />
              </FormField>
              <div className='grid grid-cols-2 gap-4'>
                <FormField label='Phone Number' error={errors.phone}>
                  <input type='tel' value={phone} onChange={(e) => setPhone(e.target.value)} placeholder='080XXXXXXXX' className={`form-input ${errors.phone ? 'border-error-400' : ''}`} />
                </FormField>
                <FormField label='Email Address' error={errors.email}>
                  <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='name@company.com' className={`form-input ${errors.email ? 'border-error-400' : ''}`} />
                </FormField>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <FormField label='Role' error={errors.role}>
                  <input type='text' value={role} onChange={(e) => setRole(e.target.value)} placeholder='e.g. Product Designer' className={`form-input ${errors.role ? 'border-error-400' : ''}`} />
                </FormField>
                <FormField label='Department' error={errors.department}>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className={`form-input ${errors.department ? 'border-error-400' : ''}`}>
                    <option value=''>Select department</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </FormField>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <FormField label='Date of Joining' error={errors.dateOfJoining}>
                  <input type='date' value={dateOfJoining} onChange={(e) => setDateOfJoining(e.target.value)} className={`form-input ${errors.dateOfJoining ? 'border-error-400' : ''}`} />
                </FormField>
                <FormField label='Date of Birth' error={errors.dateOfBirth}>
                  <input type='date' value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={`form-input ${errors.dateOfBirth ? 'border-error-400' : ''}`} />
                </FormField>
              </div>
              <button type='submit' className='w-full rounded-xl py-3 text-sm font-medium text-white transition-all' style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}>
                Add Employee
              </button>
            </form>
          )}

          {method === 'tags' && (
            <div className='space-y-5 rounded-xl border border-grey-100 bg-white p-6'>
              <div className='flex items-start gap-2 rounded-lg bg-information-50 px-3.5 py-2.5 text-xs text-information-600'>
                <HelpCircle className='h-4 w-4 shrink-0 mt-0.5' />
                Enter each employee&apos;s Giftseon @tag. If they already have an account, we&apos;ll pull their profile details in automatically. Try @adaeze, @chinedu_b, @tobifash or @amaka.j.
              </div>

              <div className='space-y-2.5'>
                {tags.map((tag, i) => {
                  const resolved = resolveTag(tag)
                  const alreadyAdded = tag.trim() && existingTags.has(tag.trim().startsWith('@') ? tag.trim() : `@${tag.trim()}`)
                  return (
                    <div key={i}>
                      <div className='flex items-center gap-2'>
                        <input
                          type='text'
                          value={tag}
                          onChange={(e) => {
                            const next = [...tags]
                            next[i] = e.target.value
                            setTags(next)
                          }}
                          placeholder='@giftseon_tag'
                          className='form-input'
                        />
                        {tags.length > 1 && (
                          <button type='button' onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className='text-grey-400 hover:text-error-500'>
                            <Trash2 className='h-4 w-4' />
                          </button>
                        )}
                      </div>
                      {tag.trim() && (
                        alreadyAdded ? (
                          <p className='mt-1 text-xs text-warning-500'>This tag has already been added.</p>
                        ) : resolved ? (
                          <p className='mt-1 flex items-center gap-1 text-xs text-success-500'>
                            <CheckCircle2 className='h-3.5 w-3.5' /> Found: {resolved.name} &bull; {resolved.phone} &bull; {resolved.email}
                          </p>
                        ) : (
                          <p className='mt-1 text-xs text-grey-400'>Not found — {tag} will get an onboarding invite instead.</p>
                        )
                      )}
                    </div>
                  )
                })}
              </div>
              {tagErrors.tags && <p className='text-xs text-error-500'>{tagErrors.tags}</p>}

              <button
                type='button'
                onClick={() => setTags([...tags, ''])}
                className='flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-primary-600'
              >
                <Plus className='h-4 w-4' /> Add another tag
              </button>

              <div className='grid grid-cols-3 gap-4 border-t border-grey-100 pt-5'>
                <FormField label='Department' error={tagErrors.department}>
                  <select value={tagDept} onChange={(e) => setTagDept(e.target.value)} className={`form-input ${tagErrors.department ? 'border-error-400' : ''}`}>
                    <option value=''>Select</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </FormField>
                <FormField label='Role' error={tagErrors.role}>
                  <input type='text' value={tagRole} onChange={(e) => setTagRole(e.target.value)} placeholder='Role' className={`form-input ${tagErrors.role ? 'border-error-400' : ''}`} />
                </FormField>
                <FormField label='Date of Joining' error={tagErrors.dateOfJoining}>
                  <input type='date' value={tagJoinDate} onChange={(e) => setTagJoinDate(e.target.value)} className={`form-input ${tagErrors.dateOfJoining ? 'border-error-400' : ''}`} />
                </FormField>
              </div>

              <button
                type='button'
                onClick={handleTagsSubmit}
                className='w-full rounded-xl py-3 text-sm font-medium text-white transition-all'
                style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
              >
                Add Employees
              </button>
            </div>
          )}
        </div>
      </div>

      <SuccessModal
        open={showSuccess}
        onClose={() => { setShowSuccess(false); router.push('/employees') }}
        message={successMessage}
      />
    </div>
  )
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className='space-y-1.5'>
      <label className='block text-sm font-medium text-blackish'>{label}</label>
      {children}
      {error && <p className='text-xs text-error-500'>{error}</p>}
    </div>
  )
}
