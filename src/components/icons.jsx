/* A single, consistent icon language: 24px grid, 1.6px stroke, round joins. */

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
}

export const PlayIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor" stroke="none" />
  </svg>
)

export const ArrowRight = (p) => (
  <svg {...base} {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
)

export const ArrowUpRight = (p) => (
  <svg {...base} {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

export const ArrowDown = (p) => (
  <svg {...base} {...p}>
    <path d="M12 4v16M6 14l6 6 6-6" />
  </svg>
)

export const ArrowLeft = (p) => (
  <svg {...base} {...p}>
    <path d="M20 12H4M10 6l-6 6 6 6" />
  </svg>
)

export const ReadingIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 6.7C10.1 5 7.4 4.3 4 4.6v13.1c3.4-.3 6.1.4 8 2.1 1.9-1.7 4.6-2.4 8-2.1V4.6c-3.4-.3-6.1.4-8 2.1Z" />
    <path d="M12 6.7v13.1M7.5 8.8h1.8M7.5 12h1.8M14.7 8.8h1.8M14.7 12h1.8" />
  </svg>
)

export const SendIcon = (p) => (
  <svg {...base} {...p}>
    <path d="m21 3-7.2 18-3.3-7.5L3 10.2 21 3Z" />
    <path d="M10.5 13.5 15 9" />
  </svg>
)

export const GaugeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4.2 18a8.5 8.5 0 1 1 15.6 0" />
    <path d="m12 12 3.6-2.5M6.3 18h11.4" />
    <circle cx="12" cy="12" r="1" />
  </svg>
)

export const ChevronLeft = (p) => (
  <svg {...base} {...p}>
    <path d="m15 5-7 7 7 7" />
  </svg>
)

export const ChevronRight = (p) => (
  <svg {...base} {...p}>
    <path d="m9 5 7 7-7 7" />
  </svg>
)

export const CloseIcon = (p) => (
  <svg {...base} {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
)

export const MenuIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 8h16M4 16h16" />
  </svg>
)

export const SoundOnIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 9.5h3l4-3.5v12l-4-3.5H4v-5Z" />
    <path d="M15 9.2a4 4 0 0 1 0 5.6M17.8 6.6a7.6 7.6 0 0 1 0 10.8" />
  </svg>
)

export const SoundOffIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 9.5h3l4-3.5v12l-4-3.5H4v-5Z" />
    <path d="m15.5 9.5 5 5M20.5 9.5l-5 5" />
  </svg>
)

export const SunIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
  </svg>
)

export const MoonIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20.2 14.4A8.2 8.2 0 0 1 9.6 3.8 8.4 8.4 0 1 0 20.2 14.4Z" />
  </svg>
)

export const MailIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
)

export const GitHubIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M9 19.2c-4 .9-4-2.1-5.5-2.6M15 21v-3.1a2.7 2.7 0 0 0-.8-2.1c2.6-.3 5.3-1.3 5.3-5.9a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.4-3.5 1.3a12 12 0 0 0-6.3 0C5.8 2.8 4.8 3.2 4.8 3.2a4.2 4.2 0 0 0-.1 3.2 4.6 4.6 0 0 0-1.3 3.3c0 4.5 2.7 5.5 5.3 5.8A2.7 2.7 0 0 0 8 17.4V21" />
  </svg>
)

export const InstagramIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.6" />
    <circle cx="12" cy="12" r="4.1" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
)

export const FacebookIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M14.6 21v-7.1h2.5l.4-2.9h-2.9V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.2a20 20 0 0 0-2.2-.1c-2.2 0-3.7 1.3-3.7 3.8V11H9v2.9h2.6V21" />
  </svg>
)

export const LinkedInIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
    <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
  </svg>
)

export const DownloadIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
  </svg>
)

export const CalendarIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
    <path d="M3.5 9.5h17M8 2.8V6M16 2.8V6M8 13h2M14 13h2M8 17h2" />
  </svg>
)

export const MapPinIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

export const CheckIcon = (p) => (
  <svg {...base} {...p}>
    <path d="m4.5 12 5 5 10-10" />
  </svg>
)

export const CopyIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="8" y="8" width="12" height="12" rx="1.5" />
    <path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" />
  </svg>
)

export const CompassIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m15.8 8.2-2.2 5.3-5.4 2.3 2.2-5.4 5.4-2.2Z" />
  </svg>
)

export const RoadIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M7 21 10.5 3M17 21 13.5 3M12 5v3M12 11v3M12 17v3" />
  </svg>
)

export const PlusIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 4v16M4 12h16" />
  </svg>
)

export const MinusIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 12h16" />
  </svg>
)

export const QuoteIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M5 11h5v7H3v-5c0-3.5 1-5.5 4-7M16 11h5v7h-7v-5c0-3.5 1-5.5 4-7" />
  </svg>
)

/* ------------------------------------------------------------------- brand */

export function BrandMark({ size = 34, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="4" fill="currentColor" />
      <circle cx="27.7" cy="13" r="5.4" fill="#d89a62" />
      <path d="M0 30.5c8.7-6.5 16.2-5.8 23.3-2.1 6.4 3.4 11.1 4.2 16.7 1.4V40H0Z" fill="#314b40" />
      <path d="M20 40 17.7 29h4.6L20 40Z" fill="#f0e9db" />
      <path d="M13 40 19 28h2L16 40Zm10.5 0L18.5 28h2l5.7 12Z" fill="#d6cab8" opacity=".55" />
      <path d="M8.4 36.2h23.2" stroke="#d89a62" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Wordmark({ compact = false }) {
  return (
    <span className="wordmark">
      <BrandMark />
      <span className="wordmark__type">
        <span className="wordmark__name">Samrat</span>
        {!compact && <span className="wordmark__role">Front-end developer</span>}
      </span>
    </span>
  )
}
