/* מחולל תכנית עסקית – הגדרות השאלון, הפרומפט והתבנית */

const planConfig = {
  id: 'plan',
  resultLabel: 'הצג תכנית עסקית',
  resultTitle: 'התכנית העסקית שלי',
  page: '/plan/',
  steps: [
    {
      title: 'העסק',
      fields: [
        { id: 'name', label: 'שם העסק (אם יש)' },
        { id: 'idea', label: 'מה הרעיון? מה העסק מוכר או עושה?', type: 'textarea', rows: 4, required: true },
        { id: 'stage', label: 'באיזה שלב העסק?', type: 'select',
          options: [
            { value: 'רעיון בלבד', label: 'רעיון בלבד' },
            { value: 'בהקמה', label: 'בהקמה' },
            { value: 'עסק קיים', label: 'עסק קיים' }
          ] },
        { id: 'where', label: 'איפה העסק פועל?', placeholder: 'למשל: באר שבע והסביבה, אונליין בכל הארץ' }
      ]
    },
    {
      title: 'הלקוחות',
      fields: [
        { id: 'audience', label: 'מי הלקוחות?', type: 'textarea', rows: 3, required: true,
          placeholder: 'למשל: משפחות צעירות בדרום, בעלי עסקים קטנים' },
        { id: 'problem', label: 'איזו בעיה או צורך העסק פותר להם?', type: 'textarea', rows: 3 },
        { id: 'marketing', label: 'איך הלקוחות ישמעו עליך?', type: 'textarea', rows: 3,
          placeholder: 'למשל: אינסטגרם, פה לאוזן, גוגל, שלטים' }
      ]
    },
    {
      title: 'מתחרים',
      fields: [
        { id: 'competitors', label: 'מי המתחרים?', type: 'textarea', rows: 3,
          placeholder: 'שמות, או תיאור כללי אם אתה לא יודע' },
        { id: 'advantage', label: 'במה אתה שונה או טוב יותר?', type: 'textarea', rows: 3 }
      ]
    },
    {
      title: 'מוצרים ומחירים',
      intro: 'כל מוצר או שירות שאתה מוכר.',
      repeat: {
        id: 'products', itemLabel: 'מוצר',
        fields: [
          { id: 'product', label: 'מוצר / שירות', required: true },
          { id: 'price', label: 'מחיר (₪)', placeholder: 'למשל: 150 לשעה, 49 לחודש' },
          { id: 'notes', label: 'הערות', placeholder: 'למשל: כמה עולה לך לייצר' }
        ]
      }
    },
    {
      title: 'עלויות',
      intro: 'הערכה גסה מספיקה. אפשר להשאיר ריק וה-AI יעריך.',
      fields: [
        { id: 'startup', label: 'עלויות הקמה (חד פעמי)', type: 'textarea', rows: 3,
          placeholder: 'למשל: ציוד 20,000, אתר 3,000' },
        { id: 'monthly', label: 'הוצאות חודשיות', type: 'textarea', rows: 3,
          placeholder: 'למשל: שכירות 4,000, פרסום 1,500, רואה חשבון 500' },
        { id: 'funding', label: 'כמה כסף יש לך להשקיע? צריך הלוואה?', type: 'textarea', rows: 2 }
      ]
    },
    {
      title: 'תחזית ויעדים',
      fields: [
        { id: 'customers', label: 'כמה לקוחות או מכירות אתה מצפה בחודש בהתחלה?' },
        { id: 'goals', label: 'איפה תרצה שהעסק יהיה בעוד 3 שנים?', type: 'textarea', rows: 3 }
      ]
    }
  ],

  buildPrompt(d) {
    const v = x => (x || '').trim();
    const line = (k, x) => v(x) ? `${k}: ${v(x)}\n` : '';
    const schema = {
      name: '', tagline: '', summary: '', problem: '', solution: '',
      audience: '', competitors: [{ name: '', notes: '' }], advantage: '',
      products: [{ name: '', price: '', notes: '' }],
      marketing: [''],
      startup_costs: [{ item: '', amount: 0 }],
      monthly_costs: [{ item: '', amount: 0 }],
      forecast: [{ year: 1, revenue: 0, expenses: 0, profit: 0 }],
      assumptions: [''], risks: [''], next_steps: ['']
    };

    let p = '';
    p += 'אתה יועץ עסקי שמכיר היטב עסקים קטנים בישראל.\n';
    p += 'כתוב עבורי טיוטה של תכנית עסקית בעברית, לפי המידע שלמטה.\n\n';
    p += 'כללים:\n';
    p += '- כתוב פשוט וברור, בלי ז\'רגון.\n';
    p += '- אל תמציא עובדות על העסק. כשאתה מעריך מספר, רשום את ההנחה ב-assumptions.\n';
    p += '- תחזית לשלוש שנים, שמרנית ומציאותית. סכומים בשקלים, כמספרים בלבד (בלי ₪ ובלי פסיקים).\n';
    p += '- profit = revenue פחות expenses.\n';
    p += '- ציין 3–5 סיכונים עיקריים ו-3–5 צעדים הבאים מעשיים.\n';
    p += '- אם חסר מידע על מתחרים, תאר סוגי מתחרים שסביר שיש.\n';
    p += '\nפורמט התשובה:\n';
    p += 'החזר את התכנית כ-JSON בלבד, בתוך בלוק קוד אחד, בדיוק במבנה הזה (שמות השדות באנגלית, התוכן בעברית).\n';
    p += '```json\n' + JSON.stringify(schema, null, 2) + '\n```\n';
    p += 'אחרי הבלוק כתוב עד 3 שאלות שכדאי לי לבדוק לפני שאני מתחיל.\n\n';

    p += '=== המידע שלי ===\n';
    p += line('שם העסק', d.name) + line('שלב', d.stage) + line('מיקום', d.where);
    p += line('הרעיון', d.idea) + line('לקוחות', d.audience) + line('הבעיה שהעסק פותר', d.problem)
       + line('שיווק', d.marketing) + line('מתחרים', d.competitors) + line('היתרון שלי', d.advantage);
    const prods = (d.products || []).filter(x => v(x.product));
    if (prods.length) {
      p += 'מוצרים ומחירים:\n';
      prods.forEach(x => {
        p += `- ${v(x.product)}${v(x.price) ? ' | ' + v(x.price) + ' ₪' : ''}${v(x.notes) ? ' | ' + v(x.notes) : ''}\n`;
      });
    }
    p += line('עלויות הקמה', d.startup) + line('הוצאות חודשיות', d.monthly) + line('מימון', d.funding)
       + line('לקוחות צפויים בחודש בהתחלה', d.customers) + line('יעדים ל-3 שנים', d.goals);
    return p;
  },

  renderResult(b) {
    const s = x => (typeof x === 'string' ? x.trim() : (typeof x === 'number' ? String(x) : ''));
    const arr = x => (Array.isArray(x) ? x.map(s).filter(Boolean) : []);
    const objs = x => (Array.isArray(x) ? x.filter(o => o && typeof o === 'object') : []);
    const money = x => {
      const n = typeof x === 'number' ? x : Number(String(x).replace(/[^\d.-]/g, ''));
      return isFinite(n) && String(x).trim() !== '' ? '₪' + Math.round(n).toLocaleString('he-IL') : s(x);
    };
    const num = x => { const n = typeof x === 'number' ? x : Number(String(x).replace(/[^\d.-]/g, '')); return isFinite(n) ? n : 0; };

    const section = (title, ...content) => {
      content = content.filter(Boolean);
      return content.length ? el('section', { 'data-key': title }, el('h3', {}, title), ...content) : null;
    };
    const para = x => (s(x) ? el('p', {}, s(x)) : null);
    const list = x => (arr(x).length ? el('ul', {}, ...arr(x).map(i => el('li', {}, i))) : null);
    const table = (head, rows) => rows.length
      ? el('table', {}, el('thead', {}, el('tr', {}, ...head.map(h => el('th', {}, h)))),
          el('tbody', {}, ...rows.map(r => el('tr', {}, ...r.map(c => el('td', {}, c))))))
      : null;
    const costTable = (items, label) => {
      const rows = objs(items).filter(i => s(i.item));
      if (!rows.length) return null;
      const total = rows.reduce((t, i) => t + num(i.amount), 0);
      return table(['פריט', 'סכום'], [...rows.map(i => [s(i.item), money(i.amount)]), [label, money(total)]]);
    };

    const comps = objs(b.competitors).filter(c => s(c.name));
    const prods = objs(b.products).filter(p => s(p.name));
    const fc = objs(b.forecast);

    return el('div', { dir: 'rtl', lang: 'he' },
      el('section', { 'data-key': 'header' },
        el('h2', { class: 'cv-name' }, s(b.name) || 'תכנית עסקית'),
        s(b.tagline) ? el('div', { class: 'cv-title' }, s(b.tagline)) : null,
        el('div', { class: 'cv-contact' }, 'טיוטת תכנית עסקית')),
      section('תקציר', para(b.summary)),
      section('הבעיה והפתרון', para(b.problem), para(b.solution)),
      section('קהל היעד', para(b.audience)),
      section('מתחרים', table(['מתחרה', 'הערות'], comps.map(c => [s(c.name), s(c.notes)])), para(b.advantage) && el('p', {}, el('strong', {}, 'היתרון שלנו: '), s(b.advantage))),
      section('מוצרים ומחירים', table(['מוצר / שירות', 'מחיר', 'הערות'], prods.map(p => [s(p.name), s(p.price), s(p.notes)]))),
      section('שיווק', list(b.marketing)),
      section('עלויות הקמה', costTable(b.startup_costs, 'סה"כ')),
      section('הוצאות חודשיות', costTable(b.monthly_costs, 'סה"כ לחודש')),
      section('תחזית ל-3 שנים', table(['שנה', 'הכנסות', 'הוצאות', 'רווח'],
        fc.map(f => [s(f.year), money(f.revenue), money(f.expenses), money(f.profit)]))),
      section('הנחות', list(b.assumptions)),
      section('סיכונים', list(b.risks)),
      section('צעדים הבאים', list(b.next_steps)),
      el('p', { class: 'disclaimer' }, 'זוהי טיוטה שנוצרה בעזרת בינה מלאכותית ואינה מהווה ייעוץ עסקי, פיננסי או משפטי. מומלץ לבדוק את המספרים עם רואה חשבון או יועץ עסקי.'));
  }
};

