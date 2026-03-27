'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Trash2, Download, Eye } from 'lucide-react'

interface Experience { company: string; role: string; from: string; to: string; desc: string }
interface Education { school: string; degree: string; from: string; to: string }
interface CV {
  name: string; email: string; phone: string; address: string; linkedin: string; summary: string
  experiences: Experience[]; educations: Education[]; skills: string; languages: string
}

const empty: CV = {
  name: '', email: '', phone: '', address: '', linkedin: '', summary: '',
  experiences: [{ company: '', role: '', from: '', to: '', desc: '' }],
  educations: [{ school: '', degree: '', from: '', to: '' }],
  skills: '', languages: '',
}

export default function CVMakerPage() {
  const { data: session } = useSession()
  const [cv, setCV] = useState<CV>({ ...empty, name: session?.user?.name || '', email: session?.user?.email || '' })
  const [preview, setPreview] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  function set(field: keyof CV, value: any) { setCV(p => ({ ...p, [field]: value })) }

  function setExp(i: number, field: keyof Experience, value: string) {
    const exps = [...cv.experiences]
    exps[i] = { ...exps[i], [field]: value }
    set('experiences', exps)
  }
  function setEdu(i: number, field: keyof Education, value: string) {
    const edus = [...cv.educations]
    edus[i] = { ...edus[i], [field]: value }
    set('educations', edus)
  }

  function handlePrint() {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>${cv.name} - CV</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #111; font-size: 13px; }
      h1 { font-size: 22px; margin: 0 0 4px; } h2 { font-size: 13px; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 0.05em; color: #444; }
      .meta { color: #555; font-size: 12px; margin-bottom: 12px; } .entry { margin-bottom: 10px; }
      .entry-header { display: flex; justify-content: space-between; } .entry-title { font-weight: bold; }
      .entry-sub { color: #555; font-size: 12px; } .entry-desc { margin-top: 3px; color: #333; }
      .skills { line-height: 1.8; } @media print { body { padding: 16px; } }
    </style></head><body>${content}</body></html>`)
    win.document.close()
    win.focus()
    win.print()
  }

  const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const label = 'text-xs font-medium text-gray-600 mb-1 block'

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CV Maker</h1>
          <p className="text-sm text-gray-500">Build and download your professional resume</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPreview(!preview)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Eye className="w-4 h-4" /> {preview ? 'Edit' : 'Preview'}
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Download className="w-4 h-4" /> Download / Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        {!preview && (
          <div className="space-y-6">
            {/* Personal Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([['name','Full Name'],['email','Email'],['phone','Phone'],['address','Address'],['linkedin','LinkedIn URL']] as [keyof CV, string][]).map(([f, l]) => (
                  <div key={f} className={f === 'linkedin' || f === 'address' ? 'sm:col-span-2' : ''}>
                    <label className={label}>{l}</label>
                    <input value={cv[f] as string} onChange={e => set(f, e.target.value)} className={inp} placeholder={l} />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className={label}>Professional Summary</label>
                  <textarea value={cv.summary} onChange={e => set('summary', e.target.value)} rows={3}
                    className={inp} placeholder="Brief summary about yourself..." />
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Work Experience</h2>
                <button onClick={() => set('experiences', [...cv.experiences, { company: '', role: '', from: '', to: '', desc: '' }])}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              {cv.experiences.map((exp, i) => (
                <div key={i} className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500">Experience {i + 1}</span>
                    {cv.experiences.length > 1 && (
                      <button onClick={() => set('experiences', cv.experiences.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div><label className={label}>Company</label><input value={exp.company} onChange={e => setExp(i, 'company', e.target.value)} className={inp} placeholder="Company name" /></div>
                    <div><label className={label}>Role</label><input value={exp.role} onChange={e => setExp(i, 'role', e.target.value)} className={inp} placeholder="Job title" /></div>
                    <div><label className={label}>From</label><input value={exp.from} onChange={e => setExp(i, 'from', e.target.value)} className={inp} placeholder="Jan 2022" /></div>
                    <div><label className={label}>To</label><input value={exp.to} onChange={e => setExp(i, 'to', e.target.value)} className={inp} placeholder="Present" /></div>
                    <div className="sm:col-span-2"><label className={label}>Description</label>
                      <textarea value={exp.desc} onChange={e => setExp(i, 'desc', e.target.value)} rows={2} className={inp} placeholder="Key responsibilities..." /></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Education</h2>
                <button onClick={() => set('educations', [...cv.educations, { school: '', degree: '', from: '', to: '' }])}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              {cv.educations.map((edu, i) => (
                <div key={i} className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500">Education {i + 1}</span>
                    {cv.educations.length > 1 && (
                      <button onClick={() => set('educations', cv.educations.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div><label className={label}>School / University</label><input value={edu.school} onChange={e => setEdu(i, 'school', e.target.value)} className={inp} placeholder="University name" /></div>
                    <div><label className={label}>Degree / Field</label><input value={edu.degree} onChange={e => setEdu(i, 'degree', e.target.value)} className={inp} placeholder="BSc Computer Science" /></div>
                    <div><label className={label}>From</label><input value={edu.from} onChange={e => setEdu(i, 'from', e.target.value)} className={inp} placeholder="2018" /></div>
                    <div><label className={label}>To</label><input value={edu.to} onChange={e => setEdu(i, 'to', e.target.value)} className={inp} placeholder="2022" /></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills & Languages */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Skills & Languages</h2>
              <div className="space-y-3">
                <div><label className={label}>Skills (comma separated)</label>
                  <input value={cv.skills} onChange={e => set('skills', e.target.value)} className={inp} placeholder="JavaScript, React, Node.js, MongoDB..." /></div>
                <div><label className={label}>Languages</label>
                  <input value={cv.languages} onChange={e => set('languages', e.target.value)} className={inp} placeholder="English (Fluent), Amharic (Native)..." /></div>
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className={preview ? 'lg:col-span-2' : ''}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Preview</h2>
            <div ref={printRef} className="text-sm text-gray-800 font-sans">
              {/* Header */}
              <h1 className="text-2xl font-bold text-gray-900">{cv.name || 'Your Name'}</h1>
              <p className="text-gray-500 text-xs mt-1 space-x-2">
                {cv.email && <span>{cv.email}</span>}
                {cv.phone && <span>· {cv.phone}</span>}
                {cv.address && <span>· {cv.address}</span>}
                {cv.linkedin && <span>· {cv.linkedin}</span>}
              </p>
              {cv.summary && <p className="mt-3 text-gray-700 text-sm leading-relaxed">{cv.summary}</p>}

              {/* Experience */}
              {cv.experiences.some(e => e.company) && (
                <>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200 pb-1 mt-5 mb-3">Work Experience</h2>
                  {cv.experiences.filter(e => e.company).map((exp, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-gray-900">{exp.role}</span>
                        <span className="text-xs text-gray-500">{exp.from}{exp.to ? ` – ${exp.to}` : ''}</span>
                      </div>
                      <p className="text-xs text-gray-500">{exp.company}</p>
                      {exp.desc && <p className="text-xs text-gray-600 mt-1">{exp.desc}</p>}
                    </div>
                  ))}
                </>
              )}

              {/* Education */}
              {cv.educations.some(e => e.school) && (
                <>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200 pb-1 mt-5 mb-3">Education</h2>
                  {cv.educations.filter(e => e.school).map((edu, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-gray-900">{edu.degree}</span>
                        <span className="text-xs text-gray-500">{edu.from}{edu.to ? ` – ${edu.to}` : ''}</span>
                      </div>
                      <p className="text-xs text-gray-500">{edu.school}</p>
                    </div>
                  ))}
                </>
              )}

              {/* Skills */}
              {cv.skills && (
                <>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200 pb-1 mt-5 mb-3">Skills</h2>
                  <p className="text-xs text-gray-700 leading-relaxed">{cv.skills}</p>
                </>
              )}

              {/* Languages */}
              {cv.languages && (
                <>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200 pb-1 mt-5 mb-3">Languages</h2>
                  <p className="text-xs text-gray-700">{cv.languages}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
