'use client'

import { signOut, useSession } from 'next-auth/react'

export function AdminHeader() {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {user?.name?.[0]?.toUpperCase() ?? 'A'}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
