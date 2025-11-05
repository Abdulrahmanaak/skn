// ==========================
// Sakinah – timeline.js
// Purpose: Customer journey timeline with vertical progress & active state handling
// + Independent visuals opposite to previous card, lock both to same grid row.
// ==========================

export function initTimeline() {
  const root = document.querySelector('[data-timeline]');
  if (!root) return;

  // scope الأوسع للقسم (لو progress خارج الغلاف)
  const section = root.closest('#journey') || document;
  const list = section.querySelector('.timeline-tasks');
  if (!list) return;

  // بطاقات النص فقط
  const tasks = Array.from(list.querySelectorAll('.timeline-task'));

  // progress (اختياري)
  const progressFill  = root.querySelector('.timeline-progress-fill') || section.querySelector('.timeline-progress-fill');
  const progressTrack = root.querySelector('.timeline-progress')      || section.querySelector('.timeline-progress');

  // السكة (اختياري)
  const scroller      = root.querySelector('.timeline-scroller');
  const scrollerTrack = root.querySelector('.timeline-scroller__track');
  const scrollerDot   = root.querySelector('.timeline-scroller__dot');

  // --- وزّع الصور واربِطها بصفوف البطاقات ---
  function assignVisualSidesAndRows() {
    const children = Array.from(list.children);
    let row = 0;

    for (let i = 0; i < children.length; i++) {
      const el = children[i];

      // نبدأ صفًا جديدًا مع كل بطاقة نص
      if (el.classList.contains('timeline-task')) {
        row += 1;

        // ضع البطاقة في هذا الصف
        el.style.gridRow = String(row);

        // ابحث عن أول عنصر صورة لاحق لها
        let j = i + 1;
        let visualLI = null;
        while (j < children.length) {
          const candidate = children[j];
          if (!candidate.classList.contains('timeline-task') &&
              candidate.querySelector?.('.timeline-visual')) {
            visualLI = candidate;
            break;
          }
          j++;
        }

        if (visualLI) {
          // طبّق الفئات الأساسية
          visualLI.classList.add('timeline-visual-item');
          visualLI.classList.remove('visual-left', 'visual-right');

          // جهة الصورة عكس جهة البطاقة
          if (el.classList.contains('timeline-task--right')) {
            visualLI.classList.add('visual-left');
          } else {
            visualLI.classList.add('visual-right');
          }

          // اجعل الصورة في نفس الصف
          visualLI.style.gridRow = String(row);
        }
      }
    }
  }

  assignVisualSidesAndRows(); // عند التحميل

  // ------------------------------
  // (2) حساب التقدم والنقطة المتحركة (اختياري)
  // ------------------------------
  if (!tasks.length) return;

  let activeIndex = tasks.findIndex(t => t.classList.contains('is-active'));
  if (activeIndex < 0) activeIndex = 0;

  function updateProgress(index) {
    if (!progressFill) return;
    const task = tasks[index]; if (!task) return;

    const trackRect = (progressTrack ? progressTrack : list).getBoundingClientRect();
    const marker = task.querySelector('.timeline-task__marker');
    let anchor = 0;

    if (marker) {
      const r = marker.getBoundingClientRect();
      anchor = r.top + r.height / 2 - trackRect.top;
    } else {
      const r = task.getBoundingClientRect();
      anchor = r.top + r.height / 2 - trackRect.top;
    }

    const maxHeight = (progressTrack ? progressTrack.getBoundingClientRect().height : list.scrollHeight);
    const clamped = Math.max(0, Math.min(anchor, maxHeight));
    progressFill.style.blockSize = `${clamped}px`;
  }

  function updateScroller(index) {
    if (!scroller || !scrollerTrack || !scrollerDot) return;
    const task = tasks[index]; if (!task) return;

    const tr = scrollerTrack.getBoundingClientRect();
    const marker = task.querySelector('.timeline-task__marker');
    let anchor = 0;

    if (marker) {
      const m = marker.getBoundingClientRect();
      anchor = m.top + m.height / 2 - tr.top;
    } else {
      const r = task.getBoundingClientRect();
      anchor = r.top + r.height / 2 - tr.top;
    }

    const max = Math.max(0, Math.min(anchor, tr.height));
    scrollerDot.style.transform = `translateY(${max}px)`;
  }

  function syncHash(id) {
    if (!id) return;
    if ('replaceState' in history) history.replaceState(null, '', `#${id}`);
    else location.hash = `#${id}`;
  }

  function setActive(index, { updateHash = false } = {}) {
    if (index < 0 || index >= tasks.length) return;
    if (activeIndex === index) {
      updateProgress(index);
      updateScroller(index);
      if (updateHash) syncHash(tasks[index].id);
      return;
    }

    tasks.forEach((task, i) => {
      const isActive = i === index;
      const isComplete = i < index;
      task.classList.toggle('is-active', isActive);
      task.classList.toggle('is-complete', isComplete);
      if (isActive) task.setAttribute('aria-current', 'step');
      else task.removeAttribute('aria-current');
    });

    activeIndex = index;
    updateProgress(index);
    updateScroller(index);
    if (updateHash) syncHash(tasks[index].id);
  }

  // احترم الهاش إن وجد
  const hashTarget = location.hash.replace('#', '');
  if (hashTarget) {
    const idx = tasks.findIndex(t => t.id === hashTarget);
    if (idx !== -1) activeIndex = idx;
  }

  setActive(activeIndex);

  // إعادة حساب صفوف الصور + التقدم عند تغيير الحجم
  const handleResize = () => {
    assignVisualSidesAndRows();
    updateProgress(activeIndex);
    updateScroller(activeIndex);
  };
  window.addEventListener('resize', handleResize);

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => {
      assignVisualSidesAndRows();
      updateProgress(activeIndex);
      updateScroller(activeIndex);
    });
    ro.observe(root);
  }

  const observerOptions = { threshold: 0.55, rootMargin: '-20% 0px -30% 0px' };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = tasks.indexOf(entry.target);
          if (idx !== -1) setActive(idx);
        }
      });
    }, observerOptions);
    tasks.forEach(t => io.observe(t));
  } else {
    const onScroll = () => {
      const mid = window.innerHeight / 2;
      let nearest = activeIndex, min = Infinity;

      tasks.forEach((t, i) => {
        const r = t.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const c = r.top + r.height / 2;
        const d = Math.abs(c - mid);
        if (d < min) { min = d; nearest = i; }
      });

      if (nearest !== activeIndex) setActive(nearest);
      else { updateProgress(activeIndex); updateScroller(activeIndex); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // تفاعل
  tasks.forEach((t, i) => {
    t.addEventListener('click', () => setActive(i, { updateHash: true }));
    t.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActive(i, { updateHash: true });
      }
    });
  });

  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (!id) return;
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) setActive(idx);
  });

  requestAnimationFrame(() => {
    assignVisualSidesAndRows();   // تأكيد أخير
    updateProgress(activeIndex);
    updateScroller(activeIndex);
  });
}
