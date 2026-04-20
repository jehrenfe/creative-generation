function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: text };
  const data = {};
  match[1].split('\n').forEach(line => {
    const colon = line.indexOf(':');
    if (colon === -1) return;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    data[key] = val;
  });
  return { data, body: match[2].trim() };
}

function mdToHtml(md) {
  if (!md) return '';
  return md.split(/\n{2,}/).map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('# '))   return `<h2>${block.slice(2)}</h2>`;
    if (block.startsWith('## '))  return `<h3>${block.slice(3)}</h3>`;
    block = block.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/\n/g,'<br>');
    return `<p>${block}</p>`;
  }).join('');
}

function buildArtCard(data) {
  const img = data.image || '';
  const t = (data.title||'Untitled').replace(/'/g,"\\'");
  const a = (data.author||'').replace(/'/g,"\\'");
  return `<div class="art-card" onclick="openLightbox('${img}','${t}','${a}')">
    <div class="art-thumb" style="background-image:url('${img}')"></div>
    <div class="art-info">
      <div class="card-name">${data.title||'Untitled'}</div>
      ${data.description?`<div class="card-desc">${data.description}</div>`:''}
      ${data.author?`<div class="card-author">by ${data.author}</div>`:''}
    </div>
    <span class="card-tag tag-art">Art</span>
  </div>`;
}

function buildArticleCard(data, filename) {
  const thumb = data.image||'';
  const thumbHTML = thumb ? `<div class="card-thumb" style="background-image:url('${thumb}')"></div>` : `<div class="card-thumb card-thumb-placeholder"></div>`;
  return `<a href="reader.html?src=articles/${filename}" class="card card-article" style="text-decoration:none;display:block;">
    ${thumbHTML}
    <div class="card-name">${data.title||'Untitled'}</div>
    ${data.description?`<div class="card-desc">${data.description}</div>`:''}
    ${data.author?`<div class="card-author">by ${data.author}</div>`:''}
    <span class="card-tag tag-article">Article</span>
  </a>`;
}

function buildBookCard(data) {
  const thumb = data.image||'';
  const thumbHTML = thumb ? `<div class="card-thumb" style="background-image:url('${thumb}')"></div>` : `<div class="card-thumb card-thumb-placeholder"></div>`;
  const href = data.file||'#';
  const target = data.file ? 'target="_blank" rel="noopener"' : '';
  return `<a href="${href}" ${target} class="card card-ebook" style="text-decoration:none;display:block;">
    ${thumbHTML}
    <div class="card-name">${data.title||'Untitled'}</div>
    ${data.description?`<div class="card-desc">${data.description}</div>`:''}
    ${data.author?`<div class="card-author">by ${data.author}</div>`:''}
    <span class="card-tag tag-ebook">Book</span>
  </a>`;
}

function openLightbox(src, title, author) {
  let lb = document.getElementById('cg-lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'cg-lightbox';
    lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:24px;cursor:pointer;';
    lb.onclick = () => lb.remove();
    document.body.appendChild(lb);
  }
  lb.innerHTML = `<img src="${src}" style="max-width:90vw;max-height:75vh;border-radius:12px;object-fit:contain;"/>
    <div style="margin-top:16px;text-align:center;">
      <p style="color:white;font-size:18px;font-weight:600;margin-bottom:4px;">${title}</p>
      ${author?`<p style="color:rgba(255,255,255,0.6);font-size:14px;">by ${author}</p>`:''}
      <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:12px;">Click anywhere to close</p>
    </div>`;
}
window.openLightbox = openLightbox;

function emptyState(msg) {
  return `<div style="text-align:center;padding:60px 20px;">
    <p style="font-size:15px;font-weight:600;color:var(--dark);margin-bottom:8px;">Nothing here yet!</p>
    <p style="font-size:14px;color:var(--mid);max-width:340px;margin:0 auto;">${msg}</p>
  </div>`;
}

async function loadContent({ containerId, type, limit=null }) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<div class="drive-loading">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style="display:block;margin:0 auto 12px">
      <circle cx="20" cy="20" r="16" stroke="#FF9A5C" stroke-width="3" stroke-dasharray="80" stroke-dashoffset="60">
        <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="1s" repeatCount="indefinite"/>
      </circle>
    </svg>
    <p style="color:var(--mid);font-size:14px;">Loading...</p>
  </div>`;
  try {
    const res = await fetch(`/content/${type}/index.json`);
    if (!res.ok) throw new Error('none');
    let files = await res.json();
    if (!files.length) { container.innerHTML = emptyState('No works published yet — check back soon!'); return; }
    files = files.sort((a,b) => new Date(b.date)-new Date(a.date));
    if (limit) files = files.slice(0, limit);
    const cards = await Promise.all(files.map(async file => {
      const r = await fetch(`/content/${type}/${file.filename}`);
      if (!r.ok) return '';
      const { data } = parseFrontmatter(await r.text());
      if (type==='art')      return buildArtCard(data);
      if (type==='articles') return buildArticleCard(data, file.filename);
      if (type==='books')    return buildBookCard(data);
      return '';
    }));
    const gridClass = type==='art' ? 'art-grid' : 'cards-grid';
    container.innerHTML = `<div class="${gridClass}">${cards.join('')}</div>`;
  } catch { container.innerHTML = emptyState('No works published yet — check back soon!'); }
}

async function loadArticle({ containerId, src }) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<div class="drive-loading"><p style="color:var(--mid);">Loading...</p></div>`;
  try {
    const res = await fetch(`/content/${src}`);
    if (!res.ok) throw new Error('not found');
    const { data, body } = parseFrontmatter(await res.text());
    container.innerHTML = `<div class="article-body">${mdToHtml(body)}</div>`;
    const titleEl  = document.getElementById('reader-title');
    const authorEl = document.getElementById('reader-author');
    if (titleEl)  titleEl.textContent = data.title || 'Article';
    if (authorEl && data.author) authorEl.innerHTML = `by <span>${data.author}</span>`;
    document.title = (data.title||'Article') + ' — Creative Generation';
  } catch { container.innerHTML = '<p style="color:var(--mid)">Could not load article.</p>'; }
}

window.loadContent = loadContent;
window.loadArticle = loadArticle;
