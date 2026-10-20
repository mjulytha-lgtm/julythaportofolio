// ══════════════════════════════════════════════════════
//  APP.JS  v3  —  Accordion + Media + Drag & Drop
// ══════════════════════════════════════════════════════

const OWNER_PASSWORD = "jun130611";
let isOwner = false;
let currentEditSection = null;

document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  initScrollAnimations();
  initNavHighlight();
  initNavScroll();
  initNavMenu();
  initLightbox();
});

function renderAll() {
  renderHero();
  renderAbout();
  renderSkills();
  renderExperience();
  renderProjects();
  renderEducation();
  renderContact();
}

// ══════════════════════════════════════════════════════
//  HERO — foto fix: inline base64 langsung di src
// ══════════════════════════════════════════════════════
function renderHero() {
  const d = PORTFOLIO_DATA.hero;
  setText('heroName',    d.name);
  setText('heroTitle',   d.title);
  setText('heroTagline', d.tagline);
  setText('heroLocation', d.location || 'Banten, Indonesia');

  const initials = d.name.split(' ').map(w => w[0]).join('').slice(0, 3);

  setAttr('heroLinkedin', 'href', d.linkedin || '#');
  setAttr('heroEmail',    'href', 'mailto:' + (d.email || ''));
  setAttr('heroInstagram','href', d.instagram || '#');

  const img = document.getElementById('heroAvatarImg');
  const fb  = document.getElementById('heroAvatarFallback');

  if (d.avatarUrl && d.avatarUrl.length > 20) {
    img.setAttribute('src', d.avatarUrl);
    img.style.cssText = 'display:block;width:100%;height:100%;object-fit:cover;object-position:center top;';
    fb.style.display  = 'none';
    // fallback if image fails to load
    img.onerror = () => { img.style.display = 'none'; fb.style.display = 'flex'; fb.textContent = initials; };
  } else {
    img.style.display = 'none';
    fb.style.display  = 'flex';
    fb.textContent    = initials;
  }
}

// ══════════════════════════════════════════════════════
//  ABOUT
// ══════════════════════════════════════════════════════
function renderAbout() {
  const d = PORTFOLIO_DATA.about;
  setText('aboutText', d.text);
    d.stats.forEach((s, i) => {
    const c = document.getElementById('stat' + i);
    if (!c) return;
    c.querySelector('.stat-num').textContent   = s.num;
    c.querySelector('.stat-label').textContent = s.label;
  });

  // sembunyikan kotak yang tidak ada datanya; kalau jumlahnya ganjil, kotak terakhir dilebarkan
  const cards = document.querySelectorAll('.about-stats .stat-card');
  cards.forEach((c, i) => {
    c.style.display = i < d.stats.length ? '' : 'none';
    c.style.gridColumn = '';
  });
  if (d.stats.length % 2 === 1) cards[d.stats.length - 1].style.gridColumn = '1 / -1';
}

// ══════════════════════════════════════════════════════
//  SKILLS
// ══════════════════════════════════════════════════════
function renderSkills() {
  const w = document.getElementById('skillsWrapper');
  w.innerHTML = '';
  PORTFOLIO_DATA.skills.forEach(cat => {
    const d = document.createElement('div');
    d.className = 'skill-category fade-in';
    d.innerHTML = `
      <div class="skill-cat-title">${cat.category}</div>
      <div class="skill-tags">${cat.tags.map(t => {
        const ic = skillIcon(t);
        return `<span class="skill-tag${ic ? ' has-ico' : ''}">${ic}${t}</span>`;
      }).join('')}</div>`;
    w.appendChild(d);
  });
  initScrollAnimations();
}

// ══════════════════════════════════════════════════════
//  EXPERIENCE — accordion
// ══════════════════════════════════════════════════════
const JOURNEY_TYPES = [
  { key: 'work',       label: 'Work',       empty: 'Belum ada pengalaman kerja.' },
  { key: 'organisasi', label: 'Organisasi', empty: 'Belum ada pengalaman organisasi.' }
];

function initialsOf(str) {
  const w = (str || '').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(x => x && !/^\d+$/.test(x));
  return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || '?').slice(0, 2)).toUpperCase();
}

// Lingkaran logo (seperti foto profil). fallback = teks/emoji bila logo belum ada
function logoCircle(logo, fallback, size, onclick) {
  const cls = 'logo-circle ' + size + (onclick ? ' editable' : '') + (logo ? '' : ' empty');
  const click = onclick ? ` onclick="${onclick}" title="Klik untuk ganti logo"` : '';
  const inner = logo ? `<img src="${logo}" alt="logo" draggable="false"/>` : `<span>${fallback}</span>`;
  return `<div class="${cls}"${click}>${inner}</div>`;
}

// "- poin" -> bullet list, baris lain -> paragraf
function descHtml(text) {
  const lines = (text || '').split(/\n/).map(l => l.trim()).filter(Boolean);
  let out = '', list = [];
  const flush = () => { if (list.length) { out += '<ul>' + list.map(x => `<li>${esc(x)}</li>`).join('') + '</ul>'; list = []; } };
  lines.forEach(l => { const m = l.match(/^[-•*]\s+(.*)$/); if (m) list.push(m[1]); else { flush(); out += `<p>${esc(l)}</p>`; } });
  flush();
  return out;
}

function journeyBox(e, idx) {
  // Penjelasan & foto tampil di pop up (klik kotak). Di kotak hanya ringkasan.
  const descBlock = `<div class="journey-print">${e.description || ''}</div>`;
  return `
    <div class="journey-box" data-idx="${idx}" role="button" tabindex="0"
         onclick="openDetail(${idx})" onkeydown="if(event.key==='Enter')openDetail(${idx})">
      <div class="journey-box-main">
        ${logoCircle(e.logo, initialsOf(e.company), 'sm')}
        <div class="journey-box-text">
          <div class="exp-role">${e.role}</div>
          <div class="exp-company">${e.company}</div>
          <span class="journey-period">${e.period}</span>
        </div>
        <span class="acc-arrow">›</span>
      </div>
      ${descBlock}
    </div>`;
}

// kategori yang sedang terbuka (tetap terbuka walau di-render ulang)
const _openCats = new Set();

