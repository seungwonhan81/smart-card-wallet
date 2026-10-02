import { ApiError, GoogleGenAI, Type } from '@google/genai';
import { BusinessCardData, CardGroup } from '../types';
import { DEFAULT_GEMINI_MODEL } from './geminiConfig';

const contactFields = ['name', 'company', 'title', 'mobile', 'tel', 'email', 'website', 'address'] as const;

const describeApiError = (error: unknown, model: string): string => {
  const status = error instanceof ApiError ? error.status : undefined;
  const message = error instanceof Error ? error.message : '';

  if (/leaked|API_KEY_BLOCKED|API key.*blocked/i.test(message)) {
    return 'API 키가 차단되었습니다. Google AI Studio에서 새 키를 발급하고 앱 설정에 적용해주세요.';
  }
  if (/API_KEY_INVALID|API key not valid|API_KEY_EXPIRED|API key.*expired/i.test(message) || status === 401) {
    return 'Gemini API 키가 유효하지 않습니다. GEMINI_API_KEY를 확인하고, 변경 후 개발 서버를 재시작하거나 재배포해주세요.';
  }
  if (/unrestricted|API_KEY_SERVICE_BLOCKED|API_KEY_HTTP_REFERRER_BLOCKED|API_KEY_IP_ADDRESS_BLOCKED/i.test(message)) {
    return 'API 키의 제한 설정으로 요청이 거부되었습니다. AI Studio에서 Gemini API 사용 허용 여부와 키의 API·웹사이트 제한을 확인해주세요.';
  }
  if (status === 403) {
    return 'Gemini API 접근이 거부되었습니다. AI Studio에서 키 차단 여부, API 제한 및 허용 웹사이트 설정을 확인해주세요.';
  }
  if (status === 404) {
    return `현재 모델(${model})을 사용할 수 없습니다. 지원되는 모델로 GEMINI_MODEL 설정을 변경한 뒤 재시작하거나 재배포해주세요.`;
  }
  if (status === 429) {
    return 'Gemini API 사용량 한도를 초과했습니다. 잠시 후 재시도하거나 AI Studio에서 프로젝트의 할당량과 결제 상태를 확인해주세요. 같은 프로젝트의 키 재발급으로 한도가 초기화되지는 않습니다.';
  }
  if (/FAILED_PRECONDITION|billing|free tier.*not available/i.test(message)) {
    return '현재 프로젝트에서 Gemini API를 사용할 수 없습니다. AI Studio에서 사용 가능 지역과 결제 설정을 확인해주세요.';
  }
  if (/timeout|timed out|abort/i.test(message) || (error instanceof Error && /AbortError|TimeoutError/.test(error.name))) {
    return '분석 요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.';
  }
  if (status !== undefined && status >= 500) {
    return `Gemini 서비스가 일시적으로 응답하지 않습니다(HTTP ${status}). 잠시 후 다시 시도해주세요.`;
  }
  if (status === 400) {
    return 'Gemini가 이미지 또는 요청 형식을 처리하지 못했습니다. 다른 사진으로 다시 시도해주세요. 반복되면 모델 설정을 확인해주세요.';
  }
  if (/fetch|network/i.test(message)) {
    return 'Gemini API에 연결하지 못했습니다. 인터넷 연결을 확인해주세요.';
  }
  // Do not expose the provider's raw error, which may contain request details.
  return '명함 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
};

export const analyzeBusinessCardImage = async (imageDataUrl: string): Promise<Partial<BusinessCardData>> => {
  // Vite replaces these values when the application is built.
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  if (!apiKey) {
    throw new Error('Gemini API 키가 설정되지 않았습니다. .env.local 또는 Vercel에 GEMINI_API_KEY를 설정하고 재시작하거나 재배포해주세요.');
  }

  const image = /^data:(image\/(?:jpeg|jpg|png|webp|heic|heif));base64,([a-z0-9+/]+={0,2})$/i.exec(imageDataUrl);
  if (!image) {
    throw new Error('지원하지 않거나 손상된 이미지입니다. JPEG, PNG, WebP, HEIC 또는 HEIF 사진을 선택해주세요.');
  }
  const mimeType = image[1].toLowerCase().replace('image/jpg', 'image/jpeg');
  // Leave retryOptions unset: SDK 1.41 uses one request and preserves ApiError details.
  const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 30_000 } });

  let response;
  try {
    response = await ai.models.generateContent({
      model,
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: image[2] } },
          { text: '이 명함 이미지에서 연락처 정보를 추출해서 JSON으로 줘. 한국어와 영어를 모두 지원해. 전화번호는 010으로 시작하면 mobile, 지역번호(02, 031 등)로 시작하면 tel로 분류해줘. 이미지에 보이는 정보만 추출하고, 없는 정보는 추측하지 말고 빈 문자열로 반환해.' },
        ],
      }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: '이름' },
            company: { type: Type.STRING, description: '회사명' },
            title: { type: Type.STRING, description: '직함/직책' },
            mobile: { type: Type.STRING, description: '휴대폰 번호 (010으로 시작)' },
            tel: { type: Type.STRING, description: '일반 전화번호 (지역번호로 시작, 예: 02, 031)' },
            email: { type: Type.STRING, description: '이메일' },
            website: { type: Type.STRING, description: '웹사이트' },
            address: { type: Type.STRING, description: '주소' },
          },
          required: ['name'],
        },
      },
    });
  } catch (error) {
    throw new Error(describeApiError(error, model));
  }

  const text = response.text;
  if (!text) {
    throw new Error('AI로부터 명함 정보를 받지 못했습니다. 글자가 선명하게 보이는 다른 사진으로 다시 시도해주세요.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('AI 응답을 읽지 못했습니다. 사진을 다시 분석해주세요.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('AI 응답이 올바른 명함 형식이 아닙니다. 사진을 다시 분석해주세요.');
  }

  const values = parsed as Record<string, unknown>;
  const result: Partial<BusinessCardData> = { group: CardGroup.OTHER };
  for (const field of contactFields) {
    result[field] = typeof values[field] === 'string' ? values[field].trim() : '';
  }
  if (!contactFields.some(field => result[field])) {
    throw new Error('사진에서 명함 정보를 찾지 못했습니다. 글자가 선명하게 보이도록 다시 촬영해주세요.');
  }
  return result;
};
