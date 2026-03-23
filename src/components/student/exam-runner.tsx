'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Flag, ChevronLeft, ChevronRight } from 'lucide-react'

interface Question { id:string; question:string; type:string; optionA:string|null; optionB:string|null; optionC:string|null; optionD:string|null; correctAnswer:string }
interface Exam { id:string; title:string; timeLimit:number; passingMark:number; type:string; subject:string }
interface Props { exam:Exam; questions:Question[]; userId:string }

export function ExamRunner({ exam, questions, userId }: Props) {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string,string>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [timeLeft, setTimeLeft] = useState(exam.timeLimit * 60)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = useCallback(async () => {
    if (submitting || submitted) return
    setSubmitting(true)
    const timeTaken = exam.timeLimit * 60 - timeLeft
    let score = 0
    const details = questions.map(q => {
      const selected = answers[q.id] ?? ''
      const correct = selected.toUpperCase() === q.correctAnswer.toUpperCase()
      if (correct) score++
      return { question: q, selected, correct }
    })
    const totalMarks = questions.length
    const passed = (score / totalMarks) * 100 >= exam.passingMark
    await fetch('/api/student/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId: exam.id, userId, score, totalMarks, timeTaken, passed,
        attempts: questions.map(q => ({ questionId: q.id, selectedAnswer: answers[q.id] ?? '', isCorrect: (answers[q.id] ?? '').toUpperCase() === q.correctAnswer.toUpperCase() })) }),
    })
    setResult({ score, total: totalMarks, passed, details })
    setSubmitted(true); setSubmitting(false)
  }, [answers, exam, questions, timeLeft, userId, submitting, submitted])

  useEffect(() => {
    if (!started || submitted) return
    if (timeLeft <= 0) { handleSubmit(); return }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [started, timeLeft, submitted, handleSubmit])

  const fmt = (s: number) => `${Math.floor(s/3600)}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const toggleFlag = (i: number) => setFlagged(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  const q = questions[current]
  const opts = q ? ([{k:'A',l:'a.',t:q.optionA},{k:'B',l:'b.',t:q.optionB},{k:'C',l:'c.',t:q.optionC},{k:'D',l:'d.',t:q.optionD}] as const).filter(o => o.t) : []

  if (!started) return (
    <div style={{minHeight:'100vh',background:'#f5f5f5',display:'flex',flexDirection:'column'}}>
      <div style={{background:'#1a3a5c',color:'white',padding:'8px 20px',display:'flex',alignItems:'center',gap:'12px'}}>
        <div style={{width:'32px',height:'32px',background:'#e8a020',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:'13px',color:'white'}}>M</div>
        <span style={{fontWeight:700,fontSize:'14px'}}>Ministry of Education — National Exit Exam</span>
      </div>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 16px'}}>
        <div style={{background:'white',borderRadius:'8px',border:'1px solid #ddd',padding:'40px',maxWidth:'480px',width:'100%',textAlign:'center'}}>
          <h1 style={{fontSize:'22px',fontWeight:700,color:'#1a3a5c',marginBottom:'4px'}}>{exam.title}</h1>
          <p style={{color:'#666',fontSize:'14px',marginBottom:'28px'}}>{exam.subject}</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'28px'}}>
            {[{label:'Questions',value:questions.length},{label:'Time Limit',value:`${exam.timeLimit} min`},{label:'Pass Mark',value:`${exam.passingMark}%`}].map(({label,value}) => (
              <div key={label} style={{background:'#f0f4f8',borderRadius:'6px',padding:'12px 8px'}}>
                <p style={{fontSize:'20px',fontWeight:700,color:'#1a3a5c',margin:0}}>{value}</p>
                <p style={{fontSize:'11px',color:'#666',margin:'2px 0 0'}}>{label}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setStarted(true)} style={{width:'100%',background:'#0066cc',color:'white',border:'none',borderRadius:'5px',padding:'12px',fontSize:'15px',fontWeight:600,cursor:'pointer'}}>Attempt quiz now</button>
        </div>
      </div>
    </div>
  )

  if (submitted && result) {
    const pct = Math.round((result.score/result.total)*100)
    return (
      <div style={{minHeight:'100vh',background:'#f5f5f5'}}>
        <div style={{background:'#1a3a5c',color:'white',padding:'8px 20px',display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'32px',height:'32px',background:'#e8a020',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:'13px',color:'white'}}>M</div>
          <span style={{fontWeight:700,fontSize:'14px'}}>Ministry of Education — National Exit Exam</span>
        </div>
        <div style={{maxWidth:'720px',margin:'40px auto',padding:'0 16px'}}>
          <div style={{background:result.passed?'#dff0d8':'#f2dede',border:`1px solid ${result.passed?'#d6e9c6':'#ebccd1'}`,borderRadius:'6px',padding:'32px',textAlign:'center',marginBottom:'24px'}}>
            <div style={{width:'72px',height:'72px',borderRadius:'50%',background:result.passed?'#5cb85c':'#d9534f',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',color:'white',fontSize:'22px',fontWeight:700}}>{pct}%</div>
            <h2 style={{fontSize:'22px',fontWeight:700,color:result.passed?'#3c763d':'#a94442',margin:'0 0 6px'}}>{result.passed?'Congratulations! You Passed.':'You did not pass. Keep practicing!'}</h2>
            <p style={{color:'#555',margin:0}}>{result.score} / {result.total} correct answers</p>
            <div style={{display:'flex',gap:'12px',justifyContent:'center',marginTop:'20px'}}>
              <button onClick={() => router.push('/app/exams')} style={{padding:'8px 20px',border:'1px solid #aaa',borderRadius:'4px',background:'white',cursor:'pointer',fontSize:'13px'}}>Back to Exams</button>
              <button onClick={() => router.push('/app/results')} style={{padding:'8px 20px',background:'#0066cc',border:'none',borderRadius:'4px',color:'white',cursor:'pointer',fontSize:'13px',fontWeight:600}}>View My Results</button>
            </div>
          </div>
          <div style={{background:'white',border:'1px solid #ddd',borderRadius:'6px',overflow:'hidden'}}>
            <div style={{padding:'14px 20px',borderBottom:'1px solid #eee',fontWeight:600,color:'#333'}}>Answer Review</div>
            <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:'10px'}}>
              {result.details.map((d: any, i: number) => (
                <div key={d.question.id} style={{padding:'12px 14px',borderRadius:'4px',border:`1px solid ${d.correct?'#d6e9c6':'#ebccd1'}`,background:d.correct?'#dff0d8':'#f2dede'}}>
                  <p style={{margin:'0 0 6px',fontSize:'13px',color:'#333'}}><strong>Q{i+1}.</strong> {d.question.question}</p>
                  <div style={{display:'flex',gap:'16px',fontSize:'12px'}}>
                    <span style={{color:d.correct?'#3c763d':'#a94442'}}>Your answer: {d.selected||'—'}</span>
                    {!d.correct && <span style={{color:'#3c763d'}}>Correct: {d.question.correctAnswer}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100vh',background:'#f5f5f5'}}>
      <div style={{background:'#1a3a5c',color:'white',padding:'8px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'32px',height:'32px',background:'#e8a020',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:'13px',color:'white',flexShrink:0}}>M</div>
          <span style={{fontWeight:700,fontSize:'14px'}}>Ministry of Education — National Exit Exam</span>
        </div>
        <button onClick={() => router.push('/app/exams')} style={{background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.35)',color:'white',borderRadius:'4px',padding:'4px 12px',fontSize:'12px',cursor:'pointer'}}>← Back</button>
      </div>
      <div style={{background:'#e8f4f8',borderBottom:'1px solid #c5dce8',padding:'10px 20px'}}>
        <h1 style={{margin:0,fontSize:'20px',fontWeight:700,color:'#1a3a5c'}}>{exam.subject}</h1>
        <p style={{margin:'2px 0 0',fontSize:'13px',color:'#555'}}>{exam.title}</p>
      </div>
      <div style={{display:'flex',flex:1,alignItems:'stretch'}}>
        <div style={{width:'170px',flexShrink:0,background:'#f9f9f9',borderRight:'1px solid #ddd',padding:'20px 14px'}}>
          <div style={{fontWeight:700,fontSize:'14px',color:'#333',marginBottom:'6px'}}>Question {current+1}</div>
          <div style={{fontSize:'12px',color:answers[q.id]?'#3c763d':'#a94442',marginBottom:'4px',fontWeight:500}}>{answers[q.id]?'Answered':'Not yet answered'}</div>
          <div style={{fontSize:'12px',color:'#666',marginBottom:'18px'}}>Marked out of 1.00</div>
          <button onClick={() => toggleFlag(current)} style={{display:'flex',alignItems:'center',gap:'5px',width:'100%',justifyContent:'center',fontSize:'12px',padding:'6px 8px',borderRadius:'4px',cursor:'pointer',background:flagged.has(current)?'#fff3cd':'white',border:flagged.has(current)?'1px solid #f0ad4e':'1px solid #0066cc',color:flagged.has(current)?'#856404':'#0066cc',fontWeight:500}}>
            <Flag size={12}/>{flagged.has(current)?'Remove flag':'Flag question'}
          </button>
        </div>
        <div style={{flex:1,padding:'20px 28px',minWidth:0}}>
          {exam.type!=='PRACTICE' && (
            <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'14px'}}>
              <div style={{border:timeLeft<300?'1px solid #d9534f':'1px solid #aaa',color:timeLeft<300?'#d9534f':'#333',background:timeLeft<300?'#fdf2f2':'white',padding:'5px 14px',fontSize:'13px',fontWeight:700,borderRadius:'3px'}}>
                ⏱ Time remaining: {fmt(timeLeft)}
              </div>
            </div>
          )}
          <div style={{background:'#d9edf7',border:'1px solid #bce8f1',borderRadius:'4px',padding:'22px 24px',marginBottom:'20px'}}>
            <p style={{fontSize:'15px',color:'#222',marginBottom:'22px',lineHeight:1.7}}>{q.question}</p>
            {q.type==='MCQ' && (
              <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                {opts.map(({k,l,t}) => (
                  <label key={k} style={{display:'flex',alignItems:'flex-start',gap:'10px',cursor:'pointer'}}>
                    <input type="radio" name={`q-${q.id}`} checked={answers[q.id]===k} onChange={() => setAnswers({...answers,[q.id]:k})} style={{marginTop:'3px',width:'16px',height:'16px',cursor:'pointer',accentColor:'#0066cc',flexShrink:0}}/>
                    <span style={{fontSize:'14px',color:'#333',lineHeight:1.5}}><strong style={{marginRight:'5px'}}>{l}</strong>{t}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type==='TRUE_FALSE' && (
              <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                {[{label:'True',key:'A'},{label:'False',key:'B'}].map(({label,key}) => (
                  <label key={key} style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}}>
                    <input type="radio" name={`q-${q.id}`} checked={answers[q.id]===key} onChange={() => setAnswers({...answers,[q.id]:key})} style={{width:'16px',height:'16px',cursor:'pointer',accentColor:'#0066cc'}}/>
                    <span style={{fontSize:'14px',color:'#333'}}>{label}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type==='SHORT_ANSWER' && (
              <input value={answers[q.id]??''} onChange={e => setAnswers({...answers,[q.id]:e.target.value})} placeholder="Type your answer..." style={{width:'100%',padding:'8px 12px',border:'1px solid #bce8f1',borderRadius:'4px',fontSize:'14px',outline:'none',background:'white',boxSizing:'border-box'}}/>
            )}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <button onClick={() => setCurrent(c => Math.max(0,c-1))} disabled={current===0} style={{display:'flex',alignItems:'center',gap:'4px',padding:'7px 16px',fontSize:'13px',borderRadius:'4px',cursor:current===0?'not-allowed':'pointer',background:'white',border:'1px solid #aaa',color:current===0?'#bbb':'#333'}}>
              <ChevronLeft size={14}/>Previous page
            </button>
            {current<questions.length-1 ? (
              <button onClick={() => setCurrent(c => Math.min(questions.length-1,c+1))} style={{display:'flex',alignItems:'center',gap:'4px',padding:'7px 16px',fontSize:'13px',borderRadius:'4px',cursor:'pointer',background:'#0066cc',border:'none',color:'white',fontWeight:600}}>
                Next page<ChevronRight size={14}/>
              </button>
            ) : (
              <button onClick={() => { if(confirm('Submit exam? You cannot change answers after submitting.')) handleSubmit() }} disabled={submitting} style={{padding:'7px 18px',fontSize:'13px',borderRadius:'4px',cursor:'pointer',background:'#5cb85c',border:'none',color:'white',fontWeight:600,opacity:submitting?0.6:1}}>
                {submitting?'Submitting...':'Submit all and finish'}
              </button>
            )}
          </div>
        </div>
        <div style={{width:'210px',flexShrink:0,background:'#f9f9f9',borderLeft:'1px solid #ddd',padding:'16px 14px'}}>
          <div style={{fontWeight:700,fontSize:'13px',color:'#333',borderBottom:'1px solid #ccc',paddingBottom:'8px',marginBottom:'12px'}}>Quiz navigation</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'4px',marginBottom:'16px'}}>
            {questions.map((ques,i) => {
              const ic=i===current,ifl=flagged.has(i),ia=!!answers[ques.id]
              let bg='white',br='1px solid #ccc',cl='#555'
              if(ic){bg='#0066cc';br='1px solid #0055aa';cl='white'}
              else if(ifl){bg='#ffe8a1';br='1px solid #f0ad4e';cl='#856404'}
              else if(ia){bg='#5cb85c';br='1px solid #4cae4c';cl='white'}
              return <button key={i} onClick={() => setCurrent(i)} style={{background:bg,border:br,color:cl,borderRadius:'3px',fontSize:'12px',fontWeight:ic?700:500,padding:'5px 2px',cursor:'pointer',textAlign:'center'}}>{i+1}</button>
            })}
          </div>
          <button onClick={() => { if(confirm('Submit exam?')) handleSubmit() }} disabled={submitting} style={{width:'100%',padding:'8px',background:'#0066cc',border:'none',color:'white',fontSize:'12px',fontWeight:700,borderRadius:'4px',cursor:'pointer',opacity:submitting?0.6:1,marginBottom:'16px'}}>
            {submitting?'Submitting...':'Finish attempt...'}
          </button>
          <div style={{fontSize:'11px',color:'#555',display:'flex',flexDirection:'column',gap:'7px'}}>
            {[{bg:'#5cb85c',br:'#4cae4c',label:'Answered'},{bg:'white',br:'#ccc',label:'Not answered'},{bg:'#ffe8a1',br:'#f0ad4e',label:'Flagged'},{bg:'#0066cc',br:'#0055aa',label:'Current'}].map(({bg,br,label}) => (
              <div key={label} style={{display:'flex',alignItems:'center',gap:'7px'}}>
                <span style={{width:'14px',height:'14px',background:bg,border:`1px solid ${br}`,borderRadius:'2px',display:'inline-block',flexShrink:0}}/>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}