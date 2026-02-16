import { GoogleGenAI, Type } from "@google/genai";
import { BusinessCardData, CardGroup } from "../types";

// Helper to safely get the API key defined in vite.config.ts
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    console.warn("process.env is not accessible");
    return '';
  }
};

export const analyzeBusinessCardImage = async (base64Image: string): Promise<Partial<BusinessCardData>> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API Key가 설정되지 않았습니다. Vercel 환경 변수나 .env 파일을 확인해주세요.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "이름" },
        company: { type: Type.STRING, description: "회사명" },
        title: { type: Type.STRING, description: "직함/직책" },
        phone: { type: Type.STRING, description: "전화번호" },
        email: { type: Type.STRING, description: "이메일" },
        website: { type: Type.STRING, description: "웹사이트" },
        address: { type: Type.STRING, description: "주소" },
      },
      required: ["name"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: "이 명함 이미지에서 연락처 정보를 추출해서 JSON으로 줘. 한국어와 영어를 모두 지원해.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI로부터 응답을 받지 못했습니다.");

    const parsed = JSON.parse(text);
    
    return {
      name: parsed.name || "",
      company: parsed.company || "",
      title: parsed.title || "",
      phone: parsed.phone || "",
      email: parsed.email || "",
      website: parsed.website || "",
      address: parsed.address || "",
      group: CardGroup.OTHER,
    };

  } catch (error) {
    console.error("Gemini 분석 오류:", error);
    throw error;
  }
};