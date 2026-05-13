'use strict';

const PASSWORD = 'bmwbps1';

// ── Default tree (Firestore 비어있을 때 자동 생성) ─────────────────────────────
const DEFAULT_TREE = [
  {
    id: 'purchase', name: '매입',
    children: [
      {
        id: 'purchase-cash', name: '현금차 매입',
        children: [
          { id: 'purchase-cash-personal', name: '개인' },
          { id: 'purchase-cash-sole',     name: '개인사업자' },
          { id: 'purchase-cash-corp',     name: '법인' },
        ],
      },
      {
        id: 'purchase-install', name: '현금(할부)차 매입',
        children: [
          { id: 'purchase-install-personal', name: '개인' },
          { id: 'purchase-install-sole',     name: '개인사업자' },
          { id: 'purchase-install-corp',     name: '법인' },
        ],
      },
      {
        id: 'purchase-fin-lease', name: '금융리스차 매입',
        children: [
          { id: 'purchase-fin-lease-personal', name: '개인' },
          { id: 'purchase-fin-lease-sole',     name: '개인사업자' },
          { id: 'purchase-fin-lease-corp',     name: '법인' },
        ],
      },
      {
        id: 'purchase-op-lease', name: '운용리스차 매입',
        children: [
          { id: 'purchase-op-lease-personal', name: '개인' },
          { id: 'purchase-op-lease-sole',     name: '개인사업자' },
          { id: 'purchase-op-lease-corp',     name: '법인' },
        ],
      },
      {
        id: 'purchase-other-lease', name: '타사리스 매입',
        children: [
          { id: 'purchase-other-lease-personal', name: '개인' },
          { id: 'purchase-other-lease-sole',     name: '개인사업자' },
          { id: 'purchase-other-lease-corp',     name: '법인' },
        ],
      },
      { id: 'purchase-demo', name: '데모 매입' },
      { id: 'purchase-rv',   name: 'RV 매입' },
      { id: 'purchase-sf',   name: 'SF비딩' },
    ],
  },
  {
    id: 'delivery', name: '출고',
    children: [
      {
        id: 'delivery-cash', name: '현금 출고',
        children: [
          { id: 'delivery-cash-personal', name: '개인' },
          { id: 'delivery-cash-sole',     name: '개인사업자' },
          { id: 'delivery-cash-corp',     name: '법인' },
        ],
      },
      {
        id: 'delivery-lease', name: '리스 출고',
        children: [
          { id: 'delivery-lease-personal', name: '개인' },
          { id: 'delivery-lease-sole',     name: '개인사업자' },
          { id: 'delivery-lease-corp',     name: '법인' },
        ],
      },
    ],
  },
  {
    id: 'rv-return', name: 'RV 반납',
    children: [
      { id: 'rv-install',  name: 'RV 잔가할부 반납' },
      { id: 'rv-rental',   name: '렌트카 반납' },
      { id: 'rv-op-lease', name: '운용리스 반납' },
    ],
  },
  {
    id: 'tax', name: '세금계산서',
    children: [
      { id: 'tax-fin-lease', name: '금융리스 선납금' },
      { id: 'tax-op-lease',  name: '운용리스 관련' },
      { id: 'tax-purchase',  name: '매입 관련' },
    ],
  },
  {
    id: 'other', name: '기타업무',
    children: [
      { id: 'other-margin',   name: '마진체크' },
      { id: 'other-motorium', name: '모터리움 사용법' },
      { id: 'other-schedule', name: '일/월별 업무' },
    ],
  },
];