function renderExperience() {
  const wrap = document.getElementById('experienceTimeline');
  wrap.innerHTML = '';

  JOURNEY_TYPES.forEach(t => {
    const items = PORTFOLIO_DATA.experience
      .map((e, i) => ({ e, i }))
      .filter(x => (x.e.type || 'organisasi') === t.key);
    const open = true;   // Work & Organisasi selalu terbuka (kiri-kanan)

    const card = document.createElement('div');
    card.className = 'journey-cat fade-in' + (open ? ' open' : '') + (items.length === 0 ? ' is-empty' : '');
    card.dataset.type = t.key;
    card.innerHTML = `
      <div class="journey-cat-head">
        <span class="skill-cat-title journey-cat-title">${t.label}<span class="journey-count">${items.length}</span></span>
      </div>
      <div class="journey-body">
        <div class="journey-inner">
          <div class="journey-items" data-type="${t.key}">
            ${items.map(x => journeyBox(x.e, x.i)).join('')}
            ${items.length === 0 && !isOwner ? `<p class="journey-empty">${t.empty}</p>` : ''}
            ${isOwner ? `<button class="journey-add" onclick="addExpOfType('${t.key}')">+ Add ${t.label}</button>` : ''}
          </div>
        </div>
      </div>`;
    wrap.appendChild(card);
  });

  if (isOwner) initExpDragDrop();
  initScrollAnimations();
}

function toggleJourneyCat(key) {
  const card = document.querySelector(`.journey-cat[data-type="${key}"]`);
  if (!card) return;
  const open = !card.classList.contains('open');
  card.classList.toggle('open', open);
  card.querySelector('.journey-cat-head').setAttribute('aria-expanded', open);
  open ? _openCats.add(key) : _openCats.delete(key);
}

// ── Detail modal (muncul saat kotak event diklik) ──
let _detailIdx = null;

function openDetail(idx) {
  _detailIdx = idx;
  renderDetail();
  showModal('detailModal');
}
function closeDetail() {
  _detailIdx = null;
  closeModal('detailModal');
}
function renderDetail() {
  if (_detailIdx === null) return;
  const idx = _detailIdx;
  const e = PORTFOLIO_DATA.experience[idx];
  if (!e) { closeDetail(); return; }

  const typeLabel = (JOURNEY_TYPES.find(t => t.key === (e.type || 'organisasi')) || JOURNEY_TYPES[0]).label;
  const hasMedia = e.media && e.media.length > 0;
  const mediaGrid = hasMedia
    ? `<div class="acc-media-grid">${e.media.map((m, mi) => buildMediaThumb(m, 'exp', idx, mi)).join('')}</div>` : '';

  const ownerTools = isOwner ? `
    <div class="detail-owner">
      <button class="media-add-btn" onclick="openMediaUpload('exp',${idx})">+ Add Photo / Video</button>
      <button class="media-add-btn" onclick="pickLogo('exp',${idx})">📷 ${e.logo ? 'Change' : 'Add'} Logo</button>
      ${e.logo ? `<button class="media-add-btn" onclick="removeLogo('exp',${idx})">Remove Logo</button>` : ''}
    </div>` : '';

  document.getElementById('detailBody').innerHTML = `
    <button class="detail-close" onclick="closeDetail()" aria-label="Close">✕</button>
    <div class="detail-head">
      ${logoCircle(e.logo, initialsOf(e.company), 'lg', isOwner ? `pickLogo('exp',${idx})` : '')}
      <div>
        <span class="detail-type">${typeLabel}</span>
        <div class="detail-title">${e.role}</div>
        <div class="exp-company">${e.company}</div>
        <span class="exp-period">${e.period}</span>
      </div>
    </div>
    <div class="exp-desc exp-desc-rich">${descHtml(e.description)}</div>
    ${mediaGrid}
    ${ownerTools}`;
}

// ── Upload logo (otomatis dimuat ke kotak 256px supaya ringan) ──
function pickLogo(section, idx) {
  if (!isOwner) return;
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'image/*';
  inp.onchange = () => {
    const f = inp.files[0];
    if (!f) return;
    resizeToSquare(f, 256, dataUrl => setLogo(section, idx, dataUrl));
  };
  inp.click();
}
function resizeToSquare(file, size, cb) {
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, size, size);
      const r = Math.min(size / img.width, size / img.height);   // muat utuh, tidak terpotong
      const w = img.width * r, h = img.height * r;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      cb(c.toDataURL('image/png'));
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}
function logoTarget(section) {
  if (section === 'exp')  return PORTFOLIO_DATA.experience;
  if (section === 'proj') return PORTFOLIO_DATA.projects;
  return PORTFOLIO_DATA.education;
}
function setLogo(section, idx, dataUrl) {
  logoTarget(section)[idx].logo = dataUrl;
  refreshSection(section);
}
function removeLogo(section, idx) {
  logoTarget(section)[idx].logo = '';
  refreshSection(section);
}
function refreshSection(section) {
  if (section === 'exp')       { renderExperience(); renderDetail(); }
  else if (section === 'proj') renderProjects();
  else                         renderEducation();
}
function refreshOwnerViews() {
  renderExperience();
  renderProjects();
  renderEducation();
  renderDetail();
}


