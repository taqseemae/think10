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
    // Note: GEMINI_API_KEY or VITE_GEMINI_API_KEY in process.env
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return { success: false, text: "System Error: Zyne API key is missing. Please add GEMINI_API_KEY or VITE_GEMINI_API_KEY to your environment variables." };
    }

    const ai = new GoogleGenAI({ apiKey });

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

      // Filter out system messages and map to Gemini format
      const history = messages
        .slice(0, -1)
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));
      
      const latestMessage = messages[messages.length - 1].text;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: latestMessage }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: isGuest ? "text/plain" : "application/json"
        }
      });

      return { success: true, text: response.text || "I couldn't process that right now. Please rephrase." };
    } catch (error: any) {
      console.error("Zyne AI Error:", error);
      return { success: false, text: `Zyne API Error: ${error?.message || "Unreachable"}` };
    }
  });
