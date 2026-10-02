const CONFIG = {
  SPREADSHEET_ID: '1v1yJOCyq-6PDja2QHM24lXuGb-KzAKtbtS1CuoLdPVo',
  SHEET_NAME: 'الاستفسارات',
  ADMIN_EMAIL: 'jaf.sco67@gmail.com',
  SCHOOL_NAME: 'الثانوية السابعة والستون'
};

function doGet() {
  return json_({
    ok: true,
    service: 'Secondary 67 Contact API',
    school: CONFIG.SCHOOL_NAME
  });
}

function doPost(e) {
  try {
    const p = (e && e.parameter) ? e.parameter : {};
    if ((p.type || 'inquiry') !== 'inquiry') {
      return json_({ ok: false, error: 'Unsupported request type' });
    }

    const trackingId = clean_(p.trackingId, 80);
    const name = clean_(p.name, 150);
    const role = clean_(p.role, 80);
    const phone = clean_(p.phone, 40);
    const email = clean_(p.email, 200);
    const subject = clean_(p.subject, 200);
    const message = clean_(p.message, 2000);
    const pageUrl = clean_(p.pageUrl, 500);

    if (!trackingId || !name || !role || !subject || !message) {
      return json_({ ok: false, error: 'Missing required fields' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
      let sh = ss.getSheetByName(CONFIG.SHEET_NAME);
      if (!sh) sh = ss.insertSheet(CONFIG.SHEET_NAME);

      if (sh.getLastRow() === 0) {
        sh.appendRow([
          'التاريخ','رقم المتابعة','الاسم','صفة المرسل','الجوال','البريد',
          'الموضوع','الرسالة','الحالة','ملاحظات الإدارة'
        ]);
        sh.setFrozenRows(1);
      }

      sh.appendRow([
        new Date(), trackingId, name, role, phone, email,
        subject, message, 'جديد', ''
      ]);
    } finally {
      lock.releaseLock();
    }

    const safeMessage = escapeHtml_(message).replace(/\n/g, '<br>');
    const html = [
      '<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8">',
      '<h2>استفسار جديد - '+escapeHtml_(CONFIG.SCHOOL_NAME)+'</h2>',
      '<p><b>رقم المتابعة:</b> '+escapeHtml_(trackingId)+'</p>',
      '<p><b>الاسم:</b> '+escapeHtml_(name)+'</p>',
      '<p><b>صفة المرسل:</b> '+escapeHtml_(role)+'</p>',
      '<p><b>الجوال:</b> '+escapeHtml_(phone || 'غير مدخل')+'</p>',
      '<p><b>البريد:</b> '+escapeHtml_(email || 'غير مدخل')+'</p>',
      '<p><b>الموضوع:</b> '+escapeHtml_(subject)+'</p>',
      '<p><b>الرسالة:</b><br>'+safeMessage+'</p>',
      pageUrl ? '<p style="color:#777;font-size:12px">المصدر: '+escapeHtml_(pageUrl)+'</p>' : '',
      '</div>'
    ].join('');

    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: '['+trackingId+'] '+subject,
      htmlBody: html,
      name: CONFIG.SCHOOL_NAME
    });

    if (email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      MailApp.sendEmail({
        to: email,
        subject: 'تم استلام استفسارك - '+trackingId,
        htmlBody: '<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8">'+
          '<p>تم استلام استفسارك لدى '+escapeHtml_(CONFIG.SCHOOL_NAME)+'.</p>'+
          '<p><b>رقم المتابعة:</b> '+escapeHtml_(trackingId)+'</p>'+
          '<p>سيتم التعامل معه وفق إجراءات المدرسة.</p></div>',
        name: CONFIG.SCHOOL_NAME
      });
    }

    return json_({ ok: true, trackingId: trackingId });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function clean_(value, maxLen) {
  return String(value || '').trim().substring(0, maxLen);
}

function escapeHtml_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
