'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

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

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-gray-900 text-base">ExamPrep</span>
          <nav className="flex items-center gap-1">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">{session?.user?.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm text-gray-500 hover:text-red-500 px-2 py-1 rounded hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
