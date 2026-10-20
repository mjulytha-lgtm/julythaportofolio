// ══════════════════════════════════════════════════════
//  EXPORT PPT — slide 16:9 (13.33 x 7.5 in), isi diambil langsung dari PORTFOLIO_DATA
//  Butuh pptxgen.bundle.js (sudah ada di folder ini)
// ══════════════════════════════════════════════════════
const PPT = {
  c0: '3C1006', c1: '7E3615', c2: 'AB653D', c3: 'D3BCA5', c4: 'DFD8CD', cream: 'F5F0EA', white: 'FFFFFF',
  title: 'Century Gothic', body: 'Calibri', W: 13.333, H: 7.5
};

// gambar (foto/logo) -> PNG bulat, supaya selalu tampil benar di PowerPoint
function pptCirclePng(src, size = 600) {
  return new Promise(resolve => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas'); c.width = c.height = size;
        const ctx = c.getContext('2d');
        ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
        const s = Math.max(size / img.width, size / img.height);
        const w = img.width * s, h = img.height * s;
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, (size - w) / 2, 0, w, h);          // rata atas (wajah tidak terpotong)
        resolve(c.toDataURL('image/png'));
      } catch (e) { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function pptStripEmoji(t) { return (t || '').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\uFE0F]/gu, '').trim(); }

function pptHeader(slide, label, title, dark) {
  slide.addText(label.toUpperCase(), { x: 0.7, y: 0.45, w: 8, h: 0.3, fontFace: PPT.title, fontSize: 11, bold: true, charSpacing: 4, color: PPT.c2, margin: 0 });
  slide.addText(title, { x: 0.7, y: 0.75, w: 11, h: 0.7, fontFace: PPT.title, fontSize: 32, bold: true, color: dark ? PPT.c4 : PPT.c0, margin: 0 });
  slide.addShape('rect', { x: 0.7, y: 1.5, w: 1.2, h: 0.05, fill: { color: PPT.c2 }, line: { color: PPT.c2, width: 0 } });
}

function pptCard(slide, x, y, w, h) {
  slide.addShape('roundRect', { x, y, w, h, rectRadius: 0.12, fill: { color: PPT.white }, line: { color: PPT.c3, width: 0.75 },
    shadow: { type: 'outer', color: '3C1006', opacity: 0.12, blur: 8, offset: 2, angle: 90 } });
}

// pill tag; mengembalikan posisi berikutnya (wrap otomatis)
function pptTags(slide, tags, x, y, maxW, fs = 10) {
  let cx = x, cy = y; const h = 0.3;
  tags.forEach(t => {
    const w = Math.min(maxW, t.length * fs * 0.0085 + 0.32);
    if (cx + w > x + maxW) { cx = x; cy += h + 0.1; }
    slide.addText(t, { x: cx, y: cy, w, h, shape: 'roundRect', rectRadius: 0.15, align: 'center', valign: 'middle',
      fontFace: PPT.body, fontSize: fs, color: PPT.c1, fill: { color: PPT.c4 }, line: { color: PPT.c3, width: 0.5 }, margin: 0 });
    cx += w + 0.1;
  });
  return cy + h;
}

