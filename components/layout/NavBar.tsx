'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Home, Search as SearchIcon, LogOut, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = storedTheme || systemTheme
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-4">
      <div className="navbar-start">
        <Link 
          href="/" 
          className="btn btn-ghost normal-case text-xl"
          aria-label="Go to dashboard"
        >
          Note-Taker 2.0
        </Link>
      </div>
      
      <div className="navbar-end gap-2">
        <button 
          className={`btn btn-ghost btn-circle ${pathname === '/' ? 'btn-active' : ''}`}
          onClick={() => router.push('/')}
          title="Dashboard"
          aria-label="Dashboard"
        >
          <Home className="w-5 h-5" />
        </button>
        <button 
          className={`btn btn-ghost btn-circle ${pathname === '/search' ? 'btn-active' : ''}`}
          onClick={() => router.push('/search')}
          title="Search"
          aria-label="Search"
        >
          <SearchIcon className="w-5 h-5" />
        </button>
        <button 
          className="btn btn-ghost btn-circle"
          onClick={handleLogout}
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleToggleTheme}
          className="btn btn-ghost btn-circle"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}
