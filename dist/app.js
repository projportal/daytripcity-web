(() => {
  'use strict';
  const DATA_URL = 'https://us-west1-daytrip-player-data.cloudfunctions.net/daytrip-events';
  // Anonymous counts only: no cookies, no storage, fixed id.
  function beacon(fields) {
    try {
      if (navigator.sendBeacon) navigator.sendBeacon(DATA_URL, JSON.stringify({ v: 1, id: 'web', ...fields }));
    } catch (e) {}
  }
  beacon({ event: 'page_view' });
  const film = document.querySelector('#city-film');
  const toggles = [...document.querySelectorAll('#motion-toggle, .preview-toggle')];
  const cards = [...document.querySelectorAll('[data-feature]')];
  const previews = cards.map(card => card.querySelector('video'));
  const media = [film, ...previews];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.querySelector('#feature-dialog');
  const detailFilm = document.querySelector('#dialog-film');
  const title = document.querySelector('#dialog-title');
  const description = document.querySelector('#dialog-description');
  const visible = new Map(media.map(video => [video, 0]));
  const agentNames = [...document.querySelectorAll('.agent-name')];
  let agentIndex = 0, agentTimer = 0;
  let motionAllowed = !reduce.matches, preferred = null, active = null, opener = null;
  const features = {
    create: { title: 'Make it yours.', text: 'Ask your AI agent. See what happens.' },
    life: { title: 'Watch it grow.', text: 'New stories. A city that keeps changing.' },
    explore: { title: 'Follow your curiosity.', text: 'Walk, drive, go your own way.' }
  };
  function load(video) {
    if (video.dataset.loaded) return;
    if (video === film) {
      const source = video.querySelector('source');
      source.src = matchMedia('(max-width:700px)').matches ? source.dataset.srcMobile : source.dataset.src;
    } else video.src = video.dataset.src;
    video.dataset.loaded = 'true'; video.load();
  }
  function showState() {
    toggles.forEach(toggle => {
      toggle.hidden = false;
      toggle.classList.toggle('paused', !motionAllowed);
      const label = `${motionAllowed ? 'Pause' : 'Play'} animations`;
      toggle.setAttribute('aria-label', label); toggle.title = label;
    });
  }
  function syncAgentName() {
    if (reduce.matches && agentIndex !== 0) {
      agentIndex = 0;
      agentNames.forEach((name, index) => name.classList.toggle('is-current', index === 0));
    }
    const enabled = motionAllowed && !reduce.matches && !dialog.open && !document.hidden && (visible.get(film) || 0) > .2;
    if (!enabled) { clearTimeout(agentTimer); agentTimer = 0; return; }
    if (agentTimer) return;
    agentTimer = setTimeout(() => {
      agentTimer = 0;
      agentIndex = (agentIndex + 1) % agentNames.length;
      agentNames.forEach((name, index) => name.classList.toggle('is-current', index === agentIndex));
      syncAgentName();
    }, 2600);
  }
  function candidate() {
    const choices = previews.filter(video => (visible.get(video) || 0) > .25);
    const distance = video => Math.abs(video.getBoundingClientRect().top + video.getBoundingClientRect().height / 2 - innerHeight / 2);
    choices.sort((a, b) => visible.get(b) - visible.get(a) || distance(a) - distance(b));
    const best = choices[0];
    const desktop = matchMedia('(min-width:701px)').matches;
    if (desktop && preferred && choices.includes(preferred)) return preferred;
    if (best && visible.get(best) >= .5) return best;
    if ((visible.get(film) || 0) > .2) return film;
    return best || null;
  }
  function sync() {
    syncAgentName();
    const next = motionAllowed && !dialog.open && !document.hidden ? candidate() : null;
    active = next;
    media.forEach(video => { if (video !== next) video.pause(); });
    if (!next || !next.paused) return;
    load(next);
    next.play().then(() => {
      if (active !== next) next.pause();
      else next.classList.add('playing');
    }).catch(() => {});
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => visible.set(entry.target, entry.intersectionRatio)); sync();
  }, { threshold: [0, .05, .2, .25, .5, .75, .9, 1] });
  media.forEach(video => {
    observer.observe(video);
    video.addEventListener('error', () => video.classList.remove('playing'));
  });
  cards.forEach(card => {
    const prefer = () => { preferred = card.querySelector('video'); sync(); };
    card.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') prefer(); });
    card.addEventListener('focus', prefer);
  });
  toggles.forEach(toggle => toggle.addEventListener('click', () => { motionAllowed = !motionAllowed; showState(); sync(); }));
  reduce.addEventListener('change', () => { motionAllowed = !reduce.matches; showState(); sync(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) detailFilm.pause(); sync(); });
  let scrollFrame = 0;
  addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; sync(); });
  }, { passive: true });
  showState();
  function openDetail(key, trigger) {
    opener = trigger;
    detailFilm.pause(); detailFilm.removeAttribute('src'); detailFilm.load();
    const trailer = key === 'film';
    const feature = features[key];
    title.textContent = trailer ? 'A little look around.' : feature.title;
    description.textContent = trailer ? 'Explore San Diego your way.' : feature.text;
    detailFilm.poster = trailer ? 'assets/san-diego-poster-v11.jpg' : `assets/feature-${key}-v11.jpg`;
    detailFilm.src = trailer ? 'assets/san-diego-daytrip-v11.mp4' : `assets/feature-${key}-v11.mp4`;
    dialog.showModal(); document.body.classList.add('modal-open'); sync();
    if (!reduce.matches) detailFilm.play().catch(() => {});
    dialog.querySelector('.dialog-close').focus();
  }
  cards.forEach(button => button.addEventListener('click', () => openDetail(button.dataset.feature, button)));
  document.querySelector('#take-look').addEventListener('click', event => openDetail('film', event.currentTarget));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    detailFilm.pause(); detailFilm.removeAttribute('src'); detailFilm.load();
    document.body.classList.remove('modal-open');
    if (opener) opener.focus({ preventScroll: true }); sync();
  });
  const downloads = [...document.querySelectorAll('.download-link')];
  const statuses = [...document.querySelectorAll('.download-status')];
  let downloadReady = downloads.every(button => button.href.startsWith('https:'));
  downloads.forEach(button => button.addEventListener('click', event => {
    if (downloadReady) {
      const release = new URL(button.href).pathname.match(/\/installers\/([^/]{1,40})\//);
      beacon(release ? { event: 'download', release: release[1] } : { event: 'download' });
      return;
    }
    event.preventDefault();
    const status = button.closest('.actions, .download-wrap').querySelector('.download-status') || document.querySelector('.actions>.download-status');
    status.textContent = 'Mac download coming soon.';
    status.classList.add('availability-message');
  }));
  fetch('links.json').then(response => {
    if (!response.ok) throw new Error('Links unavailable');
    return response.json();
  }).then(links => {
    let url; try { url = new URL(links.download ?? links.tryNow); } catch { return; }
    if (url.protocol !== 'https:') return;
    downloads.forEach(button => { button.href = url.href; });
    statuses.forEach(status => {
      status.textContent = links.downloadLabel || 'Mac only · Windows coming soon';
      if (links.downloadNote) {
        const note = document.createElement('span');
        note.className = 'release-note'; note.textContent = links.downloadNote;
        status.append(document.createElement('br'), note);
      }
      status.classList.remove('availability-message');
    });
    downloadReady = true;
  }).catch(() => {});
})();
