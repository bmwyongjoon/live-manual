# Live Manual — 가양 BPS 업무 매뉴얼

## 프로젝트 한 줄 요약
BMW 인증중고차(BPS) 가양 전시장 내부용 업무 매뉴얼 웹앱.
누구나 읽을 수 있고, 비밀번호(bmwbps1) 입력 시 수정 가능한
나무위키 스타일의 살아있는 업무 지식 베이스.

## 배포
- GitHub Pages (main 브랜치 root)
- URL: https://bmwyongjoon.github.io/live-manual

## 기술 스택
- HTML / CSS / JavaScript (프레임워크 없음, 바닐라 JS)
- Firebase Firestore (데이터 저장, `firebase.js`에서 `window.db` 전역 노출)
- PWA — `sw.js` (silent update 방식, 캐시명 `bps-manual-vN`)

---

## 파일 구조
```
├── index.html       ← 전체 마크업. 모달 2개 포함 (비밀번호, 타입 선택)
├── style.css        ← 모든 스타일 (CSS 변수 기반, 모바일 반응형)
├── app.js           ← 핵심 로직 전체 (트리, 블록, Firestore, DnD, 수정모드)
├── firebase.js      ← Firebase 초기화. window.db = firebase.firestore()
├── sw.js            ← 서비스워커. 캐시 버전 바꾸면 강제 갱신됨
├── manifest.json    ← PWA 메타
└── icons/
    └── icon.svg
```

> `editor.js`는 **존재하지 않음**. 블록 에디터 로직은 전부 `app.js` 안에 있음.

---

## Firestore 컬렉션 구조

```
categories/main        { tree: [...] }          ← 트리 전체를 JSON 배열로 저장
contents/{pageId}      { blocks: [...] }         ← 각 리프 노드의 블록 배열
```

- **`categories/main.tree`**: 중첩 배열. 폴더형 노드는 `children` 키를 가짐.
- **`contents/{id}`**: 리프 노드 ID = Firestore 문서 ID. `blocks` 배열만 있음.
- 읽기는 `loadData()` 한 번에 전체 로드 (실시간 구독 없음, pull 방식).
- 쓰기는 `saveTree()` 또는 `savePageToFirestore()` 로 즉시 저장.

---

## 트리 노드 구조 (JavaScript 객체)

```js
// 폴더형 노드 (children 키 있음)
{ id: 'purchase', name: '매입', children: [...] }

// 내용형 노드 (children 키 없음 — 리프 = 페이지)
{ id: 'purchase-demo', name: '데모 매입' }
```

### 트리 3계층 모델

```
TREE (배열)
 └─ cat (대분류, 항상 폴더형)
     └─ mid (중분류, 폴더형)   또는   directLeaf (중분류 직속 내용형)
         └─ leaf (최하위 내용형)
```

- `cat.children` 에는 **mid** 또는 **directLeaf** 가 섞일 수 있음.
- `mid.children` 에는 **leaf** 만 들어감 (4계층 미지원).
- 대분류(`cat`)는 타입 변경 불가 (항상 폴더형).
- 중분류 직속 항목(`mid`, `directLeaf`)만 ⇄ 타입 변경 가능.

---

## 전역 State (`app.js` 상단)

```js
let TREE  = [];          // Firestore에서 로드한 트리 배열 (직접 변이 후 saveTree())
let PAGES = {};          // { [pageId]: { blocks, title, path } }
let currentId = null;    // 현재 선택된 리프 노드 ID
let editMode  = false;   // 수정 모드 여부
let sidebarDrag  = null; // { node, parentArr } — 사이드바 DnD 진행 중
let blockDragIdx = null; // 블록 DnD 진행 중인 블록 인덱스
let typePickerResolve = null; // 타입 선택 모달 Promise resolve
```

---

## 주요 함수 목록

### 초기화 / 데이터 로드

| 함수 | 역할 |
|------|------|
| `initApp()` | 앱 진입점. `setupBlockDragListeners()` → `loadData()` → `buildTree()` → 수정모드 복원 |
| `loadData()` | Firestore에서 `categories/main` 과 `contents/*` 전체 로드. TREE·PAGES 세팅 |
| `buildPageMeta(nodes, ancestors)` | TREE를 순회해서 리프 노드마다 `PAGES[id].title`, `.path` 보충 |

### Firestore 저장

| 함수 | 역할 |
|------|------|
| `saveTree()` | `TREE` 전체를 `categories/main`에 덮어씀 |
| `savePageToFirestore()` | `PAGES[currentId]`를 `contents/{currentId}`에 덮어씀 |

### 트리 렌더링

