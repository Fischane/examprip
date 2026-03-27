'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Trash2, Download, Edit3, Save, CheckCircle, Loader2 } from 'lucide-react'
import { COLOR_SCHEMES, FONT_OPTIONS, resolveColorScheme, resolveFont } from '@/lib/cv-styling'

interface Experience { role: string; company: string; from: string; to: string; desc: string }
interface Education { school: string; degree: string; from: string; to: string }
interface Reference { name: string; address: string; phone: string; email: string }
interface Skill { name: string; level: number }
interface CV {
  name: string; title: string; phone: string; phone2: string
  website: string; email: string; address: string; summary: string
  experiences: Experience[]; educations: Education[]
  references: Reference[]; skills: Skill[]
  photo: string
  links: { linkedin: string; github: string; portfolio: string }
}

const empty: CV = {
  name: '', title: '', phone: '', phone2: '', website: '', email: '', address: '', summary: '',
  experiences: [{ role: '', company: '', from: '', to: '', desc: '' }],
  educations: [{ school: '', degree: '', from: '', to: '' }],
  references: [{ name: '', address: '', phone: '', email: '' }],
  skills: [{ name: '', level: 70 }],
  photo: '',
  links: { linkedin: '', github: '', portfolio: '' },
}

const inp = 'w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500'
const lbl = 'text-xs font-medium text-gray-500 mb-0.5 block'

