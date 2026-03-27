'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Trash2, Download, Edit3 } from 'lucide-react'

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
}

const empty: CV = {
  name: '', title: '', phone: '', phone2: '', website: '', email: '', address: '', summary: '',
  experiences: [{ role: '', company: '', from: '', to: '', desc: '' }],
  educations: [{ school: '', degree: '', from: '', to: '' }],
  references: [{ name: '', address: '', phone: '', email: '' }],
  skills: [{ name: '', level: 70 }],
  photo: '',
}

const inp = 'w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500'
const lbl = 'text-xs font-medium text-gray-500 mb-0.5 block'

export default function CVMakerPage() {
  const { data: session } = useSession()
  const [cv, setCV] = useState<CV>({
    ...empty,
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  })
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const printRef = useRef<HTMLDivElement>(null)

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

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => set('photo', ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handlePrint() {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>${cv.name} CV</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:Arial,sans-serif;display:flex;min-height:100vh}
      .left{width:220px;background:#2d2d2d;color:#fff;padding:24px 16px;flex-shrink:0}
      .right{flex:1;padding:32px 28px;background:#fff}
      .photo-wrap{text-align:center;margin-bottom:16px}
      .photo-wrap img{width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid #f5a623}
      .photo-placeholder{width:90px;height:90px;border-radius:50%;background:#444;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:28px;color:#888}
      .left h2{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#f5a623;border-bottom:1px solid #444;padding-bottom:6px;margin:16px 0 10px;display:flex;align-items:center;gap:6px}
      .left p{font-size:10px;color:#ccc;margin-bottom:3px;line-height:1.5}
      .left .ref-name{font-size:11px;font-weight:bold;color:#f5a623;margin-bottom:2px}
      .edu-school{font-size:11px;font-weight:bold;color:#f5a623}
      .edu-degree{font-size:9px;text-transform:uppercase;color:#aaa;margin-bottom:2px}
      .edu-year{font-size:9px;color:#888}
      .right-name{font-size:28px;font-weight:900;color:#222;line-height:1}
      .right-name span{color:#f5a623}
      .right-title{font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:#888;margin-top:4px;margin-bottom:20px}
      .right h2{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#f5a623;border-bottom:2px solid #f5a623;padding-bottom:4px;margin:20px 0 10px;display:flex;align-items:center;gap:6px}
      .exp-role{font-size:12px;font-weight:bold;color:#222}
      .exp-meta{font-size:10px;color:#888;margin-bottom:3px}
      .exp-desc{font-size:10px;color:#555;line-height:1.5}
      .skill-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
      .skill-name{font-size:10px;width:110px;color:#333}
      .skill-bar{flex:1;height:5px;background:#eee;border-radius:3px}
      .skill-fill{height:5px;background:#f5a623;border-radius:3px}
      .exp-item{margin-bottom:12px;padding-left:10px;border-left:2px solid #f5a623}
      @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body>${content}</body></html>`)
    win.document.close(); win.focus(); win.print()
  }

  const nameParts = cv.name.trim().split(' ')
  const firstName = nameParts.slice(0, -1).join(' ')
  const lastName = nameParts.slice(-1)[0] || ''

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">CV Maker</h1>
          <p className="text-xs text-gray-500">Build your professional resume</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab(tab === 'edit' ? 'preview' : 'edit')}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50">
            <Edit3 className="w-3.5 h-3.5" /> {tab === 'edit' ? 'Preview' : 'Edit'}
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-xs font-medium hover:bg-yellow-600">
            <Download className="w-3.5 h-3.5" /> Download / Print
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${tab === 'edit' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>

        {/* ── FORM ── */}
        {tab === 'edit' && (
          <div className="space-y-4 text-sm">

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
                <div><label className={lbl}>Full Name</label><input value={cv.name} onChange={e => set('name', e.target.value)} className={inp} placeholder="Brian R. Baxter" /></div>
                <div><label className={lbl}>Job Title</label><input value={cv.title} onChange={e => set('title', e.target.value)} className={inp} placeholder="Graphic & Web Designer" /></div>
                <div><label className={lbl}>Phone 1</label><input value={cv.phone} onChange={e => set('phone', e.target.value)} className={inp} placeholder="+1-718-310-5588" /></div>
                <div><label className={lbl}>Phone 2</label><input value={cv.phone2} onChange={e => set('phone2', e.target.value)} className={inp} placeholder="+1-313-381-8167" /></div>
                <div><label className={lbl}>Website</label><input value={cv.website} onChange={e => set('website', e.target.value)} className={inp} placeholder="www.yourwebsite.com" /></div>
                <div><label className={lbl}>Email</label><input value={cv.email} onChange={e => set('email', e.target.value)} className={inp} placeholder="yourinfo@email.com" /></div>
                <div className="col-span-2"><label className={lbl}>Address</label><input value={cv.address} onChange={e => set('address', e.target.value)} className={inp} placeholder="769 Prudence Street, Lincoln Park, MI 48146" /></div>
                <div className="col-span-2"><label className={lbl}>About Me</label><textarea value={cv.summary} onChange={e => set('summary', e.target.value)} rows={3} className={inp} placeholder="Brief professional summary..." /></div>
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
                    <div><label className={lbl}>Role</label><input value={exp.role} onChange={e => setExp(i, 'role', e.target.value)} className={inp} placeholder="Senior Web Designer" /></div>
                    <div><label className={lbl}>Company / City</label><input value={exp.company} onChange={e => setExp(i, 'company', e.target.value)} className={inp} placeholder="Creative Agency / Chicago" /></div>
                    <div><label className={lbl}>From</label><input value={exp.from} onChange={e => setExp(i, 'from', e.target.value)} className={inp} placeholder="2020" /></div>
                    <div><label className={lbl}>To</label><input value={exp.to} onChange={e => setExp(i, 'to', e.target.value)} className={inp} placeholder="Present" /></div>
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
                  <input value={sk.name} onChange={e => setSkill(i, 'name', e.target.value)} className={inp} placeholder="Adobe Photoshop" />
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
                    <div><label className={lbl}>School</label><input value={edu.school} onChange={e => setEdu(i, 'school', e.target.value)} className={inp} placeholder="Stanford University" /></div>
                    <div><label className={lbl}>Degree</label><input value={edu.degree} onChange={e => setEdu(i, 'degree', e.target.value)} className={inp} placeholder="Master Degree Graduate" /></div>
                    <div><label className={lbl}>From</label><input value={edu.from} onChange={e => setEdu(i, 'from', e.target.value)} className={inp} placeholder="2011" /></div>
                    <div><label className={lbl}>To</label><input value={edu.to} onChange={e => setEdu(i, 'to', e.target.value)} className={inp} placeholder="2013" /></div>
                  </div>
                </div>
              ))}
            </div>

            {/* References */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800 text-sm">References</h3>
                <button onClick={() => set('references', [...cv.references, { name: '', address: '', phone: '', email: '' }])}
                  className="text-xs text-blue-600 flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
              </div>
              {cv.references.map((ref, i) => (
                <div key={i} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">#{i + 1}</span>
                    {cv.references.length > 1 && <button onClick={() => set('references', cv.references.filter((_, j) => j !== i))}><Trash2 className="w-3 h-3 text-red-400" /></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={lbl}>Name</label><input value={ref.name} onChange={e => setRef(i, 'name', e.target.value)} className={inp} placeholder="Darwin B. Magana" /></div>
                    <div><label className={lbl}>Phone</label><input value={ref.phone} onChange={e => setRef(i, 'phone', e.target.value)} className={inp} placeholder="Tel: +1-970-533-3393" /></div>
                    <div><label className={lbl}>Address</label><input value={ref.address} onChange={e => setRef(i, 'address', e.target.value)} className={inp} placeholder="2813 Shobe Lane Mancos, CO" /></div>
                    <div><label className={lbl}>Email</label><input value={ref.email} onChange={e => setRef(i, 'email', e.target.value)} className={inp} placeholder="www.yourwebsite.com" /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PREVIEW ── */}
        <div className={tab === 'preview' ? 'max-w-3xl mx-auto w-full' : ''}>
          <div ref={printRef} className="flex shadow-lg rounded-xl overflow-hidden min-h-[900px]" style={{ fontFamily: 'Arial, sans-serif' }}>

            {/* Left dark sidebar */}
            <div className="w-48 flex-shrink-0 bg-gray-800 text-white p-5 flex flex-col gap-0">

              {/* Photo */}
              <div className="flex justify-center mb-4">
                {cv.photo
                  ? <img src={cv.photo} className="w-20 h-20 rounded-full object-cover border-3 border-yellow-400" style={{ border: '3px solid #f5a623' }} />
                  : <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-3xl">👤</div>}
              </div>

              {/* Contact */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-400 border-b border-gray-600 pb-1 mb-2 flex items-center gap-1">
                  <span>👤</span> Contact Me
                </h2>
                <div className="space-y-1 text-xs text-gray-300">
                  {cv.phone && <p>📞 {cv.phone}</p>}
                  {cv.phone2 && <p>📞 {cv.phone2}</p>}
                  {cv.website && <p>🌐 {cv.website}</p>}
                  {cv.email && <p>✉ {cv.email}</p>}
                  {cv.address && <p>📍 {cv.address}</p>}
                </div>
              </div>

              {/* References */}
              {cv.references.some(r => r.name) && (
                <div className="mt-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-400 border-b border-gray-600 pb-1 mb-2 flex items-center gap-1">
                    <span>👥</span> References
                  </h2>
                  {cv.references.filter(r => r.name).map((ref, i) => (
                    <div key={i} className="mb-3">
                      <p className="text-xs font-bold text-yellow-400">{ref.name}</p>
                      {ref.address && <p className="text-xs text-gray-400">{ref.address}</p>}
                      {ref.phone && <p className="text-xs text-gray-400">{ref.phone}</p>}
                      {ref.email && <p className="text-xs text-gray-400">{ref.email}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {cv.educations.some(e => e.school) && (
                <div className="mt-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-400 border-b border-gray-600 pb-1 mb-2 flex items-center gap-1">
                    <span>🎓</span> Education
                  </h2>
                  {cv.educations.filter(e => e.school).map((edu, i) => (
                    <div key={i} className="mb-3">
                      <p className="text-xs font-bold text-yellow-400 uppercase">{edu.school}</p>
                      <p className="text-xs text-gray-400 uppercase" style={{ fontSize: '9px' }}>{edu.degree}</p>
                      <p className="text-gray-500" style={{ fontSize: '9px' }}>{edu.from}{edu.to ? ` - ${edu.to}` : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right white section */}
            <div className="flex-1 bg-white p-6">
              {/* Name & title */}
              <div className="mb-5">
                <h1 className="font-black text-gray-900 leading-tight" style={{ fontSize: '26px' }}>
                  {firstName && <span>{firstName} </span>}
                  <span className="text-yellow-500">{lastName || (cv.name || 'YOUR NAME')}</span>
                </h1>
                {cv.title && <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">{cv.title}</p>}
              </div>

              {/* About */}
              {cv.summary && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-500 border-b-2 border-yellow-400 pb-1 mb-2 flex items-center gap-1">
                    <span>⭐</span> About Me
                  </h2>
                  <p className="text-xs text-gray-600 leading-relaxed">{cv.summary}</p>
                </div>
              )}

              {/* Experience */}
              {cv.experiences.some(e => e.role) && (
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-500 border-b-2 border-yellow-400 pb-1 mb-3 flex items-center gap-1">
                    <span>💼</span> Job Experience
                  </h2>
                  {cv.experiences.filter(e => e.role).map((exp, i) => (
                    <div key={i} className="mb-3 pl-3 border-l-2 border-yellow-400">
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

              {/* Skills */}
              {cv.skills.some(s => s.name) && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-500 border-b-2 border-yellow-400 pb-1 mb-3 flex items-center gap-1">
                    <span>⚡</span> Skills
                  </h2>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {cv.skills.filter(s => s.name).map((sk, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-0.5">
                          <span className="text-xs text-gray-700">{sk.name}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full">
                          <div className="h-1.5 bg-yellow-400 rounded-full" style={{ width: `${sk.level}%` }} />
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
