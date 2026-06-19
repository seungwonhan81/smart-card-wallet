# 배포 로그: Gemini 스캔 버그 수정 배포

- **날짜**: 2026-06-19
- **브랜치**: main
- **커밋**: `a4437a2`
- **상태**: ✅ 배포 완료

---

## 배포된 변경 사항

### 1. 버그 수정 — `src/services/geminiService.ts`

명함 스캔 시 "명함 인식에 실패했습니다" 오류를 유발하던 두 가지 문제 수정.

**수정 1: 모델명 변경**

```ts
// 수정 전
model: "gemini-3-flash-preview"  // 존재하지 않는 모델

// 수정 후
model: "gemini-2.0-flash"        // 실제 사용 가능한 모델
```

**수정 2: contents 형식 변경**

```ts
// 수정 전 — Object 형식 (잘못됨)
contents: {
  parts: [ ... ]
}

// 수정 후 — Array 형식 (@google/genai v1.x 스펙)
contents: [
  {
    role: "user",
    parts: [ ... ]
  }
]
```

### 2. 문서 추가 — `docs/bug-report-gemini-scan-failure.md`

버그 원인 분석 리포트 신규 추가.

---

## Git 이력

```
a4437a2  fix: Gemini 명함 스캔 오류 수정 및 버그 리포트 추가  ← 이번 배포
9ccbe01  feat: 명함에서 휴대폰 연락처로 저장하는 기능 추가 (vCard)
353d42f  feat: 전화번호를 휴대폰/일반전화로 분리
2b988cf  Fix: InputField을 컴포넌트 외부로 분리하여 한글 입력 버그 수정
4040395  Redesign UI: modern minimalist style across all screens
c03974c  Initial commit: 스마트 명함 지갑 앱
```

---

## 배포 프로세스

```
로컬 수정
  └─ git add src/services/geminiService.ts docs/bug-report-gemini-scan-failure.md
       └─ git commit -m "fix: Gemini 명함 스캔 오류 수정 및 버그 리포트 추가"
            └─ git push origin main
                 └─ Vercel 자동 감지 → 빌드 → 배포 (약 1~2분 소요)
```

**커밋에 포함되지 않은 파일** (로컬 전용):
- `.claude/settings.local.json` — Claude Code 로컬 설정
- `.bkit/` — bkit 내부 상태 파일

---

## 참고

- GitHub 저장소: `seungwonhan81/smart-card-wallet`
- Vercel은 `origin/main` push 시 자동 배포
- 관련 버그 리포트: [docs/bug-report-gemini-scan-failure.md](bug-report-gemini-scan-failure.md)
