/* ============================================================
   CINEVERSE — app.js
   TMDB API: https://api.themoviedb.org/3
   ============================================================ */

const API_KEY  = '9dcc0dc21737528d2a038937cdfb00cd';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/';

// ── Helpers ────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const tmdb = async (path, params = {}) => {
  const qs = new URLSearchParams({ api_key: API_KEY, ...params });
  const res = await fetch(`${BASE_URL}/${path}?${qs}`);
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  return res.json();
};
const img = (path, size = 'w500') =>
  path ? `${IMG_BASE}${size}${path}` : 'https://via.placeholder.com/500x750?text=No+Image';
const stars = n => '★'.repeat(Math.round(n / 2)) + '☆'.repeat(5 - Math.round(n / 2));
const fmt   = date => date ? new Date(date).getFullYear() : '';
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

// ── State ─────────────────────────────────────────────────
let heroMovies = [];
let heroIndex  = 0;
let heroTimer  = null;
let allPage    = 1;
let allCategory= '';
let allTotalPages = 1;
let genreMap   = {};

// ── LOADER ────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => $('loader').classList.add('hide'), 1800);
});

// ── NAVBAR SCROLL ─────────────────────────────────────────
const navbar = $('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  updateParallax();
  highlightNavLink();
}, { passive: true });

function highlightNavLink() {
  const sections = document.querySelectorAll('section[id], .hero[id]');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 140) current = s.id;
  });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
  });
}

// ── BURGER ────────────────────────────────────────────────
const burger   = $('burger');
const navLinks = $('navLinks');

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('mobile-open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});

document.querySelectorAll('[data-close]').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('mobile-open');
    burger.classList.remove('open');
  });
});

// ── SEARCH ────────────────────────────────────────────────
const searchToggle  = $('searchToggle');
const searchBar     = $('searchBar');
const searchInput   = $('searchInput');
const searchClear   = $('searchClear');
const searchResults = $('searchResults');

searchToggle.addEventListener('click', () => {
  const open = searchBar.classList.toggle('open');
  if (open) { setTimeout(() => searchInput.focus(), 350); }
  else { clearSearch(); }
});

searchClear.addEventListener('click', clearSearch);
function clearSearch() {
  searchInput.value = '';
  searchResults.innerHTML = '';
  searchBar.classList.remove('open');
}

let searchDebounce;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  const q = searchInput.value.trim();
  if (!q) { searchResults.innerHTML = ''; return; }
  searchDebounce = setTimeout(() => doSearch(q), 350);
});

async function doSearch(q) {
  searchResults.innerHTML = '<p class="search-no-results">Searching...</p>';
  try {
    const data = await tmdb('search/movie', { query: q, include_adult: false });
    if (!data.results.length) {
      searchResults.innerHTML = '<p class="search-no-results">No results found.</p>';
      return;
    }
    searchResults.innerHTML = data.results.slice(0, 12).map(m => `
      <div class="search-card" data-id="${m.id}" role="button" tabindex="0">
        <img src="${img(m.poster_path, 'w92')}" alt="${m.title}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/40x60?text=?'"/>
        <div class="search-card-info">
          <div class="search-card-title">${m.title}</div>
          <div class="search-card-year">${fmt(m.release_date)}</div>
        </div>
      </div>`).join('');
    searchResults.querySelectorAll('.search-card').forEach(c => {
      c.addEventListener('click', () => { openModal(+c.dataset.id); clearSearch(); });
      c.addEventListener('keydown', e => { if (e.key === 'Enter') { openModal(+c.dataset.id); clearSearch(); } });
    });
  } catch { searchResults.innerHTML = '<p class="search-no-results">Something went wrong.</p>'; }
}

// close search on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target) && searchBar.classList.contains('open')) clearSearch();
});

// ── GENRES ────────────────────────────────────────────────
async function loadGenres() {
  try {
    const d = await tmdb('genre/movie/list');
    d.genres.forEach(g => { genreMap[g.id] = g.name; });
  } catch {}
}

// ── HERO ──────────────────────────────────────────────────
async function loadHero() {
  try {
    const data = await tmdb('trending/movie/week');
    heroMovies = data.results.filter(m => m.backdrop_path).slice(0, 8);
    buildHeroDots();
    showHero(0);
    startHeroTimer();
  } catch {}
}

function buildHeroDots() {
  const dots = $('heroDots');
  dots.innerHTML = heroMovies.map((_, i) =>
    `<button class="hero-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Slide ${i+1}"></button>`
  ).join('');
  dots.querySelectorAll('.hero-dot').forEach(d => {
    d.addEventListener('click', () => { showHero(+d.dataset.i); resetHeroTimer(); });
  });
}