// ── Seed content (최초 1회만 삽입) ───────────────────────────────────────────
const SEED_CONTENT = {
  'purchase-cash-personal': {
    blocks: [
      {
        type: 'list',
        title: '📋 필요 서류',
        items: [
          '자동차등록증 (갑부로 대체 가능, 주민번호 뒷자리/상세주소 마킹 필수)',
          '외관체크지(인수증) — 인수증 날짜 = 성능 날짜',
          '성능지 2부 (영업일 기준 7일 / 주행거리변경 50km 재검 / DMS 등록확인)',
          '등록원부 (영업일 기준 3일까지 / 압류·저당·검사날짜 확인)',
          '카히스토리 보험이력 (영업일 기준 7일까지)',
          '본인서명사실확인서 or 인감증명서',
          '양도행위위임장',
          '통장사본 (전차주 명의 / 법인차량 대표자 개인통장 입금 불가)',
          '사실확인서',
          '승계확약서 (매매가격·날짜 기입 X)',
          '정산서',
          '360 서라운드',
        ],
      },
      {
        type: 'warning',
        title: '⚠️ 주의사항',
        content: '11시까지 메일 발송 (신인숙 부장님, 이선재 + 김하연 주임님)\n5년/10만km 매입 시 DMS 서라운드 확인 필수★',
      },
      {
        type: 'list',
        title: '📋 확정서류',
        items: [
          '매입서류, 매입품의서',
          '도이치상품용 등록증',
          '성능지 도장 날인',
          '보험가입증명서 (현금즉매 제외)',
          '제시신고서',
          '관인계약서 (상사보관용)',
        ],
      },
      {
        type: 'text',
        title: '🔄 현금매입 순서',
        content: '1. 매입서류 확인\n2. 결재 승인 완료 확인 후 메일 발송\n3. 보험가입 요청 (즉매 제외)\n4. 이전서류 만들어 여사님께 전달 (전달 전 스캔 필수)\n5. 이전된 등록증 받으면 스캔 후 품의서 저장\n6. 매입품의서 출금 수납, 비용 입력 (대행료, 취득세, 무상옵션)\n7. 매입 확정 서류 업로드\n8. 매입 완료일 설정 (상품용으로 이전된 날)\n9. 매입 확정\n10. DMS 매입등록관리 저장',
      },
      {
        type: 'text',
        title: '🔄 리스매입 순서',
        content: '1. 매입서류 확인\n2. 결재 승인 완료 확인 후 메일 발송\n3. 보험가입증명서 받으면 승계서류 만들어 김진환 차장님께 전달\n4. 출금 확인 후 매입품의서 출금 수납\n5. 매입 확정 서류 업로드\n6. 매입 완료일 설정 (승계완료일 = 차량대금 출금한 날)\n7. 매입 확정',
      },
      {
        type: 'warning',
        title: '⚠️ 매입 후 할 일',
        content: '일일: 데일리 파일 기재 후 서영우 주임에게 발송\n일일: 매입서류 스티커 붙여서 파일철\n월별: 인감 서류 스캔 후 사용인감 증빙 날인서류에 정리\n월별: 사용인감계 관리대장 작성 필수',
      },
    ],
  },
  'other-motorium': {
    blocks: [
      {
        type: 'tip',
        title: '💡 접속 정보',
        content: '아이디: kybps1\n비밀번호: 1234',
      },
      {
        type: 'text',
        title: '🔄 현금매입 등록 순서',
        content: '1. 항목 → 주차위치배정\n2. 차량번호 입력 후 Enter\n3. 딜러이름 변경\n4. 광고등록 체크박스 해제, 제시대기등록 체크\n5. 홈페이지가격 입력 (단위 만원 확인)\n6. 입고',
      },
    ],
  },
  'other-margin': {
    blocks: [
      {
        type: 'text',
        title: '📝 마진체크 방법',
        content: '판매품의서에서 비용관리 클릭\n현금차: 등록비 있음 / 리스차: 등록비 없음',
      },
      {
        type: 'cost',
        title: '💰 광택비',
        content: '양재: 130,000원\n가양: 120,000원\n수원: 150,000원',
      },
      {
        type: 'cost',
        title: '💰 등록비',
        content: '양재: 25,000원\n가양: 20,000원',
      },
    ],
  },
};

// ── State ─────────────────────────────────────────────────────────────────────
let TREE  = [];
let PAGES = {};
let currentId = null;
let editMode  = false;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const sidebarEl = document.getElementById('sidebar');
const toggleBtn = document.getElementById('sidebar-toggle');
const overlayEl = document.getElementById('overlay');
const treeEl    = document.getElementById('tree');
const editBarEl = document.getElementById('edit-bar');
const lockBtn   = document.getElementById('lock-btn');
const blocksEl  = document.getElementById('blocks');
const addBarEl  = document.getElementById('add-block-bar');
const saveBtnEl = document.getElementById('save-btn');
const modalEl   = document.getElementById('modal');
const pwInput   = document.getElementById('pw-input');
const pwConfirm = document.getElementById('pw-confirm');
const pwCancel  = document.getElementById('pw-cancel');
const pwError   = document.getElementById('pw-error');
const searchEl  = document.getElementById('search');

