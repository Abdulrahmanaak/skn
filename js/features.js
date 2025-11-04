// ==========================
// Sakinah – features.js
// Purpose: Accessible tabs logic for the features section.
// ==========================

export function initFeaturesTabs(){
  const tablist = document.querySelector('.features-tablist');
  if(!tablist) return;

  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[data-feature-panel]'));

  function activate(tab){
    tabs.forEach(t => {
      const selected = (t === tab);
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(p => p.classList.remove('is-active'));
    const feature = tab.getAttribute('data-feature');
    const panel = document.querySelector(`[data-feature-panel="${feature}"]`);
    if(panel){
      panels.forEach(p => p.hidden = true);
      panel.hidden = false;
      panel.classList.add('is-active');
      panel.focus({ preventScroll: true });
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (e) => {
      const idx = tabs.indexOf(tab);
      if(e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
        e.preventDefault();
        const dir = (document.dir === 'rtl') ? -1 : 1;
        const next = (e.key === 'ArrowRight') ? (idx + dir + tabs.length) % tabs.length
                                              : (idx - dir + tabs.length) % tabs.length;
        tabs[next].focus();
        activate(tabs[next]);
      }
    });
  });

  // Ensure default visible
  const initial = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
  if(initial) activate(initial);
}
