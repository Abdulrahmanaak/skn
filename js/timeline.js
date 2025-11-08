// ==========================
// Sakinah – timeline.js (unified rail/fill/dot)
// ==========================

export function initTimeline() {
  const root = document.querySelector('[data-timeline]');
  if (!root) return;

  const section = root.closest('#journey') || document;
  const list = section.querySelector('.timeline-tasks');
  if (!list) return;

  const tasks = Array.from(list.querySelectorAll('.timeline-task'));
  if (!tasks.length) return;

  // عناصر السكة/التقدم/النقطة
  const rail = root.querySelector('.timeline-scroller__track');
  const fill = root.querySelector('.timeline-progress-fill');
  const dot  = root.querySelector('.timeline-dot');

  let activeIndex = tasks.findIndex(t => t.classList.contains('is-active'));
  if (activeIndex < 0) activeIndex = 0;

  function trackMetrics() {
    const track = rail ? rail.getBoundingClientRect()
                       : (root.getBoundingClientRect());
    return { top: track.top, height: track.height };
  }

  function anchorForTask(task, top) {
    const r = task.getBoundingClientRect();
    return (r.top + r.height / 2) - top; // مركز البطاقة نسبة لأعلى السكة
  }

  function updateProgress(index) {
    const { top, height } = trackMetrics();
    const task = tasks[index]; if (!task) return;
    const a = anchorForTask(task, top);
    const clamped = Math.max(0, Math.min(a, height));
    if (fill) fill.style.blockSize = `${clamped}px`;
    if (dot)  dot.style.insetBlockStart = `${clamped}px`;
  }

  function setActive(index, { updateHash = false } = {}) {
    if (index < 0 || index >= tasks.length) return;
    if (activeIndex !== index) {
      tasks.forEach((t, i) => {
        const isActive = i === index;
        t.classList.toggle('is-active', isActive);
        t.classList.toggle('is-complete', i < index);
        if (isActive) t.setAttribute('aria-current', 'step');
        else t.removeAttribute('aria-current');
      });
      activeIndex = index;
    }
    updateProgress(index);
    if (updateHash) {
      const id = tasks[index].id;
      if (id) history.replaceState?.(null, '', `#${id}`);
    }
  }

  // احترم الهاش عند التحميل
  const hash = location.hash.slice(1);
  if (hash) {
    const idx = tasks.findIndex(t => t.id === hash);
    if (idx !== -1) activeIndex = idx;
  }
  setActive(activeIndex);

  // مراقبة التقاطع (التفعيل أثناء التمرير)
  const io = ('IntersectionObserver' in window)
    ? new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = tasks.indexOf(e.target);
            if (i !== -1) setActive(i);
          }
        }
      }, { threshold: 0.55, rootMargin: '-20% 0px -30% 0px' })
    : null;

  io && tasks.forEach(t => io.observe(t));

  // بديل للمتصفحات القديمة
  if (!io) {
    const onScroll = () => {
      const mid = innerHeight / 2;
      let nearest = activeIndex, min = Infinity;
      tasks.forEach((t, i) => {
        const r = t.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const d = Math.abs((r.top + r.height / 2) - mid);
        if (d < min) { min = d; nearest = i; }
      });
      setActive(nearest);
    };
    addEventListener('scroll', onScroll, { passive: true });
  }

  // إعادة حساب على تغيير المقاس/المحتوى
  const resync = () => updateProgress(activeIndex);
  addEventListener('resize', resync);
  'ResizeObserver' in window && new ResizeObserver(resync).observe(root);

  // نقر ولوحة مفاتيح
  tasks.forEach((t, i) => {
    t.addEventListener('click', () => setActive(i, { updateHash: true }));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(i, { updateHash: true }); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(i + 1, tasks.length - 1), { updateHash: true }); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(Math.max(i - 1, 0), { updateHash: true }); }
    });
  });

  addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) setActive(idx);
  });

  requestAnimationFrame(resync);

  
}
