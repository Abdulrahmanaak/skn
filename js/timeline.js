// ==========================
// Sakinah – timeline.js
// Purpose: Customer journey slider/timeline with progress & buttons.
// Assumes HTML structure from index.html.
// ==========================

export function initTimeline(){
  const root = document.querySelector('[data-timeline]');
  if(!root) return;

  const progressBar = root.querySelector('.timeline-progress-bar');
  const track = root.querySelector('.timeline-track');
  const slides = Array.from(root.querySelectorAll('.timeline-slide'));
  const btnPrev = root.querySelector('[data-direction="prev"]');
  const btnNext = root.querySelector('[data-direction="next"]');
  const navButtons = Array.from(root.querySelectorAll('.timeline-nav-button'));

  let index = 0;

  function update(){
    // Update progress (0..100%)
    const pct = ((index + 1) / slides.length) * 100;
    if(progressBar) progressBar.style.inlineSize = pct + '%';

    // Update nav active
    navButtons.forEach((b,i)=> b.classList.toggle('is-active', i===index));

    // Snap to slide for mobile/slider views
    const slide = slides[index];
    if(slide && track){
      slide.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }

    // Disable buttons at edges
    if(btnPrev) btnPrev.disabled = index === 0;
    if(btnNext) btnNext.disabled = index === slides.length - 1;
  }

  btnPrev && btnPrev.addEventListener('click', ()=>{ index = Math.max(0, index-1); update(); });
  btnNext && btnNext.addEventListener('click', ()=>{ index = Math.min(slides.length-1, index+1); update(); });
  navButtons.forEach((b,i)=> b.addEventListener('click', ()=>{ index = i; update(); }));

  // Allow hash navigation like #journey-3
  const hash = location.hash.match(/journey-(\d+)/);
  if(hash){ index = Math.min(slides.length-1, Math.max(0, parseInt(hash[1],10)-1)); }

  update();
}
