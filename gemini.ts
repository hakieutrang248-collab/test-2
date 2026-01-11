
import { GoogleGenAI } from "@google/genai";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 giây

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction } = req.body;
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key chưa được cấu hình trên Vercel (GEMINI_API_KEY).' });
  }

  const ai = new GoogleGenAI({ apiKey: apiKey as string });

  // Cơ chế Retry Logic
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        // Sử dụng model Flash Lite để có quota cao nhất và ổn định nhất
        model: 'gemini-flash-lite-latest',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      return res.status(200).json({ text: response.text });

    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.message?.includes('429');
      
      if (isRateLimit && attempt < MAX_RETRIES - 1) {
        // Đợi một chút trước khi thử lại (tăng dần thời gian chờ)
        const delay = INITIAL_RETRY_DELAY * (attempt + 1);
        console.warn(`Attempt ${attempt + 1} failed with 429. Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      // Nếu không phải lỗi rate limit hoặc đã hết lượt thử
      console.error("Gemini API Error:", error);
      const statusCode = error?.status || 500;
      const errorMessage = isRateLimit 
        ? "Hệ thống đang quá tải yêu cầu (429). Vui lòng đợi 30 giây và nhấn 'Tạo lại' để tiếp tục."
        : (error.message || 'Lỗi kết nối API');
      
      return res.status(statusCode).json({ error: errorMessage });
    }
  }
}
