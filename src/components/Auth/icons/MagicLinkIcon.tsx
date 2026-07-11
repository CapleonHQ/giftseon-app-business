const MagicLinkIcon = ({ className = 'h-10 w-10' }: { className?: string }) => (
  <svg viewBox='0 0 48 48' fill='none' className={className}>
    {/* Envelope body */}
    <rect x='6' y='14' width='36' height='24' rx='3' fill='#a6dae8' />
    {/* Envelope flap */}
    <path d='M6 17L24 30L42 17' stroke='#769ba5' strokeWidth='2' fill='none' />
    {/* Magic sparkles */}
    <circle cx='36' cy='10' r='2' fill='#c9830c' />
    <circle cx='42' cy='14' r='1.5' fill='#e4a63d' />
    <path d='M38 6L39 9L42 8L39 9L40 12L39 9L36 10L39 9Z' fill='#c9830c' />
  </svg>
)

export default MagicLinkIcon
