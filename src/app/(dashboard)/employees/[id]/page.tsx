'use client'

import { useParams, useRouter } from 'next/navigation'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import EmployeeProfileDrawer from '@/components/Employees/EmployeeProfileDrawer'
import { useEmployees } from '@/context/EmployeesContext'

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { getEmployee } = useEmployees()
  const employee = getEmployee(params.id) || null

  return (
    <div className='flex flex-col'>
      <DashboardHeader title='Employee Profile' />
      <div className='p-6 lg:p-8'>
        {!employee ? (
          <div className='flex flex-col items-center justify-center rounded-xl border border-grey-100 bg-white py-24'>
            <p className='text-sm font-semibold text-blackish'>Employee not found</p>
            <p className='mt-1 text-xs text-grey-400'>This employee may have been removed.</p>
          </div>
        ) : (
          <p className='text-sm text-grey-500'>Loading profile for {employee.name}…</p>
        )}
      </div>
      <EmployeeProfileDrawer employee={employee} onClose={() => router.push('/employees')} />
    </div>
  )
}