async function exportPPT() {
  if (typeof PptxGenJS === 'undefined') { alert('Library PPT (pptxgen.bundle.js) belum termuat. Pastikan file itu ada satu folder dengan index.html.'); return; }
  const D = PORTFOLIO_DATA, h = D.hero, pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = h.name + ' — Portfolio'; pptx.author = h.name;

  const btn = document.querySelector('.btn-panel.btn-pdf[onclick="exportPPT()"]');
  const oldLabel = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.textContent = 'Membuat PPT…'; }

  try {
    const avatar = await pptCirclePng(h.avatarUrl, 700);

    // ── 1. HERO ──
    let s = pptx.addSlide(); s.background = { color: PPT.c0 };
    s.addShape('ellipse', { x: 8.2, y: -2.2, w: 7, h: 7, fill: { color: PPT.c1, transparency: 70 }, line: { color: PPT.c1, width: 0, transparency: 100 } });
    s.addShape('ellipse', { x: -1.5, y: 5.2, w: 4, h: 4, fill: { color: PPT.c2, transparency: 82 }, line: { color: PPT.c2, width: 0, transparency: 100 } });
    s.addText('WELCOME TO MY PORTFOLIO', { x: 0.8, y: 1.3, w: 3.6, h: 0.36, shape: 'roundRect', rectRadius: 0.18, align: 'center', valign: 'middle',
      fontFace: PPT.title, fontSize: 9, bold: true, charSpacing: 2, color: PPT.c3, fill: { color: PPT.c1, transparency: 55 }, line: { color: PPT.c2, width: 0.75 }, margin: 0 });
    s.addText(h.name, { x: 0.8, y: 1.85, w: 7.3, h: 1.5, fontFace: PPT.title, fontSize: 40, bold: true, color: PPT.c4, valign: 'top', margin: 0 });
    s.addText(h.title, { x: 0.8, y: 3.4, w: 7.3, h: 0.5, fontFace: PPT.title, fontSize: 13, color: PPT.c2, charSpacing: 1, valign: 'top', margin: 0 });
    s.addText(h.tagline, { x: 0.8, y: 4.0, w: 6.9, h: 1.3, fontFace: PPT.body, fontSize: 13, color: PPT.c3, valign: 'top', lineSpacingMultiple: 1.25, margin: 0 });
    s.addText([h.location, h.email, h.instagram ? '@' + igHandle(h.instagram) : ''].filter(Boolean).join('   ·   '), { x: 0.8, y: 5.75, w: 7.3, h: 0.35, fontFace: PPT.body, fontSize: 11, color: PPT.c3, transparency: 25, margin: 0 });
    if (avatar) {
      s.addShape('ellipse', { x: 8.55, y: 1.45, w: 4.1, h: 4.1, fill: { color: PPT.c0, transparency: 100 }, line: { color: PPT.c2, width: 1, transparency: 50 } });
      s.addImage({ data: avatar, x: 8.85, y: 1.75, w: 3.5, h: 3.5 });
      s.addShape('ellipse', { x: 8.85, y: 1.75, w: 3.5, h: 3.5, fill: { color: PPT.c0, transparency: 100 }, line: { color: PPT.c2, width: 3 } });
    }
    s.addText([{ text: 'UMN', options: { bold: true, fontSize: 13, breakLine: true } }, { text: 'IPK ' + ((D.about.stats[0] || {}).num || ''), options: { fontSize: 9 } }],
      { x: 11.3, y: 4.75, w: 1.3, h: 0.7, shape: 'roundRect', rectRadius: 0.1, align: 'center', valign: 'middle', fontFace: PPT.title, color: PPT.c0, fill: { color: PPT.c2 }, margin: 0 });

    // ── 2. ABOUT ──
    s = pptx.addSlide(); s.background = { color: PPT.c4 };
    pptHeader(s, 'About', 'Who I Am');
    s.addText(D.about.text, { x: 0.7, y: 2.0, w: 6.9, h: 4.6, fontFace: PPT.body, fontSize: 13.5, color: PPT.c1, valign: 'top', lineSpacingMultiple: 1.35, margin: 0 });
    (D.about.stats || []).slice(0, 4).forEach((st, i) => {
      const x = 8.2 + (i % 2) * 2.25, y = 2.2 + Math.floor(i / 2) * 1.95;
      pptCard(s, x, y, 2.05, 1.75);
      s.addText(st.num, { x, y: y + 0.3, w: 2.05, h: 0.7, align: 'center', fontFace: PPT.title, fontSize: 28, bold: true, color: PPT.c0, margin: 0 });
      s.addText(st.label.toUpperCase(), { x, y: y + 1.05, w: 2.05, h: 0.4, align: 'center', fontFace: PPT.title, fontSize: 8, bold: true, charSpacing: 2, color: PPT.c2, margin: 0 });
    });

    // ── 3. EDUCATION (setelah About) ──
    s = pptx.addSlide(); s.background = { color: PPT.cream };
    pptHeader(s, 'Education', 'Academic Background');
    const edu = D.education || [];
    const eduLogos = await Promise.all(edu.map(e => pptCirclePng(e.logo, 200)));
    edu.slice(0, 3).forEach((e, i) => {
      const y = 2.0 + i * 1.65, cw = 11.9;
      pptCard(s, 0.7, y, cw, 1.4);
      if (eduLogos[i]) s.addImage({ data: eduLogos[i], x: 1.0, y: y + 0.3, w: 0.8, h: 0.8 });
      else s.addText(pptStripEmoji(e.icon) || (e.school || '?').slice(0, 1), { x: 1.0, y: y + 0.3, w: 0.8, h: 0.8, shape: 'ellipse', align: 'center', valign: 'middle', fontFace: PPT.title, fontSize: 16, bold: true, color: PPT.c4, fill: { color: PPT.c0 }, line: { color: PPT.c2, width: 1.5 }, margin: 0 });
      s.addText(e.degree, { x: 2.1, y: y + 0.2, w: 10.2, h: 0.4, fontFace: PPT.title, fontSize: 15, bold: true, color: PPT.c0, margin: 0 });
      s.addText(e.school, { x: 2.1, y: y + 0.62, w: 10.2, h: 0.3, fontFace: PPT.body, fontSize: 12, color: PPT.c1, margin: 0 });
      s.addText(e.year, { x: 2.1, y: y + 0.97, w: Math.max(1.6, e.year.length * 0.1 + 0.4), h: 0.28, shape: 'roundRect', rectRadius: 0.14, align: 'center', valign: 'middle', fontFace: PPT.body, fontSize: 9.5, color: PPT.c1, fill: { color: PPT.c4 }, line: { color: PPT.c3, width: 0.5 }, margin: 0 });
    });

    // ── 4. SKILLS ──
    s = pptx.addSlide(); s.background = { color: PPT.cream };
    pptHeader(s, 'Skills', 'What I Know');
    (D.skills || []).slice(0, 6).forEach((cat, i) => {
      const cw = 3.85, ch = 2.15, x = 0.7 + (i % 3) * (cw + 0.28), y = 1.95 + Math.floor(i / 3) * (ch + 0.25);
      pptCard(s, x, y, cw, ch);
      s.addShape('rect', { x: x + 0.25, y: y + 0.33, w: 0.28, h: 0.03, fill: { color: PPT.c2 }, line: { color: PPT.c2, width: 0 } });
      s.addText(cat.category.toUpperCase(), { x: x + 0.62, y: y + 0.2, w: cw - 0.8, h: 0.3, fontFace: PPT.title, fontSize: 9.5, bold: true, charSpacing: 2, color: PPT.c2, margin: 0 });
      pptTags(s, cat.tags, x + 0.25, y + 0.7, cw - 0.5, 10);
    });

    // ── 5. EXPERIENCE (Organisasi + Work, 8 kotak per slide) ──
    const exps = (D.experience || []).map(e => ({ ...e, _t: (e.type || 'organisasi') }));
    const ordered = [...exps.filter(e => e._t === 'work'), ...exps.filter(e => e._t === 'organisasi')];
    const logos = await Promise.all(ordered.map(e => pptCirclePng(e.logo, 200)));
    for (let p = 0; p < Math.max(1, Math.ceil(ordered.length / 8)); p++) {
      s = pptx.addSlide(); s.background = { color: PPT.cream };
      pptHeader(s, 'Experience', 'My Journey' + (ordered.length > 8 ? ` (${p + 1}/${Math.ceil(ordered.length / 8)})` : ''));
      ordered.slice(p * 8, p * 8 + 8).forEach((e, k) => {
        const i = p * 8 + k, cw = 5.95, ch = 1.25, y = 1.75 + Math.floor(k / 2) * (ch + 0.08);
        const xx = 0.7 + (k % 2) * (cw + 0.03);
        pptCard(s, xx, y, cw, ch);
        const ic = (e.company || '?').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(w => w && !/^\d+$/.test(w));
        const initials = (ic.length > 1 ? ic[0][0] + ic[1][0] : (ic[0] || '?').slice(0, 2)).toUpperCase();
        if (logos[i]) s.addImage({ data: logos[i], x: xx + 0.15, y: y + 0.17, w: 0.55, h: 0.55 });
        else s.addText(initials, { x: xx + 0.15, y: y + 0.17, w: 0.55, h: 0.55, shape: 'ellipse', align: 'center', valign: 'middle', fontFace: PPT.title, fontSize: 10, bold: true, color: PPT.c4, fill: { color: PPT.c0 }, line: { color: PPT.c2, width: 1.5 }, margin: 0 });
        s.addText(e.role, { x: xx + 0.85, y: y + 0.09, w: cw - 1.0, h: 0.28, fontFace: PPT.title, fontSize: 11.5, bold: true, color: PPT.c0, margin: 0 });
        s.addText((e.company || '').toUpperCase() + (e._t === 'work' ? '  ·  WORK' : ''), { x: xx + 0.85, y: y + 0.37, w: cw - 1.0, h: 0.2, fontFace: PPT.title, fontSize: 7.5, charSpacing: 1, color: PPT.c2, margin: 0 });
        s.addText(e.period || '', { x: xx + 0.85, y: y + 0.56, w: cw - 1.0, h: 0.2, fontFace: PPT.body, fontSize: 8.5, bold: true, color: PPT.c1, margin: 0 });
        s.addText((e.description || '').replace(/^[-•]\s*/gm, '').replace(/\s*\n+\s*/g, '. ').replace(/\.\.+/g, '.'), { x: xx + 0.15, y: y + 0.76, w: cw - 0.3, h: 0.46, fontFace: PPT.body, fontSize: 8, color: PPT.c1, valign: 'top', fit: 'shrink', margin: 0 });
      });
    }

    // ── 6. PROJECTS (3 per slide) ──
    const projs = D.projects || [];
    for (let p = 0; p < Math.max(1, Math.ceil(projs.length / 3)); p++) {
      s = pptx.addSlide(); s.background = { color: PPT.c4 };
      pptHeader(s, 'Projects', 'Selected Work' + (projs.length > 3 ? ` (${p + 1}/${Math.ceil(projs.length / 3)})` : ''));
      projs.slice(p * 3, p * 3 + 3).forEach((pr, k) => {
        const cw = 3.85, x = 0.7 + k * (cw + 0.28), y = 2.0, ch = 4.6;
        pptCard(s, x, y, cw, ch);
        s.addShape('roundRect', { x: x + 0.05, y: y + 0.05, w: cw - 0.1, h: 1.35, rectRadius: 0.1, fill: { color: PPT.c1 }, line: { color: PPT.c1, width: 0 } });
        s.addText(pr.emoji || '', { x: x + 0.05, y: y + 0.05, w: cw - 0.1, h: 1.35, align: 'center', valign: 'middle', fontSize: 36, margin: 0 });
        s.addText(pr.title, { x: x + 0.25, y: y + 1.55, w: cw - 0.5, h: 0.65, fontFace: PPT.title, fontSize: 14, bold: true, color: PPT.c0, valign: 'top', margin: 0 });
        const endY = pptTags(s, pr.tags || [], x + 0.25, y + 2.3, cw - 0.5, 9);
        s.addText(pr.description || '', { x: x + 0.25, y: endY + 0.15, w: cw - 0.5, h: y + ch - endY - 0.3, fontFace: PPT.body, fontSize: 10.5, color: PPT.c1, valign: 'top', lineSpacingMultiple: 1.2, fit: 'shrink', margin: 0 });
      });
    }

    // ── 7. CONTACT ──
    const ct = D.contact || {};
    s = pptx.addSlide(); s.background = { color: PPT.c0 };
    s.addShape('ellipse', { x: 9, y: 3.5, w: 7, h: 7, fill: { color: PPT.c1, transparency: 75 }, line: { color: PPT.c1, width: 0, transparency: 100 } });
    s.addText("CONTACT", { x: 0.7, y: 0.45, w: 8, h: 0.3, fontFace: PPT.title, fontSize: 11, bold: true, charSpacing: 4, color: PPT.c2, margin: 0 });
    s.addText("Let's Connect", { x: 0.7, y: 0.75, w: 11, h: 0.7, fontFace: PPT.title, fontSize: 32, bold: true, color: PPT.c4, margin: 0 });
    s.addShape('rect', { x: 0.7, y: 1.5, w: 1.2, h: 0.05, fill: { color: PPT.c2 }, line: { color: PPT.c2, width: 0 } });
    s.addText(ct.intro || '', { x: 0.7, y: 1.95, w: 6.2, h: 0.9, fontFace: PPT.body, fontSize: 13, color: PPT.c3, valign: 'top', lineSpacingMultiple: 1.25, margin: 0 });
    [['EMAIL', ct.email], ['LINKEDIN', (ct.linkedin || '').replace(/^https?:\/\/(www\.)?/, '')], ['INSTAGRAM', ct.instagram ? '@' + igHandle(ct.instagram) : ''], ['LOCATION', ct.location]].forEach((r, i) => {
      const y = 3.0 + i * 0.95;
      s.addShape('roundRect', { x: 0.7, y, w: 6.2, h: 0.8, rectRadius: 0.1, fill: { color: PPT.c1, transparency: 70 }, line: { color: PPT.c2, width: 0.5, transparency: 60 } });
      s.addText(r[0], { x: 1.0, y: y + 0.1, w: 5.6, h: 0.22, fontFace: PPT.title, fontSize: 8, bold: true, charSpacing: 2, color: PPT.c2, margin: 0 });
      s.addText(r[1] || '', { x: 1.0, y: y + 0.36, w: 5.6, h: 0.3, fontFace: PPT.body, fontSize: 13, color: PPT.c4, margin: 0,
        hyperlink: r[0] === 'EMAIL' && r[1] ? { url: 'mailto:' + r[1] } : (r[0] === 'LINKEDIN' && ct.linkedin ? { url: ct.linkedin } : (r[0] === 'INSTAGRAM' && ct.instagram ? { url: ct.instagram } : undefined)) });
    });
    s.addShape('rect', { x: 7.6, y: 3.0, w: 0.05, h: 3.65, fill: { color: PPT.c2 }, line: { color: PPT.c2, width: 0 } });
    s.addText('"Combining technical depth with a human touch — that\'s where I thrive."', { x: 7.9, y: 3.2, w: 4.7, h: 2.2, fontFace: PPT.body, italic: true, fontSize: 17, color: PPT.c4, valign: 'top', lineSpacingMultiple: 1.3, margin: 0 });
    s.addText('— ' + h.name.toUpperCase(), { x: 7.9, y: 5.8, w: 4.7, h: 0.3, fontFace: PPT.title, fontSize: 9, charSpacing: 2, color: PPT.c2, margin: 0 });

    await pptx.writeFile({ fileName: 'Portfolio — ' + h.name + '.pptx' });
  } catch (err) {
    console.error(err); alert('Gagal membuat PPT: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = oldLabel; }
  }
}
