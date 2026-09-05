import { Newspaper, ClipboardList, Trophy, User, Gift, MoreHorizontal } from 'lucide-react'

export const navTabs = [
  { id: 'feed' as const, label: 'Overview', icon: Newspaper },
  { id: 'log' as const, label: 'Activities', icon: ClipboardList },
  { id: 'rewards' as const, label: 'Rewards', icon: Gift },
  { id: 'rank' as const, label: 'Leaderboard', icon: Trophy },
  { id: 'profile' as const, label: 'Profile', icon: User },
  { id: 'extras' as const, label: 'Explore', icon: MoreHorizontal },
]

