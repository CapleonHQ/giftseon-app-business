import EmployeeOnboardingContent from '@/components/Onboarding/EmployeeOnboardingContent'

export default async function OnboardPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  return <EmployeeOnboardingContent token={token} />
}
