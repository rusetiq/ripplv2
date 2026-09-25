import { PrivateImage } from '../components/PrivateImage'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Camera, Footprints, Heart, MessageCircle, Leaf, Train, Zap, Droplets, Trash2, X, Send, Image, MoreVertical, Edit2, Trash } from 'lucide-react'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useApp } from '../AppContext'
import { api, ApiError, type Post, type Comment } from '../api'
import { useLive } from '../useLive'
import { SkeletonCard } from '../components/Skeleton'
import { compressImage } from '../utils'
import { DotNumber } from '../components/DotNumber'

const initials = (name: string) =>
  name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'AN'

const categoryIcons: Record<string, { icon: typeof Leaf; color: string; bg: string }> = {
  transport: { icon: Train, color: 'text-gulf-400', bg: 'bg-gulf-400/10' },
  energy: { icon: Zap, color: 'text-dune-400', bg: 'bg-dune-400/10' },
  food: { icon: Leaf, color: 'text-oasis-400', bg: 'bg-oasis-400/10' },
  water: { icon: Droplets, color: 'text-gulf-300', bg: 'bg-gulf-300/10' },
  waste: { icon: Trash2, color: 'text-ember-400', bg: 'bg-ember-400/10' },
}

function timeAgo(seconds: number) {
  if (!seconds) return 'just now'
  const diff = Date.now() - seconds * 1000
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function CreatePost({ onPosted }: { onPosted: () => void }) {
  const [text, setText] = useState('')
  const [image, setImage] = useState<Blob | null>(null)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Derived during render, revoked when it is replaced or unmounted.
  const preview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const handlePost = async () => {
    if (!text.trim() || posting) return
    setPosting(true)
    setError(null)
    try {
      await api.createPost(text.trim(), image)
      setText('')
      setImage(null)
      onPosted()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'That post did not go through.')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="gallery-card p-5 mb-5">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Share an action with your community..."
        rows={2}
        maxLength={500}
        className="w-full bg-transparent font-body text-[15px] leading-relaxed text-text-primary placeholder:text-text-muted resize-none outline-none"
      />
      {preview && (
        <div className="relative mt-2 rounded-xl overflow-hidden border border-border flex justify-center bg-surface-overlay/20">
          <img src={preview} alt="" className="max-h-60 object-contain" />
          <button onClick={() => setImage(null)} aria-label="remove photo" className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-surface/85 backdrop-blur-sm">
            <X size={15} className="text-text-primary" />
          </button>
        </div>
      )}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <button onClick={() => fileRef.current?.click()} className="-my-1 -ml-2 flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-text-muted transition-colors hover:text-text-secondary">
          <Image size={16} />
          <span className="font-mono text-[11px]">Photo</span>
        </button>
        <button
          onClick={handlePost}
          disabled={!text.trim() || posting}
          className="gallery-primary flex min-h-11 items-center gap-2 px-5 py-2 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
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
        e.target.value = ''
        if (!f) return
        try {
          setImage(await compressImage(f))
          setError(null)
        } catch {
          setError('That photo could not be read. Try a JPEG or PNG.')
        }
      }} className="hidden" />
      {error && <p role="alert" className="mt-2 font-body text-[11px] text-red-400">{error}</p>}
    </div>
  )
}

const suggestedActions = [
  { label: 'Take public transport', detail: '35 pts · 2.4 kg CO₂', Icon: Train },
  { label: 'Choose a plant-based meal', detail: '20 pts · 1.1 kg CO₂', Icon: Leaf },
  { label: 'Walk instead of driving', detail: '20 pts · 1.2 kg CO₂', Icon: Footprints },
  { label: 'Take a shorter shower', detail: '25 pts · 60 L', Icon: Droplets },
]

function ImpactRibbon() {
  const { user, points, co2Saved, waterSaved, streak } = useApp()
  const values = [
    { label: 'Points earned', value: user ? points.toLocaleString() : '—', unit: 'Total', accent: true },
    { label: 'Carbon saved', value: user ? co2Saved.toFixed(1) : '—', unit: 'kg CO₂' },
    { label: 'Water saved', value: user ? waterSaved.toLocaleString() : '—', unit: 'litres' },
    { label: 'Current streak', value: user ? String(streak) : '—', unit: 'days' },
  ]
  return <section className="dashboard-stats" aria-label="Your impact summary">{values.map(item => <div key={item.label}><p>{item.label}</p><div><DotNumber value={item.value}/><span className={item.accent ? 'stat-unit stat-accent' : 'stat-unit'}>{item.unit}</span></div></div>)}</section>
}

