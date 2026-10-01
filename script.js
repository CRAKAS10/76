const menuBtn=document.getElementById('menuBtn');
const mainNav=document.getElementById('mainNav');
menuBtn?.addEventListener('click',()=>mainNav.classList.toggle('open'));
mainNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mainNav.classList.remove('open')));

let SCHOOL_EMAIL='school@example.com';

const contactForm=document.getElementById('contactForm');
const contactStatus=document.getElementById('contactStatus');
const messageField=document.getElementById('contactMessage');
const messageCount=document.getElementById('messageCount');
const copyMessageBtn=document.getElementById('copyMessageBtn');

const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
}[ch]));

async function loadJSON(path,fallback){
  try{
    const res=await fetch(path+'?v='+Date.now(),{cache:'no-store'});
    if(!res.ok)throw new Error('HTTP '+res.status);
    return await res.json();
  }catch(err){
    console.warn('تعذر تحميل',path,err);
    return fallback;
  }
}

function formatArabicDate(value){
  if(!value)return '';
  const d=new Date(value+'T12:00:00');
  if(Number.isNaN(d.getTime()))return value;
  return new Intl.DateTimeFormat('ar-SA',{day:'numeric',month:'long',year:'numeric'}).format(d);
}

async function loadSiteSettings(){
  const data=await loadJSON('data/site.json',{});
  const pairs=[
    ['schoolName',data.schoolName],
    ['portalTitle',data.portalTitle],
    ['heroTitle',data.heroTitle],
    ['heroSubtitle',data.heroSubtitle],
    ['heroText',data.heroText],
    ['contactSchoolName',data.schoolName],
    ['footerSchoolName',data.schoolName],
    ['footerText',data.footerText||data.portalTitle],
    ['schoolEmailLabel',data.contactEmail]
  ];
  pairs.forEach(([id,value])=>{
    const el=document.getElementById(id);
    if(el && value)el.textContent=value;
  });
  if(data.schoolName && data.portalTitle){
    document.title=data.schoolName+' | '+data.portalTitle;
  }
  if(data.contactEmail)SCHOOL_EMAIL=data.contactEmail;
}

async function renderNews(){
  const grid=document.getElementById('newsGrid');
  if(!grid)return;
  const items=(await loadJSON('data/news.json',[]))
    .filter(x=>x.published!==false)
    .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  if(!items.length){
    grid.innerHTML='<div class="empty-state">لا توجد أخبار منشورة حاليًا.</div>';
    return;
  }
  grid.innerHTML=items.map((item,i)=>{
    const content=`
      ${item.image?'<img class="news-image" src="'+escapeHTML(item.image)+'" alt="">':''}
      <div class="tag ${i?'muted':''}">${escapeHTML(item.type||'خبر')}</div>
      <h4>${escapeHTML(item.title)}</h4>
      <p>${escapeHTML(item.description)}</p>
      <time>${escapeHTML(formatArabicDate(item.date))}</time>
      ${item.url?'<a class="card-link" href="'+escapeHTML(item.url)+'" target="_blank" rel="noopener">التفاصيل ←</a>':''}
    `;
    return item.url
      ? '<article class="news-card '+(i===0?'featured':'')+'">'+content+'</article>'
      : '<article class="news-card '+(i===0?'featured':'')+'">'+content+'</article>';
  }).join('');
}

async function renderAlerts(){
  const grid=document.getElementById('alertsGrid');
  if(!grid)return;
  const today=new Date();
  today.setHours(0,0,0,0);
  const items=(await loadJSON('data/alerts.json',[])).filter(item=>{
    if(item.published===false)return false;
    const start=item.start?new Date(item.start+'T00:00:00'):null;
    const end=item.end?new Date(item.end+'T23:59:59'):null;
    if(start && today<start)return false;
    if(end && today>end)return false;
    return true;
  }).sort((a,b)=>{
    const weight={عاجل:3,مهم:2,عادي:1};
    return (weight[b.priority]||1)-(weight[a.priority]||1);
  });
  if(!items.length){
    grid.innerHTML='<div class="alert-card priority-normal"><div class="alert-icon">🔔</div><div><b>لا توجد تنبيهات عاجلة حاليًا</b><p>ستظهر هنا التنبيهات التي تضيفها الإدارة.</p></div></div>';
    return;
  }
  grid.innerHTML=items.map(item=>{
    const cls=item.priority==='عاجل'?'priority-urgent':item.priority==='مهم'?'priority-important':'priority-normal';
    const icon=item.priority==='عاجل'?'🚨':item.priority==='مهم'?'⚠️':'🔔';
    return '<div class="alert-card '+cls+'"><div class="alert-icon">'+icon+'</div><div><span class="alert-type">'+escapeHTML(item.type||'تنبيه')+'</span><b>'+escapeHTML(item.title)+'</b><p>'+escapeHTML(item.message||'')+'</p></div></div>';
  }).join('');
}