// ══════════════════════════════════════════════════════
//  PROJECTS — accordion card (click to expand)
// ══════════════════════════════════════════════════════
function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';

  PORTFOLIO_DATA.projects.forEach((proj, idx) => {
    const hasMedia = proj.media && proj.media.length > 0;
    const first = hasMedia ? proj.media[0] : null;
    const card = document.createElement('div');
    card.className = 'project-card accordion-item fade-in' + (hasMedia ? ' proj-has-photo' : '');
    card.dataset.idx = idx;

    // thumbnail: foto/video pertama (lebar penuh) atau logo/emoji
    let thumb = '';
    if (hasMedia) {
      const linkAttr = first.link
        ? ` has-link" onclick="openMediaLink('proj',${idx},0);event.stopPropagation()" title="Buka project`
        : '';
      thumb = first.type === 'video'
        ? `<div class="project-thumb${linkAttr}">
             <video class="proj-photo" src="${first.src}" muted playsinline
               onmouseenter="this.play()" onmouseleave="this.pause();this.currentTime=0"></video>
             <div class="media-play-icon">▶</div>
           </div>`
        : `<div class="project-thumb${linkAttr}">
             <img class="proj-photo" src="${first.src}" alt="${proj.title}"/>
           </div>`;
    } else {
      thumb = `<div class="project-thumb proj-emoji">${proj.logo ? logoCircle(proj.logo, '', 'md') : (proj.emoji || '🖥')}</div>`;
    }

    // logo kecil di samping judul (kalau project punya foto, logo tidak menimpa foto)
    const titleLogo = (hasMedia && proj.logo)
      ? `<img class="proj-title-logo" src="${proj.logo}" alt="logo" draggable="false"/>` : '';

    // tombol kecil "Open Project" (pakai link dari foto pertama)
    const openBtn = (first && first.link)
      ? `<a class="open-proj-btn" href="${first.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Open Project</a>` : '';

    // foto tambahan (index 1+) tampil di bagian yang dibuka
    const extraMedia = (proj.media && proj.media.length > 1)
      ? `<div class="acc-media-grid">${proj.media.slice(1).map((m, mi) => buildMediaThumb(m, 'proj', idx, mi + 1)).join('')}</div>`
      : '';

    const ownerBtn = isOwner
      ? `<button class="media-add-btn" onclick="openMediaUpload('proj',${idx});event.stopPropagation()">+ Add Photo / Video</button>
         ${hasMedia ? `<button class="media-add-btn" onclick="setMediaLink('proj',${idx},0,event)">🔗 ${first.link ? 'Change' : 'Add'} Link</button>` : ''}
         <button class="media-add-btn" onclick="pickLogo('proj',${idx});event.stopPropagation()">📷 ${proj.logo ? 'Change' : 'Add'} Logo</button>
         ${proj.logo ? `<button class="media-add-btn" onclick="removeLogo('proj',${idx});event.stopPropagation()">Remove Logo</button>` : ''}`
      : '';

    const links = (proj.liveUrl && proj.liveUrl !== '#') || (proj.caseStudyUrl && proj.caseStudyUrl !== '#')
      ? `<div class="project-links">
          ${proj.liveUrl && proj.liveUrl !== '#' ? `<a href="${proj.liveUrl}" target="_blank" class="project-link" onclick="event.stopPropagation()">Live ↗</a>` : ''}
          ${proj.caseStudyUrl && proj.caseStudyUrl !== '#' ? `<a href="${proj.caseStudyUrl}" target="_blank" class="project-link" onclick="event.stopPropagation()">Case Study →</a>` : ''}
        </div>` : '';

    card.innerHTML = `
      <div class="acc-header proj-header" onclick="toggleAccordion(this)">
        ${thumb}
        <div class="proj-header-info">
          <div class="project-title proj-title-row">${titleLogo}<span>${proj.title}</span></div>
          <div class="project-tags">${proj.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}</div>
          ${openBtn}
          <span class="acc-arrow proj-arrow">›</span>
        </div>
      </div>
      <div class="acc-body">
        <p class="project-desc">${proj.description}</p>
        ${extraMedia}
        ${links}
        ${ownerBtn}
      </div>`;

    grid.appendChild(card);
  });

  if (isOwner) initProjDragDrop();
  initScrollAnimations();
}

// ══════════════════════════════════════════════════════
//  EDUCATION — accordion
// ══════════════════════════════════════════════════════
function renderEducation() {
  const list = document.getElementById('educationList');
  list.innerHTML = '';

  PORTFOLIO_DATA.education.forEach((edu, idx) => {
    const hasMedia = edu.media && edu.media.length > 0;
    const card = document.createElement('div');
    card.className = 'edu-card accordion-item fade-in';
    card.dataset.idx = idx;

    const mediaGrid = hasMedia
      ? `<div class="acc-media-grid">${edu.media.map((m, mi) => buildMediaThumb(m, 'edu', idx, mi)).join('')}</div>`
      : '';

    const ownerTools = isOwner ? `
      <div class="detail-owner">
        <button class="media-add-btn" onclick="openMediaUpload('edu',${idx});event.stopPropagation()">+ Add Photo / Video</button>
        <button class="media-add-btn" onclick="pickLogo('edu',${idx});event.stopPropagation()">📷 ${edu.logo ? 'Change' : 'Add'} School Logo</button>
        ${edu.logo ? `<button class="media-add-btn" onclick="removeLogo('edu',${idx});event.stopPropagation()">Remove Logo</button>` : ''}
      </div>` : '';

    const logo = logoCircle(edu.logo, edu.icon || '🎓', 'md',
      isOwner ? `pickLogo('edu',${idx});event.stopPropagation()` : '');

    card.innerHTML = `
      <div class="acc-header edu-header" onclick="toggleAccordion(this)">
        ${logo}
        <div class="edu-header-text">
          <div class="edu-degree">${edu.degree}</div>
          <div class="edu-school">${edu.school}</div>
          <span class="edu-year">${edu.year}</span>
        </div>
        <span class="acc-arrow edu-arrow">›</span>
      </div>
      <div class="acc-body">
        ${edu.detail ? `<p class="exp-desc" style="margin-bottom:12px">${edu.detail}</p>` : ''}
        ${mediaGrid}
        ${ownerTools}
        ${!hasMedia && !edu.detail && !isOwner ? '<p class="acc-empty">No additional details yet.</p>' : ''}
      </div>`;

    list.appendChild(card);
  });

  initScrollAnimations();
}

// ══════════════════════════════════════════════════════
//  ACCORDION TOGGLE
// ══════════════════════════════════════════════════════
function toggleAccordion(headerEl) {
  const item  = headerEl.closest('.accordion-item');
  const body  = item.querySelector('.acc-body');
  const arrow = item.querySelector('.acc-arrow');
  const isOpen = item.classList.contains('acc-open');

  // Close all siblings in same container
  const siblings = item.parentElement.querySelectorAll('.accordion-item.acc-open');
  siblings.forEach(s => {
    if (s !== item) {
      s.classList.remove('acc-open');
      const b = s.querySelector('.acc-body');
      const a = s.querySelector('.acc-arrow');
      b.style.maxHeight = '0';
      b.style.opacity   = '0';
      if (a) a.style.transform = 'rotate(0deg)';
    }
  });

  if (isOpen) {
    item.classList.remove('acc-open');
    body.style.maxHeight = '0';
    body.style.opacity   = '0';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  } else {
    item.classList.add('acc-open');
    body.style.maxHeight = body.scrollHeight + 200 + 'px';
    body.style.opacity   = '1';
    if (arrow) arrow.style.transform = 'rotate(90deg)';
  }
}

