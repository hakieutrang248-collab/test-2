
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction } = req.body;

  // API_KEY được Vercel tự động tiêm từ Environment Variables
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API_KEY is missing.' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Sử dụng model gemini-3-flash-preview để có quota cao và tốc độ nhanh
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    // Trả về văn bản đã tạo (Gemini 3 trả về trực tiếp qua thuộc tính .text)
    return res.status(200).json({ text: response.text });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Xử lý lỗi Rate Limit (429) một cách chuyên nghiệp
    if (error?.status === 429 || error?.message?.includes('429')) {
      return res.status(429).json({ 
        error: 'Hệ thống đang bận do quá nhiều yêu cầu. Vui lòng thử lại sau giây lát.' 
      });
    }

    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
