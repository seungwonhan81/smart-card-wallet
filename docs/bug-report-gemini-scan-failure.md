# 버그 리포트: 명함 스캔 인식 실패

- **날짜**: 2026-06-19
- **심각도**: Critical (핵심 기능 동작 불가)
- **상태**: ✅ 수정 완료
- **파일**: `src/services/geminiService.ts`

---

## 증상

명함을 카메라로 촬영하거나 갤러리에서 이미지를 선택하면, AI 분석 단계에서 항상 실패하며 다음 에러 메시지가 표시됨.

> **"명함 인식에 실패했습니다. 다시 시도해주세요."**

명함 이미지 자체는 정상적으로 촬영/불러오기가 되었고, API 키도 `.env.local`에 올바르게 설정되어 있었음.

---

## 원인 분석

### 원인 1 — 존재하지 않는 Gemini 모델명 (주요 원인)

**위치**: `src/services/geminiService.ts:42`

```ts
// ❌ 수정 전
model: "gemini-3-flash-preview"
```

`gemini-3-flash-preview`는 Google Gemini API에 존재하지 않는 모델명이다.
이 모델명으로 API를 호출하면 `404 Model Not Found` 에러가 발생하여
`catch` 블록으로 빠지고 "명함 인식에 실패" 메시지가 출력된다.

### 원인 2 — `contents` 파라미터 형식 오류 (부가 원인)

**위치**: `src/services/geminiService.ts:43-55`

```ts
// ❌ 수정 전 — 객체(Object) 형식
contents: {
  parts: [
    { inlineData: { ... } },
    { text: "..." }
  ]
}
```

`@google/genai` v1.x SDK의 `generateContent()`는 `contents`를
**배열(Array)** 형식으로 받는다. 객체로 전달하면 SDK 내부에서
타입 오류가 발생할 수 있다.

---

## 수정 내용

**파일**: `src/services/geminiService.ts`

```ts
// ✅ 수정 후
const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",          // 모델명 수정
  contents: [                          // 배열 형식으로 변경
    {
      role: "user",                    // role 명시
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64,
          },
        },
        {
          text: "이 명함 이미지에서 연락처 정보를 추출해서 JSON으로 줘...",
        },
      ],
    },
  ],
  config: {
    responseMimeType: "application/json",
    responseSchema: responseSchema,
  }
});
```

| 항목 | 수정 전 | 수정 후 |
|---|---|---|
| 모델명 | `gemini-3-flash-preview` ❌ | `gemini-2.0-flash` ✅ |
| contents 타입 | `Object { parts: [...] }` | `Array [{ role, parts }]` |
| role 필드 | 없음 | `"user"` 명시 |

---

## 영향 범위

- **카메라 촬영 → AI 분석** 경로: 100% 실패 → 정상
- **갤러리 업로드 → AI 분석** 경로: 100% 실패 → 정상
- 명함 목록, 편집, 통계 화면: 영향 없음

---

## 재발 방지 체크리스트

- [ ] Gemini 모델명은 [Google AI Studio](https://aistudio.google.com) 또는 공식 문서에서 반드시 확인 후 사용
- [ ] `@google/genai` SDK 버전 업그레이드 시 `contents` 형식 변경 여부 확인
- [ ] Vercel 배포 시 `API_KEY` 환경 변수가 설정되어 있는지 확인 (Settings → Environment Variables)

---

## 참고

- 사용 SDK: `@google/genai` v1.41.0
- 정상 동작 모델 목록 (멀티모달 지원): `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`
- Gemini 모델 목록 공식 문서: https://ai.google.dev/models
