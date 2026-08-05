import { createServerFn } from '@tanstack/react-start';
import { GoogleGenAI } from '@google/genai';
import type { BusinessProfile } from '@/context/DashboardStateContext';

export const generateZyneResponseFn = createServerFn({ method: 'POST' })
  .validator((d: { 
    messages: { role: 'user' | 'model' | 'system', text: string }[], 
    isGuest: boolean, 
    businessProfile?: BusinessProfile | null 
  }) => d)
  .handler(async ({ data }) => {
    // Check all common environment variable names for the Gemini API key
    const apiKey =
      (typeof process !== 'undefined' && (
        process.env.VITE_GEMINI_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.API_KEY ||
        process.env.GOOGLE_GEMINI_API_KEY
      )) ||
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      (import.meta as any).env?.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('[Zyne AI] Missing Gemini API key in process.env');
      return {
        success: false,
        text: 'Zyne API key is missing. Please set VITE_GEMINI_API_KEY or GEMINI_API_KEY in your environment variables.',
      };
    }

    try {
      const { messages, isGuest, businessProfile } = data;

      const systemInstruction = isGuest
        ? `You are Zyne, the AI Virtual Assistant for Think10 Advisory. 
Think10 is an advisory platform for UAE founders in retail, e-commerce, and marketplaces.
You combine AI (yourself) with vetted human experts.
Your goal right now is to answer questions about the platform, explain the value of Think10, and politely encourage the user to sign up or purchase a plan.
Keep your answers brief, professional, and persuasive. Do NOT give detailed business consulting yet; instead, explain that once they sign up, you (Zyne VC) will provide deep business audits and they can book human experts.`
        : `You are Zyne VC (Virtual Consultant), an expert business advisor for Think10 Advisory.
You are talking to an authenticated user who has access to you.
${businessProfile ? `Here is the user's business context:
- Industry: ${businessProfile.industry || 'Not specified'}
- Stage: ${businessProfile.stage || 'Not specified'}
- Revenue: ${businessProfile.revenue || 'Not specified'}
- Challenges: ${businessProfile.challenges ? businessProfile.challenges.join(', ') : 'None listed'}` : 'The user has not completed their business profile yet.'}
Your goal is to provide highly actionable, data-driven, and specific business advice for the UAE market. 
If the user's problem is very complex, requires human intuition, or if they ask to speak to a human, strongly suggest that they book a 1-on-1 session with a Think10 Human Expert through the platform.

Respond in valid JSON only with this exact structure:
{
  "understanding": "1 sentence showing you understand their specific GCC context",
  "recommendation": "A detailed multi-paragraph diagnosis and recommendation",
  "assumptions": "1 sentence outlining key assumptions",
  "risks": "1 sentence highlighting main risks",
  "nextActions": ["Action 1", "Action 2", "Action 3"],
  "sources": ["Source or benchmark 1", "Source 2"]
}
Do not use markdown blocks like \`\`\`json. Output raw JSON string only.`;

      const formattedContents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.text }],
        }));

      if (formattedContents.length === 0) {
        return { success: false, text: 'No message provided.' };
      }

      const modelsToTry = [
        'gemini-flash-latest',
        'gemini-2.0-flash',
        'gemini-1.5-flash-latest',
        'gemini-2.5-flash'
      ];

      let lastError = 'Request failed';
      
      for (const modelName of modelsToTry) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: formattedContents,
                generationConfig: {
                  temperature: 0.7,
                  responseMimeType: isGuest ? 'text/plain' : 'application/json',
                },
              }),
            }
          );

          const resData = await res.json();
          if (res.ok && resData.candidates?.[0]?.content?.parts?.[0]?.text) {
            return { success: true, text: resData.candidates[0].content.parts[0].text };
          }
          
          if (resData.error?.message) {
            lastError = resData.error.message;
          }
        } catch (e: any) {
          lastError = e?.message || lastError;
        }
      }

      return {
        success: false,
        text: `Gemini API Error: ${lastError}`,
      };
    } catch (error: any) {
      console.error('[Zyne AI Exception]:', error);
      return { success: false, text: `Zyne API Connection Error: ${error?.message || 'Unreachable'}` };
    }
  });