function showHero(index) {
  heroIndex = clamp(index, 0, heroMovies.length - 1);
  const m = heroMovies[heroIndex];
  const heroBg = $('heroBg');
  const heroContent = $('heroContent');

  heroBg.style.backgroundImage = `url(${img(m.backdrop_path, 'original')})`;
  heroContent.classList.remove('visible');

  $('heroTitle').textContent = m.title;
  $('heroDesc').textContent  = m.overview || '';
  $('heroMeta').innerHTML    = `
    <span class="hero-rating">★ ${m.vote_average?.toFixed(1)}</span>
    <span class="hero-meta-dot">•</span>
    <span>${fmt(m.release_date)}</span>
    <span class="hero-meta-dot">•</span>
    <span>${(genreMap[m.genre_ids?.[0]] || 'Movie')}</span>`;

  $('heroTrailerBtn').onclick = () => openModal(m.id);
  $('heroInfoBtn').onclick    = () => openModal(m.id);

  document.querySelectorAll('.hero-dot').forEach((d, i) =>
    d.classList.toggle('active', i === heroIndex));

  setTimeout(() => heroContent.classList.add('visible'), 80);
}

function startHeroTimer() {
  heroTimer = setInterval(() => showHero((heroIndex + 1) % heroMovies.length), 7000);
}
function resetHeroTimer() {
  clearInterval(heroTimer);
  startHeroTimer();
}

// ── TRACK (horizontal scroll row) ────────────────────────
function buildTrack(trackEl, movies) {
  trackEl.innerHTML = '';
  movies.forEach(m => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img class="card-poster" src="${img(m.poster_path)}" alt="${m.title}" loading="lazy"
           onerror="this.src='https://via.placeholder.com/180x270?text=No+Image'"/>
      <div class="card-overlay">
        <div class="card-play"><svg viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg></div>
        <div class="card-title">${m.title}</div>
        <div class="card-rating">★ ${m.vote_average?.toFixed(1)}</div>
      </div>`;
    card.addEventListener('click', () => openModal(m.id));
    trackEl.appendChild(card);
  });
}

function addSkeletons(trackEl, n = 8) {
  trackEl.innerHTML = Array(n).fill('<div class="card-skeleton"></div>').join('');
}

async function loadTrack(trackId, endpoint, params = {}) {
  const trackEl = $(trackId);
  addSkeletons(trackEl);
  try {
    const data = await tmdb(endpoint, params);
    buildTrack(trackEl, data.results);
    setupTrackNav(trackEl);
  } catch { trackEl.innerHTML = '<p style="color:var(--muted);padding:20px">Failed to load.</p>'; }
}

function setupTrackNav(trackEl) {
  const wrapper = trackEl.closest('.cards-track-wrapper');
  const prev = wrapper.querySelector('.track-prev');
  const next = wrapper.querySelector('.track-next');
  const scroll = () => {
    const w = trackEl.offsetWidth;
    prev.disabled = trackEl.scrollLeft < 10;
    next.disabled = trackEl.scrollLeft + w >= trackEl.scrollWidth - 10;
  };
  prev.addEventListener('click', () => { trackEl.scrollBy({ left: -600, behavior: 'smooth' }); });
  next.addEventListener('click', () => { trackEl.scrollBy({ left:  600, behavior: 'smooth' }); });
  trackEl.addEventListener('scroll', scroll, { passive: true });
  scroll();
}

// ── PARALLAX ─────────────────────────────────────────────
async function loadParallaxImage() {
  try {
    const data = await tmdb('movie/popular');
    const m = data.results.find(m => m.backdrop_path);
    if (m) $('parallaxLayer').style.backgroundImage = `url(${img(m.backdrop_path, 'original')})`;
  } catch {}
}

function updateParallax() {
  const banner = $('parallaxBanner');
  if (!banner) return;
  const rect = banner.getBoundingClientRect();
  const vh   = window.innerHeight;
  if (rect.bottom < 0 || rect.top > vh) return;
  const progress = (vh - rect.top) / (vh + rect.height);
  const shift = (progress - 0.5) * 80;
  $('parallaxLayer').style.transform = `translateY(${shift}px)`;
}

// ── SCROLL REVEAL ─────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

function observeReveals() {
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
}

// ── MODAL ─────────────────────────────────────────────────
const modalOverlay = $('modalOverlay');

async function openModal(movieId) {
  // reset
  $('modalTrailer').innerHTML = '';
  $('modalBackdrop').style.backgroundImage = '';
  $('modalGenres').innerHTML  = '<span class="genre-pill">Loading...</span>';
  $('modalTitle').textContent = '';
  $('modalMeta').innerHTML    = '';
  $('modalOverview').textContent = '';
  $('modalCast').innerHTML    = '';

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  try {
    const [details, videos, credits] = await Promise.all([
      tmdb(`movie/${movieId}`, { append_to_response: '' }),
      tmdb(`movie/${movieId}/videos`),
      tmdb(`movie/${movieId}/credits`),
    ]);

    // backdrop
    if (details.backdrop_path) {
      $('modalBackdrop').style.backgroundImage = `url(${img(details.backdrop_path, 'w1280')})`;
    }

    // trailer
    const trailer = videos.results.find(v =>
      v.type === 'Trailer' && v.site === 'YouTube') ||
      videos.results.find(v => v.site === 'YouTube');
    if (trailer) {
      $('modalTrailer').innerHTML = `
        <iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0&modestbranding=1"
          allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
    } else {
      $('modalTrailer').innerHTML = `<div class="no-trailer">No trailer available</div>`;
    }

    // genres
    $('modalGenres').innerHTML = (details.genres || [])
      .map(g => `<span class="genre-pill">${g.name}</span>`).join('');

    // title + meta
    $('modalTitle').textContent = details.title;
    $('modalMeta').innerHTML = `
      <span class="rating">★ ${details.vote_average?.toFixed(1)} / 10</span>
      <span>${fmt(details.release_date)}</span>
      ${details.runtime ? `<span>${details.runtime} min</span>` : ''}
      ${details.original_language ? `<span>${details.original_language.toUpperCase()}</span>` : ''}`;

    // overview
    $('modalOverview').textContent = details.overview || 'No description available.';

    // cast
    const cast = (credits.cast || []).slice(0, 12);
    if (cast.length) {
      $('modalCast').innerHTML = `
        <h4>Cast</h4>
        <div class="cast-list">${cast.map(c => `
          <div class="cast-item">
            <img src="${img(c.profile_path, 'w185')}" alt="${c.name}"
                 onerror="this.src='https://via.placeholder.com/70x70?text=?'"/>
            <div class="cast-name">${c.name}</div>
            <div class="cast-char">${c.character}</div>
          </div>`).join('')}
        </div>`;
    }

  } catch (err) {
    $('modalTitle').textContent = 'Failed to load details.';
    console.error(err);
  }
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  // stop trailer
  $('modalTrailer').innerHTML = '';
}

