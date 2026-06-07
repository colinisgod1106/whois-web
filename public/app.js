// ===== Background Particles =====
(function initParticles() {
  const container = document.getElementById('bgParticles');
  const colors = ['#6366f1', '#22d3ee', '#a78bfa', '#818cf8'];
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 15}s;
      filter: blur(${Math.random() > 0.5 ? '1px' : '0'});
    `;
    container.appendChild(p);
  }
})();

// ===== DOM References =====
const domainInput = document.getElementById('domainInput');
const searchBtn   = document.getElementById('searchBtn');
const resultSection = document.getElementById('resultSection');
const loadingCard = document.getElementById('loadingCard');
const errorCard   = document.getElementById('errorCard');
const resultCard  = document.getElementById('resultCard');
const errorMsg    = document.getElementById('errorMsg');

// ===== Input Handlers =====
domainInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') lookupWhois();
});

domainInput.addEventListener('input', () => {
  const val = domainInput.value.trim();
  searchBtn.disabled = !val;
});

function quickSearch(domain) {
  domainInput.value = domain;
  lookupWhois();
}

// ===== Main Lookup Function =====
async function lookupWhois() {
  const domain = domainInput.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!domain) return;

  domainInput.value = domain;
  showLoading();

  try {
    const res = await fetch(`/api/whois/${encodeURIComponent(domain)}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || '查詢失敗，請稍後再試。');
    }

    showResult(data);
  } catch (err) {
    showError(err.message);
  }
}

// ===== UI State Managers =====
function showLoading() {
  resultSection.style.display = 'block';
  loadingCard.style.display = 'flex';
  errorCard.style.display = 'none';
  resultCard.style.display = 'none';

  const btn = searchBtn;
  btn.classList.add('loading');
  btn.innerHTML = '<span style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spinRing 0.7s linear infinite"></span>';
  btn.disabled = true;
}

function resetBtn() {
  searchBtn.classList.remove('loading');
  searchBtn.innerHTML = '<span class="btn-text">查詢</span><span class="btn-arrow">→</span>';
  searchBtn.disabled = false;
}

function showError(msg) {
  resetBtn();
  resultSection.style.display = 'block';
  loadingCard.style.display = 'none';
  resultCard.style.display = 'none';
  errorCard.style.display = 'block';
  errorMsg.textContent = msg;
}

function showResult(data) {
  resetBtn();
  loadingCard.style.display = 'none';
  errorCard.style.display = 'none';
  resultCard.style.display = 'block';

  // Domain title
  document.getElementById('resultDomain').textContent = data.domain;

  // Build info grid
  buildInfoGrid(data.parsed, data.domain);

  // Raw text
  document.getElementById('rawText').textContent = data.raw || '（無原始資料）';

  // Reset raw section
  document.getElementById('rawContent').style.display = 'none';
  document.getElementById('rawArrow').classList.remove('open');
  document.getElementById('rawToggle').querySelector('span').textContent = '📄 顯示原始 WHOIS 資料';

  // Scroll into view
  setTimeout(() => resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

// ===== Info Grid Builder =====
function buildInfoGrid(parsed, domain) {
  const grid = document.getElementById('infoGrid');
  grid.innerHTML = '';

  const fields = [
    { key: 'domainName',      label: '網域名稱',   type: 'text' },
    { key: 'registrar',       label: '註冊商',     type: 'text' },
    { key: 'registrarUrl',    label: '註冊商網址', type: 'url'  },
    { key: 'createdDate',     label: '建立日期',   type: 'date' },
    { key: 'updatedDate',     label: '更新日期',   type: 'date' },
    { key: 'expiryDate',      label: '到期日期',   type: 'expiry' },
    { key: 'registrantOrg',   label: '註冊組織',   type: 'text' },
    { key: 'registrantCountry', label: '所在國家', type: 'text' },
    { key: 'dnsSec',          label: 'DNSSEC',    type: 'text' },
    { key: 'nameServers',     label: '名稱伺服器', type: 'multi' },
    { key: 'status',          label: '網域狀態',   type: 'multi' },
  ];

  fields.forEach(({ key, label, type }) => {
    const val = parsed[key];
    const item = document.createElement('div');
    item.className = 'info-item';

    let valueHtml = '';

    if (!val || (Array.isArray(val) && val.length === 0)) {
      valueHtml = `<div class="info-value null-value">N/A</div>`;
    } else if (type === 'multi' && Array.isArray(val)) {
      const tags = val.map(v => `<span class="tag">${escHtml(v)}</span>`).join('');
      valueHtml = `<div class="info-value multi-value">${tags}</div>`;
    } else if (type === 'date') {
      valueHtml = `<div class="info-value date">${escHtml(formatDate(val))}</div>`;
    } else if (type === 'expiry') {
      const cls = getExpiryClass(val);
      valueHtml = `<div class="info-value ${cls}">${escHtml(formatDate(val))}</div>`;
    } else if (type === 'url' && val) {
      const href = val.startsWith('http') ? val : 'https://' + val;
      valueHtml = `<div class="info-value"><a href="${escHtml(href)}" target="_blank" style="color:var(--accent-cyan);text-decoration:none;">${escHtml(val)}</a></div>`;
    } else {
      valueHtml = `<div class="info-value">${escHtml(String(val))}</div>`;
    }

    item.innerHTML = `<div class="info-label">${escHtml(label)}</div>${valueHtml}`;
    grid.appendChild(item);
  });
}

// ===== Helpers =====
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }) +
           ' (' + d.toISOString().split('T')[0] + ')';
  } catch { return dateStr; }
}

function getExpiryClass(dateStr) {
  if (!dateStr) return 'null-value';
  try {
    const d = new Date(dateStr);
    if (isNaN(d)) return 'date';
    const now = new Date();
    const diff = d - now;
    if (diff < 0) return 'expiry-past';
    if (diff < 90 * 24 * 60 * 60 * 1000) return 'expiry-soon';
    return 'date';
  } catch { return 'date'; }
}

function toggleRaw() {
  const content = document.getElementById('rawContent');
  const arrow   = document.getElementById('rawArrow');
  const label   = document.getElementById('rawToggle').querySelector('span');
  const open = content.style.display === 'none';
  content.style.display = open ? 'block' : 'none';
  arrow.classList.toggle('open', open);
  label.textContent = open ? '📄 隱藏原始 WHOIS 資料' : '📄 顯示原始 WHOIS 資料';
}

async function copyRaw() {
  const raw = document.getElementById('rawText').textContent;
  try {
    await navigator.clipboard.writeText(raw);
    const btn = document.getElementById('copyRawBtn');
    btn.textContent = '✅ 已複製！';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📋 複製原始資料';
      btn.classList.remove('copied');
    }, 2000);
  } catch { alert('複製失敗，請手動複製。'); }
}