// ══════════════════════════════════════════════════════
//  MEDIA THUMB BUILDER
// ══════════════════════════════════════════════════════
function buildMediaThumb(m, section, idx, mi) {
  const linkOn = section === 'proj' && m.link;      // link foto hanya untuk Projects
  const rb = isOwner
    ? `<button class="media-remove" onclick="removeMedia('${section}',${idx},${mi},event)" title="Remove">✕</button>
       ${section === 'proj' ? `<button class="media-link-btn" onclick="setMediaLink('${section}',${idx},${mi},event)" title="Atur link foto">🔗</button>` : ''}`
    : '';
  const lb = '';
  const cls = 'media-thumb' + (linkOn ? ' has-link' : '');
  const click = linkOn
    ? `openMediaLink('${section}',${idx},${mi});event.stopPropagation()`
    : `openLightbox('${m.src}','${m.type === 'video' ? 'video' : 'image'}');event.stopPropagation()`;
  if (m.type === 'video') {
    return `<div class="${cls}" onclick="${click}">
      <video src="${m.src}" muted style="width:100%;height:100%;object-fit:cover;display:block;"></video>
      <div class="media-play-icon">▶</div>${lb}${rb}
    </div>`;
  }
  return `<div class="${cls}" onclick="${click}">
    <img src="${m.src}" alt="media" style="width:100%;height:100%;object-fit:cover;display:block;"/>
    ${lb}${rb}
  </div>`;
}

function renderContact() {
  const d = PORTFOLIO_DATA.contact;
  setText('contactIntro', d.intro);
  setText('contactEmail', d.email);
  const cel = document.getElementById('contactEmailLink');
  if (cel) cel.href = 'mailto:' + d.email;
  setText('contactLocation', d.location || '');
  const cl = document.getElementById('contactLinkedin');
  if (cl) cl.href = d.linkedin || '#';
  const ci = document.getElementById('contactInstagram');
  if (ci) ci.href = d.instagram || '#';
  setText('contactInstagramText', '@' + igHandle(d.instagram));
}
function igHandle(u) { return ((u || 'julythadamic').replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop() || '').replace(/^@/, ''); }

// ══════════════════════════════════════════════════════
//  MEDIA UPLOAD MODAL
// ══════════════════════════════════════════════════════
let _mediaTarget = { section: null, idx: null };

function openMediaUpload(section, idx) {
  _mediaTarget = { section, idx };
  let modal = document.getElementById('mediaModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'mediaModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-box" style="max-width:520px">
        <h2>Add Photo / Video</h2>
        <div id="mediaLinkRow">
          <p class="edit-label">Link saat foto diklik (opsional)</p>
          <input type="text" id="mediaLinkInput" placeholder="https://..."/>
        </div>
        <div id="mediaDrop" class="media-dropzone">
          <div class="drop-icon">📁</div>
          <p class="drop-text">Drag & drop photo or video here</p>
          <p class="drop-sub">or click to browse</p>
          <input type="file" id="mediaFileInput" accept="image/*,video/*" multiple style="display:none"/>
        </div>
        <div id="mediaPreviewList" class="media-preview-list"></div>
        <p class="edit-label" style="margin-top:14px">— or paste URL —</p>
        <input type="text" id="mediaUrlInput" placeholder="https://..."/>
        <select id="mediaUrlType" style="width:100%;margin-bottom:10px;padding:9px;border:1.5px solid var(--c3);border-radius:8px;font-family:var(--font-body);font-size:0.85rem;color:var(--c0);">
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <div class="modal-actions">
          <button onclick="confirmMediaUrl()">Add URL</button>
          <button onclick="closeModal('mediaModal')" class="btn-cancel">Close</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const drop = modal.querySelector('#mediaDrop');
    const inp  = modal.querySelector('#mediaFileInput');
    drop.addEventListener('click',     ()  => inp.click());
    drop.addEventListener('dragover',  e   => { e.preventDefault(); drop.classList.add('drag-over'); });
    drop.addEventListener('dragleave', ()  => drop.classList.remove('drag-over'));
    drop.addEventListener('drop',      e   => { e.preventDefault(); drop.classList.remove('drag-over'); handleMediaFiles(e.dataTransfer.files); });
    inp.addEventListener('change',     ()  => handleMediaFiles(inp.files));
  }
  document.getElementById('mediaPreviewList').innerHTML = '';
  document.getElementById('mediaUrlInput').value = '';
  document.getElementById('mediaUrlInput').value = '';
  document.getElementById('mediaLinkInput').value = '';
  document.getElementById('mediaLinkRow').style.display = section === 'proj' ? '' : 'none';
  modal.classList.remove('hidden');
  modal.classList.remove('hidden');
}

// Foto diperkecil hanya jika sisi terpanjangnya > MEDIA_MAX_PX (resolusi tetap tajam),
// lalu disimpan JPEG kualitas tinggi. Foto yang sudah kecil/ringan dipakai apa adanya.
const MEDIA_MAX_PX = 1600;
const MEDIA_JPEG_Q = 0.88;
function prepareImage(file, dataUrl, cb) {
  if (/gif|svg/.test(file.type)) return cb(dataUrl);          // animasi/vektor: jangan diubah
  const img = new Image();
  img.onload = () => {
    const longest = Math.max(img.naturalWidth, img.naturalHeight);
    if (longest <= MEDIA_MAX_PX && file.size <= 700 * 1024) return cb(dataUrl);
    const r = Math.min(1, MEDIA_MAX_PX / longest);
    const w = Math.round(img.naturalWidth * r), h = Math.round(img.naturalHeight * r);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);          // PNG transparan -> latar putih
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    cb(c.toDataURL('image/jpeg', MEDIA_JPEG_Q));
  };
  img.onerror = () => cb(dataUrl);
  img.src = dataUrl;
}

function handleMediaFiles(files) {
  Array.from(files).forEach(file => {
    const isVid = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = e => {
      const done = src => {
        addMediaToTarget({ type: isVid ? 'video' : 'image', src });
        showMediaPreview(src, isVid ? 'video' : 'image');
      };
      if (isVid) done(e.target.result);
      else prepareImage(file, e.target.result, done);
    };
    reader.readAsDataURL(file);
  });
}

