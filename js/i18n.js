// ==========================
// Sakinah – i18n.js
// Purpose: Minimal i18n scaffolding using data-skey attributes.
// Note: Per your request, translation is last step. This file provides
// setLocale() and a tiny in-memory dictionary so we can plug JSON later.
// ==========================

export const i18n = {
  locale: 'ar',
  dict: {
    ar: {},
    en: {}
  },
  setLocale(lang){
    this.locale = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    this.apply();
  },
  apply(){
    const map = this.dict[this.locale] || {};
    document.querySelectorAll('[data-skey]').forEach(node => {
      const key = node.getAttribute('data-skey');
      const val = map[key];
      if(!val) return;
      // Allow markup replacement if data-allow-html present
      if(node.hasAttribute('data-allow-html')){
        node.innerHTML = val;
      }else{
        node.textContent = val;
      }
    });
    // Update language toggle label if present
    const langBtn = document.querySelector('[data-lang-toggle] span');
    if(langBtn){
      langBtn.textContent = (this.locale === 'ar') ? 'العربية' : 'English';
    }
  }
};

export function initLangToggle(){
  const btn = document.querySelector('[data-lang-toggle]');
  if(!btn) return;
  btn.addEventListener('click', () => {
    const next = (i18n.locale === 'ar') ? 'en' : 'ar';
    i18n.setLocale(next);
  });
}

// === Language capsule logic (B) ===
(function () {
  const KEY = 'lang';
  const html = document.documentElement;
  const getSaved = () => localStorage.getItem(KEY) || (i18n && i18n.locale) || 'ar';

  // Extend i18n.setLocale to also persist
  const originalSet = i18n.setLocale.bind(i18n);
  i18n.setLocale = function(lang){
    localStorage.setItem(KEY, lang);
    originalSet(lang);
    // Update pill label and aria
    document.querySelectorAll('.lang-pill__label').forEach(el => { el.textContent = lang.toUpperCase(); });
    document.querySelectorAll('.js-lang-option').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });
  };

  // Init on load
  i18n.setLocale(getSaved());

  // Open/close menus + choose language
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.js-lang-trigger');
    const pill = e.target.closest('.js-lang');
    const anyOpen = document.querySelectorAll('.js-lang[data-open="true"]');

    if (trigger && pill) {
      const open = pill.getAttribute('data-open') === 'true';
      anyOpen.forEach(x => x.setAttribute('data-open', 'false'));
      pill.setAttribute('data-open', String(!open));
      trigger.setAttribute('aria-expanded', String(!open));
      return;
    }
    const opt = e.target.closest('.js-lang-option');
    if (opt) {
      i18n.setLocale(opt.dataset.lang);
      const p = opt.closest('.js-lang');
      if (p) {
        p.setAttribute('data-open', 'false');
        const btn = p.querySelector('.js-lang-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
      return;
    }
    if (!pill && anyOpen.length) {
      anyOpen.forEach(x => x.setAttribute('data-open', 'false'));
      document.querySelectorAll('.js-lang-trigger').forEach(b => b.setAttribute('aria-expanded', 'false'));
    }
  });
})();
