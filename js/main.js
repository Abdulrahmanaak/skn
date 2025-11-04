// ==========================
// Sakinah – main.js
// Purpose: App entry; initialize all modules with safe guards.
// ==========================
import { i18n, initLangToggle } from './i18n.js';
import { initFeaturesTabs } from './features.js';
import { initTimeline } from './timeline.js';
import { initRevealAndCounters } from './reveal.js';
import { initPrecheckModal } from './modal.js';

// Initialize after DOM ready

// Optional: theme toggle (works if a [data-theme-toggle] element exists)
function initThemeToggle(){
  const root = document.documentElement;
  const btn = document.querySelector('[data-theme-toggle]');
  if(!btn) return;
  // Load saved preference
  const saved = localStorage.getItem('skn-theme');
  if(saved) root.setAttribute('data-theme', saved);
  btn.addEventListener('click', ()=>{
    const current = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('skn-theme', next);
    btn.setAttribute('aria-pressed', String(next==='dark'));
  });
}


window.track = (name, detail={}) => { try{ console.info('[track]', name, detail); }catch(e){} };

document.addEventListener('DOMContentLoaded', () => {
  // Track features card CTA clicks
  document.querySelectorAll('[data-feature-cta]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-feature-cta');
      if(window.track){ window.track('features_card_cta', { feature: key }); }
    });
  });

  // Language defaults
  i18n.setLocale('ar');
  initLangToggle();

  initThemeToggle();
  // Components
  const hero = document.querySelector('#hero');
  if(hero){
    document.querySelectorAll('.feature-cta').forEach(btn=>{
      btn.addEventListener('click', ()=> track('features_card_click', { feature: btn.dataset.featureCta }));
    });

    const primary = hero.querySelector('.btn.btn-primary');
    const secondary = hero.querySelector('.btn.btn-soft');
    primary && primary.addEventListener('click', ()=> track('hero_cta_primary_click', {label:'register'}));
    secondary && secondary.addEventListener('click', ()=> track('hero_cta_secondary_click', {label:'features'}));
  }
  initFeaturesTabs();
  initTimeline();
  initRevealAndCounters();
  initPrecheckModal();

  // Performance hint: mark sections for content-visibility
  document.querySelectorAll('section').forEach(s => s.classList.add('section-cv'));
});