function confirmMediaUrl() {
  const src  = document.getElementById('mediaUrlInput').value.trim();
  const type = document.getElementById('mediaUrlType').value;
  if (!src) return;
  addMediaToTarget({ type, src });
  showMediaPreview(src, type);
  document.getElementById('mediaUrlInput').value = '';
}

function addMediaToTarget(obj) {
  const { section, idx } = _mediaTarget;
  const arr = section === 'exp'  ? PORTFOLIO_DATA.experience
            : section === 'proj' ? PORTFOLIO_DATA.projects
            :                      PORTFOLIO_DATA.education;
  if (!arr[idx].media) arr[idx].media = [];
  const li = document.getElementById('mediaLinkInput');
  if (section === 'proj' && li && li.value.trim()) obj.link = normalizeLink(li.value.trim());
  arr[idx].media.push(obj);
  refreshSection(section);
}

function showMediaPreview(src, type) {
  const list = document.getElementById('mediaPreviewList');
  if (!list) return;
  const item = document.createElement('div');
  item.innerHTML = type === 'video'
    ? `<video src="${src}" controls style="max-width:100%;border-radius:8px;margin-top:8px;"></video>`
    : `<img src="${src}" style="max-width:100%;border-radius:8px;margin-top:8px;"/>`;
  list.appendChild(item);
}

function removeMedia(section, idx, mi, e) {
  e.stopPropagation();
  const arr = section === 'exp'  ? PORTFOLIO_DATA.experience
            : section === 'proj' ? PORTFOLIO_DATA.projects
            :                      PORTFOLIO_DATA.education;
  arr[idx].media.splice(mi, 1);
  refreshSection(section);
}

// ══════════════════════════════════════════════════════
//  LIGHTBOX
// ══════════════════════════════════════════════════════
function initLightbox() {
  if (document.getElementById('lightbox')) return;
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.className = 'lightbox hidden';
  lb.innerHTML = `
    <div class="lightbox-bg" onclick="closeLightbox()"></div>
    <div class="lightbox-inner">
      <button class="lightbox-close" onclick="closeLightbox()">✕</button>
      <div id="lightboxContent"></div>
    </div>`;
  document.body.appendChild(lb);
}
function openLightbox(src, type) {
  const lb = document.getElementById('lightbox');
  if (!lb) { initLightbox(); }
  document.getElementById('lightboxContent').innerHTML = type === 'video'
    ? `<video src="${src}" controls autoplay style="max-width:92vw;max-height:82vh;border-radius:12px;"></video>`
    : `<img src="${src}" style="max-width:92vw;max-height:82vh;border-radius:12px;object-fit:contain;display:block;"/>`;
  document.getElementById('lightbox').classList.remove('hidden');
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) { lb.classList.add('hidden'); document.getElementById('lightboxContent').innerHTML = ''; }
}

// ══════════════════════════════════════════════════════
//  DRAG & DROP REORDER
// ══════════════════════════════════════════════════════
function initExpDragDrop() {
  // urutan diubah hanya di dalam kotak yang sama (Organisasi / Work)
  document.querySelectorAll('#experienceTimeline .journey-items').forEach(cont => {
    makeSortable(cont, '.journey-box', order => {
      const arr   = PORTFOLIO_DATA.experience;
      const slots = [...cont.querySelectorAll('.journey-box')].map(el => parseInt(el.dataset.idx)).sort((a, b) => a - b);
      const moved = order.map(i => arr[i]);
      slots.forEach((pos, k) => { arr[pos] = moved[k]; });
      renderExperience();
    });
  });
}
function initProjDragDrop() {
  makeSortable(document.getElementById('projectsGrid'), '.project-card', order => {
    PORTFOLIO_DATA.projects = order.map(i => PORTFOLIO_DATA.projects[i]);
    renderProjects();
  });
}
function makeSortable(container, sel, onReorder) {
  let dragSrc = null;
  container.querySelectorAll(sel).forEach(item => {
    item.setAttribute('draggable', 'true');
    item.addEventListener('dragstart', function(e) {
      dragSrc = this;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => this.classList.add('dragging'), 0);
    });
    item.addEventListener('dragend', function() {
      this.classList.remove('dragging');
      container.querySelectorAll(sel).forEach(i => i.classList.remove('drag-over-item'));
    });
    item.addEventListener('dragover', function(e) {
      e.preventDefault();
      if (this !== dragSrc) {
        container.querySelectorAll(sel).forEach(i => i.classList.remove('drag-over-item'));
        this.classList.add('drag-over-item');
      }
    });
    item.addEventListener('drop', function(e) {
      e.preventDefault();
      if (dragSrc && this !== dragSrc) {
        const all  = [...container.querySelectorAll(sel)];
        const order = all.map(el => parseInt(el.dataset.idx));
        const from  = order.indexOf(parseInt(dragSrc.dataset.idx));
        const to    = order.indexOf(parseInt(this.dataset.idx));
        order.splice(from, 1);
        order.splice(to, 0, parseInt(dragSrc.dataset.idx));
        onReorder(order);
      }
    });
  });
}

// ══════════════════════════════════════════════════════
//  OWNER LOGIN / LOGOUT
// ══════════════════════════════════════════════════════
function openLoginModal() {
  if (isOwner) { logoutOwner(); return; }
  document.getElementById('loginErr').textContent = '';
  document.getElementById('ownerPass').value = '';
  showModal('loginModal');
}
function loginOwner() {
  if (document.getElementById('ownerPass').value === OWNER_PASSWORD) {
    isOwner = true;
    closeModal('loginModal');
    document.getElementById('ownerBar').classList.remove('hidden');
    document.body.classList.add('owner-active');
    refreshOwnerViews();
  } else {
    document.getElementById('loginErr').textContent = 'Incorrect password.';
  }
}
function logoutOwner() {
  isOwner = false;
  document.getElementById('ownerBar').classList.add('hidden');
  document.body.classList.remove('owner-active');
  refreshOwnerViews();
}

// ══════════════════════════════════════════════════════
//  EDIT MODALS
// ══════════════════════════════════════════════════════
function openEditor(section) {
  if (!isOwner) return;
  currentEditSection = section;
  document.getElementById('editModalTitle').textContent = 'Edit — ' + section.charAt(0).toUpperCase() + section.slice(1);
  const body = document.getElementById('editModalBody');
  const map = { hero:buildHeroForm, about:buildAboutForm, skills:buildSkillsForm,
                experience:buildExpForm, projects:buildProjectsForm, education:buildEduForm, contact:buildContactForm };
  body.innerHTML = map[section] ? map[section]() : '';
  showModal('editModal');
}