| 함수 | 역할 |
|------|------|
| `buildTree()` | `treeEl.innerHTML = ''` 후 TREE 순회해서 DOM 재생성. 수정모드 시 "대분류 추가" 버튼 추가 |
| `makeCat(cat)` | 대분류 DOM 생성. 수정모드 시 헤더에 드래그 + 편집버튼 부착 |
| `makeMid(mid, parentArr)` | 중분류(폴더형) DOM 생성. parentArr = cat.children |
| `makeLeaf(item, parentArr)` | 최하위 리프 DOM 생성. parentArr = mid.children |
| `makeDirectLeaf(item, parentArr)` | 대분류 직속 리프 DOM 생성. parentArr = cat.children |
| `makeTreeEditBtns({onAdd, onRename, onDelete, onTypeToggle})` | 수정 버튼 묶음(+, ✏, ✕, ⇄) 생성. onTypeToggle 없으면 ⇄ 숨김 |
| `addTreeDrag(el, node, parentArr)` | 사이드바 항목에 HTML5 DnD 이벤트 부착. 같은 parentArr 내에서만 재정렬 허용 |

### 트리 편집

| 함수 | 역할 |
|------|------|
| `treeAddCat()` | 대분류 추가 (항상 폴더형, prompt 사용) |
| `treeAddChild(parentNode, allowFolder)` | 하위 항목 추가. allowFolder=true 면 타입 선택 모달 표시 후 진행 |
| `treeRename(node)` | prompt로 이름 변경 후 saveTree |
| `treeDelete(node)` | 자식 있으면 경고. collectLeafIds로 Firestore 일괄 삭제 |
| `treeToggleType(node, parentArr)` | 폴더↔내용형 전환. 폴더→내용형 시 자식 Firestore 삭제 포함 |
| `collectLeafIds(node)` | 재귀로 리프 id 배열 반환 (삭제 시 사용) |
| `removeFromTree(id, nodes)` | TREE에서 id 탐색 후 splice |
| `newId()` | `'n' + Date.now().toString(36) + random` 형태 고유 ID 생성 |

### 페이지 렌더링

| 함수 | 역할 |
|------|------|
| `selectPage(id)` | currentId 세팅, 트리 active 표시, renderPage 호출, 모바일 사이드바 닫기 |
| `renderPage(id)` | breadcrumb·제목·블록 전체를 innerHTML로 덮어씀 |
| `renderBlock(block, idx)` | 블록 하나의 HTML 문자열 반환. 수정모드 시 dragHandle·contenteditable·삭제버튼 포함 |
| `showView(name)` | `'welcome'` 또는 `'content'` 뷰 전환 |
| `escHtml(str)` | innerHTML 삽입 전 XSS 방지 이스케이프 |

### 블록 편집

| 함수 | 역할 |
|------|------|
| `syncBlocks()` | DOM의 contenteditable 값을 읽어 `PAGES[currentId].blocks` 상태에 반영. 저장 직전·DnD 시작 전·addBlock 전에 호출 |
| `addBlock(type)` | syncBlocks → blocks.push → renderPage → 마지막 블록 포커스 |
| `addListItem(idx)` | 목록 블록에 빈 항목 추가 후 re-render |
| `deleteListItem(idx, itemIdx)` | 목록 항목 삭제 후 re-render |
| `deleteBlock(idx)` | 블록 삭제 후 re-render + Firestore 저장 |
| `savePage()` | syncBlocks → savePageToFirestore → 토스트 "저장되었습니다" |
| `setupBlockDragListeners()` | `blocksEl` 에 dragstart/end/over/leave/drop 위임 이벤트 1회 등록 (initApp에서 호출) |

### 타입 선택 모달

| 함수 | 역할 |
|------|------|
| `showTypePicker()` | Promise 반환. 모달 오픈. resolve는 'folder' / 'content' / null |
| `closeTypePicker(result)` | 모달 닫고 typePickerResolve 호출 |

### 수정 모드

| 함수 | 역할 |
|------|------|
| `enterEditMode()` | editMode=true, body.edit-mode 추가, buildTree+renderPage 재호출 |
| `exitEditMode()` | editMode=false, sessionStorage 삭제, buildTree+renderPage 재호출 |

### 검색 / 토스트 / 유틸

| 함수 | 역할 |
|------|------|
| `doSearch()` | PAGES 전체 텍스트 검색, 드롭다운 생성 |
| `showToast(msg, isError)` | 하단 중앙 3초 토스트. isError=true 면 빨간 배경 |
| `clearDragIndicators()` | `.drag-over-top / .drag-over-bottom` 클래스 전체 제거 |

---

## 블록 타입 상세

`PAGES[id].blocks` 배열의 각 원소 구조:

