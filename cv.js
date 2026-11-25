/* מחולל קורות חיים – הגדרות השאלון והפרומפט */

const cvConfig = {
  id: 'cv',
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
  }
};

createWizard(cvConfig, document.getElementById('app'));
