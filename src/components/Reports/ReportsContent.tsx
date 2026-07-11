'use client'

import { useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Gift, Clock3, CheckCircle2, Truck, XCircle, Download } from 'lucide-react'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import StatCard from '@/components/Dashboard/StatCard'
import { useEmployees } from '@/context/EmployeesContext'
import { useGifting } from '@/context/GiftingContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const SPEND_BY_MONTH = [
  { month: 'Feb', amount: 180000 },
  { month: 'Mar', amount: 220000 },
  { month: 'Apr', amount: 165000 },
  { month: 'May', amount: 310000 },
  { month: 'Jun', amount: 275000 },
  { month: 'Jul', amount: 195000 },
]

const CAMPAIGNS = [
  { id: 'camp-1', campaign: 'Birthday Gift — July Cohort', occasion: 'birthday', sent: 14, redeemed: 11 },
  { id: 'camp-2', campaign: 'Work Anniversary Q2', occasion: 'work_anniversary', sent: 8, redeemed: 8 },
  { id: 'camp-3', campaign: 'Performance Bonus H1', occasion: 'performance_bonus', sent: 5, redeemed: 3 },
  { id: 'camp-4', campaign: 'Welcome Pack — New Hires', occasion: 'welcome', sent: 6, redeemed: 4 },
]

const PHYSICAL_DELIVERIES = [
  { id: 'del-1', employee: 'Chinedu Balogun', item: 'Welcome Onboarding Pack', status: 'In Transit', trackingUrl: 'https://track.giftseon.com/GB-2381' },
  { id: 'del-2', employee: 'Tobi Fashola', item: 'Custom Gift Pack', status: 'Delivered', trackingUrl: 'https://track.giftseon.com/GB-2290' },
  { id: 'del-3', employee: 'Ibrahim Suleiman', item: 'Compensation Voucher Pack', status: 'Processing', trackingUrl: 'https://track.giftseon.com/GB-2402' },
]

const BREAKDOWN_TABS = ['Occasion Type', 'Employee', 'Month', 'Budget Consumed'] as const
type BreakdownTab = (typeof BREAKDOWN_TABS)[number]

const OCCASION_BREAKDOWN = [
  { label: 'Birthday Gift', gifts: 18, spend: 320000 },
  { label: 'Work Anniversary', gifts: 9, spend: 210000 },
  { label: 'Performance Bonus', gifts: 5, spend: 400000 },
  { label: 'Welcome / Onboarding', gifts: 6, spend: 90000 },
  { label: 'Compensation', gifts: 3, spend: 150000 },
]

