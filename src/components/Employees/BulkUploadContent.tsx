'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileSpreadsheet, X, Download } from 'lucide-react'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import SuccessModal from '@/components/Profile/SuccessModal'
import { useEmployees, type NewEmployeeInput } from '@/context/EmployeesContext'

const EXPECTED_COLUMNS = ['Name', 'Phone', 'Email', 'Role', 'Department', 'Date of Joining', 'Date of Birth']

type ParsedRow = {
  name: string
  phone: string
  email: string
  role: string
  department: string
  dateOfJoining: string
  dateOfBirth: string
  error?: string
}

const parseCsv = (text: string): ParsedRow[] => {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return []
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const idx = (key: string) => header.findIndex((h) => h.includes(key))

  const nameIdx = idx('name')
  const phoneIdx = idx('phone')
  const emailIdx = idx('email')
  const roleIdx = idx('role')
  const deptIdx = idx('department')
  const joinIdx = idx('joining')
  const dobIdx = idx('birth')

  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim())
    const row: ParsedRow = {
      name: cells[nameIdx] || '',
      phone: cells[phoneIdx] || '',
      email: cells[emailIdx] || '',
      role: cells[roleIdx] || '',
      department: cells[deptIdx] || '',
      dateOfJoining: cells[joinIdx] || '',
      dateOfBirth: cells[dobIdx] || '',
    }
    if (!row.name || !row.email) {
      row.error = 'Missing required name or email'
    }
    return row
  })
}

const SAMPLE_CSV = `Name,Phone,Email,Role,Department,Date of Joining,Date of Birth
Amara Chukwu,08011122233,amara.chukwu@acme.com,Software Engineer,Engineering,2024-04-01,1995-02-14
Segun Adebayo,08022233344,segun.adebayo@acme.com,Sales Associate,Sales,2023-08-15,1993-07-22
`

