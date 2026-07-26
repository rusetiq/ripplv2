import { useApp } from '../App'
import { Flame, Waves } from 'lucide-react'

export function StatusBar() {
  const { points, streak, level } = useApp()

  return (
    <div className="relative z-10 flex items-center justify-between px-5 pt-3 pb-2">
      <div className="flex items-center gap-3">
        <Waves size={20} className="text-oasis-400" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-base tracking-[0.08em] text-text-primary leading-none">RIPPL</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="font-mono text-[9px] text-oasis-400 font-medium">Lvl {level}</span>
            <span className="font-mono text-[9px] text-text-muted">• {points.toLocaleString()} pts</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-surface-raised/80 backdrop-blur-sm rounded-full px-2.5 py-1 border border-border">
          <Flame size={11} className="text-ember-400" />
          <span className="font-mono text-[10px] text-ember-400 font-medium">{streak}</span>
        </div>
      </div>
    </div>
  )
}