// ── Firestore helpers ─────────────────────────────────────────────────────────
function buildPageMeta(nodes, ancestors) {
  for (const n of nodes) {
    if (n.children) {
      buildPageMeta(n.children, [...ancestors, n.name]);
    } else {
      const stored = PAGES[n.id] || {};
      PAGES[n.id] = {
        blocks: stored.blocks || [],
        title:  n.name,
        path:   [...ancestors, n.name],
      };
    }
  }
}

async function loadData() {
  const catDoc = await db.collection('categories').doc('main').get();

  if (catDoc.exists) {
    TREE = catDoc.data().tree;
  } else {
    TREE = DEFAULT_TREE;
    const batch = db.batch();
    batch.set(db.collection('categories').doc('main'), { tree: DEFAULT_TREE });
    Object.entries(SEED_CONTENT).forEach(([id, data]) => {
      batch.set(db.collection('contents').doc(id), data);
    });
    await batch.commit();
  }

  const snap = await db.collection('contents').get();
  PAGES = {};
  snap.forEach(doc => { PAGES[doc.id] = doc.data(); });

  buildPageMeta(TREE, []);
}

async function savePageToFirestore() {
  await db.collection('contents').doc(currentId).set(PAGES[currentId]);
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, isError) {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = isError ? 'toast toast-error' : 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── Tree builder ──────────────────────────────────────────────────────────────
function buildTree() {
  treeEl.innerHTML = '';
  TREE.forEach(cat => treeEl.appendChild(makeCat(cat)));
}

function makeCat(cat) {
  const div = document.createElement('div');
  div.className = 'tree-cat';

  const hdr = document.createElement('div');
  hdr.className = 'tree-cat-header';
  hdr.innerHTML = `<span>${cat.name}</span><span class="ch">▶</span>`;
  hdr.addEventListener('click', () => div.classList.toggle('open'));

  const kids = document.createElement('div');
  kids.className = 'tree-cat-children';
  cat.children.forEach(c => kids.appendChild(c.children ? makeMid(c) : makeDirectLeaf(c)));

  div.appendChild(hdr);
  div.appendChild(kids);
  return div;
}

function makeMid(mid) {
  const div = document.createElement('div');
  div.className = 'tree-mid';

  const hdr = document.createElement('div');
  hdr.className = 'tree-mid-header';
  hdr.innerHTML = `<span>${mid.name}</span><span class="ch">▶</span>`;
  hdr.addEventListener('click', () => div.classList.toggle('open'));

  const kids = document.createElement('div');
  kids.className = 'tree-mid-children';
  mid.children.forEach(c => kids.appendChild(makeLeaf(c)));

  div.appendChild(hdr);
  div.appendChild(kids);
  return div;
}

function makeLeaf(item) {
  const el = document.createElement('div');
  el.className = 'tree-leaf';
  el.dataset.id = item.id;
  el.innerHTML = `<span class="leaf-dot"></span><span>${item.name}</span>`;
  el.addEventListener('click', () => selectPage(item.id));
  return el;
}

function makeDirectLeaf(item) {
  const el = document.createElement('div');
  el.className = 'tree-direct-leaf';
  el.dataset.id = item.id;
  el.innerHTML = `<span class="leaf-dot"></span><span>${item.name}</span>`;
  el.addEventListener('click', () => selectPage(item.id));
  return el;
}

// ── Page selection & rendering ────────────────────────────────────────────────
function selectPage(id) {
  currentId = id;

  document.querySelectorAll('.tree-leaf.active, .tree-direct-leaf.active')
    .forEach(el => el.classList.remove('active'));

  const el = treeEl.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.classList.add('active');
    let p = el.parentElement;
    while (p && p !== treeEl) {
      if (p.classList.contains('tree-mid') || p.classList.contains('tree-cat')) {
        p.classList.add('open');
      }
      p = p.parentElement;
    }
  }

  renderPage(id);
  if (window.innerWidth < 768) closeSidebar();
}