export default function BulkUploadContent() {
  const router = useRouter()
  const { addEmployees } = useEmployees()
  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [parseError, setParseError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleFile = useCallback((file: File) => {
    setFileName(file.name)
    setParseError('')
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      const parsed = parseCsv(text)
      if (parsed.length === 0) {
        setParseError('We could not find any rows in this file. Make sure it has a header row and at least one employee.')
        setRows([])
        return
      }
      setRows(parsed)
    }
    reader.onerror = () => setParseError('Could not read this file. Please try again.')
    reader.readAsText(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] },
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted[0]) handleFile(accepted[0])
    },
  })

  const validRows = rows.filter((r) => !r.error)
  const invalidRows = rows.filter((r) => r.error)

  const handleReset = () => {
    setFileName(null)
    setRows([])
    setParseError('')
  }

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'giftseon-employee-template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleConfirmImport = () => {
    const inputs: NewEmployeeInput[] = validRows.map((r) => ({
      name: r.name,
      phone: r.phone,
      email: r.email,
      role: r.role || 'Not specified',
      department: r.department || 'Not specified',
      dateOfJoining: r.dateOfJoining || new Date().toISOString().slice(0, 10),
      dateOfBirth: r.dateOfBirth || '',
      source: 'spreadsheet',
    }))
    addEmployees(inputs)
    setSuccessMessage(
      `${inputs.length} employee${inputs.length === 1 ? '' : 's'} imported successfully${
        invalidRows.length > 0 ? `. ${invalidRows.length} row${invalidRows.length === 1 ? '' : 's'} were skipped due to missing data.` : '.'
      }`
    )
    setShowSuccess(true)
  }

  return (
    <div className='flex flex-col'>
      <DashboardHeader title='Upload Spreadsheet' />
      <div className='p-6 lg:p-8'>
        <div className='mx-auto max-w-3xl space-y-6'>
          <div className='rounded-xl border border-grey-100 bg-white p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-semibold text-blackish'>Import employees from a spreadsheet</p>
                <p className='mt-1 text-xs text-grey-500'>
                  Upload a CSV with columns: {EXPECTED_COLUMNS.join(', ')}.
                </p>
              </div>
              <button onClick={handleDownloadSample} className='flex items-center gap-1.5 rounded-lg border border-grey-200 px-3 py-2 text-xs font-medium text-grey-600 hover:bg-grey-50 transition-colors'>
                <Download className='h-3.5 w-3.5' /> Sample CSV
              </button>
            </div>

            {!fileName ? (
              <div
                {...getRootProps()}
                className={`mt-5 flex flex-col items-center rounded-lg border-2 border-dashed py-12 cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary-400 bg-primary-50/30' : 'border-grey-200 hover:border-primary-300'
                }`}
              >
                <input {...getInputProps()} />
                <UploadCloud className='mb-3 h-8 w-8 text-primary-400' />
                <p className='text-sm text-grey-600'>
                  <span className='font-medium text-primary-500'>Click to upload</span> or drag and drop your CSV file
                </p>
                <p className='mt-1 text-xs text-grey-400'>.csv up to 5MB</p>
              </div>
            ) : (
              <div className='mt-5 flex items-center justify-between rounded-lg border border-grey-200 bg-grey-50/50 px-4 py-3'>
                <div className='flex items-center gap-2 text-sm text-blackish'>
                  <FileSpreadsheet className='h-4 w-4 text-primary-500' />
                  {fileName}
                </div>
                <button onClick={handleReset} className='text-grey-400 hover:text-error-500'>
                  <X className='h-4 w-4' />
                </button>
              </div>
            )}

            {parseError && <p className='mt-3 text-xs text-error-500'>{parseError}</p>}
          </div>

          {rows.length > 0 && (
            <div className='rounded-xl border border-grey-100 bg-white'>
              <div className='flex items-center justify-between border-b border-grey-100 px-5 py-4'>
                <p className='text-sm font-semibold text-blackish'>Preview ({rows.length} rows)</p>
                <p className='text-xs text-grey-400'>{validRows.length} ready &bull; {invalidRows.length} need attention</p>
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full text-left text-sm'>
                  <thead>
                    <tr className='border-b border-grey-100 text-xs text-grey-400'>
                      <th className='px-5 py-3 font-medium'>Name</th>
                      <th className='px-3 py-3 font-medium'>Phone</th>
                      <th className='px-3 py-3 font-medium'>Email</th>
                      <th className='px-3 py-3 font-medium'>Role</th>
                      <th className='px-3 py-3 font-medium'>Department</th>
                      <th className='px-3 py-3 font-medium'>Joined</th>
                      <th className='px-3 py-3 font-medium'>DOB</th>
                      <th className='px-3 py-3 font-medium'>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className={`border-b border-grey-50 ${row.error ? 'bg-error-50/30' : ''}`}>
                        <td className='px-5 py-2.5 text-blackish'>{row.name || '—'}</td>
                        <td className='px-3 py-2.5 text-grey-600'>{row.phone || '—'}</td>
                        <td className='px-3 py-2.5 text-grey-600'>{row.email || '—'}</td>
                        <td className='px-3 py-2.5 text-grey-600'>{row.role || '—'}</td>
                        <td className='px-3 py-2.5 text-grey-600'>{row.department || '—'}</td>
                        <td className='px-3 py-2.5 text-grey-600'>{row.dateOfJoining || '—'}</td>
                        <td className='px-3 py-2.5 text-grey-600'>{row.dateOfBirth || '—'}</td>
                        <td className='px-3 py-2.5'>
                          {row.error ? (
                            <span className='inline-block rounded-full bg-error-50 px-2.5 py-0.5 text-xs font-medium text-error-500'>{row.error}</span>
                          ) : (
                            <span className='inline-block rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-500'>Ready</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className='flex gap-3 border-t border-grey-100 px-5 py-4'>
                <button onClick={handleReset} className='flex-1 rounded-lg border border-grey-200 py-2.5 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'>
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={validRows.length === 0}
                  className='flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-all disabled:opacity-50'
                  style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
                >
                  Import {validRows.length} employee{validRows.length === 1 ? '' : 's'}
                </button>
              </div>
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