```js
// text / warning / tip / cost
{ type: 'text',    title: '📝 내용',     content: '...' }
{ type: 'warning', title: '⚠️ 주의사항', content: '...' }
{ type: 'tip',     title: '💡 팁',       content: '...' }
{ type: 'cost',    title: '💰 비용',      content: '...' }

// list (items 배열 사용, content 없음)
{ type: 'list',    title: '📋 목록',     items: ['항목1', '항목2'] }
```

수정모드 렌더링:
- `content` 타입들: `.block-body[contenteditable]` 하나.
- `list` 타입: `<ul class="editable-list">` + `.item-text[contenteditable]` 반복.
- 모든 블록 헤더에 `⠿` 드래그 핸들(`data-drag-block="true"`) 포함.
- `syncBlocks()` 는 `innerText`로 값을 읽어 PAGES 상태 갱신.

---

## 드래그 앤 드롭 구조

### 사이드바 (트리 항목 재정렬)
- `addTreeDrag(el, node, parentArr)` 로 각 항목 DOM에 직접 이벤트 부착.
- `sidebarDrag.parentArr !== parentArr` 이면 drop 무시 → 같은 레벨끼리만 재정렬.
- 대분류: `hdr` (`.tree-cat-header`) 가 드래그 대상, `parentArr = TREE`.
- 중분류: `hdr` (`.tree-mid-header`) 가 드래그 대상, `parentArr = cat.children`.
- 리프: `el` 전체가 드래그 대상, `parentArr = mid.children` 또는 `cat.children`.
- `.tree-edit-btns` 위에서 dragstart 시작하면 `e.preventDefault()` 로 차단.

### 블록 재정렬
- `setupBlockDragListeners()` 가 `blocksEl` 에 이벤트 위임으로 한 번만 등록.
- `data-drag-block="true"` 속성을 가진 핸들 엘리먼트에서만 dragstart 허용.
- drop 시: `blocks.splice` 로 배열 재정렬 → `renderPage` → `savePageToFirestore`.

### 드롭 위치 판단 (공통)
- 타겟 엘리먼트의 `getBoundingClientRect().top + height/2` = 중앙값.
- `e.clientY < 중앙값` → 위에 삽입 (`drag-over-top` 클래스).
- `e.clientY >= 중앙값` → 아래에 삽입 (`drag-over-bottom` 클래스).

---

## CSS 주요 클래스 / 변수

### CSS 변수 (`:root`)
```css
--navy, --navy-dark, --navy-light   /* 파란 계열 */
--accent          /* #6ba3e8 — 강조색 */
--orange          /* #e07020 — 수정모드 바, 저장버튼 */
--warn-bg/border/text               /* 경고 블록 */
--tip-bg/border/text                /* 팁 블록 */
--cost-bg/border/text               /* 비용 블록 */
--sidebar-w: 280px
--header-h:  56px
```

### 수정모드 CSS 트리거
- `body.edit-mode` 클래스 → 트리 편집버튼 hover 표시, contenteditable 스타일, cursor: grab 등.

### 드래그 인디케이터
```css
.drag-over-top    → box-shadow: inset 0 2px 0 var(--accent)  (트리)
                    border-top: 3px solid var(--navy)          (블록)
.drag-over-bottom → box-shadow: inset 0 -2px 0 var(--accent) (트리)
                    border-bottom: 3px solid var(--navy)       (블록)
.tree-dragging, .block-dragging → opacity: .35
```

---

## index.html 모달 2종

```html
#type-modal   — 항목 유형 선택 (📁폴더형 / 📄내용형)
#modal        — 비밀번호 입력
```

---

## 서비스워커 (sw.js)

```js
const CACHE = 'bps-manual-v4';  // ← 파일 수정 배포 시 이 버전을 올려야 캐시 갱신
```

- `install`: skipWaiting → 즉시 활성화.
- `activate`: 이전 캐시 전체 삭제 후 clients.claim.
- `fetch`: Firestore/gstatic URL 제외하고 cache-first.
- **배너 없음** — silent update. 절대 notification/alert 추가 금지.

---

## 핵심 설계 원칙 (절대 바꾸지 말 것)

1. **silent update** — sw.js skipWaiting 로직, 배너·알림 금지
2. **sessionStorage 비밀번호** — localStorage·쿠키 사용 금지
3. **Firestore 컬렉션 구조** — `categories/main`, `contents/{id}` 변경 금지
4. **editor.js 없음** — 에디터 로직 분리 금지. app.js 단일 파일 유지
5. **syncBlocks() 호출 타이밍** — 저장·DnD·addBlock 직전에 반드시 호출

---

## 업무 맥락

- BPS = BMW Premium Selection (인증중고차)
- 운용·금융리스 매입 시 반드시 보험가입
- BMW 파이낸셜은 면세사업자 → 세금계산서 발행 불가
- 11시 메일: 신인숙 부장님, 이선재 + 김하연 주임님
- 김진환 차장님: 리스·데모 승계서류 담당
