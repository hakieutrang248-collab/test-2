
import { ExamInput, MatrixData, SpecData, ExamData, AnswerKeyData } from "../types";

const SYSTEM_INSTRUCTION = `Bạn là chuyên gia khảo thí của Bộ GD&ĐT Việt Nam. 
Nhiệm vụ: Thiết kế Ma trận, Đặc tả, Đề thi chuẩn Công văn 7991 (17/12/2024).
Yêu cầu: Xuất JSON chính xác 100%, ngôn ngữ chuyên môn chuẩn xác.`;

async function callGeminiApi(prompt: string): Promise<string> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstruction: SYSTEM_INSTRUCTION }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Lỗi hệ thống (${response.status})`);
  }

  return data.text;
}

export const generateMatrix = async (input: ExamInput): Promise<MatrixData> => {
  const prompt = `Tạo MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ (Môn: ${input.subject}, Lớp: ${input.grade}, ${input.semester}).
  Nội dung: ${input.topics}. YCCĐ: ${input.outcomes}.
  Số câu yêu cầu: MCQ: ${input.mcqCount}, Đúng-Sai: ${input.tfCount}, Trả lời ngắn: ${input.shortCount}, Tự luận: ${input.essayCount}.
  Phân bổ: 40% Biết, 30% Hiểu, 30% VD. Trả về JSON MatrixData.`;

  const text = await callGeminiApi(prompt);
  return JSON.parse(text || '{}');
};

export const generateSpecification = async (input: ExamInput, matrix: MatrixData): Promise<SpecData> => {
  const prompt = `Tạo BẢN ĐẶC TẢ dựa trên Ma trận: ${JSON.stringify(matrix)}. Trả về JSON SpecData.`;
  const text = await callGeminiApi(prompt);
  return JSON.parse(text || '{}');
};

export const generateExam = async (input: ExamInput, spec: SpecData): Promise<ExamData> => {
  const prompt = `Dựa trên Bản đặc tả: ${JSON.stringify(spec)}, hãy soạn ĐỀ THI chi tiết các câu hỏi. Trả về JSON ExamData.`;
  const text = await callGeminiApi(prompt);
  return JSON.parse(text || '{}');
};

export const generateAnswers = async (exam: ExamData): Promise<AnswerKeyData> => {
  const prompt = `Tạo ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM cho đề thi: ${JSON.stringify(exam)}. Trả về JSON AnswerKeyData.`;
  const text = await callGeminiApi(prompt);
  return JSON.parse(text || '{}');
};
