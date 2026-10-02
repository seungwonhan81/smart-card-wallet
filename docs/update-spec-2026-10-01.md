# Gemini API 연동 업데이트 명세

- 작성일: 2026-10-01
- 대상 프로젝트: 스마트 명함 지갑 (`smart-card`)
- 범위: 이번 대화에서 진행한 코드, 환경 설정, 테스트, 빌드 및 실행 작업
- 현재 상태: 코드 수정과 자동 검증 완료. 사용자가 같은 Gemini API 키 한 개로 정상 작동을 확인함.

## 1. 업데이트 목적

명함 인식에 사용하던 `gemini-2.0-flash`는 2026-06-01 서비스가 종료됐다. 기존 코드는 이 모델을 고정해서 호출했고, 키 설정 이름도 실제 코드의 `API_KEY`와 설치 안내의 `GEMINI_API_KEY`가 달랐다.

지원되는 모델로 변경하고, 키 설정을 하나로 통일했다. 이미지 형식과 AI 응답 처리도 보완했으며, 실패 원인을 구분해 표시하도록 변경했다.

## 2. 변경 파일 전체 목록

| 파일 | 작업 | 변경 내용 |
| --- | --- | --- |
| `src/services/geminiConfig.ts` | 신규 생성 | 기본 모델 및 환경 설정 선택 로직 추가 |
| `src/services/geminiService.ts` | 수정 | 모델·키 설정 변경, 이미지 MIME 처리, 요청 시간 제한, API 오류 분류 및 응답 검증 |
| `vite.config.ts` | 수정 | 공통 설정 함수를 사용해 `GEMINI_API_KEY`, `GEMINI_MODEL`을 앱에 반영 |
| `src/components/CardScanner.tsx` | 수정 | 분석 상태 정리, 파일 읽기 오류 처리, 동일 파일 재선택 지원 |
| `.env.local` | 로컬 설정 수정 | 기존 `API_KEY` 항목 이름을 `GEMINI_API_KEY`로 변경. 해당 변경 작업에서 키 값은 그대로 유지 |
| `.env.example` | 신규 생성 | 단일 Gemini 키와 선택 모델 설정 예시 추가. 실제 키 값은 포함하지 않음 |
| `package.json` | 수정 | `test`, `typecheck` 실행 명령 추가 |
| `tests/gemini.test.mjs` | 신규 생성 | 실제 SDK의 HTTP 요청을 모의 응답으로 검증하는 자동 테스트 17개 추가 |
| `dist/` | 빌드 생성물 갱신 | `npm run build` 실행으로 배포용 HTML·JavaScript 등 다시 생성 |
| `docs/update-spec-2026-10-01.md` | 신규 생성 | 이 업데이트 명세 작성 |

`.env.local`과 `dist/`는 기존 Git 제외 설정에 해당한다. 환경 파일의 키 값은 이 명세에 기록하지 않는다. 의존성 버전과 `package-lock.json`은 변경하지 않았으며, 사용 중인 SDK는 `@google/genai` 1.41.0이다.

## 3. 모델 및 API 설정

### 3.1. 호출 모델 변경

| 항목 | 변경 전 | 변경 후 |
| --- | --- | --- |
| 기본 모델 | `gemini-2.0-flash` 고정 | `gemini-3.5-flash-lite` |
| 모델 교체 방법 | 코드 직접 수정 | 선택 환경변수 `GEMINI_MODEL` 설정 |
| 기본값 관리 | 분석 함수 내부 문자열 | `geminiConfig.ts`의 `DEFAULT_GEMINI_MODEL` |

설정값이 없거나 공백뿐이면 기본 모델을 사용한다. 모델 이름 앞뒤 공백은 제거한다. 다른 모델을 지정할 경우 이미지 입력과 구조화 JSON 출력을 지원하고 해당 프로젝트에서 접근 가능한 모델이어야 한다.

2026-10-01 실행 중인 개발 서버의 `/@vite/env`를 조회해, 브라우저에 전달하는 모델 값이 `gemini-3.5-flash-lite`임을 확인했다. 같은 모델을 명시한 실제 SDK 요청도 수행했다.

### 3.2. API 키 한 개로 통일

이 프로젝트에서 키를 사용하는 서비스는 **Google Gemini Developer API** 하나다. 카메라 촬영과 갤러리 업로드가 모두 `analyzeBusinessCardImage()`를 호출하고 같은 키를 사용한다.

| 설정 | 용도 | 필수 여부 |
| --- | --- | --- |
| `GEMINI_API_KEY` | 명함 이미지에서 이름·회사·직함·전화·이메일·웹사이트·주소를 추출하는 Gemini API 인증 | 필수, 한 개 |
| `GEMINI_MODEL` | 사용할 모델 이름 | 선택. API 키가 아님 |

