const STORAGE={students:'s67_students_v2',attendance:'s67_attendance_v2',incidents:'s67_incidents_v2',positive:'s67_positive_v2'};
const state={
 students:JSON.parse(localStorage.getItem(STORAGE.students)||'[]'),
 attendance:JSON.parse(localStorage.getItem(STORAGE.attendance)||'{}'),
 incidents:JSON.parse(localStorage.getItem(STORAGE.incidents)||'[]'),
 positive:JSON.parse(localStorage.getItem(STORAGE.positive)||'[]')
};

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const today=()=>new Date().toISOString().slice(0,10);
const save=()=>{
 localStorage.setItem(STORAGE.students,JSON.stringify(state.students));
 localStorage.setItem(STORAGE.attendance,JSON.stringify(state.attendance));
 localStorage.setItem(STORAGE.incidents,JSON.stringify(state.incidents));
 localStorage.setItem(STORAGE.positive,JSON.stringify(state.positive));
};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const toast=msg=>{const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)};

const viewTitles={dashboard:'لوحة المؤشرات',students:'الطالبات',attendance:'الحضور والمواظبة',incidents:'المخالفات السلوكية',positive:'السلوك الإيجابي',reports:'التقارير',settings:'الإعدادات'};
function openView(id){
 $$('.view').forEach(v=>v.classList.toggle('active',v.id===id));
 $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
 $('#viewTitle').textContent=viewTitles[id]||'النظام';
 $('#sidebar').classList.remove('open');
 if(id==='reports')renderReport('summary');
 window.scrollTo({top:0,behavior:'smooth'});
}
$$('.nav-item').forEach(b=>b.addEventListener('click',()=>openView(b.dataset.view)));
$$('[data-view-target]').forEach(b=>b.addEventListener('click',()=>openView(b.dataset.viewTarget)));
$('#menuBtn')?.addEventListener('click',()=>$('#sidebar').classList.toggle('open'));

$$('[data-open]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.open).classList.add('open')));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('.modal').classList.remove('open')));
$$('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')}));

function studentName(id){return state.students.find(s=>s.id===id)?.name||'—'}
function refreshSelects(){
 const options='<option value="">اختر الطالبة</option>'+state.students.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.name)+' — '+esc(s.grade)+'</option>').join('');
 $('#incidentStudent').innerHTML=options; $('#positiveStudent').innerHTML=options;
}

function renderStudents(filter=''){
 const q=filter.trim().toLowerCase();
 const rows=state.students.filter(s=>!q||[s.id,s.name,s.grade,s.classroom,s.parent,s.phone].some(v=>String(v||'').toLowerCase().includes(q)));
 $('#studentsTable').innerHTML=rows.length?rows.map(s=>'<tr><td>'+esc(s.id)+'</td><td><div class="row-name"><span class="avatar">'+esc(s.name.slice(0,1))+'</span><b>'+esc(s.name)+'</b></div></td><td>'+esc(s.grade)+'</td><td>'+esc(s.classroom||'—')+'</td><td>'+esc(s.parent||'—')+'</td><td>'+esc(s.phone||'—')+'</td><td><span class="tag ok">نشطة</span></td><td><button class="delete-btn" data-delete-student="'+esc(s.id)+'">حذف</button></td></tr>').join(''):'<tr><td colspan="8"><div class="empty">لا توجد طالبات مسجلات.</div></td></tr>';
 $('#studentsBadge').textContent=state.students.length;
 $$('[data-delete-student]').forEach(b=>b.addEventListener('click',()=>{if(confirm('حذف الطالبة؟')){state.students=state.students.filter(s=>s.id!==b.dataset.deleteStudent);save();renderAll();}}));
}