$('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeAllOverlay(); }
});

// ── SEE ALL OVERLAY ───────────────────────────────────────
const allOverlay = $('allOverlay');

document.querySelectorAll('.see-all').forEach(btn => {
  btn.addEventListener('click', () => {
    allCategory = btn.dataset.category;
    $('allTitle').textContent = btn.dataset.title;
    $('allGrid').innerHTML = '';
    allPage = 1;
    allTotalPages = 1;
    allOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    loadAllPage();
  });
});

function closeAllOverlay() {
  allOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
$('allClose').addEventListener('click', closeAllOverlay);
allOverlay.addEventListener('click', e => { if (e.target === allOverlay) closeAllOverlay(); });

async function loadAllPage() {
  const btn = $('loadMoreBtn');
  btn.disabled = true;
  btn.textContent = 'Loading...';
  try {
    const isTrending = allCategory.startsWith('trending');
    const endpoint   = isTrending ? allCategory : allCategory;
    const data       = isTrending
      ? await tmdb(allCategory, { page: allPage })
      : await tmdb(allCategory, { page: allPage });
    allTotalPages = data.total_pages || 1;

    data.results.forEach(m => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.innerHTML = `
        <img class="card-poster" src="${img(m.poster_path)}" alt="${m.title}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/180x270?text=No+Image'"/>
        <div class="card-overlay">
          <div class="card-play"><svg viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg></div>
          <div class="card-title">${m.title}</div>
          <div class="card-rating">★ ${m.vote_average?.toFixed(1)}</div>
        </div>`;
      card.addEventListener('click', () => openModal(m.id));
      $('allGrid').appendChild(card);
    });

    allPage++;
    btn.disabled  = allPage > allTotalPages;
    btn.textContent = allPage > allTotalPages ? 'No More Results' : 'Load More';
  } catch {
    btn.textContent = 'Error — Try Again';
    btn.disabled = false;
  }
}
$('loadMoreBtn').addEventListener('click', loadAllPage);

// ── INIT ──────────────────────────────────────────────────
async function init() {
  await loadGenres();

  await Promise.all([
    loadHero(),
    loadParallaxImage(),
    loadTrack('trendingTrack', 'trending/movie/week'),
    loadTrack('popularTrack',  'movie/popular'),
    loadTrack('topRatedTrack', 'movie/top_rated'),
    loadTrack('upcomingTrack', 'movie/upcoming'),
  ]);

  observeReveals();
}

init();
