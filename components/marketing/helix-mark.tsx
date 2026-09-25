export function HelixMark({ size = 18, light = false }: { size?: number; light?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M7 3c0 6 10 6 10 12s-10 3-10 6" stroke="#34E0A1" />
      <path d="M17 3c0 6-10 6-10 12s10 3 10 6" stroke={light ? '#fff' : '#38C6E0'} />
      {size > 16 ? <path d="M9 7.5h6M9 16.5h6" stroke="#9AA3B2" strokeWidth="1.5" /> : null}
    </svg>
  )
}
