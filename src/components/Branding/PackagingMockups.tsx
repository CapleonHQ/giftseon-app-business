'use client'

interface MockupProps {
  brandColor: string
  logo?: string
  companyName: string
}

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('') || 'GX'

const shade = (hex: string, amount: number) => {
  const clean = hex.replace('#', '')
  const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return `rgb(${r}, ${g}, ${b})`
}

function LogoMark({ logo, companyName, size = 30 }: { logo?: string; companyName: string; size?: number }) {
  if (logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt='' width={size} height={size} className='rounded-full object-cover' style={{ width: size, height: size }} />
  }
  return (
    <div
      className='flex items-center justify-center rounded-full bg-white/90 font-bold text-blackish'
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(companyName)}
    </div>
  )
}

function Stage({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className='flex flex-col items-center'>
      <div className='flex h-40 w-full items-end justify-center rounded-xl bg-gradient-to-b from-grey-50 to-grey-100 pb-2'>
        <div className='relative' style={{ filter: 'drop-shadow(0 10px 8px rgba(18,18,18,0.18))' }}>
          {children}
          <div className='mx-auto mt-1 h-2 w-16 rounded-full bg-black/10 blur-[2px]' />
        </div>
      </div>
      <p className='mt-2 text-xs font-medium text-grey-500'>{label}</p>
    </div>
  )
}

export function BoxMockup({ brandColor, logo, companyName }: MockupProps) {
  const top = shade(brandColor, 40)
  const side = shade(brandColor, -35)
  return (
    <Stage label='Gift Box'>
      <svg width='104' height='96' viewBox='0 0 104 96'>
        <polygon points='16,28 88,28 72,10 32,10' fill={top} />
        <polygon points='72,10 88,28 88,84 72,66' fill={side} />
        <rect x='16' y='28' width='56' height='56' fill={brandColor} />
        <rect x='40' y='10' width='8' height='74' fill='rgba(255,255,255,0.85)' />
        <polygon points='32,10 48,10 40,28 16,28' fill='rgba(255,255,255,0.85)' />
        <rect x='16' y='53' width='56' height='6' fill='rgba(255,255,255,0.85)' />
        <polygon points='72,10 88,28 80,28 64,10' fill='rgba(255,255,255,0.6)' />
        <foreignObject x='30' y='36' width='28' height='28'>
          <div className='flex h-full w-full items-center justify-center'>
            <LogoMark logo={logo} companyName={companyName} size={26} />
          </div>
        </foreignObject>
      </svg>
    </Stage>
  )
}

export function BottleMockup({ brandColor, logo, companyName }: MockupProps) {
  const bodyLight = shade(brandColor, 25)
  return (
    <Stage label='Water Bottle'>
      <svg width='60' height='104' viewBox='0 0 60 104'>
        <rect x='24' y='2' width='12' height='10' rx='2' fill='#5b7880' />
        <rect x='21' y='10' width='18' height='8' rx='2' fill='#87817f' />
        <path d='M18 18 C18 14 22 12 30 12 C38 12 42 14 42 18 L46 30 C48 34 48 38 48 42 L48 92 C48 98 44 102 30 102 C16 102 12 98 12 92 L12 42 C12 38 12 34 14 30 Z' fill={bodyLight} />
        <path d='M18 18 C18 14 22 12 30 12 L30 102 C16 102 12 98 12 92 L12 42 C12 38 12 34 14 30 Z' fill='rgba(255,255,255,0.28)' />
        <rect x='12' y='46' width='36' height='30' fill={brandColor} />
        <rect x='12' y='46' width='36' height='2.5' fill='rgba(255,255,255,0.7)' />
        <rect x='12' y='73.5' width='36' height='2.5' fill='rgba(255,255,255,0.7)' />
        <foreignObject x='11' y='51' width='38' height='20'>
          <div className='flex h-full w-full items-center justify-center'>
            <LogoMark logo={logo} companyName={companyName} size={18} />
          </div>
        </foreignObject>
      </svg>
    </Stage>
  )
}

export function HoodieMockup({ brandColor, logo, companyName }: MockupProps) {
  const shadow = shade(brandColor, -30)
  return (
    <Stage label='Hoodie'>
      <svg width='108' height='100' viewBox='0 0 108 100'>
        <path d='M54 4 C44 4 38 12 38 20 C24 22 16 30 14 44 L8 62 L22 68 L28 52 L28 96 L80 96 L80 52 L86 68 L100 62 L94 44 C92 30 84 22 70 20 C70 12 64 4 54 4 Z' fill={brandColor} />
        <path d='M38 20 C38 12 44 4 54 4 C64 4 70 12 70 20 C70 20 60 28 54 28 C48 28 38 20 38 20 Z' fill={shadow} />
        <path d='M28 52 L28 96 L36 96 L36 58 Z' fill='rgba(0,0,0,0.08)' />
        <path d='M80 52 L80 96 L72 96 L72 58 Z' fill='rgba(0,0,0,0.08)' />
        <line x1='50' y1='30' x2='47' y2='44' stroke='rgba(255,255,255,0.8)' strokeWidth='2' strokeLinecap='round' />
        <line x1='58' y1='30' x2='61' y2='44' stroke='rgba(255,255,255,0.8)' strokeWidth='2' strokeLinecap='round' />
        <foreignObject x='40' y='46' width='28' height='28'>
          <div className='flex h-full w-full items-center justify-center'>
            <LogoMark logo={logo} companyName={companyName} size={24} />
          </div>
        </foreignObject>
      </svg>
    </Stage>
  )
}

export function BookMockup({ brandColor, logo, companyName }: MockupProps) {
  const spine = shade(brandColor, -35)
  const pageEdge = '#f3f2f2'
  return (
    <Stage label='Notebook'>
      <svg width='90' height='100' viewBox='0 0 90 100'>
        <rect x='10' y='6' width='74' height='90' rx='3' fill={pageEdge} />
        <rect x='6' y='4' width='70' height='92' rx='4' fill={brandColor} />
        <rect x='6' y='4' width='10' height='92' rx='4' fill={spine} />
        <rect x='14' y='4' width='2' height='92' fill='rgba(0,0,0,0.12)' />
        <rect x='6' y='4' width='70' height='6' fill='rgba(255,255,255,0.18)' />
        <foreignObject x='26' y='34' width='34' height='34'>
          <div className='flex h-full w-full flex-col items-center justify-center gap-1.5'>
            <LogoMark logo={logo} companyName={companyName} size={26} />
          </div>
        </foreignObject>
      </svg>
    </Stage>
  )
}

export default function PackagingGallery({ brandColor, logo, companyName, dimmed }: MockupProps & { dimmed?: boolean }) {
  return (
    <div className={`grid grid-cols-2 gap-3 transition-all sm:grid-cols-4 ${dimmed ? 'opacity-40 grayscale' : ''}`}>
      <BoxMockup brandColor={brandColor} logo={logo} companyName={companyName} />
      <BottleMockup brandColor={brandColor} logo={logo} companyName={companyName} />
      <HoodieMockup brandColor={brandColor} logo={logo} companyName={companyName} />
      <BookMockup brandColor={brandColor} logo={logo} companyName={companyName} />
    </div>
  )
}