const STATUS_STYLES: Record<string, string> = {
  Delivered: 'bg-success-50 text-success-500',
  'In Transit': 'bg-information-50 text-information-500',
  Processing: 'bg-warning-50 text-warning-500',
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function ReportsContent() {
  const { employees } = useEmployees()
  const { rules } = useGifting()
  const [breakdownTab, setBreakdownTab] = useState<BreakdownTab>('Occasion Type')

  const completionRate = useMemo(() => {
    if (employees.length === 0) return 0
    return Math.round((employees.filter((e) => e.profileCompletion === 'Complete').length / employees.length) * 100)
  }, [employees])

  const employeeBreakdown = useMemo(
    () =>
      employees
        .filter((e) => e.giftHistory.length > 0)
        .map((e) => ({
          label: e.name,
          gifts: e.giftHistory.length,
          spend: e.giftHistory.reduce((sum, g) => sum + g.amount, 0),
        })),
    [employees]
  )

  const chartData = {
    labels: SPEND_BY_MONTH.map((s) => s.month),
    datasets: [
      {
        label: 'Gifting spend (₦)',
        data: SPEND_BY_MONTH.map((s) => s.amount),
        backgroundColor: 'rgba(26, 26, 188, 0.6)',
        borderRadius: 6,
        maxBarThickness: 36,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        ticks: { callback: (value: string | number) => `₦${Number(value).toLocaleString()}` },
        grid: { color: '#f3f2f2' },
      },
      x: { grid: { display: false } },
    },
  }

  const handleExport = () => {
    if (breakdownTab === 'Employee') {
      downloadCsv('gifting-report-by-employee.csv', [
        ['Employee', 'Gifts Sent', 'Total Spend (NGN)'],
        ...employeeBreakdown.map((r) => [r.label, r.gifts, r.spend]),
      ])
    } else if (breakdownTab === 'Month') {
      downloadCsv('gifting-report-by-month.csv', [
        ['Month', 'Spend (NGN)'],
        ...SPEND_BY_MONTH.map((r) => [r.month, r.amount]),
      ])
    } else {
      downloadCsv('gifting-report-by-occasion.csv', [
        ['Occasion Type', 'Gifts Sent', 'Total Spend (NGN)'],
        ...OCCASION_BREAKDOWN.map((r) => [r.label, r.gifts, r.spend]),
      ])
    }
  }

  return (
    <div className='flex flex-col'>
      <DashboardHeader title='Reports' />
      <div className='p-6 lg:p-8 space-y-6'>
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-5'>
          <StatCard label='Total sent' value='41' icon={<Gift className='h-4 w-4 text-primary-500' />} />
          <StatCard label='Pending' value='4' icon={<Clock3 className='h-4 w-4 text-warning-500' />} iconBg='bg-warning-50' />
          <StatCard label='Claimed' value='28' icon={<CheckCircle2 className='h-4 w-4 text-information-500' />} iconBg='bg-information-50' />
          <StatCard label='Delivered' value='35' icon={<Truck className='h-4 w-4 text-success-500' />} iconBg='bg-success-50' />
          <StatCard label='Failed' value='2' icon={<XCircle className='h-4 w-4 text-error-500' />} iconBg='bg-error-50' />
        </div>

        <div className='rounded-xl border border-grey-100 bg-white p-5'>
          <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
            <p className='text-sm font-semibold text-blackish'>Gifting Breakdown</p>
            <div className='flex flex-wrap gap-1 rounded-lg bg-grey-50 p-1'>
              {BREAKDOWN_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBreakdownTab(tab)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    breakdownTab === tab ? 'bg-white text-primary-500 shadow-sm' : 'text-grey-500 hover:text-blackish'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {breakdownTab === 'Month' ? (
            <div className='h-64'>
              <Bar data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-sm'>
                <thead>
                  <tr className='border-b border-grey-100 text-xs text-grey-400'>
                    <th className='py-2.5 pr-3 font-medium'>{breakdownTab}</th>
                    <th className='py-2.5 px-3 font-medium'>Gifts Sent</th>
                    <th className='py-2.5 pl-3 font-medium'>Total Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {(breakdownTab === 'Employee' ? employeeBreakdown : breakdownTab === 'Budget Consumed'
                    ? rules.map((r) => ({ label: r.label, gifts: r.enabled ? 1 : 0, spend: r.budget }))
                    : OCCASION_BREAKDOWN
                  ).map((row) => (
                    <tr key={row.label} className='border-b border-grey-50'>
                      <td className='py-2.5 pr-3 text-blackish'>{row.label}</td>
                      <td className='py-2.5 px-3 text-grey-600'>{row.gifts}</td>
                      <td className='py-2.5 pl-3 text-blackish'>&#8358;{row.spend.toLocaleString()}</td>
                    </tr>
                  ))}
                  {breakdownTab === 'Employee' && employeeBreakdown.length === 0 && (
                    <tr><td colSpan={3} className='py-6 text-center text-xs text-grey-400'>No gifting activity recorded for employees yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={handleExport}
            className='mt-4 flex items-center gap-1.5 rounded-lg border border-grey-200 px-4 py-2 text-xs font-medium text-grey-600 hover:bg-grey-50 transition-colors'
          >
            <Download className='h-3.5 w-3.5' /> Export CSV
          </button>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Physical delivery tracking */}
          <div className='rounded-xl border border-grey-100 bg-white p-5'>
            <p className='text-sm font-semibold text-blackish'>Physical Gift Delivery Status</p>
            <div className='mt-3 space-y-3'>
              {PHYSICAL_DELIVERIES.map((d) => (
                <div key={d.id} className='rounded-lg border border-grey-100 p-3.5'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-medium text-blackish'>{d.employee}</p>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[d.status]}`}>{d.status}</span>
                  </div>
                  <p className='mt-1 text-xs text-grey-400'>{d.item}</p>
                  <a href={d.trackingUrl} target='_blank' rel='noreferrer' className='mt-1.5 inline-block text-xs font-medium text-primary-500 hover:text-primary-600 underline'>
                    Track in real time
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Voucher redemption + profile completion */}
          <div className='space-y-6'>
            <div className='rounded-xl border border-grey-100 bg-white p-5'>
              <p className='text-sm font-semibold text-blackish'>Voucher Redemption Rate by Campaign</p>
              <div className='mt-3 space-y-4'>
                {CAMPAIGNS.map((c) => {
                  const pct = Math.round((c.redeemed / c.sent) * 100)
                  return (
                    <div key={c.id}>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-grey-600'>{c.campaign}</span>
                        <span className='font-medium text-blackish'>{pct}% ({c.redeemed}/{c.sent})</span>
                      </div>
                      <div className='mt-1.5 h-2 w-full overflow-hidden rounded-full bg-grey-100'>
                        <div className='h-full rounded-full bg-primary-500' style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className='rounded-xl border border-grey-100 bg-white p-5'>
              <p className='text-sm font-semibold text-blackish'>Employee Profile Completion Rate</p>
              <div className='mt-3 flex items-center gap-4'>
                <div className='relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full' style={{
                  background: `conic-gradient(var(--primary-500) ${completionRate * 3.6}deg, var(--grey-100) 0deg)`,
                }}>
                  <div className='flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-blackish'>
                    {completionRate}%
                  </div>
                </div>
                <p className='text-xs text-grey-500'>
                  {employees.filter((e) => e.profileCompletion === 'Complete').length} of {employees.length} employees have completed their Giftseon profile, so gifts can be delivered without manual follow-up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
