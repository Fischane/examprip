'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {[
          { label: 'Site Name', defaultValue: 'ExamPrep', type: 'text' },
          { label: 'Default Time Limit (min)', defaultValue: '60', type: 'number' },
          { label: 'Default Passing Mark (%)', defaultValue: '60', type: 'number' },
        ].map(({ label, defaultValue, type }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input type={type} defaultValue={defaultValue}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
