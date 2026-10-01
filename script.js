const menuBtn=document.getElementById('menuBtn');
const mainNav=document.getElementById('mainNav');
menuBtn?.addEventListener('click',()=>mainNav.classList.toggle('open'));
mainNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mainNav.classList.remove('open')));

const SCHOOL_EMAIL='school@example.com';
const contactForm=document.getElementById('contactForm');
const contactStatus=document.getElementById('contactStatus');
const messageField=document.getElementById('contactMessage');
const messageCount=document.getElementById('messageCount');
const copyMessageBtn=document.getElementById('copyMessageBtn');

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
    'رسالة عبر بوابة الثانوية السابعة والستون',
    '',
    'الاسم: '+data.name,
    'صفة المرسل: '+data.role,
    'رقم الجوال: '+(data.phone||'غير مدخل'),
    'البريد الإلكتروني: '+(data.email||'غير مدخل'),
    'الموضوع: '+data.subject,
    '',
    'نص الرسالة:',
    data.message
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
    setTimeout(()=>{
      const first=target.querySelector('input,select,textarea,button');
      first?.focus({preventScroll:true});
    },550);
  });
});
