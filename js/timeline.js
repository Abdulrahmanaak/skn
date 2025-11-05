// ==========================
// Sakinah – timeline.js
// Purpose: Customer journey timeline with vertical progress & active state handling.
// Works with the vertical ordered list markup defined in index.html.
// ==========================

export function initTimeline(){
  const root = document.querySelector('[data-timeline]');
  if(!root) return;

  const list = root.querySelector('.timeline-tasks');
  const tasks = Array.from(root.querySelectorAll('.timeline-task'));
  const progressFill = root.querySelector('.timeline-progress-fill');
  const progressTrack = root.querySelector('.timeline-progress');

  if(!list || !tasks.length) return;

  let activeIndex = tasks.findIndex(task => task.classList.contains('is-active'));
  if(activeIndex < 0) activeIndex = 0;

  function updateProgress(index){
    if(!progressFill) return;
    const task = tasks[index];
    if(!task) return;

    const trackRect = progressTrack ? progressTrack.getBoundingClientRect() : list.getBoundingClientRect();
    const marker = task.querySelector('.timeline-task__marker');
    let anchor = 0;

    if(marker){
      const markerRect = marker.getBoundingClientRect();
      anchor = markerRect.top + markerRect.height / 2 - trackRect.top;
    } else {
      const taskRect = task.getBoundingClientRect();
      anchor = taskRect.top + taskRect.height / 2 - trackRect.top;
    }

    const maxHeight = progressTrack ? progressTrack.getBoundingClientRect().height : list.scrollHeight;
    const clamped = Math.max(0, Math.min(anchor, maxHeight));
    progressFill.style.blockSize = `${clamped}px`;
  }

  function syncHash(id){
    if(!id) return;
    if(typeof history !== 'undefined' && 'replaceState' in history){
      history.replaceState(null, '', `#${id}`);
    } else {
      location.hash = `#${id}`;
    }
  }

  function setActive(index, { updateHash = false } = {}){
    if(index < 0 || index >= tasks.length) return;

    if(activeIndex === index){
      updateProgress(index);
      if(updateHash){
        syncHash(tasks[index].id);
      }
      return;
    }

    tasks.forEach((task, i)=>{
      const isActive = i === index;
      const isComplete = i < index;
      task.classList.toggle('is-active', isActive);
      task.classList.toggle('is-complete', isComplete);
      if(isActive){
        task.setAttribute('aria-current', 'step');
      } else {
        task.removeAttribute('aria-current');
      }
    });

    activeIndex = index;
    updateProgress(index);

    if(updateHash){
      syncHash(tasks[index].id);
    }
  }

  const hashTarget = location.hash.replace('#', '');
  if(hashTarget){
    const hashIndex = tasks.findIndex(task => task.id === hashTarget);
    if(hashIndex !== -1){
      activeIndex = hashIndex;
    }
  }

  setActive(activeIndex);

  const handleResize = ()=> updateProgress(activeIndex);
  window.addEventListener('resize', handleResize);

  if('ResizeObserver' in window){
    const resizeObserver = new ResizeObserver(()=> updateProgress(activeIndex));
    resizeObserver.observe(root);
  }

  const observerOptions = { threshold: 0.55, rootMargin: '-20% 0px -30% 0px' };

  if('IntersectionObserver' in window){
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry =>{
        if(entry.isIntersecting){
          const idx = tasks.indexOf(entry.target);
          if(idx !== -1){
            setActive(idx);
          }
        }
      });
    }, observerOptions);

    tasks.forEach(task => observer.observe(task));
  } else {
    const onScroll = ()=>{
      const viewportMid = window.innerHeight / 2;
      let nearest = activeIndex;
      let minDistance = Number.POSITIVE_INFINITY;

      tasks.forEach((task, idx)=>{
        const rect = task.getBoundingClientRect();
        if(rect.bottom < 0 || rect.top > window.innerHeight) return;
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportMid);
        if(distance < minDistance){
          minDistance = distance;
          nearest = idx;
        }
      });

      if(nearest !== activeIndex){
        setActive(nearest);
      } else {
        updateProgress(activeIndex);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  tasks.forEach((task, index)=>{
    task.addEventListener('click', ()=> setActive(index, { updateHash: true }));
    task.addEventListener('keydown', event =>{
      if(event.key === 'Enter' || event.key === ' '){
        event.preventDefault();
        setActive(index, { updateHash: true });
      }
    });
  });

  window.addEventListener('hashchange', ()=>{
    const targetId = location.hash.replace('#', '');
    if(!targetId) return;
    const idx = tasks.findIndex(task => task.id === targetId);
    if(idx !== -1){
      setActive(idx);
    }
  });

  requestAnimationFrame(()=> updateProgress(activeIndex));
}
