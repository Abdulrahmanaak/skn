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
