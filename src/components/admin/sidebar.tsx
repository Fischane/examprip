'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/questions', label: 'Questions' },
  { href: '/admin/exams', label: 'Exams' },
  { href: '/admin/materials', label: 'Materials' },
  { href: '/admin/payments', label: 'Payments' },
  { href: '/admin/results', label: 'Results' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/uploads', label: 'Uploads' },
  { href: '/admin/notifications', label: 'Notifications' },
  { href: '/admin/settings', label: 'Settings' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-gray-200">
        <span className="font-bold text-gray-900 text-lg">ExamAdmin</span>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {items.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
