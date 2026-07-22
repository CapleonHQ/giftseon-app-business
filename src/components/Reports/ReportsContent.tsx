'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Gift, Clock3, CheckCircle2, Truck, Download, Radio } from 'lucide-react'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import StatCard from '@/components/Dashboard/StatCard'
import RequireEmployeesGate from '@/components/Dashboard/RequireEmployeesGate'
import DeliveryTrackerModal from '@/components/Tracking/DeliveryTrackerModal'
import { useEmployees } from '@/context/EmployeesContext'
import { useGifting } from '@/context/GiftingContext'
import { getReportsOverview, getSpendByMonth, getOccasionBreakdown, getCampaignRedemptions } from '@/lib/api/reports'
import { getDeliveries } from '@/lib/api/tracking'
import type { PhysicalDelivery } from '@/types/Tracking'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const BREAKDOWN_TABS = ['Occasion Type', 'Employee', 'Month', 'Budget Consumed'] as const
type BreakdownTab = (typeof BREAKDOWN_TABS)[number]

const STATUS_STYLES: Record<string, string> = {
  Delivered: 'bg-success-50 text-success-500',
  'Out for Delivery': 'bg-information-50 text-information-500',
  'In Transit': 'bg-information-50 text-information-500',
  Dispatched: 'bg-warning-50 text-warning-500',
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
  const [trackedDelivery, setTrackedDelivery] = useState<PhysicalDelivery | null>(null)

  const { data: overview } = useQuery({ queryKey: ['reports-overview'], queryFn: getReportsOverview })
  const { data: spendByMonth = [] } = useQuery({ queryKey: ['reports-spend-by-month'], queryFn: getSpendByMonth })
  const { data: occasionBreakdown = [] } = useQuery({
    queryKey: ['reports-occasion-breakdown'],
    queryFn: getOccasionBreakdown,
  })
  const { data: campaigns = [] } = useQuery({
    queryKey: ['reports-campaign-redemptions'],
    queryFn: getCampaignRedemptions,
  })
  const { data: deliveries = [] } = useQuery({ queryKey: ['deliveries'], queryFn: getDeliveries })

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

  const occasionRows = occasionBreakdown.map((o) => ({ label: o.occasion, gifts: o.count, spend: o.spend }))

  const chartData = {
    labels: spendByMonth.map((s) => s.month),
    datasets: [
      {
        label: 'Gifting spend (₦)',
        data: spendByMonth.map((s) => s.amount),
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
        ...spendByMonth.map((r) => [r.month, r.amount]),
      ])
    } else if (breakdownTab === 'Budget Consumed') {
      downloadCsv('gifting-report-by-rule.csv', [
        ['Gifting Rule', 'Active', 'Budget (NGN)'],
        ...rules.map((r) => [r.label, r.enabled ? 1 : 0, r.budget]),
      ])
    } else {
      downloadCsv('gifting-report-by-occasion.csv', [
        ['Occasion Type', 'Gifts Sent', 'Total Spend (NGN)'],
        ...occasionRows.map((r) => [r.label, r.gifts, r.spend]),
      ])
    }
  }

  return (
    <>
    <div className='flex flex-col'>
      <DashboardHeader title='Reports' />
      <div className='p-6 lg:p-8'>
      <RequireEmployeesGate pageLabel='Reports'>
      <div className='space-y-6'>
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <StatCard label='Total sent' value={String(overview?.giftsSent ?? 0)} icon={<Gift className='h-4 w-4 text-primary-500' />} />
          <StatCard label='Pending' value={String(overview?.giftsPending ?? 0)} icon={<Clock3 className='h-4 w-4 text-warning-500' />} iconBg='bg-warning-50' />
          <StatCard label='Claimed' value={String(overview?.giftsClaimed ?? 0)} icon={<CheckCircle2 className='h-4 w-4 text-information-500' />} iconBg='bg-information-50' />
          <StatCard label='Employees onboarded' value={String(overview?.employeesOnboarded ?? 0)} icon={<Truck className='h-4 w-4 text-success-500' />} iconBg='bg-success-50' />
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
                    : occasionRows
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
                  {breakdownTab === 'Occasion Type' && occasionRows.length === 0 && (
                    <tr><td colSpan={3} className='py-6 text-center text-xs text-grey-400'>No gifts sent yet.</td></tr>
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
              {deliveries.length === 0 ? (
                <p className='py-6 text-center text-xs text-grey-400'>No physical gifts in transit.</p>
              ) : (
                deliveries.map((d) => (
                  <div key={d.id} className='rounded-lg border border-grey-100 p-3.5'>
                    <div className='flex items-center justify-between'>
                      <p className='text-sm font-medium text-blackish'>{d.employee}</p>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[d.status]}`}>{d.status}</span>
                    </div>
                    <p className='mt-1 text-xs text-grey-400'>{d.item}</p>
                    <button
                      onClick={() => setTrackedDelivery(d)}
                      className='mt-1.5 flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600'
                    >
                      <Radio className='h-3 w-3' /> Track in real time
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Voucher redemption + profile completion */}
          <div className='space-y-6'>
            <div className='rounded-xl border border-grey-100 bg-white p-5'>
              <p className='text-sm font-semibold text-blackish'>Voucher Redemption Rate by Campaign</p>
              <div className='mt-3 space-y-4'>
                {campaigns.length === 0 && (
                  <p className='py-4 text-center text-xs text-grey-400'>No campaigns fired yet.</p>
                )}
                {campaigns.map((c) => {
                  const pct = c.sent > 0 ? Math.round((c.redeemed / c.sent) * 100) : 0
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
      </RequireEmployeesGate>
      </div>
    </div>

    <DeliveryTrackerModal delivery={trackedDelivery} onClose={() => setTrackedDelivery(null)} />
    </>
  )
}
