import { Component, type ReactNode } from 'react'

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() { return { failed: true } }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main role="alert" className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-surface p-6 text-center text-text-primary">
        <h1 className="text-xl">Something could not load</h1>
        <p className="max-w-sm text-sm text-text-muted">Refresh to get the latest version of Rippl and try again.</p>
        <button className="rounded-full bg-oasis-400 px-6 py-3 text-surface" onClick={() => window.location.reload()}>reload rippl</button>
      </main>
    )
  }
}
