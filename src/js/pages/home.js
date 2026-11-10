import { escapeHtml } from '../config.js';
import { fetchAllData } from '../sanity-client.js';
import { observeReveals, openVideoModal } from '../ui.js';

async function initHomePage() {
  const ytGrid = document.getElementById('youtube-grid');
  if (!ytGrid) return;

  const data = await fetchAllData();
  const videos = data.youtube || [];

  if (!videos.length) {
    ytGrid.innerHTML = '';
    return;
  }

  ytGrid.innerHTML = videos
    .map(
      (v) => `
      <button
        type="button"
        class="yt-card"
        data-video-id="${escapeHtml(v.id)}"
        data-reveal
        aria-label="Reproducir vídeo: ${escapeHtml(v.title)}"
      >
        <div class="yt-card__thumb-wrap">
          <img
            src="${escapeHtml(v.thumb)}"
            data-fallback="${escapeHtml(v.fallbackThumb)}"
            alt="${escapeHtml(v.title)}"
            class="yt-card__thumb"
            loading="lazy"
          />
          <span class="yt-card__play" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span class="yt-card__duration">${escapeHtml(v.duration)}</span>
        </div>
        <div class="yt-card__body">
          <span class="yt-card__tag">${escapeHtml(v.tag)}</span>
          <h3 class="yt-card__title">${escapeHtml(v.title)}</h3>
          <p class="yt-card__desc">${escapeHtml(v.highlight)}</p>
        </div>
      </button>
    `
    )
    .join('');

  ytGrid.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener(
      'error',
      () => {
        const fb = img.getAttribute('data-fallback');
        if (fb && img.src !== fb) img.src = fb;
      },
      { once: true }
    );
  });

  ytGrid.querySelectorAll('.yt-card').forEach((card) => {
    card.addEventListener('click', () => {
      const vid = card.getAttribute('data-video-id');
      if (vid) openVideoModal(vid);
    });
  });

  observeReveals(ytGrid);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomePage);
} else {
  initHomePage();
}

