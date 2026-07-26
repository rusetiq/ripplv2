import { motion } from 'framer-motion'
import { Shield, Mail, Check, X, Gift, Plus, Trash2, ImageIcon, Link, Tag, Coins, ArrowUpDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useApp } from '../App'
import { db } from '../firebase'
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc, onSnapshot, orderBy } from 'firebase/firestore'

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
  order: number
}

const EMPTY_REWARD: Omit<SponsoredReward, 'id'> = {
  name: '',
  subtitle: '',
  href: '',
  imageUrl: '',
  points: 0,
  badge: '',
  order: 0,
}

export function AdminTab() {
  const { userData, user } = useApp()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchEmail, setSearchEmail] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [activeSection, setActiveSection] = useState<'admins' | 'rewards'>('admins')
  const [sponsored, setSponsored] = useState<SponsoredReward[]>([])
  const [rewardForm, setRewardForm] = useState(EMPTY_REWARD)
  const [savingReward, setSavingReward] = useState(false)
  const [showRewardForm, setShowRewardForm] = useState(false)

  const isAdmin = (userData as any)?.isAdmin

  useEffect(() => {
    if (!isAdmin) return
    loadAdmins()
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return
    const q = query(collection(db, 'sponsoredRewards'), orderBy('order', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setSponsored(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<SponsoredReward, 'id'>) })))
    })
    return unsub
  }, [isAdmin])

  const loadAdmins = async () => {
    setLoading(true)
    const q = query(collection(db, 'users'), where('isAdmin', '==', true))
    const snap = await getDocs(q)
    setUsers(snap.docs.map(d => {
      const data = d.data()
      return {
        uid: d.id,
        displayName: data.displayName || 'Unknown',
        email: data.email || '',
        isAdmin: true,
      }
    }))
    setLoading(false)
  }

  const handleAddAdmin = async () => {
    if (!searchEmail.trim()) return
    setAddingAdmin(true)
    const q = query(collection(db, 'users'), where('email', '==', searchEmail.toLowerCase().trim()))
    const snap = await getDocs(q)
    if (snap.empty) {
      alert('User not found. Make sure they have signed in to the app first.')
      setAddingAdmin(false)
      return
    }
    const userDoc = snap.docs[0]
    await updateDoc(doc(db, 'users', userDoc.id), { isAdmin: true, email: searchEmail.toLowerCase().trim() })
    setSearchEmail('')
    setAddingAdmin(false)
    loadAdmins()
  }

  const handleRemoveAdmin = async (uid: string) => {
    if (uid === user?.uid) {
      alert('Cannot remove yourself as admin')
      return
    }
    if (!confirm('Remove this admin?')) return
    await updateDoc(doc(db, 'users', uid), { isAdmin: false })
    loadAdmins()
  }

  const handleSaveReward = async () => {
    if (!rewardForm.name || !rewardForm.href || !rewardForm.imageUrl) return
    setSavingReward(true)
    await addDoc(collection(db, 'sponsoredRewards'), {
      ...rewardForm,
      order: sponsored.length,
    })
    setRewardForm(EMPTY_REWARD)
    setShowRewardForm(false)
    setSavingReward(false)
  }

  const handleDeleteReward = async (id: string) => {
    if (!confirm('Delete this sponsored reward?')) return
    await deleteDoc(doc(db, 'sponsoredRewards', id))
  }

  if (!isAdmin) {
    return (
      <motion.div
        key="admin"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="px-4 pb-4"
      >
        <div className="mb-5 pt-1">
          <h2 className="font-display text-[13px] tracking-[0.2em] text-text-primary">ADMIN PANEL</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Shield size={32} className="text-text-muted mb-4" />
          <p className="font-body text-[14px] text-text-primary mb-2">Admin access denied</p>
          <p className="font-mono text-[10px] text-text-muted">You don't have admin privileges</p>
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
      className="px-4 pb-4"
    >
      <div className="mb-5 pt-1">
        <h2 className="font-display text-[13px] tracking-[0.2em] text-text-primary">ADMIN PANEL</h2>
        <p className="font-mono text-[10px] text-text-muted mt-0.5">manage admins & rewards</p>
      </div>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveSection('admins')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-mono transition-all ${activeSection === 'admins' ? 'bg-oasis-500/15 text-oasis-400 border border-oasis-500/25' : 'bg-surface-raised/50 text-text-muted border border-border'}`}
        >
          <Shield size={12} />
          Admins
        </button>
        <button
          onClick={() => setActiveSection('rewards')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-mono transition-all ${activeSection === 'rewards' ? 'bg-oasis-500/15 text-oasis-400 border border-oasis-500/25' : 'bg-surface-raised/50 text-text-muted border border-border'}`}
        >
          <Gift size={12} />
          Rewards
        </button>
      </div>

      {activeSection === 'admins' && (
        <>
          <div className="bg-surface-raised/60 backdrop-blur-sm rounded-2xl border border-border p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-oasis-400" />
              <h3 className="font-body text-[13px] font-semibold text-text-primary">Add Admin</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={searchEmail}
                onChange={e => setSearchEmail(e.target.value)}
                placeholder="Enter email (e.g., user@example.com)"
                className="flex-1 bg-surface-overlay rounded-xl px-3 py-2 font-body text-[12px] text-text-primary placeholder:text-text-muted outline-none border border-border"
                onKeyDown={e => e.key === 'Enter' && handleAddAdmin()}
              />
              <button
                onClick={handleAddAdmin}
                disabled={!searchEmail.trim() || addingAdmin}
                className="bg-oasis-500 hover:bg-oasis-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-4 py-2 transition-colors"
              >
                {addingAdmin ? (
                  <div className="w-3.5 h-3.5 border-2 border-surface border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={14} className="text-surface" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-surface-raised/60 backdrop-blur-sm rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Mail size={14} className="text-gulf-400" />
              <h3 className="font-body text-[13px] font-semibold text-text-primary">Current Admins ({users.length})</h3>
            </div>
            {loading ? (
              <div className="text-center py-6">
                <div className="w-4 h-4 border-2 border-oasis-400 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : users.length === 0 ? (
              <p className="font-mono text-[10px] text-text-muted py-4">No admins yet</p>
            ) : (
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.uid} className="flex items-center justify-between gap-3 bg-surface-overlay/40 rounded-lg p-2.5 border border-border">
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-[12px] font-medium text-text-primary">{u.displayName}</p>
                      <p className="font-mono text-[9px] text-text-muted truncate">{u.email || u.uid}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveAdmin(u.uid)}
                      disabled={u.uid === user?.uid}
                      className="text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed p-1 transition-colors"
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
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest">Sponsored Rewards ({sponsored.length})</p>
            <button
              onClick={() => setShowRewardForm(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-oasis-500/15 border border-oasis-500/25 text-oasis-400 font-mono text-[10px] transition-all hover:bg-oasis-500/20"
            >
              <Plus size={11} />
              Add
            </button>
          </div>

          {showRewardForm && (
            <div className="bg-surface-raised/60 border border-border rounded-2xl p-4 mb-4">
              <p className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-3">New Sponsored Reward</p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 bg-surface-overlay rounded-xl px-3 py-2 border border-border">
                  <Tag size={12} className="text-text-muted shrink-0" />
                  <input
                    type="text"
                    placeholder="Name (e.g., ENOVA SOLAR)"
                    value={rewardForm.name}
                    onChange={e => setRewardForm(f => ({ ...f, name: e.target.value }))}
                    className="flex-1 bg-transparent font-body text-[12px] text-text-primary placeholder:text-text-muted outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 bg-surface-overlay rounded-xl px-3 py-2 border border-border">
                  <Tag size={12} className="text-text-muted shrink-0" />
                  <input
                    type="text"
                    placeholder="Subtitle (e.g., 200 PTS on first install)"
                    value={rewardForm.subtitle}
                    onChange={e => setRewardForm(f => ({ ...f, subtitle: e.target.value }))}
                    className="flex-1 bg-transparent font-body text-[12px] text-text-primary placeholder:text-text-muted outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 bg-surface-overlay rounded-xl px-3 py-2 border border-border">
                  <Link size={12} className="text-text-muted shrink-0" />
                  <input
                    type="url"
                    placeholder="URL (https://...)"
                    value={rewardForm.href}
                    onChange={e => setRewardForm(f => ({ ...f, href: e.target.value }))}
                    className="flex-1 bg-transparent font-body text-[12px] text-text-primary placeholder:text-text-muted outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 bg-surface-overlay rounded-xl px-3 py-2 border border-border">
                  <ImageIcon size={12} className="text-text-muted shrink-0" />
                  <input
                    type="url"
                    placeholder="Image URL (https://...)"
                    value={rewardForm.imageUrl}
                    onChange={e => setRewardForm(f => ({ ...f, imageUrl: e.target.value }))}
                    className="flex-1 bg-transparent font-body text-[12px] text-text-primary placeholder:text-text-muted outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 bg-surface-overlay rounded-xl px-3 py-2 border border-border">
                    <Coins size={12} className="text-text-muted shrink-0" />
                    <input
                      type="number"
                      placeholder="Points"
                      value={rewardForm.points || ''}
                      onChange={e => setRewardForm(f => ({ ...f, points: parseInt(e.target.value) || 0 }))}
                      className="flex-1 bg-transparent font-body text-[12px] text-text-primary placeholder:text-text-muted outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-surface-overlay rounded-xl px-3 py-2 border border-border">
                    <ArrowUpDown size={12} className="text-text-muted shrink-0" />
                    <input
                      type="text"
                      placeholder="Badge (e.g., Energy)"
                      value={rewardForm.badge}
                      onChange={e => setRewardForm(f => ({ ...f, badge: e.target.value }))}
                      className="flex-1 bg-transparent font-body text-[12px] text-text-primary placeholder:text-text-muted outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveReward}
                  disabled={savingReward || !rewardForm.name || !rewardForm.href || !rewardForm.imageUrl}
                  className="w-full py-2.5 rounded-xl bg-oasis-500 disabled:opacity-40 disabled:cursor-not-allowed font-mono text-[11px] text-surface tracking-widest uppercase transition-all hover:bg-oasis-600 active:scale-[0.98]"
                >
                  {savingReward ? 'Saving…' : 'Save Reward'}
                </button>
              </div>
            </div>
          )}

          {sponsored.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-raised/30 rounded-2xl border border-border">
              <Gift size={28} className="text-text-muted mb-3" />
              <p className="font-mono text-[10px] text-text-muted">No sponsored rewards yet</p>
              <p className="font-mono text-[9px] text-text-muted/60 mt-1">Click Add to create one</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sponsored.map((sp) => (
                <div key={sp.id} className="flex items-center gap-3 bg-surface-raised/50 border border-border rounded-xl p-3">
                  <div
                    className="w-12 h-12 rounded-xl bg-cover bg-center shrink-0 border border-border"
                    style={{ backgroundImage: sp.imageUrl ? `url('${sp.imageUrl}')` : undefined, background: sp.imageUrl ? undefined : 'rgba(255,255,255,0.04)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[12px] font-semibold text-text-primary truncate">{sp.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[9px] text-oasis-400">{sp.points} pts</span>
                      {sp.badge && <span className="font-mono text-[8px] text-text-muted">· {sp.badge}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteReward(sp.id)}
                    className="text-red-400/60 hover:text-red-400 p-1.5 transition-colors shrink-0"
                  >
                    <Trash2 size={13} />
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