function renderPage(id) {
  const page = PAGES[id];
  if (!page) return;

  document.getElementById('breadcrumb').innerHTML = page.path.map((seg, i) =>
    i < page.path.length - 1
      ? `<span>${seg}</span><span class="bc-sep">›</span>`
      : `<span class="bc-last">${seg}</span>`
  ).join('');

  document.getElementById('page-title').textContent = page.title;

  if (page.blocks.length === 0 && !editMode) {
    blocksEl.innerHTML = '<p class="empty-msg">아직 내용이 없습니다. 수정 모드에서 블록을 추가하세요.</p>';
  } else {
    blocksEl.innerHTML = page.blocks.map((b, i) => renderBlock(b, i)).join('');
  }

  addBarEl.classList.toggle('hidden', !editMode);
  saveBtnEl.classList.toggle('hidden', !editMode);

  showView('content');
}

function renderBlock(block, idx) {
  const actions = editMode
    ? `<div class="block-actions">
         <button class="btn-block-edit" onclick="editBlock(${idx})">편집</button>
         <button class="btn-block-del"  onclick="deleteBlock(${idx})">삭제</button>
       </div>`
    : '';

  const body = block.type === 'list'
    ? `<ul>${(block.items || []).map(i => `<li>${i}</li>`).join('')}</ul>`
    : (block.content || '');

  return `
    <div class="block block-${block.type}">
      <div class="block-head">
        <div class="block-title">${block.title || ''}</div>
        ${actions}
      </div>
      <div class="block-body">${body}</div>
    </div>`;
}

// ── View helpers ──────────────────────────────────────────────────────────────
function showView(name) {
  document.getElementById('view-welcome').classList.toggle('hidden', name !== 'welcome');
  document.getElementById('view-content').classList.toggle('hidden', name !== 'content');
}

// ── Edit mode ─────────────────────────────────────────────────────────────────
function enterEditMode() {
  editMode = true;
  document.body.classList.add('edit-mode');
  editBarEl.classList.remove('hidden');
  lockBtn.textContent = '🔓';
  if (currentId) renderPage(currentId);
}

function exitEditMode() {
  editMode = false;
  document.body.classList.remove('edit-mode');
  editBarEl.classList.add('hidden');
  lockBtn.textContent = '🔒';
  sessionStorage.removeItem('bps_auth');
  if (currentId) renderPage(currentId);
}

// ── Block operations ──────────────────────────────────────────────────────────
function editBlock(idx) {
  if (!currentId || !PAGES[currentId]) return;
  const block = PAGES[currentId].blocks[idx];
  if (block.type === 'list') {
    const raw = prompt('항목 편집 (줄바꿈으로 구분)', (block.items || []).join('\n'));
    if (raw === null) return;
    block.items = raw.split('\n').map(s => s.trim()).filter(Boolean);
  } else {
    const content = prompt('내용 편집', block.content || '');
    if (content === null) return;
    block.content = content;
  }
  renderPage(currentId);
}

async function deleteBlock(idx) {
  if (!currentId || !confirm('이 블록을 삭제하시겠습니까?')) return;
  PAGES[currentId].blocks.splice(idx, 1);
  renderPage(currentId);
  try {
    await savePageToFirestore();
    showToast('삭제되었습니다');
  } catch (e) {
    showToast('저장 실패: ' + e.message, true);
  }
}

function addBlock(type) {
  if (!currentId) return;
  const defaultTitles = {
    text: '📝 내용', list: '📋 목록', warning: '⚠️ 주의사항', tip: '💡 팁', cost: '💰 비용',
  };
  const title = prompt('블록 제목', defaultTitles[type] || '블록');
  if (title === null) return;

  let block;
  if (type === 'list') {
    const raw = prompt('항목 입력 (줄바꿈으로 구분)', '');
    if (raw === null) return;
    block = { type: 'list', title, items: raw.split('\n').map(s => s.trim()).filter(Boolean) };
  } else {
    const content = prompt('내용 입력', '');
    if (content === null) return;
    block = { type, title, content };
  }
  PAGES[currentId].blocks.push(block);
  renderPage(currentId);
}

