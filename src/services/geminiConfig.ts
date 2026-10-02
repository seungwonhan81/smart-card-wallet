export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';

type Environment = Record<string, string | undefined>;

// This app uses one credential: a Google Gemini Developer API key.
export const resolveGeminiConfig = (local: Environment, runtime: Environment) => ({
  apiKey: runtime.GEMINI_API_KEY?.trim() || local.GEMINI_API_KEY?.trim() || '',
  model: runtime.GEMINI_MODEL?.trim() || local.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
});