초기 수정에서는 기존 `API_KEY`와 `GEMINI_API_KEY`를 함께 인식하는 호환 처리를 추가했다. 이후 키 이름을 하나로 통일하라는 요청에 따라 호환 처리를 제거했다. **최종 코드는 `GEMINI_API_KEY`만 읽으며, 기존 `API_KEY`를 추가로 설정하거나 별도 키를 발급할 필요가 없다.**

키와 모델 모두 공백을 제거한 실행 환경변수 값을 우선 사용하고, 해당 값이 없으면 로컬 환경 파일 값을 사용한다. 키가 없으면 이미지를 전송하기 전에 설정 오류를 표시한다.

Google 호출 정보:

```text
서비스: Google Gemini Developer API
SDK: @google/genai
메서드: ai.models.generateContent()
HTTP: POST
인증 헤더: x-goog-api-key
호출 주소: https://generativelanguage.googleapis.com/v1beta/models/{모델}:generateContent
현재 기본 주소: https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent
```

별도 OCR API, OpenAI API 또는 Vertex AI 인증을 사용하는 호출은 발견되지 않았다. Google Fonts, Tailwind, 아이콘 CDN은 화면 표시를 위한 외부 리소스이며 별도 API 키를 요구하지 않는다.

### 3.3. Vite 설정 반영

`vite.config.ts`에서 `resolveGeminiConfig()`의 결과를 다음 이름으로 앱에 전달하도록 변경했다.

```text
process.env.GEMINI_API_KEY
process.env.GEMINI_MODEL
```

로컬 설정 예시:

```dotenv
GEMINI_API_KEY=발급받은_키_값
GEMINI_MODEL=gemini-3.5-flash-lite
```

`GEMINI_MODEL`은 생략할 수 있다. 로컬에서 설정을 바꾸면 개발 서버를 재시작해 반영 여부를 확인한다. Vercel에서도 키 이름을 `GEMINI_API_KEY`로 설정해야 하며, 환경변수를 변경한 뒤 재빌드·재배포해야 한다.

로컬과 배포 환경은 각각 설정하지만 같은 Gemini 키를 사용할 수 있다. 각 환경을 위해 두 번째 키를 필수로 발급받는 구조가 아니다.

## 4. 명함 분석 처리 변경

### 4.1. 이미지 형식 처리

기존 코드는 이미지의 Data URL 접두사를 제거한 뒤 모든 이미지를 `image/jpeg`로 전송했다. 변경 후에는 Data URL에서 실제 MIME과 Base64 데이터를 분리해 전송한다.

- 처리하는 MIME: JPEG/JPG, PNG, WebP, HEIC, HEIF.
- `image/jpg`는 `image/jpeg`로 정규화.
- 지원하지 않는 형식, 빈 데이터, 허용된 Data URL 형식에 맞지 않는 입력은 API 호출 전에 오류 표시.

자동 테스트로 PNG와 카메라 JPEG의 전송 MIME을 확인했다. 모든 허용 형식에 대한 실제 이미지 인식 성공을 검증한 것은 아니다.

### 4.2. 요청 시간 및 재시도

요청에 `httpOptions.timeout = 30_000`을 추가했다. 분석 요청 시간이 초과되면 네트워크 확인 및 재시도 안내를 표시한다.

작업 중 `retryOptions: { attempts: 1 }`을 적용해 검증했으나, SDK 1.41.0에서는 이 옵션을 설정했을 때 원래 HTTP 오류 정보가 일반 오류로 바뀌는 현상을 확인했다. 최종 코드에서는 `retryOptions`를 설정하지 않는다. 해당 SDK의 기본 경로는 한 번 요청하고 `ApiError` 정보를 보존한다. 실패 응답 테스트에서도 요청이 자동 반복되지 않는지 검증했다.

### 4.3. 추출 지시 보완

프롬프트에 다음 규칙을 추가했다.

- 이미지에 보이는 정보만 추출.
- 없는 정보는 추측하지 않고 빈 문자열로 반환.

기존 한국어·영어 지원, 휴대폰과 일반 전화번호 분류, JSON 응답 스키마는 유지한다.

### 4.4. 응답 검증 및 정리

AI 응답을 명함 편집 화면으로 전달하기 전에 다음 검증을 추가했다.

1. 응답 텍스트가 없으면 재촬영 안내.
2. JSON 파싱에 실패하면 응답 처리 오류 안내.
3. `null`, 배열, 문자열 등 JSON 객체가 아닌 응답은 거부.
4. 연락처 필드는 문자열인 경우 앞뒤 공백을 제거하고, 예상하지 않은 자료형은 빈 문자열로 정리.
5. 연락처 필드가 전부 비어 있으면 명함 정보를 찾지 못했다는 안내.

