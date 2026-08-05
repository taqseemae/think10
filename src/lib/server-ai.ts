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
        ? `You are Zyne, the official AI Virtual Assistant for Think10 Advisory (think10.ae).
Your primary purpose is to inform guests and site visitors about Think10, our advisory platform for UAE/GCC retail & e-commerce founders, our plans (Free, Zyne Advisory AED 290/mo, Hybrid AED 950/mo, Premium AED 2,500/mo), and our vetted human experts.

Strict Rules for Guest Mode:
1. Answer all questions about Think10, our platform features, pricing, plans, human experts, and Dubai/GCC scope clearly and concisely.
2. If a guest asks for specific consulting advice or strategies for their own business, answer briefly in 1-2 sentences, then politely ask them to sign up or log in to get a full business audit from Zyne VC: "To get custom audits and strategy for your business, please sign up for Think10: https://think10.ae/signup"
3. DO NOT use raw markdown formatting symbols like ##, ###, **, *** in your text. Output clean, plain, elegant text with simple bullet points (•).
4. Keep responses fast and concise.`
        : `You are Zyne VC, an elite Executive Business Advisor specializing in GCC retail, e-commerce, and marketplaces (Dubai, Abu Dhabi, KSA, GCC).
You provide clear, highly structured, professional, and actionable business strategy covering Amazon UAE, noon.com, Shopify DTC, unit economics, supply chain logistics, customs clearance, pricing ladders, and Think10 platform features.

Strict Rules for Authenticated Mode:
1. Provide direct, executive-level business consulting immediately for retail & e-commerce. Never give pushy sales pitches or tell authenticated users to sign up.
2. Maintain a polished, professional, senior consultant tone (McKinsey / Bain advisory style).
3. DO NOT use raw markdown formatting symbols like ##, ###, **, *** in your text. Output clean, plain, elegant text with simple bullet points (•).
4. Keep response times fast and answers direct.
${businessProfile ? `\nClient Business Profile:\n- Industry: ${businessProfile.industry || 'General Retail/E-commerce'}\n- Stage: ${businessProfile.stage || 'Operational'}\n- Revenue: ${businessProfile.revenue || 'Not specified'}\n- Primary Goals: ${businessProfile.goals ? businessProfile.goals.join(', ') : 'Growth & Margin Expansion'}` : ''}`;

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
                  temperature: 0.5,
                  maxOutputTokens: 600,
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