function renderAttendance(){
 const date=$('#attendanceDate').value||today(), day=state.attendance[date]||{};
 $('#attendanceTable').innerHTML=state.students.length?state.students.map(s=>{
  const rec=day[s.id]||{status:'غير مسجل',note:''};
  return '<tr><td><b>'+esc(s.name)+'</b></td><td>'+esc(s.grade)+'</td><td><select class="status-select" data-att-status="'+esc(s.id)+'"><option '+(rec.status==='غير مسجل'?'selected':'')+'>غير مسجل</option><option '+(rec.status==='حاضرة'?'selected':'')+'>حاضرة</option><option '+(rec.status==='غائبة'?'selected':'')+'>غائبة</option><option '+(rec.status==='متأخرة'?'selected':'')+'>متأخرة</option><option '+(rec.status==='مستأذنة'?'selected':'')+'>مستأذنة</option></select></td><td><input class="note-input" data-att-note="'+esc(s.id)+'" value="'+esc(rec.note||'')+'" placeholder="ملاحظة"></td></tr>';
 }).join(''):'<tr><td colspan="4"><div class="empty">أضف الطالبات أولاً.</div></td></tr>';
 $$('[data-att-status]').forEach(el=>el.addEventListener('change',()=>updateAttendance(el.dataset.attStatus)));
 $$('[data-att-note]').forEach(el=>el.addEventListener('change',()=>updateAttendance(el.dataset.attNote)));
}
function updateAttendance(id){
 const date=$('#attendanceDate').value||today(); state.attendance[date]??={};
 const status=$('[data-att-status="'+CSS.escape(id)+'"]')?.value||'غير مسجل';
 const note=$('[data-att-note="'+CSS.escape(id)+'"]')?.value||'';
 state.attendance[date][id]={status,note}; save();renderDashboard();toast('تم تحديث الحضور');
}
$('#attendanceDate').value=today(); $('#attendanceDate').addEventListener('change',renderAttendance);

function renderIncidents(){
 $('#incidentsTable').innerHTML=state.incidents.length?state.incidents.slice().reverse().map(i=>'<tr><td>'+esc(i.date)+'</td><td><b>'+esc(studentName(i.studentId))+'</b></td><td>'+esc(i.type)+'</td><td><span class="tag bad">'+esc(i.level)+'</span></td><td>'+esc(i.action||'—')+'</td><td><span class="tag warn">مسجلة</span></td></tr>').join(''):'<tr><td colspan="6"><div class="empty">لا توجد مخالفات مسجلة.</div></td></tr>';
}
function renderPositive(){
 $('#positiveTable').innerHTML=state.positive.length?state.positive.slice().reverse().map(i=>'<tr><td>'+esc(i.date)+'</td><td><b>'+esc(studentName(i.studentId))+'</b></td><td>'+esc(i.type)+'</td><td><span class="tag ok">+'+esc(i.points)+'</span></td><td>'+esc(i.note||'—')+'</td></tr>').join(''):'<tr><td colspan="5"><div class="empty">لا توجد حالات تعزيز مسجلة.</div></td></tr>';
}

function renderDashboard(){
 const date=today(), day=state.attendance[date]||{};
 const present=Object.values(day).filter(x=>x.status==='حاضرة').length;
 $('#studentsCount').textContent=state.students.length; $('#presentCount').textContent=present; $('#incidentsCount').textContent=state.incidents.length; $('#positiveCount').textContent=state.positive.length;
 const attPct=state.students.length?Math.round(present/state.students.length*100):0;
 const posPct=Math.min(100,state.students.length?Math.round(state.positive.length/state.students.length*100):0);
 const incPct=Math.min(100,state.students.length?Math.round(state.incidents.length/state.students.length*100):0);
 $('#attendancePct').textContent=attPct+'%';$('#attendanceBar').style.width=attPct+'%';
 $('#positivePct').textContent=posPct+'%';$('#positiveBar').style.width=posPct+'%';
 $('#incidentPct').textContent=incPct+'%';$('#incidentBar').style.width=incPct+'%';
 $('#disciplineScore').textContent=Math.max(0,100-Math.min(40,state.incidents.length*2));
 const activities=[
  ...state.incidents.slice(-3).map(x=>({t:'مخالفة: '+x.type,p:studentName(x.studentId)+' • '+x.date,c:'bad'})),
  ...state.positive.slice(-3).map(x=>({t:'تعزيز: '+x.type,p:studentName(x.studentId)+' • +'+x.points+' نقاط',c:'ok'}))
 ].slice(-5).reverse();
 $('#activityList').innerHTML=activities.length?activities.map(a=>'<div class="activity-item"><span class="dot"></span><div><b>'+esc(a.t)+'</b><p>'+esc(a.p)+'</p></div></div>').join(''):'<div class="empty">لا توجد إجراءات مسجلة بعد.</div>';
}