결과 필드는 `name`, `company`, `title`, `mobile`, `tel`, `email`, `website`, `address`이며, 기본 그룹은 기존과 같이 `기타`다.

## 5. 오류 표시 변경

기존에는 원래 오류를 그대로 전달했다. 변경 후에는 SDK의 `ApiError.status`와 오류 내용을 확인해 한국어 안내를 표시한다. Google의 원본 오류 문자열과 요청 상세는 그대로 화면에 노출하지 않는다.

| 조건 | 표시하는 안내 |
| --- | --- |
| 키 미설정 | `GEMINI_API_KEY` 설정 및 재시작·재배포 필요 |
| 유효하지 않거나 만료된 키, HTTP 401 | 키 값 확인 및 재시작·재배포 필요 |
| 유출 또는 차단된 키 | AI Studio에서 키 상태 확인 및 대체 키 적용 |
| 제한 없는 키 거부, API·웹사이트·IP 제한 오류 | 키의 API 및 접근 제한 설정 확인 |
| HTTP 403 | Gemini 접근 권한 및 키 제한 확인 |
| HTTP 404 | 현재 선택된 모델 이름과 `GEMINI_MODEL` 변경 안내 |
| HTTP 429 | 프로젝트 사용량 한도 및 결제 상태 확인. 같은 프로젝트의 키 재발급으로 한도가 초기화되지 않음 |
| 지역·결제 등 사전 조건 오류 | 프로젝트 사용 가능 지역 및 결제 설정 확인 |
| 시간 초과·요청 중단 | 네트워크 확인 및 재시도 안내 |
| HTTP 500 이상 | Gemini의 일시적인 서비스 오류 안내 |
| 그 밖의 HTTP 400 | 이미지 또는 요청 형식 처리 오류 안내 |
| 연결 실패 | 인터넷 연결 확인 |
| 분류되지 않은 오류 | 일반 명함 분석 오류 안내 |

## 6. 스캐너 화면 처리 변경

`src/components/CardScanner.tsx`에서 다음을 수정했다.

- 분석 성공·실패 후 모두 `finally`에서 `isAnalyzing`을 해제하도록 변경.
- 파일 읽기 완료 처리를 `FileReader.onloadend`에서 성공 이벤트인 `onload`로 변경.
- `FileReader.onerror`를 추가해 읽기 실패 시 다른 사진 선택 안내.
- 파일 선택 후 입력값을 비워 같은 사진을 다시 선택할 수 있도록 변경.

## 7. 자동 테스트 및 실행 명령 추가

`package.json`에 다음 명령을 추가했다.

```sh
npm test
npm run typecheck
```

- `npm test`: Node.js 테스트 러너로 `tests/gemini.test.mjs` 실행.
- `npm run typecheck`: `tsc --noEmit` 실행.

테스트는 기존 Vite의 TypeScript 로더와 실제 `@google/genai` SDK를 사용한다. HTTP 응답은 모의 처리하므로 실제 Gemini 키나 API 사용료가 필요하지 않다. 테스트용 키는 실제 자격 증명이 아닌 고정 문자열이다.

추가한 테스트는 총 17개다.

| 검증 범위 | 테스트 수 |
| --- | ---: |
| 단일 키 설정, 실행 환경 우선순위, 이전 `API_KEY` 이름 무시, 모델 설정 | 1 |
| 기본 모델·Google 주소·인증 헤더·PNG MIME·JSON 요청 및 결과 | 1 |
| 카메라 JPEG MIME 및 사용자 지정 모델 | 1 |
| 키 미설정 시 요청 차단 | 1 |
| 지원하지 않거나 잘못된 이미지 입력의 요청 차단 | 1 |
| 키 무효·키 유출·제한 없는 키 거부·접근 거부·모델 오류·한도·지역/결제·요청 형식·서비스 오류 | 9 |
| 네트워크·시간 초과·원본 상세 노출 방지 | 1 |
| 빈 응답·잘못된 JSON·비객체·연락처가 없는 응답 | 1 |
| 예상하지 않은 필드 자료형 정리 | 1 |
| **합계** | **17** |

## 8. 참고 자료

- [Google Gemini 모델 종료 기록](https://ai.google.dev/gemini-api/docs/changelog#june-1-2026)
- [Gemini 3.5 Flash-Lite 모델 설명](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite)
- [Google Gemini API 키 설정 및 정책](https://ai.google.dev/gemini-api/docs/api-key)
- [Google Gemini API 오류 확인 안내](https://ai.google.dev/gemini-api/docs/troubleshooting)