function buildHeroForm() {
  const d = PORTFOLIO_DATA.hero;
  return `
    <label class="edit-label">Name</label><input type="text" id="ef_name" value="${esc(d.name)}"/>
    <label class="edit-label">Title / Role</label><input type="text" id="ef_title" value="${esc(d.title)}"/>
    <label class="edit-label">Tagline</label><textarea id="ef_tagline">${esc(d.tagline)}</textarea>
    <label class="edit-label">LinkedIn URL</label><input type="text" id="ef_linkedin" value="${esc(d.linkedin)}"/>
    <label class="edit-label">Email</label><input type="text" id="ef_email" value="${esc(d.email)}"/>
    <label class="edit-label">Instagram URL</label><input type="text" id="ef_instagram" value="${esc(d.instagram||'')}"/>
    <label class="edit-label">Location</label><input type="text" id="ef_location" value="${esc(d.location||'')}"/>
    <label class="edit-label">Avatar Image URL</label>
    <input type="text" id="ef_avatar" value="${esc(d.avatarUrl)}" placeholder="https://..."/>`;
}
function buildAboutForm() {
  const d = PORTFOLIO_DATA.about;
  return `<label class="edit-label">About Text</label><textarea id="ef_aboutText">${esc(d.text)}</textarea>
    <hr class="edit-section-divider"/>
    ${d.stats.map((s,i)=>`<div class="edit-item-card">
      <label class="edit-label">Stat #${i+1} Number</label><input type="text" id="ef_stat_num_${i}" value="${esc(s.num)}"/>
      <label class="edit-label">Label</label><input type="text" id="ef_stat_lbl_${i}" value="${esc(s.label)}"/>
    </div>`).join('')}`;
}
function buildSkillsForm() {
  return `<div id="ef_skills_container">${PORTFOLIO_DATA.skills.map((cat,ci)=>`
    <div class="edit-item-card" id="ef_skill_cat_${ci}">
      <button class="remove-btn" onclick="removeSkillCat(${ci})">✕</button>
      <label class="edit-label">Category</label><input type="text" id="ef_skill_catname_${ci}" value="${esc(cat.category)}"/>
      <label class="edit-label">Skills (comma-separated)</label><input type="text" id="ef_skill_tags_${ci}" value="${esc(cat.tags.join(', '))}"/>
    </div>`).join('')}</div>
    <button class="add-item-btn" onclick="addSkillCat()">+ Add Category</button>`;
}
function buildExpForm() {
  const card = (e, i) => `
    <div class="edit-item-card">
      <button class="remove-btn" onclick="removeItem('ef_exp_container',${i},'experience')">✕</button>
      <label class="edit-label">Category</label>
      <select id="ef_exp_type_${i}">
        ${JOURNEY_TYPES.map(t=>`<option value="${t.key}" ${(e.type||'organisasi')===t.key?'selected':''}>${t.label}</option>`).join('')}
      </select>
      <label class="edit-label">Role</label><input type="text" id="ef_exp_role_${i}" value="${esc(e.role)}"/>
      <label class="edit-label">Organization / Company / Event</label><input type="text" id="ef_exp_company_${i}" value="${esc(e.company)}"/>
      <label class="edit-label">Period</label><input type="text" id="ef_exp_period_${i}" value="${esc(e.period)}"/>
      <label class="edit-label">Description</label><textarea id="ef_exp_desc_${i}">${esc(e.description)}</textarea>
    </div>`;
  const group = t => {
    const rows = PORTFOLIO_DATA.experience
      .map((e, i) => ({ e, i }))
      .filter(x => (x.e.type || 'organisasi') === t.key);
    return `
      <div class="exp-form-group" data-type="${t.key}">
        <div class="exp-form-group-title">${t.label} <span>${rows.length}</span></div>
        ${rows.map(x => card(x.e, x.i)).join('')}
        <button class="add-item-btn" onclick="addExpInForm('${t.key}')">+ Add ${t.label}</button>
      </div>`;
  };
  return `<div id="ef_exp_container">${JOURNEY_TYPES.map(group).join('')}</div>
    <p class="edit-label" style="margin-top:12px;text-transform:none;letter-spacing:0">Logo & foto diupload langsung dari kotak event (klik kotaknya saat Owner Mode aktif).</p>`;
}
function buildProjectsForm() {
  return `<div id="ef_proj_container">${PORTFOLIO_DATA.projects.map((p,i)=>`
    <div class="edit-item-card">
      <button class="remove-btn" onclick="removeItem('ef_proj_container',${i},'projects')">✕</button>
      <label class="edit-label">Title</label><input type="text" id="ef_proj_title_${i}" value="${esc(p.title)}"/>
      <label class="edit-label">Description</label><textarea id="ef_proj_desc_${i}">${esc(p.description)}</textarea>
      <label class="edit-label">Tags (comma-separated)</label><input type="text" id="ef_proj_tags_${i}" value="${esc(p.tags.join(', '))}"/>
      <label class="edit-label">Emoji Icon</label><input type="text" id="ef_proj_emoji_${i}" value="${esc(p.emoji||'')}" placeholder="🖥"/>
      <label class="edit-label">Live URL</label><input type="text" id="ef_proj_live_${i}" value="${esc(p.liveUrl||'')}"/>
      <label class="edit-label">Case Study URL</label><input type="text" id="ef_proj_case_${i}" value="${esc(p.caseStudyUrl||'')}"/>
    </div>`).join('')}</div>
    <button class="add-item-btn" onclick="addProject()">+ Add Project</button>`;
}
function buildEduForm() {
  return `<div id="ef_edu_container">${PORTFOLIO_DATA.education.map((e,i)=>`
    <div class="edit-item-card">
      <button class="remove-btn" onclick="removeItem('ef_edu_container',${i},'education')">✕</button>
      <label class="edit-label">Degree / Cert</label><input type="text" id="ef_edu_degree_${i}" value="${esc(e.degree)}"/>
      <label class="edit-label">School</label><input type="text" id="ef_edu_school_${i}" value="${esc(e.school)}"/>
      <label class="edit-label">Year</label><input type="text" id="ef_edu_year_${i}" value="${esc(e.year)}"/>
      <label class="edit-label">Detail (optional)</label><textarea id="ef_edu_detail_${i}">${esc(e.detail||'')}</textarea>
      <label class="edit-label">Fallback Emoji (dipakai bila logo belum ada)</label><input type="text" id="ef_edu_icon_${i}" value="${esc(e.icon||'🎓')}"/>
    </div>`).join('')}</div>
    <button class="add-item-btn" onclick="addEdu()">+ Add Education</button>`;
}
function buildContactForm() {
  const d = PORTFOLIO_DATA.contact;
  return `
    <label class="edit-label">Intro Text</label><textarea id="ef_contact_intro">${esc(d.intro)}</textarea>
    <label class="edit-label">Email</label><input type="text" id="ef_contact_email" value="${esc(d.email)}"/>
    <label class="edit-label">Instagram URL</label><input type="text" id="ef_contact_instagram" value="${esc(d.instagram||'')}"/>
    <label class="edit-label">Location</label><input type="text" id="ef_contact_location" value="${esc(d.location)}"/>
    <label class="edit-label">LinkedIn URL</label><input type="text" id="ef_contact_linkedin" value="${esc(d.linkedin)}"/>`;
}

