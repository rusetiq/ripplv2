import { useApp } from '../App'
import { Moon, Shield, Sun, ArrowUpRight, Plus, User } from 'lucide-react'
import { navTabs } from './navigation'

export function StatusBar() {
  const { points, level, darkMode, setDarkMode, activeTab, setActiveTab, isAdmin, user, setShowSignIn } = useApp()
  return <aside className="dashboard-sidebar">
    <a href="/" className="dashboard-brand" aria-label="rippl home"><span className="rippl-brand-mark" aria-hidden="true"/>rippl</a>
    <div className="sidebar-heading">Your space</div>
    <nav className="dashboard-navigation" aria-label="Main navigation">
      {navTabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveTab(id)} aria-current={activeTab === id ? 'page' : undefined} className={activeTab === id ? 'is-active' : ''}><Icon size={19} strokeWidth={1.5}/><span>{label}</span>{activeTab === id && <ArrowUpRight size={17}/>}</button>)}
      {isAdmin && <button onClick={() => setActiveTab('admin')} aria-current={activeTab === 'admin' ? 'page' : undefined}><Shield size={19}/><span>Admin</span></button>}
    </nav>
    <div className="sidebar-invitation"><span className="small-pill">One step at a time</span><h2>A little good.<br/>Every day.</h2><p>Your next small choice could be the start of something.</p><button onClick={() => user ? setActiveTab('log') : setShowSignIn(true)}>Log an action <Plus size={18}/></button></div>
    <div className="sidebar-bottom"><button className="sidebar-profile" onClick={() => user ? setActiveTab('profile') : setShowSignIn(true)}><span className="profile-circle"><User size={19}/></span><span>{user ? user.displayName || 'Your profile' : 'Make yourself at home'}<small>{user ? `Level ${level} · ${points.toLocaleString()} points` : 'Sign in to save your progress'}</small></span></button><button className="theme-button" onClick={() => setDarkMode(!darkMode)} aria-label={darkMode ? 'Use light mode' : 'Use dark mode'}>{darkMode ? <Sun size={18}/> : <Moon size={18}/>}</button></div>
  </aside>
}
