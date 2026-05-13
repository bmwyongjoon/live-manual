# Live Manual — 가양 BPS 업무 매뉴얼

## 프로젝트 한 줄 요약
BMW 인증중고차(BPS) 가양 전시장 내부용 업무 매뉴얼 웹앱.
누구나 읽을 수 있고, 비밀번호(bmwbps1) 입력 시 수정 가능한
나무위키 스타일의 살아있는 업무 지식 베이스.

## 배포
- GitHub Pages (main 브랜치 root)
- URL: https://bmwyongjoon.github.io/live-manual

## 기술 스택
- HTML / CSS / JavaScript (프레임워크 없음)
- Firebase Firestore (데이터 저장)
- PWA (서비스워커 silent update 방식)

## 파일 구조
├── index.html
├── style.css
├── app.js
├── firebase.js    ← Firebase 초기화 및 Firestore 연동
├── editor.js      ← 블록 에디터 로직
├── manifest.json
├── sw.js
└── icons/

## 핵심 설계 원칙
1. Firebase Firestore가 데이터 저장소 (content.json 없음)
2. 저장 버튼 → Firestore 즉시 저장 → 자동 반영
3. 비밀번호(bmwbps1)는 sessionStorage만 사용
4. 서비스워커는 silent update (배너 절대 없음)
5. 읽기: 누구나 / 쓰기: 비밀번호 입력자만

## 블록 에디터 종류
- 📝 텍스트
- 📋 목록
- ✅ 체크리스트
- ⚠️ 주의사항 박스
- 💡 팁 박스
- 💰 비용 박스

## 카테고리 구조
매입 / 출고 / RV 반납 / 세금계산서 / 기타업무

## 업무 맥락
- BPS = BMW Premium Selection (인증중고차)
- 운용·금융리스 매입 시 반드시 보험가입
- BMW 파이낸셜은 면세사업자 → 세금계산서 발행 불가
- 11시 메일: 신인숙 부장님, 이선재 + 김하연 주임님
- 김진환 차장님: 리스·데모 승계서류 담당

## 절대 바꾸지 말 것
- silent update 방식 (sw.js skipWaiting 로직)
- sessionStorage 비밀번호 방식
- Firestore 컬렉션 구조