async function renderEvents(){
  const grid=document.getElementById('calendarGrid');
  if(!grid)return;
  const items=(await loadJSON('data/events.json',[]))
    .filter(x=>x.published!==false)
    .sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
  if(!items.length){
    grid.innerHTML='<div class="empty-state">لا توجد مواعيد منشورة حاليًا.</div>';
    return;
  }
  grid.innerHTML=items.map(item=>{
    const d=new Date((item.date||'')+'T12:00:00');
    const day=Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('ar-SA',{day:'2-digit'}).format(d);
    const month=Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('ar-SA',{month:'long'}).format(d);
    return '<div class="date-card"><strong>'+escapeHTML(day)+'</strong><span>'+escapeHTML(month)+'</span><p>'+escapeHTML(item.title)+'</p></div>';
  }).join('');
}

async function renderLinks(){
  const grid=document.getElementById('quickLinksGrid');
  if(!grid)return;
  const items=(await loadJSON('data/links.json',[])).filter(x=>x.published!==false);
  if(!items.length){
    grid.innerHTML='<div class="empty-state">لا توجد روابط سريعة.</div>';
    return;
  }
  grid.innerHTML=items.map(item=>{
    const target=(item.url||'#');
    return '<a href="'+escapeHTML(target)+'" '+(target.startsWith('http')?'target="_blank" rel="noopener"':'')+'><span class="quick-icon">'+escapeHTML(item.icon||'↗')+'</span>'+escapeHTML(item.title)+'</a>';
  }).join('');
}

async function renderResources(){
  const grid=document.getElementById('resourceGrid');
  if(!grid)return;
  const items=(await loadJSON('data/resources.json',[])).filter(x=>x.published!==false);
  if(!items.length){
    grid.innerHTML='<div class="empty-state">لا توجد ملفات أو نماذج منشورة حاليًا.</div>';
    return;
  }
  grid.innerHTML=items.map(item=>{
    const target=item.file||item.url||'';
    return '<div class="resource-card"><b>'+escapeHTML(item.icon||'📄')+'</b><h4>'+escapeHTML(item.title)+'</h4><p>'+escapeHTML(item.description||'')+'</p>'+(target?'<a href="'+escapeHTML(target)+'" target="_blank" rel="noopener">فتح الملف أو الرابط</a>':'')+'</div>';
  }).join('');
}

function setStatus(message,type='info'){
  if(!contactStatus)return;
  contactStatus.textContent=message;
  contactStatus.className='form-status show '+type;
}

function getContactPayload(){
  const name=document.getElementById('contactName')?.value.trim()||'';
  const role=document.getElementById('contactRole')?.value||'';
  const phone=document.getElementById('contactPhone')?.value.trim()||'';
  const email=document.getElementById('contactEmail')?.value.trim()||'';
  const subject=document.getElementById('contactSubject')?.value||'';
  const message=messageField?.value.trim()||'';
  return {name,role,phone,email,subject,message};
}

function buildMessage(data){
  return [
    'رسالة عبر بوابة الثانوية السابعة والستون','',
    'الاسم: '+data.name,
    'صفة المرسل: '+data.role,
    'رقم الجوال: '+(data.phone||'غير مدخل'),
    'البريد الإلكتروني: '+(data.email||'غير مدخل'),
    'الموضوع: '+data.subject,'','نص الرسالة:',data.message
  ].join('\n');
}

messageField?.addEventListener('input',()=>{if(messageCount)messageCount.textContent=String(messageField.value.length)});
contactForm?.addEventListener('reset',()=>setTimeout(()=>{
  if(messageCount)messageCount.textContent='0';
  if(contactStatus)contactStatus.className='form-status';
},0));

contactForm?.addEventListener('submit',e=>{
  e.preventDefault();
  if(!contactForm.checkValidity()){
    contactForm.reportValidity();
    setStatus('يرجى إكمال الحقول المطلوبة قبل الإرسال.','error');
    return;
  }
  const data=getContactPayload();
  const subject='بوابة المدرسة - '+data.subject+' - '+data.name;
  const body=buildMessage(data);
  const mailto='mailto:'+SCHOOL_EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  setStatus('سيتم فتح تطبيق البريد لإرسال الرسالة. إذا لم يفتح، استخدم زر «نسخ الرسالة».','success');
  window.location.href=mailto;
});

copyMessageBtn?.addEventListener('click',async()=>{
  const data=getContactPayload();
  if(!data.name||!data.role||!data.subject||!data.message){
    setStatus('أكمل الاسم والصفة والموضوع ونص الرسالة أولًا.','error');
    return;
  }
  try{
    await navigator.clipboard.writeText(buildMessage(data));
    setStatus('تم نسخ نص الرسالة بنجاح.','success');
  }catch{
    setStatus('تعذر النسخ تلقائيًا. حدّد نص الرسالة وانسخه يدويًا.','error');
  }
});

document.querySelectorAll('.contact-jump').forEach(link=>{
  link.addEventListener('click',e=>{
    e.preventDefault();
    const target=document.getElementById('contact');
    if(!target)return;
    target.scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(()=>target.querySelector('input,select,textarea,button')?.focus({preventScroll:true}),550);
  });
});

Promise.all([
  loadSiteSettings(),
  renderNews(),
  renderAlerts(),
  renderEvents(),
  renderLinks(),
  renderResources()
]);