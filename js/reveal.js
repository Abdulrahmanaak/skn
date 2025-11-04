// ==========================
// Sakinah – reveal.js
// Purpose: IntersectionObserver-based reveal animations and hero image.
// Also exposes a simple 'data-count' animator for counters.
// ==========================

export function initRevealAndCounters(){
  document.body.classList.add('has-js');

  const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }) : null;

  document.querySelectorAll('[data-reveal], [data-hero-visual]').forEach(el => {
    if(io) io.observe(el); else el.classList.add('is-visible');
  });

  // Counters (hero metrics)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced) return;

  const counters = document.querySelectorAll('[data-count]');
  const ci = ('IntersectionObserver' in window) ? new IntersectionObserver((ents)=>{
    ents.forEach(ent => {
      if(ent.isIntersecting){ if(ent.target.matches('[data-count]')){ animateCounter(ent.target); ci.unobserve(ent.target); } if(!heroCountersTracked && ent.target.classList && ent.target.classList.contains('hero-counters')){ heroCountersTracked=true; try{ window.track && window.track('hero_counters_view'); }catch(e){} ci.unobserve(ent.target);} }
    });
  }, { threshold: 0.4 }) : null;

  let heroCountersTracked=false;
  counters.forEach(c => { if(ci) ci.observe(c); else animateCounter(c); });
  if(ci){ ci.observe(document.querySelector('.hero-counters')); }

  function animateCounter(node){
    const to = Number(node.getAttribute('data-to') || 0);
    const suffix = node.getAttribute('data-suffix') || '';
    const finalSuffix = node.getAttribute('data-final-suffix') || suffix;
    const dur = 1200 + Math.min(800, to*1.5);
    const start = performance.now();

    function frame(t){
      const k = Math.min(1, (t - start)/dur);
      const val = Math.round(to * (0.5 - Math.cos(Math.PI*k)/2));
      node.textContent = val + (k<1 ? suffix : finalSuffix);
      if(k<1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
}
