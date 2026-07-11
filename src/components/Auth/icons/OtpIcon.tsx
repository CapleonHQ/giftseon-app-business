const OtpIcon = ({ className = 'h-10 w-10' }: { className?: string }) => (
  <svg viewBox='0 0 48 48' fill='none' className={className}>
    {/* Lock body */}
    <rect x='14' y='22' width='20' height='16' rx='3' fill='#9696e0' />
    {/* Lock shackle */}
    <path d='M18 22V17C18 13.69 20.69 11 24 11C27.31 11 30 13.69 30 17V22' stroke='#4848c9' strokeWidth='2.5' strokeLinecap='round' fill='none' />
    {/* Keyhole */}
    <circle cx='24' cy='29' r='2.5' fill='white' />
    <rect x='23' y='30' width='2' height='4' rx='1' fill='white' />
    {/* Dots representing OTP */}
    <circle cx='12' cy='44' r='2.5' fill='#c9830c' />
    <circle cx='20' cy='44' r='2.5' fill='#c9830c' />
    <circle cx='28' cy='44' r='2.5' fill='#c9830c' />
    <circle cx='36' cy='44' r='2.5' fill='#c9830c' />
  </svg>
)

export default OtpIcon
