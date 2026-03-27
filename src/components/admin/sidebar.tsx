'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const items = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/questions', label: 'Questions' },
  { href: '/admin/exams', label: 'Exams' },
  { href: '/admin/materials', label: 'Materials' },
  { href: '/admin/payments', label: 'Payments' },
  { href: '/admin/results', label: 'Results' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/cv-templates', label: 'CV Templates' },
  { href: '/admin/cv-analytics', label: 'CV Analytics' },
  { href: '/admin/cv-settings', label: 'CV Settings' },
  { href: '/admin/notifications', label: 'Notifications' },
  { href: '/admin/settings', label: 'Settings' },
]

function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex-1 p-3 space-y-0.5">
      {items.map(({ href, label }) => (
        <Link key={href} href={href} onClick={onClick}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === href || pathname.startsWith(href + '/')
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}>
          {label}
        </Link>
      ))}
    </nav>
  )
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col">
        <div className="h-16 flex items-center px-5 border-b border-gray-200">
          <span className="font-bold text-gray-900 text-lg">ExamAdmin</span>
        </div>
        <NavLinks />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <span className="font-bold text-gray-900">ExamAdmin</span>
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-white flex flex-col shadow-xl">
            <div className="h-14 flex items-center justify-between px-5 border-b border-gray-200">
              <span className="font-bold text-gray-900">ExamAdmin</span>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <NavLinks onClick={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}
