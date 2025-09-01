/* ------------------------- Helpers ------------------------- */
const $ = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));
const uid = ()=>'x'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);

function toDateTime(dateStr, timeStr){
  return new Date(dateStr + 'T' + (timeStr || '00:00'));
}
function minutes(ms){return Math.round(ms/60000)}
function formatTime(d){return d.toTimeString().slice(0,5)}

/* ------------------------- Store ------------------------- */
const KEY='examSchedule.v1';
const Store={
  load(){ try{ return JSON.parse(localStorage.getItem(KEY))||[] }catch{ return [] } },
  save(rows){ localStorage.setItem(KEY, JSON.stringify(rows)); }
}

/* ------------------------- Core ------------------------- */
const Schedule={
  rows: Store.load(),

  add(row){ this.rows.push(row); this.persist(); },
  update(id, patch){ const i=this.rows.findIndex(r=>r.id===id); if(i>-1){ this.rows[i]={...this.rows[i], ...patch}; this.persist(); } },
  remove(id){ this.rows = this.rows.filter(r=>r.id!==id); this.persist(); },
  clear(){ this.rows=[]; this.persist(); },
  persist(){ Store.save(this.rows); render(); },

  sorted(){ return [...this.rows].sort((a,b)=>{
    const ad = toDateTime(a.date,a.start).getTime();
    const bd = toDateTime(b.date,b.start).getTime();
    return ad-bd;
  }) }
}

/* ------------------------- Validation ------------------------- */
function overlaps(aStart,aEnd,bStart,bEnd){ return aStart < bEnd && bStart < aEnd }

function validateAll(){
  const minGapDays = parseInt($('#minGap').value||'0',10);
  const out=[];
  const rows = Schedule.rows.map(r=>({
    ...r,
    _start: toDateTime(r.date, r.start),
    _end: new Date(toDateTime(r.date, r.start).getTime() + (r.duration||90)*60000)
  }));

  for(let i=0;i<rows.length;i++){
    for(let j=i+1;j<rows.length;j++){
      const A = rows[i], B = rows[j];
      const sameDate = A.date === B.date;
      const sameClass = A.klass === B.klass;
      const sameSection = (A.section||'') === (B.section||'');

      if(sameDate && overlaps(A._start, A._end, B._start, B._end)){
        if(A.hall && B.hall && A.hall.toLowerCase()===B.hall.toLowerCase()){
          out.push({type:'hall', msg:`Hall clash: ${A.hall} is double-booked (${A.subject} vs ${B.subject}) on ${A.date}.`, ids:[A.id,B.id]});
        }
        if(sameClass && (A.section==='' || B.section==='' || sameSection)){
          out.push({type:'class', msg:`Class ${A.klass}${A.section?'-'+A.section:''} has overlapping exams (${A.subject} vs ${B.subject}) on ${A.date}.`, ids:[A.id,B.id]});
        }
        const invA = (A.invigilators||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
        const invB = (B.invigilators||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
        if(invA.length && invB.length){
          const common = invA.filter(x=>invB.includes(x));
          if(common.length){ out.push({type:'invigilator', msg:`Invigilator clash (${common.join(', ')}): overlapping duties on ${A.date}.`, ids:[A.id,B.id]}); }
        }
      }
      if(minGapDays>0 && sameClass){
        const dayA = new Date(A.date+"T00:00");
        const dayB = new Date(B.date+"T00:00");
        const gap = Math.abs((dayA - dayB)/(1000*60*60*24));
        if(gap < minGapDays){
          out.push({type:'gap', msg:`Minimum gap not met for Class ${A.klass}: ${A.subject} and ${B.subject} are ${gap} day(s) apart (need ≥ ${minGapDays}).`, ids:[A.id,B.id]});
        }
      }
    }
  }
  return out;
}