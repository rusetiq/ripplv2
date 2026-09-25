import './DotLoader.css'

export function DotLoader({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={`rippl-loader ${className}`} width={size} height={size} viewBox="-5 -5 36 36" fill="currentColor" aria-hidden="true">
      <g>
        {[[13, 1], [13, 1], [25, 25], [13, 13], [13, 13], [25, 13], [1, 25], [13, 25], [25, 25]].map(([cx, cy], index) => (
          <circle key={index} className="rippl-loader-dot" cx={cx} cy={cy} r="4" />
        ))}
      </g>
    </svg>
  )
}
