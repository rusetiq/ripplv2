import { motion } from 'framer-motion'

export function SkeletonLine({ width = '100%', height = 12, className = '' }: { width?: string | number; height?: string | number; className?: string }) {
  return (
    <div
      className={`rounded-md bg-surface-overlay/60 animate-pulse ${className}`}
      style={{ width, height }}
    />
  )
}

export function SkeletonCircle({ size = 36, className = '' }) {
  return (
    <div
      className={`rounded-full bg-surface-overlay/60 animate-pulse shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-surface-raised/40 rounded-2xl border border-border p-4 space-y-3 ${className}`}
    >
      <div className="flex items-start gap-3">
        <SkeletonCircle size={36} />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="40%" height={14} />
          <SkeletonLine width="100%" height={10} />
          <SkeletonLine width="60%" height={10} />
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <SkeletonLine width={60} height={10} className="rounded-full" />
        <SkeletonLine width={50} height={10} className="rounded-full" />
      </div>
      <div className="flex justify-between pt-2 border-t border-border">
        <SkeletonLine width={40} height={10} />
        <SkeletonLine width={40} height={10} />
        <SkeletonLine width={40} height={10} />
      </div>
    </motion.div>
  )
}

export function SkeletonMetricCard() {
  return (
    <div className="bg-surface-raised/30 rounded-xl border border-border p-3 flex flex-col items-center gap-2">
      <SkeletonCircle size={24} />
      <SkeletonLine width={40} height={16} />
      <SkeletonLine width={50} height={8} />
      <SkeletonLine width={30} height={8} />
    </div>
  )
}

export function SkeletonBadgeCard() {
  return (
    <div className="bg-surface-raised/30 rounded-xl border border-border p-3 flex flex-col items-center gap-2">
      <SkeletonCircle size={32} />
      <SkeletonLine width="80%" height={8} />
    </div>
  )
}

export function SkeletonRow({ hasAvatar = true }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-raised/20">
      {hasAvatar && <SkeletonCircle size={32} />}
      <div className="flex-1 space-y-1.5">
        <SkeletonLine width="35%" height={12} />
        <SkeletonLine width="20%" height={10} />
      </div>
      <SkeletonLine width={40} height={10} />
    </div>
  )
}

export function SkeletonBarChart() {
  return (
    <div className="flex items-end justify-between gap-2 h-24">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${[40, 70, 30, 90, 60, 50, 80][i]}%` }}
            transition={{ delay: i * 0.08 }}
            className="w-full rounded-md bg-surface-overlay/50"
          />
          <SkeletonLine width={12} height={8} />
        </div>
      ))}
    </div>
  )
}