export default function CVEditorByIdPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const docId = params.id as string

  const [cv, setCV] = useState<CV>(empty)
  const [cvName, setCvName] = useState('My CV')
  const [templateId, setTemplateId] = useState('')
  const [colorScheme, setColorScheme] = useState('default')
  const [font, setFont] = useState('inter')
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/cv-documents/${docId}`)
      .then(r => r.json())
      .then(doc => {
        if (doc.error) { router.push('/app/cv/dashboard'); return }
        const d = doc.data || {}
        setCV({
          name: d.name || '',
          title: d.title || '',
          phone: d.phone || '',
          phone2: d.phone2 || '',
          website: d.website || '',
          email: d.email || '',
          address: d.address || '',
          summary: d.summary || '',
          experiences: d.experiences?.length ? d.experiences : empty.experiences,
          educations: d.educations?.length ? d.educations : empty.educations,
          references: d.references?.length ? d.references : empty.references,
          skills: d.skills?.length ? d.skills : empty.skills,
          photo: d.photo || '',
          links: { linkedin: d.links?.linkedin || '', github: d.links?.github || '', portfolio: d.links?.portfolio || '' },
        })
        setCvName(doc.name || 'My CV')
        setTemplateId(doc.templateId || '')
        if (doc.styling?.colorScheme) setColorScheme(doc.styling.colorScheme)
        if (doc.styling?.font) setFont(doc.styling.font)
      })
      .catch(() => router.push('/app/cv/dashboard'))
      .finally(() => setLoading(false))
  }, [docId])

  function set(f: keyof CV, v: any) { setCV(p => ({ ...p, [f]: v })) }
  function setExp(i: number, f: keyof Experience, v: string) {
    const a = [...cv.experiences]; a[i] = { ...a[i], [f]: v }; set('experiences', a)
  }
  function setEdu(i: number, f: keyof Education, v: string) {
    const a = [...cv.educations]; a[i] = { ...a[i], [f]: v }; set('educations', a)
  }
  function setRef(i: number, f: keyof Reference, v: string) {
    const a = [...cv.references]; a[i] = { ...a[i], [f]: v }; set('references', a)
  }
  function setSkill(i: number, f: keyof Skill, v: any) {
    const a = [...cv.skills]; a[i] = { ...a[i], [f]: v }; set('skills', a)
  }
  function setLink(f: keyof CV['links'], v: string) {
    setCV(p => ({ ...p, links: { ...p.links, [f]: v } }))
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => set('photo', ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true); setSaveError('')
    try {
      const res = await fetch(`/api/cv-documents/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cvName,
          data: { ...cv },
          styling: { colorScheme, font, accentColor: resolveColorScheme(colorScheme).accent, backgroundColor: resolveColorScheme(colorScheme).background },
        }),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
      else { const d = await res.json(); setSaveError(d.error || 'Save failed') }
    } catch { setSaveError('Save failed') }
    setSaving(false)
  }

  async function handlePrint() {
    // Log download record
    await fetch('/api/download-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cvDocumentId: docId, type: 'cv' }),
    }).catch(() => {})

    const scheme = resolveColorScheme(colorScheme)
    const fontCss = resolveFont(font).css
    const nameParts = cv.name.trim().split(' ')
    const fn = nameParts.slice(0, -1).join(' ')
    const ln = nameParts.slice(-1)[0] || cv.name

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>${cv.name || 'CV'}</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:${fontCss};display:flex;min-height:297mm;-webkit-print-color-adjust:exact;print-color-adjust:exact}</style>
    </head><body>
    <div style="width:200px;flex-shrink:0;background:${scheme.sidebar};color:#fff;padding:24px 16px;min-height:100vh">
      ${cv.photo ? `<div style="text-align:center;margin-bottom:14px"><img src="${cv.photo}" style="width:88px;height:88px;border-radius:50%;object-fit:cover;border:3px solid ${scheme.accent};display:inline-block"/></div>` : ''}
      <div style="font-size:9px;font-weight:bold;text-transform:uppercase;color:${scheme.accent};border-bottom:1px solid #444;padding-bottom:5px;margin:14px 0 8px">Contact</div>
      <div style="font-size:10px;color:#ccc;line-height:1.8">
        ${cv.phone ? `<div>📞 ${cv.phone}</div>` : ''}
        ${cv.email ? `<div>✉ ${cv.email}</div>` : ''}
        ${cv.address ? `<div>📍 ${cv.address}</div>` : ''}
        ${cv.links.linkedin ? `<div>🔗 ${cv.links.linkedin}</div>` : ''}
        ${cv.links.github ? `<div>💻 ${cv.links.github}</div>` : ''}
        ${cv.links.portfolio ? `<div>🌐 ${cv.links.portfolio}</div>` : ''}
      </div>
    </div>
    <div style="flex:1;background:#fff;padding:32px 28px">
      <div style="font-size:26px;font-weight:900;color:#222;line-height:1.1;margin-bottom:18px">${fn ? `${fn} ` : ''}<span style="color:${scheme.accent}">${ln}</span></div>
      ${cv.title ? `<div style="font-size:10px;text-transform:uppercase;letter-spacing:.15em;color:#999;margin-top:4px">${cv.title}</div>` : ''}
      ${cv.summary ? `<div style="font-size:9px;font-weight:bold;text-transform:uppercase;color:${scheme.accent};border-bottom:2px solid ${scheme.accent};padding-bottom:4px;margin:18px 0 10px">About Me</div><p style="font-size:10px;color:#555;line-height:1.6">${cv.summary}</p>` : ''}
    </div>
    </body></html>`)
    win.document.close()
    setTimeout(() => { win.focus(); win.print() }, 300)
  }

  const scheme = resolveColorScheme(colorScheme)
  const fontCss = resolveFont(font).css
  const nameParts = cv.name.trim().split(' ')
  const firstName = nameParts.slice(0, -1).join(' ')
  const lastName = nameParts.slice(-1)[0] || ''

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit CV</h1>
          <p className="text-xs text-gray-500">Update your saved resume</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input value={cvName} onChange={e => setCvName(e.target.value)} placeholder="CV Name"
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-36" />
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-60">
            {saved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save CV'}
          </button>
          <button onClick={() => setTab(tab === 'edit' ? 'preview' : 'edit')}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50">
            <Edit3 className="w-3.5 h-3.5" /> {tab === 'edit' ? 'Preview' : 'Edit'}
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-medium hover:bg-yellow-600">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </div>

      {saveError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">{saveError}</div>}

      <div className={`grid gap-6 ${tab === 'edit' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
        {tab === 'edit' && (
          <div className="space-y-4 text-sm">
            {/* Styling */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Styling</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Color Scheme</label>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {Object.entries(COLOR_SCHEMES).map(([key, s]) => (
                      <button key={key} onClick={() => setColorScheme(key)} title={key}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${colorScheme === key ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                        style={{ background: s.accent }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Font</label>
                  <select value={font} onChange={e => setFont(e.target.value)} className={inp}>
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Personal */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Personal Info</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2 flex flex-col items-center gap-2 mb-2">
                  {cv.photo
                    ? <img src={cv.photo} className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400" />
                    : <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl">👤</div>}
                  <label className="cursor-pointer text-xs text-blue-600 hover:underline">
                    Upload Photo <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                  </label>
                </div>
                <div><label className={lbl}>Full Name</label><input value={cv.name} onChange={e => set('name', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Job Title</label><input value={cv.title} onChange={e => set('title', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Phone 1</label><input value={cv.phone} onChange={e => set('phone', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Phone 2</label><input value={cv.phone2} onChange={e => set('phone2', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Website</label><input value={cv.website} onChange={e => set('website', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Email</label><input value={cv.email} onChange={e => set('email', e.target.value)} className={inp} /></div>
                <div className="col-span-2"><label className={lbl}>Address</label><input value={cv.address} onChange={e => set('address', e.target.value)} className={inp} /></div>
                <div className="col-span-2"><label className={lbl}>About Me</label><textarea value={cv.summary} onChange={e => set('summary', e.target.value)} rows={3} className={inp} /></div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Social Links</h3>
              <div className="grid grid-cols-1 gap-2">
                <div><label className={lbl}>LinkedIn</label><input value={cv.links.linkedin} onChange={e => setLink('linkedin', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>GitHub</label><input value={cv.links.github} onChange={e => setLink('github', e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Portfolio</label><input value={cv.links.portfolio} onChange={e => setLink('portfolio', e.target.value)} className={inp} /></div>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800 text-sm">Job Experience</h3>
                <button onClick={() => set('experiences', [...cv.experiences, { role: '', company: '', from: '', to: '', desc: '' }])}
                  className="text-xs text-blue-600 flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
              </div>
              {cv.experiences.map((exp, i) => (
                <div key={i} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">#{i + 1}</span>
                    {cv.experiences.length > 1 && <button onClick={() => set('experiences', cv.experiences.filter((_, j) => j !== i))}><Trash2 className="w-3 h-3 text-red-400" /></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={lbl}>Role</label><input value={exp.role} onChange={e => setExp(i, 'role', e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Company</label><input value={exp.company} onChange={e => setExp(i, 'company', e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>From</label><input value={exp.from} onChange={e => setExp(i, 'from', e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>To</label><input value={exp.to} onChange={e => setExp(i, 'to', e.target.value)} className={inp} /></div>
                    <div className="col-span-2"><label className={lbl}>Description</label><textarea value={exp.desc} onChange={e => setExp(i, 'desc', e.target.value)} rows={2} className={inp} /></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800 text-sm">Skills</h3>
                <button onClick={() => set('skills', [...cv.skills, { name: '', level: 70 }])}
                  className="text-xs text-blue-600 flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
              </div>
              {cv.skills.map((sk, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input value={sk.name} onChange={e => setSkill(i, 'name', e.target.value)} className={inp} placeholder="Skill name" />
                  <input type="range" min={10} max={100} value={sk.level} onChange={e => setSkill(i, 'level', Number(e.target.value))} className="w-20 accent-yellow-500" />
                  <span className="text-xs text-gray-400 w-6">{sk.level}%</span>
                  {cv.skills.length > 1 && <button onClick={() => set('skills', cv.skills.filter((_, j) => j !== i))}><Trash2 className="w-3 h-3 text-red-400" /></button>}
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800 text-sm">Education</h3>
                <button onClick={() => set('educations', [...cv.educations, { school: '', degree: '', from: '', to: '' }])}
                  className="text-xs text-blue-600 flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
              </div>
              {cv.educations.map((edu, i) => (
                <div key={i} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">#{i + 1}</span>
                    {cv.educations.length > 1 && <button onClick={() => set('educations', cv.educations.filter((_, j) => j !== i))}><Trash2 className="w-3 h-3 text-red-400" /></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={lbl}>School</label><input value={edu.school} onChange={e => setEdu(i, 'school', e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Degree</label><input value={edu.degree} onChange={e => setEdu(i, 'degree', e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>From</label><input value={edu.from} onChange={e => setEdu(i, 'from', e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>To</label><input value={edu.to} onChange={e => setEdu(i, 'to', e.target.value)} className={inp} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        <div className={tab === 'preview' ? 'max-w-3xl mx-auto w-full' : ''}>
          <div ref={printRef} className="flex shadow-lg rounded-xl overflow-hidden min-h-[900px]" style={{ fontFamily: fontCss }}>
            <div className="w-48 flex-shrink-0 text-white p-5" style={{ background: scheme.sidebar }}>
              <div className="flex justify-center mb-4">
                {cv.photo
                  ? <img src={cv.photo} className="w-20 h-20 rounded-full object-cover" style={{ border: `3px solid ${scheme.accent}` }} />
                  : <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-3xl">👤</div>}
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-600 pb-1 mb-2" style={{ color: scheme.accent }}>Contact</h2>
              <div className="space-y-1 text-xs text-gray-300">
                {cv.phone && <p>📞 {cv.phone}</p>}
                {cv.email && <p>✉ {cv.email}</p>}
                {cv.address && <p>📍 {cv.address}</p>}
                {cv.links.linkedin && <p>🔗 LinkedIn</p>}
                {cv.links.github && <p>💻 GitHub</p>}
                {cv.links.portfolio && <p>🌐 Portfolio</p>}
              </div>
              {cv.educations.some(e => e.school) && (
                <div className="mt-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-600 pb-1 mb-2" style={{ color: scheme.accent }}>Education</h2>
                  {cv.educations.filter(e => e.school).map((edu, i) => (
                    <div key={i} className="mb-3">
                      <p className="text-xs font-bold" style={{ color: scheme.accent }}>{edu.school}</p>
                      <p className="text-xs text-gray-400">{edu.degree}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 bg-white p-6">
              <div className="mb-5">
                <h1 className="font-black text-gray-900 leading-tight" style={{ fontSize: '26px' }}>
                  {firstName && <span>{firstName} </span>}
                  <span style={{ color: scheme.accent }}>{lastName || cv.name || 'YOUR NAME'}</span>
                </h1>
                {cv.title && <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">{cv.title}</p>}
              </div>
              {cv.summary && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 pb-1 mb-2" style={{ color: scheme.accent, borderColor: scheme.accent }}>About Me</h2>
                  <p className="text-xs text-gray-600 leading-relaxed">{cv.summary}</p>
                </div>
              )}
              {cv.experiences.some(e => e.role) && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 pb-1 mb-3" style={{ color: scheme.accent, borderColor: scheme.accent }}>Experience</h2>
                  {cv.experiences.filter(e => e.role).map((exp, i) => (
                    <div key={i} className="mb-3 pl-3 border-l-2" style={{ borderColor: scheme.accent }}>
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-bold text-gray-900 uppercase">{exp.role}</p>
                        <p className="text-xs text-gray-400 whitespace-nowrap ml-2">{exp.from}{exp.to ? ` - ${exp.to}` : ''}</p>
                      </div>
                      {exp.company && <p className="text-xs text-gray-500 italic">{exp.company}</p>}
                      {exp.desc && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{exp.desc}</p>}
                    </div>
                  ))}
                </div>
              )}
              {cv.skills.some(s => s.name) && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 pb-1 mb-3" style={{ color: scheme.accent, borderColor: scheme.accent }}>Skills</h2>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {cv.skills.filter(s => s.name).map((sk, i) => (
                      <div key={i}>
                        <span className="text-xs text-gray-700">{sk.name}</span>
                        <div className="h-1.5 bg-gray-200 rounded-full mt-0.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${sk.level}%`, background: scheme.accent }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
