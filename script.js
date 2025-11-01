// SocialCode — front-end logic (no server)
const titleEl = document.getElementById('title');
const pitchEl = document.getElementById('pitch');
const descEl = document.getElementById('desc');
const templateEl = document.getElementById('template');
const generateBtn = document.getElementById('generate');
const preview = document.getElementById('preview');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const savedList = document.getElementById('savedList');

let currentHTML = '';
let savedPages = JSON.parse(localStorage.getItem('socialcode_saved')||'[]');

function renderSaved(){
  savedList.innerHTML = '';
  savedPages.forEach((p, i) => {
    const div = document.createElement('div'); div.className='savedItem';
    div.innerHTML = `<div><strong>${escapeHtml(p.title)}</strong><div class="small" style="color:#9fb4c9">${escapeHtml(p.pitch)}</div></div>
      <div style="display:flex;gap:8px"><button data-i="${i}" class="btn view">View</button><button data-i="${i}" class="btn">Delete</button></div>`;
    savedList.appendChild(div);
  });
  savedList.querySelectorAll('.view').forEach(b=>b.addEventListener('click', e=>{
    const i = +e.target.dataset.i; preview.innerHTML = '<iframe style="width:100%;height:100%;border:0" srcdoc="'+escapeAttr(savedPages[i].html)+'"></iframe>'; 
  }));
  savedList.querySelectorAll('.btn:not(.view)').forEach(b=>b.addEventListener('click', e=>{
    const i = +e.target.dataset.i; savedPages.splice(i,1); localStorage.setItem('socialcode_saved', JSON.stringify(savedPages)); renderSaved();
  }));
}
renderSaved();

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }
function escapeAttr(s){ return escapeHtml(s).replace(/\n/g,'\\n').replace(/"/g,'&quot;'); }

generateBtn.addEventListener('click', ()=>{
  const title = titleEl.value.trim() || 'Untitled Idea';
  const pitch = pitchEl.value.trim() || '';
  const desc = descEl.value.trim() || '';
  const tpl = templateEl.value;

  // choose template
  const template = document.getElementById('landingTemplate' + (tpl==='simple'?'Simple': tpl==='bold'?'Bold':'Split'));
  const clone = template.content.cloneNode(true);
  clone.querySelectorAll('#L_TITLE').forEach(n=>n.textContent = title);
  clone.querySelectorAll('#L_PITCH').forEach(n=>n.textContent = pitch);
  clone.querySelectorAll('#L_DESC').forEach(n=>n.textContent = desc);

  // build standalone html
  const standalone = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title>
<style>body{font-family:Inter,system-ui;margin:0;padding:20px;background:#071026;color:#e6eef6}a{color:#6ec1ff}</style>
</head><body>${clone.children ? clone.children[0]?.outerHTML || new XMLSerializer().serializeToString(clone) : new XMLSerializer().serializeToString(clone)}</body></html>`;

  currentHTML = standalone;
  preview.innerHTML = '<iframe style="width:100%;height:100%;border:0" srcdoc="'+escapeAttr(standalone)+'"></iframe>';
  downloadBtn.disabled = false; copyBtn.disabled = false;

  // save to local storage listing
  savedPages.unshift({title,pitch,desc,html:standalone,ts:Date.now()});
  if(savedPages.length>20) savedPages.pop();
  localStorage.setItem('socialcode_saved', JSON.stringify(savedPages));
  renderSaved();
});

// download
downloadBtn.addEventListener('click', ()=>{
  if(!currentHTML) return;
  const blob = new Blob([currentHTML], {type:'text/html'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (titleEl.value.trim()||'landing') + '.html'; a.click(); URL.revokeObjectURL(a.href);
});

// copy
copyBtn.addEventListener('click', ()=>{
  if(!currentHTML) return;
  navigator.clipboard.writeText(currentHTML).then(()=>alert('HTML copied to clipboard'));
});

// export all
document.getElementById('exportAll').addEventListener('click', ()=>{
  const data = JSON.stringify(savedPages, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'socialcode_pages.json'; a.click(); URL.revokeObjectURL(a.href);
});

// quick help
document.getElementById('publishHelp').addEventListener('click', ()=>{
  alert('Quick publish: create a GitHub repo named your-idea and add the downloaded HTML as index.html, then enable GitHub Pages (branch main / root).');
});