// ══════════════════════════════════════════════════════
//  SAVE
// ══════════════════════════════════════════════════════
function saveSection() {
  const map = { hero:saveHero, about:saveAbout, skills:saveSkills,
                experience:saveExp, projects:saveProjects, education:saveEdu, contact:saveContact };
  if (map[currentEditSection]) map[currentEditSection]();
  closeModal('editModal');
  renderAll();
  initScrollAnimations();
  setTimeout(downloadPDF, 400);
}
function saveHero() {
  Object.assign(PORTFOLIO_DATA.hero, { name:val('ef_name'), title:val('ef_title'), tagline:val('ef_tagline'),
    linkedin:val('ef_linkedin'), email:val('ef_email'), instagram:val('ef_instagram'),
    location:val('ef_location'), avatarUrl:val('ef_avatar') });
}
function saveAbout() {
  PORTFOLIO_DATA.about.text  = val('ef_aboutText');
  PORTFOLIO_DATA.about.stats = PORTFOLIO_DATA.about.stats.map((s,i) => ({ num:val('ef_stat_num_'+i)||s.num, label:val('ef_stat_lbl_'+i)||s.label }));
}
function saveSkills() {
  PORTFOLIO_DATA.skills = [...document.querySelectorAll('#ef_skills_container .edit-item-card')]
    .map(c => { const ci=(c.id||'').replace('ef_skill_cat_',''); if(!ci) return null;
      return { category:val('ef_skill_catname_'+ci), tags:val('ef_skill_tags_'+ci).split(',').map(s=>s.trim()).filter(Boolean) }; }).filter(Boolean);
}
function saveExp() {
  PORTFOLIO_DATA.experience = [...document.querySelectorAll('#ef_exp_container .edit-item-card')]
    .map((_,i) => { if(!document.getElementById('ef_exp_role_'+i)) return null;
      const old = PORTFOLIO_DATA.experience[i] || {};
      return { type:val('ef_exp_type_'+i)||'organisasi', role:val('ef_exp_role_'+i), company:val('ef_exp_company_'+i),
               period:val('ef_exp_period_'+i), description:val('ef_exp_desc_'+i),
               logo:old.logo||'', media:old.media||[] }; }).filter(Boolean);
}
function saveProjects() {
  PORTFOLIO_DATA.projects = [...document.querySelectorAll('#ef_proj_container .edit-item-card')]
    .map((_,i) => { if(!document.getElementById('ef_proj_title_'+i)) return null;
      return { title:val('ef_proj_title_'+i), description:val('ef_proj_desc_'+i),
               tags:val('ef_proj_tags_'+i).split(',').map(s=>s.trim()).filter(Boolean),
               emoji:val('ef_proj_emoji_'+i), liveUrl:val('ef_proj_live_'+i), caseStudyUrl:val('ef_proj_case_'+i),
               logo:(PORTFOLIO_DATA.projects[i]||{}).logo||'',
               media:(PORTFOLIO_DATA.projects[i]||{}).media||[] }; }).filter(Boolean);}

function saveEdu() {
  PORTFOLIO_DATA.education = [...document.querySelectorAll('#ef_edu_container .edit-item-card')]
    .map((_,i) => { if(!document.getElementById('ef_edu_degree_'+i)) return null;
      return { degree:val('ef_edu_degree_'+i), school:val('ef_edu_school_'+i), year:val('ef_edu_year_'+i),
               detail:val('ef_edu_detail_'+i), icon:val('ef_edu_icon_'+i)||'🎓',
               logo:(PORTFOLIO_DATA.education[i]||{}).logo||'',
               media:(PORTFOLIO_DATA.education[i]||{}).media||[] }; }).filter(Boolean);
}
function saveContact() {
  Object.assign(PORTFOLIO_DATA.contact, { intro:val('ef_contact_intro'), email:val('ef_contact_email'),
    instagram:val('ef_contact_instagram'), location:val('ef_contact_location'), linkedin:val('ef_contact_linkedin') });
}

// Add / Remove helpers
function addSkillCat()  { PORTFOLIO_DATA.skills.push({category:'New',tags:['Skill']}); document.getElementById('editModalBody').innerHTML=buildSkillsForm(); }
function addExpOfType(type) {
  PORTFOLIO_DATA.experience.push({ type, role:'New Role', company:'Organization / Company', period:'2026', description:'...', logo:'', media:[] });
  renderExperience();
  openEditor('experience');
}
function addExpInForm(type) {
  saveExp();   // simpan dulu isian yang sudah diketik supaya tidak hilang
  PORTFOLIO_DATA.experience.push({ type, role:'New Role', company:'Organization / Company', period:'2026', description:'...', logo:'', media:[] });
  document.getElementById('editModalBody').innerHTML = buildExpForm();
  const g = document.querySelector(`.exp-form-group[data-type="${type}"] .edit-item-card:last-of-type`);
  if (g) g.scrollIntoView({ block: 'center', behavior: 'smooth' });
}
function removeSkillCat(i) { PORTFOLIO_DATA.skills.splice(i,1); document.getElementById('editModalBody').innerHTML=buildSkillsForm(); }
function addExp()    { PORTFOLIO_DATA.experience.push({type:'organisasi',role:'New Role',company:'Organization / Company',period:'2026',description:'...',logo:'',media:[]}); document.getElementById('editModalBody').innerHTML=buildExpForm(); }
function addProject(){ PORTFOLIO_DATA.projects.push({title:'New Project',description:'...',tags:['Tag'],emoji:'🖥',liveUrl:'',caseStudyUrl:'',media:[]}); document.getElementById('editModalBody').innerHTML=buildProjectsForm(); }
function addEdu()    { PORTFOLIO_DATA.education.push({degree:'Degree',school:'Institution',year:'2025',icon:'🎓',logo:'',media:[]}); document.getElementById('editModalBody').innerHTML=buildEduForm(); }
function removeItem(cont, idx, sec) {
  if(sec==='experience') PORTFOLIO_DATA.experience.splice(idx,1);
  if(sec==='projects')   PORTFOLIO_DATA.projects.splice(idx,1);
  if(sec==='education')  PORTFOLIO_DATA.education.splice(idx,1);
  const b={experience:buildExpForm,projects:buildProjectsForm,education:buildEduForm};
  document.getElementById('editModalBody').innerHTML=b[sec]();
}

