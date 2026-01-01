// ==========================
// Sakinah – main.js
// Purpose: App entry; initialize all modules with safe guards.
// ==========================
import { i18n, initLangToggle } from './i18n.js';
import { initFeaturesTabs } from './features.js';
import { initTimeline } from './timeline.js';
import { initRevealAndCounters } from './reveal.js';
import { initPrecheckModal } from './modal.js';

// ===== Force Locks: Arabic + Light theme (temporary) =====
(function lockLangAndTheme() {
  const html = document.documentElement;
  // وسم عام يفيد الـ CSS
  html.setAttribute('data-locked', 'true');

  // —— قفل اللغة على العربية ——
  try {
    // حفظ القيم المقفلة
    localStorage.setItem('lang', 'ar');

    // إجبار اتجاه الصفحة واللغة
    html.lang = 'ar';
    html.dir = 'rtl';

    // تطعيم setLocale بحيث تتجاهل أي محاولة تغيير للغة
    import('./i18n.js').then(({ i18n }) => {
      const originalSet = i18n.setLocale.bind(i18n);
      i18n.setLocale = function () { originalSet('ar'); };
      // طبّق العربية الآن
      i18n.setLocale('ar');
    }).catch(() => { });
  } catch (e) { }

  // —— قفل الثيم على الفاتح ——
  try {
    const KEY = 'skn-theme';
    localStorage.setItem(KEY, 'light');
    html.setAttribute('data-theme', 'light');
  } catch (e) { }

  // —— تعطيل أزرار التبديل واجهياً (مع بقاءها بالكود) ——
  const disable = (el) => {
    if (!el) return;
    el.setAttribute('aria-disabled', 'true');
    el.setAttribute('tabindex', '-1');
    el.style.pointerEvents = 'none';
    el.style.opacity = '0.45';
  };

  // لغة (كبسولة) + ثيم (زر القمر)
  const langPills = document.querySelectorAll('.js-lang, [data-lang-toggle]');
  const themeBtns = document.querySelectorAll('.js-theme-toggle, [data-theme-toggle]');
  langPills.forEach(disable);
  themeBtns.forEach(disable);

  // منع أي استماع سابق بالنقر باستخدام طور الالتقاط
  document.addEventListener('click', (e) => {
    if (e.target.closest('.js-theme-toggle') ||
      e.target.closest('[data-theme-toggle]') ||
      e.target.closest('.js-lang-option') ||
      e.target.closest('[data-lang-toggle]')) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return false;
    }
  }, true);
})();

// Initialize after DOM ready

// Optional: theme toggle (works if a [data-theme-toggle] element exists)
function initThemeToggle() {
  const root = document.documentElement;
  const btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return;
  // Load saved preference
  const saved = localStorage.getItem('skn-theme');
  if (saved) root.setAttribute('data-theme', saved);
  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('skn-theme', next);
    btn.setAttribute('aria-pressed', String(next === 'dark'));
  });
}


window.track = (name, detail = {}) => { try { console.info('[track]', name, detail); } catch (e) { } };

document.addEventListener('DOMContentLoaded', () => {
  // Track features card CTA clicks
  document.querySelectorAll('[data-feature-cta]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-feature-cta');
      if (window.track) { window.track('features_card_cta', { feature: key }); }
    });
  });

  // Language defaults
  i18n.setLocale('ar');
  initLangToggle();

  initThemeToggle();
  // Components
  const hero = document.querySelector('#hero');
  if (hero) {
    document.querySelectorAll('.feature-cta').forEach(btn => {
      btn.addEventListener('click', () => track('features_card_click', { feature: btn.dataset.featureCta }));
    });

    const primary = hero.querySelector('.btn.btn-primary');
    const secondary = hero.querySelector('.btn.btn-soft');
    primary && primary.addEventListener('click', () => track('hero_cta_primary_click', { label: 'register' }));
    secondary && secondary.addEventListener('click', () => track('hero_cta_secondary_click', { label: 'features' }));
  }
  initFeaturesTabs();
  initTimeline();
  initRevealAndCounters();
  initPrecheckModal();

  // Performance hint: mark sections for content-visibility
  document.querySelectorAll('section').forEach(s => s.classList.add('section-cv'));
});

// === Mobile drawer open/close ===
(function () {
  const body = document.body;
  const drawer = document.getElementById('nav-drawer');
  const openBtn = document.querySelector('.js-nav-open');
  const closeEls = document.querySelectorAll('.js-nav-close');
  const overlay = document.querySelector('.nav-overlay');

  const open = () => {
    if (!drawer) return;
    drawer.classList.add('is-open');
    document.body.classList.add('drawer-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (overlay) overlay.hidden = false;
    body.style.overflow = 'hidden';
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.hidden = true;
    body.style.overflow = '';
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
  };

  if (openBtn) openBtn.addEventListener('click', open);
  closeEls.forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // Close drawer when a link inside it is clicked
  if (drawer) {
    drawer.addEventListener('click', (e) => {
      if (e.target.matches('a, a *')) {
        close();
      }
    });
  }
})();

// === Theme toggle (js-theme-toggle support) ===
(function () {
  const KEY = 'skn-theme';
  const root = document.documentElement;
  const btns = document.querySelectorAll('.js-theme-toggle');
  if (!btns.length) return;
  const saved = localStorage.getItem(KEY);
  if (saved) root.setAttribute('data-theme', saved);

  const apply = (t) => {
    root.setAttribute('data-theme', t);
    localStorage.setItem(KEY, t);
    btns.forEach(b => b.setAttribute('aria-pressed', String(t === 'dark')));
  };

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = current === 'dark' ? 'light' : 'dark';
      apply(next);
    });
  });
})();


// === Clone desktop nav links into the mobile drawer ===
(function () {
  const drawerLinks = document.querySelector('.nav-drawer__links');
  if (!drawerLinks) return;
  const headerNav = document.querySelector('.site-header nav.primary-nav');
  if (!headerNav) return;
  const links = Array.from(headerNav.querySelectorAll('a')).filter(a => !a.classList.contains('btn'));
  if (!links.length) return;
  drawerLinks.innerHTML = '';
  links.forEach(a => {
    const c = a.cloneNode(true);
    c.removeAttribute('class');
    drawerLinks.appendChild(c);
  });
})();
