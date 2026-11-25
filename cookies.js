/* באנר הסכמה לעוגיות – BULU
   הבחירה נשמרת בדפדפן. פרסומות (בעתיד) ייטענו רק אם buluConsent() === 'all'. */

function buluConsent() {
  try { return localStorage.getItem('bulu-consent'); } catch (e) { return null; }
}

function buluCookieSettings() {
  if (document.getElementById('cookie-bar')) return;
  const bar = document.createElement('div');
  bar.id = 'cookie-bar';
  bar.setAttribute('role', 'dialog');
  bar.innerHTML =
    '<p>האתר עשוי להשתמש בעוגיות לצורך פרסומות ומדידת שימוש. ' +
    '<a href="privacy.html">פרטים במדיניות הפרטיות</a>.</p>' +
    '<div><button type="button" class="btn" data-c="all">מאשר</button> ' +
    '<button type="button" class="btn secondary" data-c="essential">רק הכרחיות</button></div>';
  bar.addEventListener('click', e => {
    const c = e.target.dataset && e.target.dataset.c;
    if (!c) return;
    try { localStorage.setItem('bulu-consent', c); } catch (err) {}
    bar.remove();
    document.dispatchEvent(new CustomEvent('bulu-consent', { detail: c }));
  });
  document.body.append(bar);
}

if (!buluConsent()) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buluCookieSettings);
  else buluCookieSettings();
}
