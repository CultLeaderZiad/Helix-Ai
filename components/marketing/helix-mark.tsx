export function HelixMark({ size = 24, className }: { size?: number; light?: boolean; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 200 210"
      fill="currentColor"
      aria-hidden
    >
      <path d="M52 4 L52 86 L42 94 L42 168 L4 198 L4 32 Z" />
      <path d="M196 28 L196 178 L158 208 L158 92 L148 84 L148 4 Z" />
      <path d="M58 98 L138 48 L138 78 L58 128 Z" />
    </svg>
  )
}
