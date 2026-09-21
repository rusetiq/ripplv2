import { Fragment, type ReactNode } from 'react'

export function AccountBoundary({ accountId, children }: { accountId: string | null; children: ReactNode }) {
  return <Fragment key={accountId ?? 'signed-out'}>{children}</Fragment>
}
