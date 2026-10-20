// ══════════════════════════════════════════════════════
//  SKILL ICONS — logo tools (SVG inline, tanpa internet)
//  Tiap ikon = kotak rounded 24x24 berwarna brand + simbol putih.
//  Tambah tool baru: isi SKILL_ICONS['nama tool (huruf kecil)'] = '<svg>…</svg>'
// ══════════════════════════════════════════════════════
const _t = (bg, glyph) => `<svg class="sk-svg" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="${bg}"/>${glyph}</svg>`;
const _txt = (s, fill = '#fff', size = 12, y = 16.4) =>
  `<text x="12" y="${y}" text-anchor="middle" font-family="Poppins,Arial,sans-serif" font-weight="700" font-size="${size}" fill="${fill}">${s}</text>`;
const _grad = (id, a, b, inner) =>
  `<svg class="sk-svg" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#${id})"/>${inner}</svg>`;

const SKILL_ICONS = {
  // Programming
  'java': _t('#EAF1F7',
    '<path d="M8 11.5h8v2.6a4 4 0 0 1-4 4 4 4 0 0 1-4-4z" fill="#5382A1"/><path d="M16 12.4h.9a1.8 1.8 0 0 1 0 3.6h-1.4" fill="none" stroke="#5382A1" stroke-width="1.3" stroke-linecap="round"/><path d="M10.2 4.2c1.6 1.4-1.4 2.2 0 4M13.4 5c1.1 1-1 1.8 0 3" fill="none" stroke="#F89820" stroke-width="1.3" stroke-linecap="round"/><rect x="7.2" y="19" width="9.6" height="1.2" rx=".6" fill="#F89820"/>'),
  '.net c#': _t('#512BD4', _txt('C#', '#fff', 11.5, 15.8)),
  'python': _t('#3776AB',
    '<rect x="5.5" y="4.5" width="9.5" height="9" rx="3.4" fill="#FFD43B"/><rect x="9" y="10.5" width="9.5" height="9" rx="3.4" fill="#fff"/><circle cx="8.6" cy="7.6" r="1" fill="#3776AB"/><circle cx="15.4" cy="16.4" r="1" fill="#3776AB"/>'),
  'html/css': _grad('gHC', '#E34F26', '#1572B6', '<path d="M9.2 8.2 5.6 12l3.6 3.8M14.8 8.2 18.4 12l-3.6 3.8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),

  // Design & Creative
  'figma': _t('#1E1E1E',
    '<path d="M12 3.5H9.4a2.75 2.75 0 0 0 0 5.5H12z" fill="#F24E1E"/><path d="M12 3.5h2.6a2.75 2.75 0 0 1 0 5.5H12z" fill="#FF7262"/><path d="M12 9H9.4a2.75 2.75 0 0 0 0 5.5H12z" fill="#A259FF"/><circle cx="14.6" cy="11.75" r="2.75" fill="#1ABCFE"/><path d="M12 14.5H9.4a2.75 2.75 0 1 0 2.6 2.75z" fill="#0ACF83"/>'),
  'canva': _grad('gCv', '#00C4CC', '#7D2AE8', '<path d="M16 8.6a5 5 0 1 0 0 6.8" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/>'),
  'draw.io': _t('#F08705',
    '<rect x="4.5" y="4.5" width="6" height="5" rx="1" fill="#fff"/><rect x="13.5" y="14.5" width="6" height="5" rx="1" fill="#fff"/><path d="M10.5 7h3.5v8" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><circle cx="7.5" cy="17" r="2.2" fill="none" stroke="#fff" stroke-width="1.5"/>'),
  'capcut': _t('#111',
    '<path d="M16.6 8.2a5.2 5.2 0 1 0 0 7.6" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round"/><path d="M12.2 6.5 8.2 17.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>'),

  // Data & Database
  'tableau': _t('#1F3A5F',
    '<path d="M12 4.5v5M9.5 7h5" stroke="#E8762D" stroke-width="1.7" stroke-linecap="round"/><path d="M12 14.5v5M9.5 17h5" stroke="#5B9BD5" stroke-width="1.7" stroke-linecap="round"/><path d="M5.5 9.5v5M3.5 12h4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" transform="translate(1.5 0)"/><path d="M18.5 9.5v5M16.5 12h4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" transform="translate(-1.5 0)"/><path d="M12 9.8v4.4M9.8 12h4.4" stroke="#E8762D" stroke-width="1.7" stroke-linecap="round"/>'),
  'power bi': _t('#F2C811',
    '<rect x="5.5" y="12.5" width="3.4" height="6" rx="1.2" fill="#8a6d00"/><rect x="10.3" y="8.5" width="3.4" height="10" rx="1.2" fill="#5c4900"/><rect x="15.1" y="4.5" width="3.4" height="14" rx="1.2" fill="#1b1b1b"/>'),
  'r studio': _t('#75AADB', _txt('R', '#fff', 15, 17.4)),
  'oracle database 21c': _t('#C74634', '<rect x="4" y="8.5" width="16" height="7" rx="3.5" fill="none" stroke="#fff" stroke-width="2.2"/>'),
  'oracle virtualbox': _t('#183A61',
    '<path d="M12 4.2 18.8 8v8L12 19.8 5.2 16V8z" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 12 18.8 8M12 12v7.8M12 12 5.2 8" stroke="#69B7FF" stroke-width="1.4" stroke-linejoin="round"/>'),
  'xampp': _t('#FB7A24', _txt('X', '#fff', 14, 17)),

  // Office & Tools
  'microsoft word': _t('#2B579A', '<rect x="9" y="5.5" width="9.5" height="13" rx="1.4" fill="#fff" opacity=".28"/>' + _txt('W', '#fff', 13.5, 17)),
  'powerpoint': _t('#D24726', '<rect x="9" y="5.5" width="9.5" height="13" rx="1.4" fill="#fff" opacity=".28"/>' + _txt('P', '#fff', 13.5, 17)),
  'excel': _t('#217346', '<rect x="9" y="5.5" width="9.5" height="13" rx="1.4" fill="#fff" opacity=".28"/>' + _txt('X', '#fff', 13.5, 17))
};


// ── Logo ASLI (vektor/HD) dari CDN resmi ikon — dicoba berurutan.
//    Kalau semua gagal (mis. offline), otomatis pakai ikon gambar di atas.
const _DV = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/';
const _SI = 'https://cdn.simpleicons.org/';
const _I8 = 'https://img.icons8.com/color/96/';
const _WM = 'https://upload.wikimedia.org/wikipedia/commons/';
const SKILL_LOGOS = {
  'java':                [_DV + 'java/java-original.svg', _I8 + 'java-coffee-cup-logo.png'],
  '.net c#':             [_DV + 'csharp/csharp-original.svg', _I8 + 'c-sharp-logo.png'],
  'python':              [_DV + 'python/python-original.svg', _SI + 'python', _I8 + 'python.png'],
  'html/css':            [_DV + 'html5/html5-original.svg'],   // HTML & CSS digabung 1 ikon (dua logo)
  'figma':               [_DV + 'figma/figma-original.svg', _SI + 'figma', _I8 + 'figma.png'],
  'canva':               [_DV + 'canva/canva-original.svg', _SI + 'canva', _I8 + 'canva.png'],
  'draw.io':             [_SI + 'diagramsdotnet', _I8 + 'diagrams-net.png'],
  'capcut':              [_SI + 'capcut', _I8 + 'capcut.png'],
  'tableau':             [_DV + 'tableau/tableau-original.svg', _SI + 'tableau', _I8 + 'tableau-software.png'],
  'power bi':            [_I8 + 'power-bi-2021.png', _SI + 'powerbi', _DV + 'powerbi/powerbi-original.svg'],
  'r studio':            [_DV + 'rstudio/rstudio-original.svg', _SI + 'rstudioide', _I8 + 'r-studio.png'],
  'oracle database 21c': [_DV + 'oracle/oracle-original.svg', _SI + 'oracle', _I8 + 'oracle-logo.png'],
  'oracle virtualbox':   [_SI + 'virtualbox', _I8 + 'virtualbox.png'],
  'xampp':               [_DV + 'xampp/xampp-original.svg', _SI + 'xampp', _I8 + 'xampp.png'],
  'microsoft word':      [_I8 + 'microsoft-word-2019--v2.png', _I8 + 'microsoft-word-2019.png', _WM + 'f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg'],
  'powerpoint':          [_I8 + 'microsoft-powerpoint-2019--v2.png', _I8 + 'microsoft-powerpoint-2019.png', _WM + '0/0d/Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg'],
  'excel':               [_I8 + 'microsoft-excel-2019--v1.png', _I8 + 'microsoft-excel-2019.png', _WM + '3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg']
};

function skillIcon(name) {
  const key = (name || '').trim().toLowerCase();
  const fb = SKILL_ICONS[key] || '';
  const urls = SKILL_LOGOS[key];
  if (!urls || !urls.length) return fb;
  if (key === 'html/css') {      // dua logo kecil bersebelahan
    return `<span class="sk-duo"><img class="sk-img" src="${_DV}html5/html5-original.svg" alt="" loading="lazy" onerror="skillImgErr(this)" data-key="${key}" data-n="1"/><img class="sk-img" src="${_DV}css3/css3-original.svg" alt="" loading="lazy" onerror="skillImgErr(this)" data-key="${key}" data-n="1"/></span>`;
  }
  return `<img class="sk-img" src="${urls[0]}" alt="" loading="lazy" decoding="async" data-key="${key}" data-n="1" onerror="skillImgErr(this)"/>`;
}

function skillImgErr(img) {
  const key = img.dataset.key, n = +img.dataset.n || 1;
  const urls = SKILL_LOGOS[key] || [];
  if (key !== 'html/css' && n < urls.length) { img.dataset.n = n + 1; img.src = urls[n]; return; }
  const holder = img.closest('.sk-duo') || img;
  const wrap = document.createElement('span');
  wrap.innerHTML = SKILL_ICONS[key] || '';
  holder.replaceWith(...wrap.childNodes);
}