function ImpactCards() {
  const { user, co2Saved, waterSaved, setActiveTab, setShowSignIn } = useApp()
  return <section className="impact-card-grid" aria-label="Your environmental impact">
    <button className="impact-card carbon-card" onClick={() => user ? setActiveTab('impact') : setShowSignIn(true)}>
      <span className="impact-card-heading">Carbon saved</span>
      <div className="impact-card-value text-white"><DotNumber value={user ? co2Saved.toFixed(1) : '—'} className="text-white fill-white"/><span className="text-white">kg of CO₂ saved</span></div>
      <span className="impact-card-dots" aria-hidden="true"/>
    </button>
    <button className="impact-card water-card" onClick={() => user ? setActiveTab('impact') : setShowSignIn(true)}>
      <span className="impact-card-heading">Water saved</span>
      <div className="impact-card-value text-white"><DotNumber value={user ? waterSaved.toLocaleString() : '—'} className="text-white fill-white"/><span className="text-white">litres of water saved</span></div>
      <span className="impact-card-dots" aria-hidden="true"/>
    </button>
  </section>
}

function GuestActivation() {
  const { signInWithGoogle } = useApp()
  return (
    <section className="guest-welcome">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="max-w-[560px]">
          <h2 className="text-[24px] font-medium leading-tight text-text-primary">Your next chapter starts small.</h2>
          <p className="mt-2 max-w-[60ch] text-[13px] leading-5 text-text-muted">Save your everyday wins, find your people, and watch your impact grow.</p>
        </div>
        <button onClick={signInWithGoogle} className="gallery-primary inline-flex shrink-0 items-center justify-center gap-2 px-5 py-3 text-[13px] font-medium">Continue with Google <ArrowRight size={15} /></button>
      </div>
    </section>
  )
}

function FieldStationRail() {
  const { user, level, streak, setActiveTab, setShowSignIn } = useApp()
  const chooseAction = () => user ? setActiveTab('log') : setShowSignIn(true)

  return (
    <aside className="space-y-4 lg:sticky lg:top-0 lg:self-start">
      <section className="gallery-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <h2 className="text-[13px] font-medium text-text-primary">Something good for today</h2>
          <button onClick={chooseAction} className="-my-2 -mr-2 flex min-h-11 items-center rounded-xl px-2 text-[12px] font-medium text-text-muted transition-colors hover:text-text-primary">See all</button>
        </div>
        <div className="divide-y divide-border">
          {suggestedActions.map(({ label, detail, Icon }) => (
            <button key={label} onClick={chooseAction} className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-overlay active:scale-[0.99]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-text-secondary transition-colors group-hover:border-oasis-500 group-hover:text-text-primary"><Icon size={16} strokeWidth={1.7} /></span>
              <span className="min-w-0 flex-1"><span className="block text-[12px] font-medium text-text-primary">{label}</span><span className="mt-0.5 block font-mono text-[9px] text-text-muted">{detail}</span></span>
              <ArrowRight size={14} className="text-text-muted" />
            </button>
          ))}
        </div>
      </section>

      <section className="gallery-card p-4">
        <h2 className="text-[13px] font-medium text-text-primary">Find your rhythm</h2>
        {user ? (
          <div className="mt-4 grid grid-cols-2 divide-x divide-border border-y border-border py-3">
            <div><p className="font-mono text-[20px] text-text-primary">{streak}</p><p className="mt-1 text-[10px] text-text-muted">day streak</p></div>
            <div className="pl-4"><p className="font-mono text-[20px] text-text-primary">L{level}</p><p className="mt-1 text-[10px] text-text-muted">current level</p></div>
          </div>
        ) : (
          <div className="mt-4 flex gap-3 border-t border-border pt-4"><Camera size={18} className="mt-0.5 shrink-0 text-text-muted" /><p className="text-[11px] leading-5 text-text-muted">One action is all it takes to begin. Come back tomorrow and make it a habit.</p></div>
        )}
      </section>
    </aside>
  )
}

