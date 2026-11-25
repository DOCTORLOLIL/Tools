/* מחולל קורות חיים – הגדרות השאלון והפרומפט */

const cvConfig = {
  id: 'cv',
  resultLabel: 'הצג קורות חיים',
  resultTitle: 'קורות החיים שלי',
  page: '/cv/',
  steps: [
    {
      title: 'פרטים אישיים',
      fields: [
        { id: 'lang', label: 'באיזו שפה לכתוב את קורות החיים?', type: 'select',
          options: [{ value: 'he', label: 'עברית' }, { value: 'en', label: 'אנגלית' }] },
        { id: 'fullName', label: 'שם מלא', required: true },
        { id: 'target', label: 'לאיזה תפקיד או תחום אתה מגיש?', placeholder: 'למשל: מנהל מחסן, מזכירה רפואית, מפתח', required: true },
        { id: 'phone', label: 'טלפון', type: 'tel', dir: 'ltr' },
        { id: 'email', label: 'אימייל', type: 'email', dir: 'ltr' },
        { id: 'city', label: 'עיר מגורים' },
        { id: 'linkedin', label: 'קישור ללינקדאין (לא חובה)', dir: 'ltr' }
      ]
    },
    {
      title: 'קצת עליך',
      intro: 'כתוב במילים שלך, בלי לחשוב על ניסוח. ה-AI ילטש.',
      fields: [
        { id: 'about', label: 'מי אתה ומה החוזקות שלך?', type: 'textarea', rows: 5,
          placeholder: 'למשל: אחראי, עובד טוב בצוות, 5 שנים בתחום הלוגיסטיקה...' }
      ]
    },
    {
      title: 'ניסיון תעסוקתי',
      intro: 'מהעבודה האחרונה לראשונה. אם אין ניסיון – לחץ "הסר".',
      repeat: {
        id: 'jobs', itemLabel: 'משרה',
        fields: [
          { id: 'role', label: 'תפקיד', required: true },
          { id: 'company', label: 'מקום עבודה' },
          { id: 'years', label: 'שנים', placeholder: 'למשל: 2021 – היום' },
          { id: 'desc', label: 'מה עשית שם? הישגים?', type: 'textarea', rows: 3 }
        ]
      }
    },
    {
      title: 'שירות צבאי / לאומי',
      fields: [
        { id: 'svcType', label: 'סוג שירות', type: 'select',
          options: [
            { value: 'צבאי', label: 'שירות צבאי' },
            { value: 'לאומי', label: 'שירות לאומי' },
            { value: 'אזרחי', label: 'שירות אזרחי' },
            { value: 'none', label: 'לא שירתתי / לא רלוונטי' }
          ] },
        { id: 'svcRole', label: 'תפקיד' },
        { id: 'svcUnit', label: 'יחידה / מקום שירות' },
        { id: 'svcYears', label: 'שנים', placeholder: 'למשל: 2016 – 2019' },
        { id: 'svcDesc', label: 'מה עשית? דרגה, אחריות, הצטיינות', type: 'textarea', rows: 3 }
      ]
    },
    {
      title: 'השכלה',
      intro: 'תואר, קורס, תעודה מקצועית או בגרות. אם אין – לחץ "הסר".',
      repeat: {
        id: 'edu', itemLabel: 'לימודים',
        fields: [
          { id: 'degree', label: 'מה למדת?', required: true, placeholder: 'למשל: הנדסאי חשמל, בגרות מלאה' },
          { id: 'school', label: 'מוסד' },
          { id: 'years', label: 'שנים' },
          { id: 'notes', label: 'הערות (ממוצע, פרויקט, הצטיינות)' }
        ]
      }
    },
    {
      title: 'כישורים ועוד',
      fields: [
        { id: 'skills', label: 'כישורים ותוכנות', type: 'textarea', rows: 3,
          placeholder: 'למשל: אקסל, רישיון מלגזה, שירות לקוחות' },
        { id: 'languages', label: 'שפות', placeholder: 'למשל: עברית – שפת אם, אנגלית – טובה מאוד' },
        { id: 'extra', label: 'התנדבות, תחביבים או כל דבר נוסף', type: 'textarea', rows: 3 }
      ]
    }
  ],

  buildPrompt(d) {
    const v = x => (x || '').trim();
    const en = d.lang === 'en';
    const langName = en ? 'אנגלית' : 'עברית';
    const line = (k, x) => v(x) ? `${k}: ${v(x)}\n` : '';

    const schema = {
      name: '', title: '',
      contact: { phone: '', email: '', city: '', linkedin: '' },
      summary: '',
      experience: [{ role: '', company: '', years: '', bullets: [''] }],
      service: { type: '', role: '', unit: '', years: '', bullets: [''] },
      education: [{ degree: '', institution: '', years: '', notes: '' }],
      skills: [''], languages: [''], extra: ['']
    };

    let p = '';
    p += 'אתה כותב קורות חיים מקצועי שמכיר היטב את שוק העבודה בישראל.\n';
    p += `כתוב עבורי קורות חיים ב${langName}, לפי המידע שלמטה.\n\n`;
    p += 'כללים:\n';
    p += `- התאם את קורות החיים לתפקיד: ${v(d.target)}\n`;
    p += '- עמוד אחד. ניסוח קצר, מקצועי, עם פעלים חזקים.\n';
    p += '- תקציר של 2–3 שורות. לכל משרה 2–4 נקודות. הדגש הישגים ומספרים אם יש.\n';
    p += '- ניסיון והשכלה מהחדש לישן.\n';
    p += '- אל תמציא שום מידע שלא נתתי. אם חסר משהו – דלג עליו.\n';
    if (en) p += '- תרגם מונחים צבאיים למונחים שמעסיק אזרחי מבין.\n';
    p += '\nפורמט התשובה:\n';
    p += `החזר את קורות החיים כ-JSON בלבד, בתוך בלוק קוד אחד, בדיוק במבנה הזה (שמות השדות באנגלית, התוכן ב${langName}).\n`;
    p += 'אם אין שירות – service יהיה null. שדה ריק – מחרוזת ריקה.\n';
    p += '```json\n' + JSON.stringify(schema, null, 2) + '\n```\n';
    p += 'אחרי הבלוק כתוב עד 3 טיפים קצרים לשיפור קורות החיים.\n\n';

    p += '=== המידע שלי ===\n';
    p += line('שם', d.fullName) + line('טלפון', d.phone) + line('אימייל', d.email)
       + line('עיר', d.city) + line('לינקדאין', d.linkedin);
    if (v(d.about)) p += `\nעל עצמי:\n${v(d.about)}\n`;

    const jobs = (d.jobs || []).filter(j => v(j.role));
    if (jobs.length) {
      p += '\nניסיון תעסוקתי:\n';
      jobs.forEach(j => {
        p += `- ${v(j.role)}${v(j.company) ? ' | ' + v(j.company) : ''}${v(j.years) ? ' | ' + v(j.years) : ''}\n`;
        if (v(j.desc)) p += `  ${v(j.desc)}\n`;
      });
    }

    if (d.svcType && d.svcType !== 'none') {
      p += `\nשירות ${d.svcType}:\n`;
      p += line('תפקיד', d.svcRole) + line('יחידה', d.svcUnit) + line('שנים', d.svcYears) + line('פירוט', d.svcDesc);
    }

    const edu = (d.edu || []).filter(e => v(e.degree));
    if (edu.length) {
      p += '\nהשכלה:\n';
      edu.forEach(e => {
        p += `- ${v(e.degree)}${v(e.school) ? ' | ' + v(e.school) : ''}${v(e.years) ? ' | ' + v(e.years) : ''}${v(e.notes) ? ' | ' + v(e.notes) : ''}\n`;
      });
    }

    if (v(d.skills) || v(d.languages) || v(d.extra)) p += '\n';
    p += line('כישורים', d.skills) + line('שפות', d.languages) + line('נוסף', d.extra);
    return p;
  },

  // תבנית קורות החיים – מקבלת את ה-JSON מה-AI
  renderResult(cv, d) {
    const en = d.lang === 'en';
    const s = x => (typeof x === 'string' ? x.trim() : '');
    const arr = x => (Array.isArray(x) ? x.map(s).filter(Boolean) : []);
    const svcName = { 'צבאי': 'Military Service', 'לאומי': 'National Service', 'אזרחי': 'Civil Service' };
    const T = en
      ? { summary: 'Profile', exp: 'Experience', svc: svcName[d.svcType] || 'Service', edu: 'Education',
          skills: 'Skills', langs: 'Languages', extra: 'Additional' }
      : { summary: 'תקציר', exp: 'ניסיון תעסוקתי', svc: d.svcType && d.svcType !== 'none' ? 'שירות ' + d.svcType : 'שירות',
          edu: 'השכלה', skills: 'כישורים', langs: 'שפות', extra: 'נוסף' };

    // מקטע תמיד מוצג; אם הוא ריק – דף התוצאות מסמן אותו ולא מדפיס אותו
    const section = (title, ...content) =>
      el('section', { 'data-key': title }, el('h3', {}, title), ...content.filter(Boolean));
    const item = (head, sub, years, bullets) => el('div', { class: 'cv-item' },
      el('div', { class: 'cv-row' }, el('strong', {}, head), years ? el('span', { class: 'cv-years' }, years) : null),
      sub ? el('div', { class: 'cv-sub' }, sub) : null,
      bullets.length ? el('ul', {}, ...bullets.map(b => el('li', {}, b))) : null);
    const inline = list => (list.length ? el('p', {}, list.join(' · ')) : null);

    const c = cv.contact || {};
    const contact = [c.phone, c.email, c.city, c.linkedin].map(s).filter(Boolean);
    const contactLine = el('div', { class: 'cv-contact' });
    contact.forEach((x, i) => {
      if (i) contactLine.append(' · ');
      contactLine.append(el('span', { dir: 'auto' }, x));
    });

    const exp = (Array.isArray(cv.experience) ? cv.experience : [])
      .filter(j => j && s(j.role))
      .map(j => item(s(j.role), s(j.company), s(j.years), arr(j.bullets)));
    const sv = cv.service;
    const svc = sv && (s(sv.role) || s(sv.unit))
      ? item(s(sv.role) || s(sv.unit), s(sv.role) ? s(sv.unit) : '', s(sv.years), arr(sv.bullets)) : null;
    const edu = (Array.isArray(cv.education) ? cv.education : [])
      .filter(e => e && s(e.degree))
      .map(e => item(s(e.degree), [s(e.institution), s(e.notes)].filter(Boolean).join(' · '), s(e.years), []));

    return el('div', { dir: en ? 'ltr' : 'rtl', lang: en ? 'en' : 'he' },
      el('section', { 'data-key': 'header' },
        el('h2', { class: 'cv-name' }, s(cv.name) || s(d.fullName)),
        s(cv.title) ? el('div', { class: 'cv-title' }, s(cv.title)) : null,
        contactLine),
      section(T.summary, s(cv.summary) ? el('p', {}, s(cv.summary)) : null),
      section(T.exp, ...exp),
      d.svcType === 'none' && !svc ? null : section(T.svc, svc),
      section(T.edu, ...edu),
      section(T.skills, inline(arr(cv.skills))),
      section(T.langs, inline(arr(cv.languages))),
      section(T.extra, inline(arr(cv.extra))));
  }
};

