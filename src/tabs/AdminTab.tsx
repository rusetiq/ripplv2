import { motion } from 'framer-motion'
import { Shield, Mail, X, Gift, Plus, Trash2, ImageIcon, Link, Tag, Coins, ArrowUpDown } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../App'
import { api, ApiError } from '../api'
import { useLive } from '../useLive'
import { SPONSORED_LOCAL_FALLBACKS } from '../sponsoredImages'

interface AdminUser {
  uid: string
  displayName: string
  email: string
  isAdmin: boolean
}

interface SponsoredReward {
  id: string
  name: string
  subtitle: string
  href: string
  imageUrl: string
  points: number
  badge: string
}

const EMPTY_REWARD: Omit<SponsoredReward, 'id'> = {
  name: '',
  subtitle: '',
  href: '',
  imageUrl: '',
  points: 0,
  badge: '',
}

export function AdminTab() {
  const { isAdmin, user } = useApp()
  const [searchEmail, setSearchEmail] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [activeSection, setActiveSection] = useState<'admins' | 'rewards'>('admins')
  const [rewardForm, setRewardForm] = useState(EMPTY_REWARD)
  const [savingReward, setSavingReward] = useState(false)
  const [showRewardForm, setShowRewardForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* Admin is one flag on the user row, checked by the Worker on every request
     below /api/admin. This gate only decides what to render. */
  const adminList = useLive(signal => api.admins(signal), [isAdmin], { enabled: isAdmin, intervalMs: 120_000 })
  const campaigns = useLive(signal => api.sponsored(signal), [isAdmin], { enabled: isAdmin, intervalMs: 120_000 })

  const users: AdminUser[] = (adminList.data?.admins ?? []).map(a => ({
    uid: a.uid,
    displayName: a.displayName || 'Unknown',
    email: a.email,
    isAdmin: true,
  }))
  const loading = adminList.loading
  const sponsored: SponsoredReward[] = campaigns.data?.sponsored ?? []

  const run = async (work: () => Promise<unknown>, after?: () => void) => {
    setError(null)
    try {
      await work()
      after?.()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'That did not go through.')
    }
  }

  const handleAddAdmin = async () => {
    if (!searchEmail.trim()) return
    setAddingAdmin(true)
    await run(() => api.addAdmin(searchEmail.toLowerCase().trim()), () => {
      setSearchEmail('')
      adminList.refresh()
    })
    setAddingAdmin(false)
  }

  const handleRemoveAdmin = async (uid: string) => {
    if (uid === user?.uid) return
    if (!confirm('Remove this admin?')) return
    await run(() => api.removeAdmin(uid), adminList.refresh)
  }

  const handleSaveReward = async () => {
    if (!rewardForm.name || !rewardForm.href || !rewardForm.imageUrl) return
    setSavingReward(true)
    await run(() => api.addSponsored(rewardForm), () => {
      setRewardForm(EMPTY_REWARD)
      setShowRewardForm(false)
      campaigns.refresh()
    })
    setSavingReward(false)
  }

  const handleDeleteReward = async (id: string) => {
    if (!confirm('Delete this sponsored reward?')) return
    await run(() => api.removeSponsored(id), campaigns.refresh)
  }

  if (!isAdmin) {
    return (
      <motion.div
        key="admin"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="pb-2"
      >
        <div className="mb-5 pt-1">
          <p className="gallery-label mb-1.5 text-text-muted">system</p>
          <h2 className="font-display text-[26px] leading-tight text-text-primary">admin panel</h2>
        </div>
        <div className="gallery-card flex flex-col items-center justify-center rounded-[30px] border border-border p-7 text-center sm:p-10">
          <div className="w-14 h-14 rounded-2xl bg-surface-overlay flex items-center justify-center mb-4 text-text-muted">
            <Shield size={26} strokeWidth={1.8} />
          </div>
          <p className="font-display text-[18px] text-text-primary mb-1">access restricted</p>
          <p className="font-body text-[13px] text-text-muted max-w-[280px]">
            you need verified administrator privileges to access this console.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="admin"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="pb-2"
    >
      <div className="mb-5 pt-1">
        <p className="gallery-label mb-1.5 text-text-muted">system</p>
        <h2 className="font-display text-[26px] leading-tight text-text-primary">admin panel</h2>
        <p className="mt-1 text-[13px] text-text-muted">manage platform administrators and sponsored brand rewards.</p>
      </div>

      {error && (
        <div role="alert" className="mb-5 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3">
          <p className="font-body text-[12px] text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveSection('admins')}
          className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-[12px] font-medium transition-all ${
            activeSection === 'admins'
              ? 'bg-[#d5e0eb] text-[#253b54] shadow-sm'
              : 'bg-surface-raised text-text-muted hover:text-text-primary border border-border/70'
          }`}
        >
          <Shield size={14} />
          <span>admins</span>
        </button>
        <button
          onClick={() => setActiveSection('rewards')}
          className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-[12px] font-medium transition-all ${
            activeSection === 'rewards'
              ? 'bg-[#d5e0eb] text-[#253b54] shadow-sm'
              : 'bg-surface-raised text-text-muted hover:text-text-primary border border-border/70'
          }`}
        >
          <Gift size={14} />
          <span>sponsored rewards</span>
        </button>
      </div>

      {activeSection === 'admins' && (
        <>
          <div className="gallery-card p-5 rounded-[26px] border border-border mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={15} className="text-oasis-400" />
              <h3 className="font-display text-[15px] text-text-primary">add administrator</h3>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input
                type="email"
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                placeholder="enter email (e.g. user@rippl.eco)"
                className="flex-1 bg-surface-overlay rounded-xl px-3.5 py-2.5 font-body text-[13px] text-text-primary placeholder:text-text-muted outline-none border border-border"
                onKeyDown={e => e.key === 'Enter' && handleAddAdmin()}
              />
              <button
                onClick={handleAddAdmin}
                disabled={!searchEmail.trim() || addingAdmin}
                className="gallery-primary flex min-h-12 shrink-0 items-center justify-center px-5 transition-all"
              >
                {addingAdmin ? (
                  <div className="w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="font-body text-[12px] font-medium">grant</span>
                )}
              </button>
            </div>
          </div>

          <div className="gallery-card p-5 rounded-[26px] border border-border">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-gulf-400" />
                <h3 className="font-display text-[15px] text-text-primary">current administrators</h3>
              </div>
              <span className="font-mono text-[11px] text-text-muted">{users.length} active</span>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-5 h-5 border-2 border-oasis-400 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : users.length === 0 ? (
              <p className="font-body text-[12px] text-text-muted py-4 text-center">no administrators found</p>
            ) : (
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.uid} className="flex items-center justify-between gap-3 bg-surface-overlay/50 rounded-xl p-3 border border-border">
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-[13px] font-medium text-text-primary">{u.displayName}</p>
                      <p className="font-mono text-[10px] text-text-muted truncate">{u.email || u.uid}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveAdmin(u.uid)}
                      disabled={u.uid === user?.uid}
                      aria-label="remove administrator" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeSection === 'rewards' && (
        <>
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="gallery-label min-w-0 truncate text-text-muted">sponsored campaigns ({sponsored.length})</span>
            <button
              onClick={() => setShowRewardForm(v => !v)}
              className="gallery-primary inline-flex min-h-11 shrink-0 items-center gap-1.5 px-4 text-[11px] transition-all"
            >
              <Plus size={13} />
              <span>new campaign</span>
            </button>
          </div>

          {showRewardForm && (
            <div className="gallery-card p-5 rounded-[26px] border border-border mb-5">
              <h3 className="font-display text-[16px] text-text-primary mb-3">create sponsored reward</h3>
              <div className="space-y-3">
                <div className="bg-surface-overlay rounded-xl px-3.5 py-2.5 border border-border flex items-center gap-2">
                  <Tag size={14} className="text-text-muted shrink-0" />
                  <input
                    type="text"
                    placeholder="partner name (e.g. Enova Solar)"
                    value={rewardForm.name}
                    onChange={e => setRewardForm(f => ({ ...f, name: e.target.value }))}
                    className="flex-1 bg-transparent font-body text-[13px] text-text-primary placeholder:text-text-muted outline-none"
                  />
                </div>
                <div className="bg-surface-overlay rounded-xl px-3.5 py-2.5 border border-border flex items-center gap-2">
                  <Tag size={14} className="text-text-muted shrink-0" />
                  <input
                    type="text"
                    placeholder="tagline (e.g. Earn 200 pts bonus)"
                    value={rewardForm.subtitle}
                    onChange={e => setRewardForm(f => ({ ...f, subtitle: e.target.value }))}
                    className="flex-1 bg-transparent font-body text-[13px] text-text-primary placeholder:text-text-muted outline-none"
                  />
                </div>
                <div className="bg-surface-overlay rounded-xl px-3.5 py-2.5 border border-border flex items-center gap-2">
                  <Link size={14} className="text-text-muted shrink-0" />
                  <input
                    type="url"
                    placeholder="target url (https://...)"
                    value={rewardForm.href}
                    onChange={e => setRewardForm(f => ({ ...f, href: e.target.value }))}
                    className="flex-1 bg-transparent font-body text-[13px] text-text-primary placeholder:text-text-muted outline-none"
                  />
                </div>
                <div className="bg-surface-overlay rounded-xl px-3.5 py-2.5 border border-border flex items-center gap-2">
                  <ImageIcon size={14} className="text-text-muted shrink-0" />
                  <input
                    type="url"
                    placeholder="banner image url (https://...)"
                    value={rewardForm.imageUrl}
                    onChange={e => setRewardForm(f => ({ ...f, imageUrl: e.target.value }))}
                    className="flex-1 bg-transparent font-body text-[13px] text-text-primary placeholder:text-text-muted outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-overlay rounded-xl px-3.5 py-2.5 border border-border flex items-center gap-2">
                    <Coins size={14} className="text-text-muted shrink-0" />
                    <input
                      type="number"
                      placeholder="points value"
                      value={rewardForm.points || ''}
                      onChange={e => setRewardForm(f => ({ ...f, points: parseInt(e.target.value) || 0 }))}
                      className="flex-1 bg-transparent font-body text-[13px] text-text-primary placeholder:text-text-muted outline-none"
                    />
                  </div>
                  <div className="bg-surface-overlay rounded-xl px-3.5 py-2.5 border border-border flex items-center gap-2">
                    <ArrowUpDown size={14} className="text-text-muted shrink-0" />
                    <input
                      type="text"
                      placeholder="badge label"
                      value={rewardForm.badge}
                      onChange={e => setRewardForm(f => ({ ...f, badge: e.target.value }))}
                      className="flex-1 bg-transparent font-body text-[13px] text-text-primary placeholder:text-text-muted outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveReward}
                  disabled={savingReward || !rewardForm.name || !rewardForm.href || !rewardForm.imageUrl}
                  className="gallery-primary min-h-12 w-full py-3 transition-all"
                >
                  <span className="font-body text-[12px] font-medium">
                    {savingReward ? 'saving...' : 'publish reward'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {sponsored.length === 0 ? (
            <div className="gallery-card p-8 flex flex-col items-center justify-center text-center rounded-[26px] border border-border">
              <Gift size={26} className="text-text-muted mb-2" />
              <p className="font-body text-[13px] text-text-muted">no active sponsored campaigns</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sponsored.map((sp) => (
                <div key={sp.id} className="gallery-card flex items-center gap-3.5 p-3 rounded-[20px] border border-border">
                  <img
                    className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-border bg-surface-overlay"
                    src={sp.imageUrl || SPONSORED_LOCAL_FALLBACKS[0]}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={event => { event.currentTarget.src = SPONSORED_LOCAL_FALLBACKS[0] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[14px] text-text-primary truncate">{sp.name}</p>
                    <p className="font-body text-[11px] text-text-muted line-clamp-1">{sp.subtitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] text-oasis-400 font-medium">+{sp.points} pts</span>
                      {sp.badge && <span className="font-body text-[10px] text-text-muted">· {sp.badge}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteReward(sp.id)}
                    aria-label="delete campaign" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-400/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