function renderReport(type){
 let html='';
 const day=state.attendance[$('#attendanceDate').value||today()]||{};
 if(type==='attendance'){
  html='<h3>تقرير الحضور — '+esc($('#attendanceDate').value||today())+'</h3><table><thead><tr><th>الطالبة</th><th>الحالة</th><th>الملاحظة</th></tr></thead><tbody>'+state.students.map(s=>'<tr><td>'+esc(s.name)+'</td><td>'+esc(day[s.id]?.status||'غير مسجل')+'</td><td>'+esc(day[s.id]?.note||'—')+'</td></tr>').join('')+'</tbody></table>';
 }else if(type==='incidents'){
  html='<h3>تقرير المخالفات</h3><table><thead><tr><th>التاريخ</th><th>الطالبة</th><th>المخالفة</th><th>الدرجة</th><th>الإجراء</th></tr></thead><tbody>'+state.incidents.map(i=>'<tr><td>'+esc(i.date)+'</td><td>'+esc(studentName(i.studentId))+'</td><td>'+esc(i.type)+'</td><td>'+esc(i.level)+'</td><td>'+esc(i.action||'—')+'</td></tr>').join('')+'</tbody></table>';
 }else if(type==='positive'){
  html='<h3>تقرير السلوك الإيجابي</h3><table><thead><tr><th>التاريخ</th><th>الطالبة</th><th>السلوك</th><th>النقاط</th></tr></thead><tbody>'+state.positive.map(i=>'<tr><td>'+esc(i.date)+'</td><td>'+esc(studentName(i.studentId))+'</td><td>'+esc(i.type)+'</td><td>'+esc(i.points)+'</td></tr>').join('')+'</tbody></table>';
 }else{
  html='<div class="summary-boxes"><div class="summary-box"><b>'+state.students.length+'</b><span>طالبة</span></div><div class="summary-box"><b>'+state.incidents.length+'</b><span>مخالفة</span></div><div class="summary-box"><b>'+state.positive.length+'</b><span>تعزيز</span></div><div class="summary-box"><b>'+$('#disciplineScore').textContent+'</b><span>مؤشر الانضباط</span></div></div>';
 }
 $('#reportContent').innerHTML=html||'<div class="empty">لا توجد بيانات.</div>';
}
$$('[data-report]').forEach(b=>b.addEventListener('click',()=>renderReport(b.dataset.report)));
$('#printBtn').addEventListener('click',()=>window.print());

$('#studentForm').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));if(state.students.some(s=>s.id===d.id)){toast('رقم الطالبة موجود مسبقًا');return;}state.students.push(d);save();e.target.reset();$('#studentModal').classList.remove('open');renderAll();toast('تمت إضافة الطالبة');});
$('#incidentForm').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.date=today();state.incidents.push(d);save();e.target.reset();$('#incidentModal').classList.remove('open');renderAll();toast('تم تسجيل المخالفة');});
$('#positiveForm').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.date=today();d.points=Number(d.points||0);state.positive.push(d);save();e.target.reset();$('#positiveModal').classList.remove('open');renderAll();toast('تم حفظ السلوك الإيجابي');});
$('#studentSearch').addEventListener('input',e=>renderStudents(e.target.value));

$('#exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='secondary67-discipline-backup.json';a.click();URL.revokeObjectURL(a.href);});
$('#resetBtn').addEventListener('click',()=>{if(confirm('مسح جميع البيانات المحفوظة على هذا الجهاز؟')){Object.values(STORAGE).forEach(k=>localStorage.removeItem(k));location.reload();}});

function renderAll(){refreshSelects();renderStudents($('#studentSearch')?.value||'');renderAttendance();renderIncidents();renderPositive();renderDashboard();renderReport('summary');}
renderAll();