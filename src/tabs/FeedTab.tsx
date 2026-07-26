import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Leaf, Train, Zap, Droplets, Trash2, X, Send, Image, MoreVertical, Edit2, Trash } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useApp } from '../App'
import { db } from '../firebase'
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, increment, addDoc, serverTimestamp, deleteDoc, getDocs, runTransaction, deleteField } from 'firebase/firestore'
import { SkeletonCard } from '../components/Skeleton'
import { compressImage } from '../utils'

interface FeedPost {
  id: string
  userId: string
  userName: string
  userAvatar: string
  category: string
  action: string
  impact: string
  points: number
  likesCount: number
  likes?: Record<string, boolean>
  commentsCount: number
  imageBase64?: string
  timestamp: { seconds: number } | null
}

interface Comment {
  id: string
  userId: string
  userName: string
  text: string
  timestamp: { seconds: number } | null
}

const categoryIcons: Record<string, { icon: typeof Leaf; color: string; bg: string }> = {
  transport: { icon: Train, color: 'text-gulf-400', bg: 'bg-gulf-400/10' },
  energy: { icon: Zap, color: 'text-dune-400', bg: 'bg-dune-400/10' },
  food: { icon: Leaf, color: 'text-oasis-400', bg: 'bg-oasis-400/10' },
  water: { icon: Droplets, color: 'text-gulf-300', bg: 'bg-gulf-300/10' },
  waste: { icon: Trash2, color: 'text-ember-400', bg: 'bg-ember-400/10' },
}

const avatarGradients = [
  'from-oasis-400 to-gulf-400',
  'from-dune-400 to-ember-400',
  'from-gulf-400 to-oasis-500',
  'from-ember-400 to-dune-300',
  'from-oasis-500 to-dune-400',
]

const userAvatarGradient = 'from-oasis-400 to-gulf-400'

