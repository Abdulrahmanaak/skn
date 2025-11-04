// ==========================
// Sakinah – modal.js
// Purpose: Precheck modal open/close with focus trap and ESC support.
// ==========================

export function initPrecheckModal(){
  const modal = document.querySelector('[data-precheck-modal]');
  const openers = document.querySelectorAll('[data-precheck-open]');
  if(!modal || !openers.length) return;
  const dialog = modal.querySelector('.precheck-dialog');
  const closer = modal.querySelector('.modal-close');
  let lastActive = null;

  function open(){
    lastActive = document.activeElement;
    modal.setAttribute('data-state','open');
    document.body.classList.add('is-modal-open');
    trapFocus();
  }
  function close(){
    modal.removeAttribute('data-state');
    document.body.classList.remove('is-modal-open');
    if(lastActive) lastActive.focus();
  }

  openers.forEach(btn => btn.addEventListener('click', open));
  closer && closer.addEventListener('click', close);
  modal.addEventListener('click', (e)=> { if(e.target === modal) close(); });
  window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && modal.getAttribute('data-state')==='open') close(); });

  // Minimal focus trap
  function trapFocus(){
    const focusables = dialog.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
    const first = focusables[0], last = focusables[focusables.length-1];
    first && first.focus();
    dialog.addEventListener('keydown', (e)=>{
      if(e.key !== 'Tab') return;
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    });
  }
}
