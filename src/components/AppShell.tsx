import { type ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { StatusBar } from './StatusBar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full max-w-[430px] mx-auto overflow-hidden bg-surface flex flex-col sm:max-w-full sm:mx-0 sm:max-h-dvh sm:rounded-none">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-oasis-500/[0.04] blur-[100px]" />
        <div className="absolute top-1/2 -left-40 w-72 h-72 rounded-full bg-gulf-500/[0.03] blur-[80px]" />
        <div className="absolute -bottom-20 right-0 w-60 h-60 rounded-full bg-dune-400/[0.03] blur-[80px]" />
      </div>
      <StatusBar />
      <main className="relative flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