function timeAgo(ts: { seconds: number } | null) {
  if (!ts?.seconds) return 'just now'
  const diff = Date.now() - ts.seconds * 1000
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function CreatePost({ user }: { user: any }) {
  const [text, setText] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [imageError, setImageError] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handlePost = async () => {
    if (!text.trim() || posting) return
    setPosting(true)
    await addDoc(collection(db, 'posts'), {
      userId: user.uid,
      userName: user.displayName || '',
      userAvatar: (user.displayName || 'U').split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase(),
      category: '',
      action: text.trim(),
      impact: '',
      points: 0,
      likesCount: 0,
      likes: {},
      commentsCount: 0,
      imageBase64: image || '',
      timestamp: serverTimestamp(),
    })
    setText('')
    setImage(null)
    setPosting(false)
  }

  return (
    <div className="bg-surface-raised/60 backdrop-blur-sm rounded-2xl border border-border p-4 mb-4">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What's on your mind?"
        rows={2}
        className="w-full bg-transparent font-body text-[13px] text-text-primary placeholder:text-text-muted resize-none outline-none"
      />
      {image && (
        <div className="relative mt-2 rounded-xl overflow-hidden border border-border flex justify-center bg-surface-overlay/20">
          <img src={image} alt="" className="max-h-60 object-contain" />
          <button onClick={() => setImage(null)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-surface/80 flex items-center justify-center">
            <X size={12} className="text-text-primary" />
          </button>
        </div>
      )}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-text-muted hover:text-text-secondary transition-colors">
          <Image size={14} />
          <span className="font-mono text-[9px]">Photo</span>
        </button>
        <button
          onClick={handlePost}
          disabled={!text.trim() || posting}
          className="flex items-center gap-1.5 bg-oasis-500 hover:bg-oasis-600 disabled:opacity-40 disabled:cursor-not-allowed text-surface rounded-xl px-4 py-1.5 transition-colors"
        >
          <span className="font-body text-[11px] font-medium">Post</span>
          {posting ? (
            <div className="w-3.5 h-3.5 border-2 border-surface border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={12} />
          )}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={async e => {
        const f = e.target.files?.[0]
        if (f) {
          try {
            setImage(await compressImage(f))
            setImageError(false)
          } catch {
            setImageError(true)
          }
        }
      }} className="hidden" />
      {imageError && (
        <p className="font-mono text-[8px] text-red-400 mt-1">Image too large</p>
      )}
    </div>
  )
}

export function FeedTab() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loaded, setLoaded] = useState(false)
  const { user } = useApp()

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(50))
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as FeedPost)))
      setLoaded(true)
    })
    return unsub
  }, [])

  return (
    <motion.div
      key="feed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="px-4 pb-4"
    >
      <div className="flex items-center justify-between mb-4 pt-1">
        <div>
          <h2 className="font-display text-[24px] tracking-[0.1em] text-text-primary">THE FEED</h2>
          <p className="font-mono text-[10px] text-text-muted mt-0.5">ripples across the UAE</p>
        </div>
        <div className="flex items-center gap-1.5 bg-oasis-500/10 rounded-full px-3 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-oasis-400 animate-ripple-pulse" />
          <span className="font-mono text-[10px] text-oasis-400">Live</span>
        </div>
      </div>

      {user && <CreatePost user={user} />}

      {!loaded ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-mono text-[11px] text-text-muted">No activity yet. Be the first to post!</p>
        </div>
      ) : (
        <div className="space-y-3 flex flex-col">
          <AnimatePresence mode="popLayout" initial={false}>
            {posts.map((post, i) => (
              <FeedCard key={post.id} post={post} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

function FeedCard({ post, index }: { post: FeedPost; index: number }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likesCount)
  const appCtx = useApp()
  const { user, setShowSignIn } = appCtx
  const cat = categoryIcons[post.category] || categoryIcons.transport
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(post.action)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentCount, setCommentCount] = useState(post.commentsCount)
  const menuRef = useRef<HTMLDivElement>(null)

  const isOwner = user?.uid === post.userId
  const isAdmin = (appCtx.userData as any)?.isAdmin

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setLikeCount(post.likesCount)
    setLiked(!!(user && post.likes && post.likes[user.uid]))
  }, [post, user])

  const handleLike = async () => {
    if (!user) { setShowSignIn(true); return }
    try {
      let wasLiked = false
      await runTransaction(db, async (tx) => {
        const ref = doc(db, 'posts', post.id)
        const snap = await tx.get(ref)
        const data = snap.data() as any
        wasLiked = !!(data?.likes && data.likes[user.uid])
        if (wasLiked) {
          tx.set(ref, { likes: { [user.uid]: deleteField() }, likesCount: increment(-1) }, { merge: true })
        } else {
          tx.set(ref, { likes: { [user.uid]: true }, likesCount: increment(1) }, { merge: true })
        }
      })
      setLiked(!wasLiked)
      setLikeCount(c => wasLiked ? Math.max(0, c - 1) : c + 1)
    } catch {
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    await deleteDoc(doc(db, 'posts', post.id))
    setMenuOpen(false)
  }

  const handleRemoveImage = async () => {
    if (!confirm('Remove image from this post?')) return
    await updateDoc(doc(db, 'posts', post.id), { imageBase64: '' })
    setMenuOpen(false)
  }

  const handleAdminEditPoints = async () => {
    const val = prompt('Set points for this post (number):', String(post.points))
    if (!val) return
    const n = parseInt(val, 10)
    if (isNaN(n)) return
    await updateDoc(doc(db, 'posts', post.id), { points: n })
    setMenuOpen(false)
  }

  const handleEdit = async () => {
    if (!editText.trim()) return
    await updateDoc(doc(db, 'posts', post.id), { action: editText.trim() })
    setEditing(false)
    setMenuOpen(false)
  }

  const loadComments = async () => {
    const q = query(collection(db, 'posts', post.id, 'comments'), orderBy('timestamp', 'asc'))
    const snap = await getDocs(q)
    setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment)))
  }

  const handleCommentClick = () => {
    if (!user) { setShowSignIn(true); return }
    setShowComments(true)
    loadComments()
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return
    await addDoc(collection(db, 'posts', post.id, 'comments'), {
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      text: commentText.trim(),
      timestamp: serverTimestamp(),
    })
    await updateDoc(doc(db, 'posts', post.id), { commentsCount: increment(1) })
    setCommentCount(c => c + 1)
    setCommentText('')
    loadComments()
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, height: 0, padding: 0, marginTop: 0, marginBottom: 0, border: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-surface-raised/60 backdrop-blur-sm rounded-2xl border border-border p-4 group hover:border-border-active transition-colors duration-300 overflow-hidden"
      >
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${isOwner ? userAvatarGradient : avatarGradients[index % avatarGradients.length]} flex items-center justify-center shrink-0`}>
            <span className="text-[10px] font-body font-bold text-surface">{post.userAvatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-body text-[13px] font-semibold text-text-primary">{post.userName}</span>
              <span className="font-mono text-[9px] text-text-muted">{timeAgo(post.timestamp)}</span>
            </div>
            {editing ? (
              <div className="mt-1">
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  className="w-full bg-surface-overlay rounded-lg p-2 font-body text-[12px] text-text-primary outline-none border border-border resize-none"
                  rows={2}
                />
                <div className="flex gap-2 mt-1.5">
                  <button onClick={handleEdit} className="font-mono text-[9px] text-oasis-400 hover:text-oasis-300">Save</button>
                  <button onClick={() => { setEditing(false); setEditText(post.action) }} className="font-mono text-[9px] text-text-muted hover:text-text-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="font-body text-[12px] text-text-secondary mt-1 leading-relaxed">{post.action}</p>
            )}
            {post.imageBase64 && (
              <div className="mt-2 rounded-xl overflow-hidden border border-border flex justify-center bg-surface-overlay/20">
                <img src={post.imageBase64} alt="" className="max-h-80 object-contain" />
              </div>
            )}
            {post.category && cat && (
              <div className="flex items-center gap-2 mt-2.5">
                <div className={`flex items-center gap-1.5 ${cat.bg} rounded-full px-2 py-0.5`}>
                  <cat.icon size={10} className={cat.color} />
                  <span className={`font-mono text-[9px] ${cat.color}`}>{post.impact}</span>
                </div>
                <div className="flex items-center gap-1 bg-oasis-400/8 rounded-full px-2 py-0.5">
                  <span className="font-mono text-[9px] text-oasis-400">+{post.points} pts</span>
                </div>
              </div>
            )}
          </div>
          {(isOwner || isAdmin) && (
            <div className="relative shrink-0" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-text-muted hover:text-text-secondary p-1 rounded-lg hover:bg-surface-overlay transition-colors">
                <MoreVertical size={14} />
              </button>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 top-8 z-50 bg-surface-raised border border-border rounded-xl p-1.5 shadow-xl min-w-[120px]"
                >
                  <button
                    onClick={() => { setEditing(true); setMenuOpen(false); setEditText(post.action) }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-surface-overlay transition-colors text-left"
                  >
                    <Edit2 size={12} className="text-text-muted" />
                    <span className="font-body text-[11px] text-text-primary">Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-surface-overlay transition-colors text-left"
                  >
                    <Trash size={12} className="text-red-400" />
                    <span className="font-body text-[11px] text-red-400">Delete</span>
                  </button>
                  {isAdmin && post.imageBase64 && (
                    <button
                      onClick={handleRemoveImage}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-surface-overlay transition-colors text-left"
                    >
                      <Image size={12} className="text-text-muted" />
                      <span className="font-body text-[11px] text-text-primary">Remove image</span>
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={handleAdminEditPoints}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-surface-overlay transition-colors text-left"
                    >
                      <span className="font-body text-[11px] text-text-primary">Set points</span>
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-border">
          <button onClick={handleLike} className="flex items-center gap-1.5 group/btn">
            <Heart
              size={14}
              className={`transition-all duration-200 ${liked ? 'text-red-400 fill-red-400 scale-110' : 'text-text-muted group-hover/btn:text-red-400'}`}
            />
            <span className={`font-mono text-[10px] ${liked ? 'text-red-400' : 'text-text-muted'}`}>{likeCount}</span>
          </button>
          <button onClick={handleCommentClick} className="flex items-center gap-1.5 group/btn">
            <MessageCircle size={14} className="text-text-muted group-hover/btn:text-gulf-400 transition-colors" />
            <span className="font-mono text-[10px] text-text-muted">{commentCount}</span>
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex flex-col bg-surface/95 backdrop-blur-md"
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-border">
              <h3 className="font-body text-[14px] font-bold text-text-primary">Comments</h3>
              <button onClick={() => setShowComments(false)} className="text-text-muted hover:text-text-secondary">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {comments.length === 0 ? (
                <p className="font-mono text-[10px] text-text-muted text-center py-10">No comments yet</p>
              ) : comments.map(c => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gulf-400 to-oasis-400 flex items-center justify-center shrink-0">
                    <span className="text-[7px] font-body font-bold text-surface">
                      {c.userName.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-body text-[11px] font-semibold text-text-primary">{c.userName}</span>
                      <span className="font-mono text-[8px] text-text-muted">{timeAgo(c.timestamp)}</span>
                    </div>
                    <p className="font-body text-[11px] text-text-secondary mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-border flex gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-surface-overlay rounded-xl px-3 py-2 font-body text-[12px] text-text-primary placeholder:text-text-muted outline-none border border-border"
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="bg-oasis-500 hover:bg-oasis-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-3 py-2 transition-colors"
              >
                <Send size={14} className="text-surface" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
