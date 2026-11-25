/* מנוע שאלונים משותף לכל המחוללים – BULU
   כל מחולל מגדיר config עם: id, steps, buildPrompt(data)
   המידע נשמר רק בדפדפן של המשתמש (localStorage), לא נשלח לשום שרת. */

function el(tag, attrs, ...children) {
  const e = document.createElement(tag);
  for (const k in (attrs || {})) {
    if (k === 'class') e.className = attrs[k];
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  for (const c of children) if (c != null) e.append(c);
  return e;
}

function createWizard(config, root) {
  const KEY = 'bulu-' + config.id;
  let data = {};
  try { data = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  let step = 0;
  const last = config.steps.length; // השלב האחרון = הפרומפט

  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} };

  // שדה אחד
  function field(f, obj) {
    const id = 'f-' + Math.random().toString(36).slice(2);
    let input;
    if (f.type === 'textarea') {
      input = el('textarea', { id, rows: f.rows || 4 });
    } else if (f.type === 'select') {
      input = el('select', { id });
      f.options.forEach(o => input.append(el('option', { value: o.value }, o.label)));
    } else {
      input = el('input', { id, type: f.type || 'text' });
    }
    if (f.placeholder) input.placeholder = f.placeholder;
    if (f.dir) input.dir = f.dir;
    input.value = obj[f.id] ?? (f.type === 'select' ? f.options[0].value : '');
    obj[f.id] = input.value;
    if (f.required) input.dataset.required = '1';
    input.addEventListener('input', () => {
      obj[f.id] = input.value;
      input.classList.remove('invalid');
      save();
    });
    return el('div', { class: 'field' },
      el('label', { for: id }, f.label, f.required ? el('span', { class: 'req' }, ' *') : null),
      f.hint ? el('small', { class: 'hint' }, f.hint) : null,
      input
    );
  }

  // שלב עם פריטים שחוזרים (משרות, לימודים...)
  function repeatBlock(r, body) {
    const list = data[r.id] = data[r.id] || [];
    if (!list.length) list.push({});
    list.forEach((item, i) => {
      const box = el('fieldset', { class: 'item' }, el('legend', {}, r.itemLabel + ' ' + (i + 1)));
      r.fields.forEach(f => box.append(field(f, item)));
      box.append(el('button', {
        type: 'button', class: 'link danger',
        onclick: () => { list.splice(i, 1); save(); render(); }
      }, 'הסר'));
      body.append(box);
    });
    body.append(el('button', {
      type: 'button', class: 'btn secondary',
      onclick: () => { list.push({}); save(); render(); }
    }, '+ הוסף ' + r.itemLabel));
  }

  function valid() {
    let ok = true;
    root.querySelectorAll('[data-required="1"]').forEach(i => {
      if (!i.value.trim()) { i.classList.add('invalid'); ok = false; }
    });
    if (!ok) root.querySelector('.invalid').focus();
    return ok;
  }

  function render() {
    root.innerHTML = '';
    root.append(el('div', { class: 'progress' },
      el('div', { class: 'bar', style: 'width:' + Math.round(step / last * 100) + '%' })));
    root.append(el('p', { class: 'stepnum' },
      step < last ? `שלב ${step + 1} מתוך ${last}` : 'הפרומפט מוכן'));

    if (step === last) { renderPrompt(); return; }

    const s = config.steps[step];
    const body = el('div', { class: 'card' },
      el('h2', {}, s.title),
      s.intro ? el('p', { class: 'intro' }, s.intro) : null);
    if (s.repeat) repeatBlock(s.repeat, body);
    else s.fields.forEach(f => body.append(field(f, data)));
    save();
    root.append(body);

    root.append(el('div', { class: 'nav' },
      step > 0
        ? el('button', { type: 'button', class: 'btn secondary', onclick: () => { step--; render(); } }, '→ הקודם')
        : el('span'),
      el('button', {
        type: 'button', class: 'btn',
        onclick: () => { if (valid()) { step++; render(); } }
      }, step === last - 1 ? 'צור פרומפט ✓' : 'הבא ←')
    ));
    window.scrollTo(0, 0);
  }

  function renderPrompt() {
    const text = config.buildPrompt(data);
    const ta = el('textarea', { class: 'prompt', rows: 14, readonly: '' });
    ta.value = text;
    const status = el('span', { class: 'status' });

    const copy = async () => {
      try { await navigator.clipboard.writeText(text); }
      catch (e) { ta.select(); document.execCommand('copy'); }
      status.textContent = 'הועתק ✓';
    };

    root.append(el('div', { class: 'card' },
      el('h2', {}, 'הפרומפט שלך מוכן'),
      el('ol', { class: 'howto' },
        el('li', {}, 'לחץ "העתק פרומפט".'),
        el('li', {}, 'פתח את ChatGPT או Claude.'),
        el('li', {}, 'הדבק ושלח.')),
      ta,
      el('div', { class: 'nav' },
        el('div', {},
          el('button', { type: 'button', class: 'btn', onclick: copy }, 'העתק פרומפט'),
          status),
        el('div', {},
          el('a', { class: 'btn secondary', href: 'https://chatgpt.com/', target: '_blank', rel: 'noopener' }, 'ChatGPT'),
          ' ',
          el('a', { class: 'btn secondary', href: 'https://claude.ai/new', target: '_blank', rel: 'noopener' }, 'Claude')))
    ));

    root.append(el('div', { class: 'nav' },
      el('button', { type: 'button', class: 'btn secondary', onclick: () => { step--; render(); } }, '→ חזרה לעריכה'),
      el('button', {
        type: 'button', class: 'link danger',
        onclick: () => {
          if (confirm('למחוק את כל מה שמילאת ולהתחיל מחדש?')) {
            data = {}; localStorage.removeItem(KEY); step = 0; render();
          }
        }
      }, 'התחל מחדש')
    ));
    window.scrollTo(0, 0);
  }

  render();
}