export function FeedTab() {
  const { user, setActiveTab, setShowSignIn } = useApp()

  const stream = useLive(signal => api.feed(signal), [user?.uid], { enabled: !!user, intervalMs: 45_000 })
  const posts: Post[] = stream.data?.posts ?? []
  const loaded = !stream.loading

  return (
    <motion.div
      key="feed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="dashboard-overview"
    >
      <div className="dashboard-greeting">
        <div><h1>{user ? `Hello, ${user.displayName?.split(' ')[0] || 'you'}.` : 'A little better, every day.'}</h1><p>Your everyday choices. A positive difference.</p></div>
        <button onClick={() => user ? setActiveTab('log') : setShowSignIn(true)} className="gallery-primary dashboard-log">Log an action <Camera size={18}/></button>
      </div>
      <ImpactRibbon />
      <ImpactCards />
      {!user && <GuestActivation />}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0"><div className="community-heading"><h2>Better together</h2><p>Everyday wins from the Rippl community.</p></div>
          {user && <CreatePost onPosted={stream.refresh} />}
          {!loaded ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : posts.length === 0 ? (
            <div className="community-empty"><p className="text-[13px] text-text-primary">{user ? 'Be the first to share a little good.' : 'Good things happen together.'}</p>{!user && <p className="community-empty-detail">Sign in to see what others are doing and share your own small wins.</p>}{user && <button onClick={() => setActiveTab('log')} className="mt-3 text-[12px] font-medium text-text-muted underline underline-offset-4">Log the first action</button>}</div>
          ) : (
            <div className="flex flex-col space-y-3"><AnimatePresence mode="popLayout" initial={false}>{posts.map((post, i) => <FeedCard key={post.id} post={post} index={i} onChanged={stream.refresh} />)}</AnimatePresence></div>
          )}
        </div>
        <FieldStationRail />
      </div>
    </motion.div>
  )
}