// ══════════════════════════════════════════════════════
//  SAVE — unduh data.js terbaru (isi semua section + foto/logo/media)
//  Cara pakai: klik "Save data.js", lalu TIMPA file data.js lama di folder website.
// ══════════════════════════════════════════════════════
let _unsaved = false;
['setLogo','removeLogo','saveSection','addMediaToTarget','removeMedia','removeItem'].forEach(name => {
  const fn = window[name];
  if (typeof fn !== 'function') return;
  window[name] = function () { _unsaved = true; markSaveBtn(); return fn.apply(this, arguments); };
});
function markSaveBtn() {
  const b = document.getElementById('btnSave');
  if (b) b.classList.toggle('btn-save-dirty', _unsaved);
}
function saveDataFile() {
  const header = '// ══════════════════════════════════════════════════════\n' +
                 '//  PORTFOLIO DATA — disimpan otomatis dari Owner Mode (' + new Date().toLocaleString('id-ID') + ')\n' +
                 '//  Timpa file ini ke folder website untuk menyimpan perubahan.\n' +
                 '// ══════════════════════════════════════════════════════\n\n';
  const body = 'const PORTFOLIO_DATA = ' + JSON.stringify(PORTFOLIO_DATA, null, 2) + ';\n';
  const blob = new Blob([header + body], { type: 'text/javascript;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'data.js';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  _unsaved = false; markSaveBtn();
}
window.addEventListener('beforeunload', e => {
  if (isOwner && _unsaved) { e.preventDefault(); e.returnValue = ''; }
});

// ══════════════════════════════════════════════════════
//  PDF EXPORT
// ══════════════════════════════════════════════════════
function downloadPDF() {
  // Ukuran halaman 16:9 (sama dengan slide PPT) diatur di print.css.
  // Di dialog print pilih "Save as PDF" — margin None, Background graphics ON.
  const bar = document.getElementById('ownerBar');
  const wasOwner = document.body.classList.contains('owner-active');
  bar.style.display = 'none';
  document.body.classList.remove('owner-active');
  document.getElementById('mainNav').classList.remove('menu-open');
  const restore = () => {
    if (isOwner) { bar.style.display = ''; document.body.classList.add('owner-active'); }
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);
  setTimeout(() => window.print(), 100);
}

// ══════════════════════════════════════════════════════
//  SCROLL / NAV
// ══════════════════════════════════════════════════════
function initScrollAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in').forEach(el => { el.classList.remove('visible'); obs.observe(el); });
}
function initNavHighlight() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('nav-active'));
        const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if(a) a.classList.add('nav-active');
      }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll('section[id]').forEach(s => obs.observe(s));
}
function initNavScroll() {
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 80));
}

function initNavMenu() {
  const nav = document.getElementById('mainNav');
  const burger = document.getElementById('navBurger');
  if (!nav || !burger) return;
  const setOpen = (open) => {
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
  };
  burger.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!nav.classList.contains('menu-open')); });
  nav.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 860) setOpen(false); });
}

// ══════════════════════════════════════════════════════
//  UTILS
// ══════════════════════════════════════════════════════
function setText(id, t)    { const el=document.getElementById(id); if(el) el.textContent=t; }
function setAttr(id, a, v) { const el=document.getElementById(id); if(el) el.setAttribute(a,v); }
function val(id)            { const el=document.getElementById(id); return el?el.value.trim():''; }
function esc(s)             { return (s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function showModal(id)      { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id)     { document.getElementById(id)?.classList.add('hidden'); }

document.addEventListener('keydown', e => {
  if(e.key==='Enter'  && !document.getElementById('loginModal').classList.contains('hidden')) loginOwner();
  if(e.key==='Escape') { closeModal('loginModal'); closeModal('editModal'); closeDetail(); closeLightbox(); closeModal('mediaModal'); }
});

// ── Link di foto (Projects) ──
function normalizeLink(u) {
  if (/^(https?:|mailto:|tel:|\.{0,2}\/)/i.test(u)) return u;
  if (/^www\./i.test(u) || /^[\w-]+(\.[\w-]+)*\.[a-z]{2,}(\/|$)/i.test(u)) return 'https://' + u;
  return u;
}
function mediaArr(section) {
  return section === 'exp' ? PORTFOLIO_DATA.experience
       : section === 'proj' ? PORTFOLIO_DATA.projects
       : PORTFOLIO_DATA.education;
}
function openMediaLink(section, idx, mi) {
  const m = (mediaArr(section)[idx].media || [])[mi];
  if (m && m.link) window.open(m.link, '_blank', 'noopener');
}
function setMediaLink(section, idx, mi, e) {
  if (e) e.stopPropagation();
  const m = mediaArr(section)[idx].media[mi];
  const v = prompt('Link yang dibuka saat foto diklik (kosongkan untuk menghapus link):', m.link || 'https://');
  if (v === null) return;
  const t = v.trim();
  if (!t || t === 'https://') delete m.link; else m.link = normalizeLink(t);
  if (typeof _unsaved !== 'undefined') { _unsaved = true; if (typeof markSaveBtn === 'function') markSaveBtn(); }
  refreshSection(section);
  if (section === 'proj') {
    const h = document.querySelector(`.project-card[data-idx="${idx}"] .acc-header`);
    if (h) toggleAccordion(h);
  }
}