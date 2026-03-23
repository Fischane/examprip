'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Search } from 'lucide-react'

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ question: '', type: 'MCQ', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', difficulty: 'MEDIUM', subject: '', topic: '' })

  useEffect(() => {
    fetch('/api/questions').then(r => r.json()).then(setQuestions)
    fetch('/api/subjects').then(r => r.json()).then(setSubjects)
  }, [])

  const filtered = questions.filter(q => q.question.toLowerCase().includes(search.toLowerCase()))

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/questions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const q = await res.json()
    setQuestions([q, ...questions])
    setShowModal(false)
    setForm({ question: '', type: 'MCQ', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', difficulty: 'MEDIUM', subject: '', topic: '' })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete?')) return
    await fetch(`/api/questions/${id}`, { method: 'DELETE' })
    setQuestions(questions.filter(q => q._id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Questions ({questions.length})</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Question', 'Type', 'Subject', 'Difficulty', 'Answer', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(q => (
              <tr key={q._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 max-w-xs truncate">{q.question}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{q.type}</span></td>
                <td className="px-4 py-3 text-gray-500">{q.subject?.name || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${q.difficulty === 'EASY' ? 'bg-green-100 text-green-700' : q.difficulty === 'HARD' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{q.difficulty}</span>
                </td>
                <td className="px-4 py-3 font-bold text-gray-900">{q.correctAnswer}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(q._id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Question</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <textarea value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required placeholder="Question text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="MCQ">MCQ</option>
                  <option value="TRUE_FALSE">True/False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                </select>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              {form.type === 'MCQ' && (
                <div className="grid grid-cols-2 gap-3">
                  {['A', 'B', 'C', 'D'].map(k => (
                    <input key={k} value={(form as any)[`option${k}`]} onChange={e => setForm({ ...form, [`option${k}`]: e.target.value })}
                      placeholder={`Option ${k}`} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <select value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {form.type === 'MCQ' ? ['A','B','C','D'].map(k => <option key={k} value={k}>{k}</option>) : ['True','False'].map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Add Question</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
