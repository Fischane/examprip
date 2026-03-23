'use client'

import { useState } from 'react'
import { Upload, FileText } from 'lucide-react'

export default function UploadsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [subject, setSubject] = useState('')
  const [status, setStatus] = useState('')

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !subject) return
    setStatus('Parsing...')
    // Parse CSV/Excel and bulk upload
    const text = await file.text()
    const lines = text.split('\n').filter(Boolean).slice(1) // skip header
    const questions = lines.map(line => {
      const [question, optionA, optionB, optionC, optionD, correctAnswer, difficulty] = line.split(',').map(s => s.trim())
      return { question, optionA, optionB, optionC, optionD, correctAnswer, difficulty: difficulty || 'MEDIUM', subject, type: 'MCQ' }
    }).filter(q => q.question)

    const res = await fetch('/api/questions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions }),
    })
    const data = await res.json()
    setStatus(`✅ Uploaded ${data.inserted} questions`)
    setFile(null)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bulk Upload</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg">
          <FileText className="w-5 h-5 text-blue-600" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">CSV Format:</p>
            <p className="text-xs">question, optionA, optionB, optionC, optionD, correctAnswer, difficulty</p>
          </div>
        </div>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject ID</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} required placeholder="MongoDB Subject ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">Upload CSV file</p>
            <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] || null)} className="text-sm" />
          </div>
          {status && <p className="text-sm text-green-600 font-medium">{status}</p>}
          <button type="submit" disabled={!file || !subject}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium">
            Upload Questions
          </button>
        </form>
      </div>
    </div>
  )
}