async function savePage() {
  if (!currentId || !PAGES[currentId]) return;
  saveBtnEl.disabled = true;
  saveBtnEl.textContent = '저장 중...';
  try {
    await savePageToFirestore();
    showToast('저장되었습니다');
  } catch (e) {
    showToast('저장 실패: ' + e.message, true);
  } finally {
    saveBtnEl.disabled = false;
    saveBtnEl.textContent = '저장';
  }
}

// ── Password modal ────────────────────────────────────────────────────────────
function openModal() {
  pwInput.value = '';
  pwError.classList.add('hidden');
  modalEl.classList.remove('hidden');
  setTimeout(() => pwInput.focus(), 60);
}

function closeModal() {
  modalEl.classList.add('hidden');
}

// ── Sidebar (mobile) ──────────────────────────────────────────────────────────
function openSidebar() {
  sidebarEl.classList.add('open');
  overlayEl.classList.remove('hidden');
}

function closeSidebar() {
  sidebarEl.classList.remove('open');
  overlayEl.classList.add('hidden');
}

// ── Search ────────────────────────────────────────────────────────────────────
let searchTimer;

searchEl.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(doSearch, 200);
});

searchEl.addEventListener('keydown', e => {
  if (e.key === 'Escape') { searchEl.value = ''; clearDropdown(); }
});

function doSearch() {
  clearDropdown();
  const q = searchEl.value.trim().toLowerCase();
  if (!q) return;

  const hits = Object.entries(PAGES).filter(([, page]) => {
    const corpus = [
      page.title,
      ...page.path,
      ...(page.blocks || []).flatMap(b => b.type === 'list' ? (b.items || []) : [b.content ?? '']),
    ].join(' ').toLowerCase();
    return corpus.includes(q);
  });

  if (!hits.length) return;

  const dd = document.createElement('div');
  dd.id = 'search-dropdown';

  hits.forEach(([id, page]) => {
    const item = document.createElement('div');
    item.className = 'search-dd-item';
    item.innerHTML = `
      <div class="search-dd-title">${page.title}</div>
      <div class="search-dd-path">${page.path.join(' › ')}</div>`;
    item.addEventListener('click', () => {
      clearDropdown();
      searchEl.value = '';
      selectPage(id);
    });
    dd.appendChild(item);
  });

  document.body.appendChild(dd);
}

function clearDropdown() {
  document.getElementById('search-dropdown')?.remove();
}

document.addEventListener('click', e => {
  if (!e.target.closest('#search') && !e.target.closest('#search-dropdown')) {
    clearDropdown();
  }
});

// ── Event wiring ──────────────────────────────────────────────────────────────
toggleBtn.addEventListener('click', () =>
  sidebarEl.classList.contains('open') ? closeSidebar() : openSidebar()
);

overlayEl.addEventListener('click', closeSidebar);

lockBtn.addEventListener('click', () => {
  if (editMode) {
    exitEditMode();
  } else if (sessionStorage.getItem('bps_auth') === '1') {
    enterEditMode();
  } else {
    openModal();
  }
});

pwConfirm.addEventListener('click', () => {
  if (pwInput.value === PASSWORD) {
    sessionStorage.setItem('bps_auth', '1');
    closeModal();
    enterEditMode();
  } else {
    pwError.classList.remove('hidden');
    pwInput.value = '';
    pwInput.focus();
  }
});

pwCancel.addEventListener('click', closeModal);

pwInput.addEventListener('keydown', e => {
  if (e.key === 'Enter')  pwConfirm.click();
  if (e.key === 'Escape') closeModal();
});

modalEl.addEventListener('click', e => {
  if (e.target === modalEl) closeModal();
});

// ── Boot ──────────────────────────────────────────────────────────────────────
async function initApp() {
  try {
    await loadData();
  } catch (e) {
    console.error('Firestore 로드 실패:', e);
    TREE = DEFAULT_TREE;
    buildPageMeta(TREE, []);
    showToast('데이터 로드에 실패했습니다.', true);
  }

  buildTree();
  showView('welcome');

  if (sessionStorage.getItem('bps_auth') === '1') {
    enterEditMode();
  }
}

initApp();
