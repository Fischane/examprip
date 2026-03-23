'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, BookOpen } from 'lucide-react'

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', subject: '', questions: [] as string[],
    timeLimit: 60, passingMark: 60, type: 'MOCK', description: ''
  })

  useEffect(() => {
    fetch('/api/exams').then(r => r.json()).then(d => setExams(Array.isArray(d) ? d : []))
    fetch('/api/subjects').then(r => r.json()).then(d => setSubjects(Array.isArray(d) ? d : []))
    fetch('/api/questions').then(r => r.json()).then(d => setQuestions(Array.isArray(d) ? d : []))
  }, [])

  const filteredQ = form.subject
    ? questions.filter(q => q.subject?._id === form.subject || q.subject === form.subject)
    : questions

  function resetForm() {
    setForm({ title: '', subject: '', questions: [], timeLimit: 60, passingMark: 60, type: 'MOCK', description: '' })
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (form.questions.length === 0) { alert('Select at least one question'); return }
    setSaving(true)
    const res = await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, isActive: true }),
    })
    const exam = await res.json()
    setExams(prev => [exam, ...prev])
    setShowModal(false)
    resetForm()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this exam?')) return
    await fetch(`/api/exams/${id}`, { method: 'DELETE' })
    setExams(prev => prev.filter(e => e._id !== id))
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/exams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    setExams(prev => prev.map(e => e._id === id ? { ...e, isActive: !current } : e))
  }

  const typeColor: Record<string, string> = {
    MOCK: 'bg-purple-100 text-purple-700',
    PRACTICE: 'bg-green-100 text-green-700',
    DAILY: 'bg-orange-100 text-orange-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Exams ({exams.length})</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Create Exam
        </button>
      </div>

      {exams.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No exams yet. Create your first exam.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map(exam => (
          <div key={exam._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 flex-1 pr-2">{exam.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${typeColor[exam.type] ?? 'bg-gray-100 text-gray-600'}`}>
                {exam.type}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">{exam.subject?.name ?? '—'}</p>
            <div className="flex gap-3 text-xs text-gray-500 mb-4">
              <span>{exam.questions?.length ?? 0} questions</span>
              <span>{exam.timeLimit} min</span>
              <span>Pass: {exam.passingMark}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${exam.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {exam.isActive ? 'Active' : 'Inactive'}
              </span>
              <div className="flex gap-1">
                <button onClick={() => toggleActive(exam._id, exam.isActive)} className="p-1.5 rounded hover:bg-gray-100" title="Toggle active">
                  {exam.isActive
                    ? <ToggleRight className="w-4 h-4 text-green-600" />
                    : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                </button>
                <button onClick={() => handleDelete(exam._id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create Exam</h2>
            <form onSubmit={handleAdd} className="space-y-4">

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Exam Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required placeholder="e.g. Information Science Mock Exam"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Subject *</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value, questions: [] })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MOCK">Mock Exam</option>
                    <option value="PRACTICE">Practice</option>
                    <option value="DAILY">Daily Quiz</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Time Limit (min)</label>
                  <input
                    type="number" min={1} value={form.timeLimit}
                    onChange={e => setForm({ ...form, timeLimit: +e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Passing Mark (%)</label>
                  <input
                    type="number" min={1} max={100} value={form.passingMark}
                    onChange={e => setForm({ ...form, passingMark: +e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Questions * ({form.questions.length} selected)
                  {!form.subject && <span className="text-gray-400 ml-1">— select a subject first</span>}
                </label>
                <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                  {filteredQ.length === 0 ? (
                    <p className="text-xs text-gray-400 p-4 text-center">
                      {form.subject ? 'No questions for this subject' : 'Select a subject to see questions'}
                    </p>
                  ) : (
                    <div className="p-2 space-y-1">
                      <label className="flex items-center gap-2 p-1 cursor-pointer hover:bg-gray-50 rounded border-b border-gray-100 mb-1">
                        <input
                          type="checkbox"
                          checked={form.questions.length === filteredQ.length}
                          onChange={e => setForm({ ...form, questions: e.target.checked ? filteredQ.map((q: any) => q._id) : [] })}
                        />
                        <span className="text-xs font-medium text-gray-600">Select all ({filteredQ.length})</span>
                      </label>
                      {filteredQ.map((q: any) => (
                        <label key={q._id} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={form.questions.includes(q._id)}
                            onChange={e => setForm({
                              ...form,
                              questions: e.target.checked
                                ? [...form.questions, q._id]
                                : form.questions.filter(id => id !== q._id)
                            })}
                            className="mt-0.5 shrink-0"
                          />
                          <span className="text-xs text-gray-700 leading-relaxed">{q.question}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this exam..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm() }}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium"
                >
                  {saving ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
