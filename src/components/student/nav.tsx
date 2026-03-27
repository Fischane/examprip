'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navItems = [
  { href: '/app/dashboard', label: 'Dashboard' },
  { href: '/app/exams', label: 'Exams' },
  { href: '/app/materials', label: 'Materials' },
  { href: '/app/results', label: 'My Results' },
  { href: '/app/payment', label: 'Payment' },
  { href: '/app/profile', label: 'Profile' },
]

export function StudentNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-gray-900 text-base">ExamPrep</span>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 hidden sm:block">{session?.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: '/login' })}
            className="hidden md:block text-sm text-gray-500 hover:text-red-500 px-2 py-1 rounded hover:bg-gray-100">
            Sign out
          </button>
          {/* Hamburger */}
          <button onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {navItems.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
              {label}
            </Link>
          ))}
          <button onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 font-medium">
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}