function FeedCard({ post, index, onChanged }: { post: Post; index: number; onChanged: () => void }) {
  const { user, isAdmin, setShowSignIn } = useApp()
  const [liked, setLiked] = useState(post.liked)
  const [likeCount, setLikeCount] = useState(post.likesCount)
  const cat = categoryIcons[post.category] || categoryIcons.transport
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(post.action)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentCount, setCommentCount] = useState(post.commentsCount)
  const [error, setError] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const isOwner = user?.uid === post.author.uid

  useEffect(() => {
    const handleClick = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', handleClick)
    return () => document.removeEventListener('pointerdown', handleClick)
  }, [])

  /* A refetch replaces the post object. Reconciling during render rather than
     in an effect keeps an optimistic like from flashing back for a frame. */
  const [seen, setSeen] = useState(post)
  if (seen !== post) {
    setSeen(post)
    setLiked(post.liked)
    setLikeCount(post.likesCount)
    setCommentCount(post.commentsCount)
  }

  const handleLike = async () => {
    if (!user) { setShowSignIn(true); return }
    const optimistic = !liked
    setLiked(optimistic)
    setLikeCount(c => (optimistic ? c + 1 : Math.max(0, c - 1)))
    try {
      const result = await api.like(post.id)
      setLiked(result.liked)
      setLikeCount(result.likesCount)
    } catch {
      setLiked(!optimistic)
      setLikeCount(c => (optimistic ? Math.max(0, c - 1) : c + 1))
    }
  }

  const act = async (work: () => Promise<unknown>, after?: () => void) => {
    setError(null)
    try {
      await work()
      after?.()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'That did not go through.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    setMenuOpen(false)
    await act(() => api.deletePost(post.id), onChanged)
  }

  const handleRemoveImage = async () => {
    if (!confirm('Remove image from this post?')) return
    setMenuOpen(false)
    await act(() => api.removePostImage(post.id), onChanged)
  }

  const handleEdit = async () => {
    if (!editText.trim()) return
    await act(() => api.editPost(post.id, editText.trim()), () => {
      setEditing(false)
      setMenuOpen(false)
      onChanged()
    })
  }

  const loadComments = async () => {
    await act(async () => {
      const result = await api.comments(post.id)
      setComments(result.comments)
    })
  }

  const handleCommentClick = () => {
    if (!user) { setShowSignIn(true); return }
    setShowComments(true)
    void loadComments()
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return
    const text = commentText.trim()
    setCommentText('')
    await act(() => api.addComment(post.id, text), () => {
      setCommentCount(c => c + 1)
      void loadComments()
      onChanged()
    })
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, height: 0, padding: 0, marginTop: 0, marginBottom: 0, border: 0 }}
        transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="gallery-card p-5 group hover:bg-surface-overlay transition-colors duration-300 overflow-hidden"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full border border-white/15 bg-black flex items-center justify-center shrink-0">
            <span className="text-[10px] font-mono font-medium text-white">{initials(post.author.displayName)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-body text-[13px] font-medium text-text-primary">{post.author.displayName}</span>
              <span className="font-mono text-[9px] text-text-muted">{timeAgo(post.createdAt)}</span>
            </div>
            {editing ? (
              <div className="mt-1">
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  className="w-full bg-surface-overlay rounded-lg p-2 font-body text-[12px] text-text-primary outline-none border border-border resize-none"
                  rows={2}
                />
                <div className="mt-1 flex gap-1">
                  <button onClick={handleEdit} className="min-h-11 rounded-lg px-3 font-mono text-[12px] text-oasis-400 hover:text-oasis-300">Save</button>
                  <button onClick={() => { setEditing(false); setEditText(post.action) }} className="min-h-11 rounded-lg px-3 font-mono text-[12px] text-text-muted hover:text-text-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="font-body text-[14px] text-text-secondary mt-2 leading-relaxed">{post.action}</p>
            )}
            {post.imageUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-border flex justify-center bg-surface-overlay/20">
                <PrivateImage src={post.imageUrl} alt="" loading="lazy" className="max-h-80 object-contain" />
              </div>
            )}
            {post.category && cat && (
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-overlay px-2.5 py-1">
                  <cat.icon size={10} className={cat.color} />
                  <span className="font-mono text-[9px] text-text-secondary">{post.impact}</span>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-overlay px-2.5 py-1">
                  <span className="font-mono text-[9px] text-text-secondary">+{post.points} pts</span>
                </div>
              </div>
            )}
          </div>
          {(isOwner || isAdmin) && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="post options"
                aria-expanded={menuOpen}
                className="-mr-2 -mt-2 flex h-11 w-11 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-overlay hover:text-text-secondary"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 top-8 z-50 bg-surface-raised border border-border rounded-xl p-1.5 min-w-[120px]"
                >
                  <button
                    onClick={() => { setEditing(true); setMenuOpen(false); setEditText(post.action) }}
                    className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-overlay"
                  >
                    <Edit2 size={12} className="text-text-muted" />
                    <span className="font-body text-[11px] text-text-primary">Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-overlay"
                  >
                    <Trash size={12} className="text-red-400" />
                    <span className="font-body text-[11px] text-red-400">Delete</span>
                  </button>
                  {(isAdmin || isOwner) && post.imageUrl && (
                    <button
                      onClick={handleRemoveImage}
                      className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-overlay"
                    >
                      <Image size={12} className="text-text-muted" />
                      <span className="font-body text-[11px] text-text-primary">Remove image</span>
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {error && <p role="alert" className="mt-2 font-body text-[11px] text-red-400">{error}</p>}

        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-border">
          <button onClick={handleLike} aria-pressed={liked} aria-label={liked ? 'unlike' : 'like'} className="group/btn -my-1 flex min-h-11 flex-1 items-center justify-start gap-1.5 rounded-xl px-2">
            <Heart
              size={16}
              className={`transition-all duration-200 ${liked ? 'text-red-400 fill-red-400 scale-110' : 'text-text-muted group-hover/btn:text-red-400'}`}
            />
            <span className={`font-mono text-[11px] ${liked ? 'text-red-400' : 'text-text-muted'}`}>{likeCount}</span>
          </button>
          <button onClick={handleCommentClick} aria-label="comments" className="group/btn -my-1 flex min-h-11 flex-1 items-center justify-end gap-1.5 rounded-xl px-2">
            <MessageCircle size={16} className="text-text-muted group-hover/btn:text-gulf-400 transition-colors" />
            <span className="font-mono text-[11px] text-text-muted">{commentCount}</span>
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="comments-sheet fixed inset-0 z-[90] flex flex-col bg-surface/95 backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border">
              <h3 className="font-body text-[14px] font-bold text-text-primary">Comments</h3>
              <button
                onClick={() => setShowComments(false)}
                aria-label="close comments"
                className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-overlay hover:text-text-secondary"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3">
              {comments.length === 0 ? (
                <p className="font-mono text-[10px] text-text-muted text-center py-10">No comments yet</p>
              ) : comments.map(c => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gulf-400 to-oasis-400 flex items-center justify-center shrink-0">
                    <span className="text-[7px] font-body font-bold text-surface">
                      {initials(c.author.displayName)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-body text-[11px] font-semibold text-text-primary">{c.author.displayName}</span>
                      <span className="font-mono text-[8px] text-text-muted">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="font-body text-[11px] text-text-secondary mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="comments-composer flex shrink-0 gap-2 border-t border-border px-4 py-3">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                enterKeyHint="send"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-xl border border-border bg-surface-overlay px-3 py-2.5 font-body text-[14px] text-text-primary placeholder:text-text-muted outline-none"
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                aria-label="send comment"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-oasis-500 transition-colors hover:bg-oasis-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={16} className="text-surface" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
