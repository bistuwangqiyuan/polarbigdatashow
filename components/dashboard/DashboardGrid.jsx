'use client'

export default function DashboardGrid({ children, cols = 12, gap = 6 }) {
  return (
    <div 
      className="grid h-full"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: `${gap * 4}px`
      }}
    >
      {children}
    </div>
  )
}

export function GridItem({ children, colSpan = 1, rowSpan = 1, className = '' }) {
  return (
    <div 
      className={`${className}`}
      style={{
        gridColumn: `span ${colSpan} / span ${colSpan}`,
        gridRow: `span ${rowSpan} / span ${rowSpan}`
      }}
    >
      {children}
    </div>
  )
}