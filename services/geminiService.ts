
import { ExamInput, MatrixData, SpecData, ExamData, AnswerKeyData } from "../types";

const SYSTEM_INSTRUCTION = `Bạn là một chuyên gia khảo thí CORE ENGINE của Bộ Giáo dục và Đào tạo Việt Nam. 
Nhiệm vụ của bạn là thiết kế các thành phần của đề kiểm tra định kỳ theo Chương trình GDPT 2018, Công văn 7991/BGDĐT-GDTrH (ngày 17/12/2024).
Mọi dữ liệu phải chuẩn xác 100% về mặt sư phạm, ngôn ngữ hành chính chuẩn mực.`;

async function callGeminiApi(prompt: string): Promise<string> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstruction: SYSTEM_INSTRUCTION }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to call Gemini API');
  }

  const data = await response.json();
  return data.text;
}

export const generateMatrix = async (input: ExamInput): Promise<MatrixData> => {
  const prompt = `Dựa trên thông tin: Môn ${input.subject}, Lớp ${input.grade}, ${input.semester}. 
  Chủ đề: ${input.topics}. YCCĐ: ${input.outcomes}.
  TÀI LIỆU THAM KHẢO / ĐỀ CƯƠNG: "${input.referenceMaterial || 'Không cung cấp'}"

  YÊU CẦU CẤU TRÚC ĐỀ (BẮT BUỘC):
  1. PHẦN I: TRẮC NGHIỆM KHÁCH QUAN (TỔNG 7.0 ĐIỂM)
     - Số câu Nhiều lựa chọn: ${input.mcqCount} câu
     - Số câu Đúng - Sai: ${input.tfCount} câu
     - Số câu Trả lời ngắn: ${input.shortCount} câu
  2. PHẦN II: TỰ LUẬN (TỔNG 3.0 ĐIỂM)
     - Số câu Tự luận: ${input.essayCount} câu.
  
  MỨC ĐỘ NHẬN THỨC: Nhận biết 40%, Thông hiểu 30%, Vận dụng 30%.
  Hãy phân bổ các câu hỏi vào Ma trận chuẩn Công văn 7991.
  Trả về JSON chuẩn theo MatrixData interface.`;

  const text = await callGeminiApi(prompt);
  return JSON.parse(text || '{}');
};

export const generateSpecification = async (input: ExamInput, matrix: MatrixData): Promise<SpecData> => {
  const prompt = `Dựa trên MA TRẬN: ${JSON.stringify(matrix)} và TÀI LIỆU THAM KHẢO: "${input.referenceMaterial}"
  Tạo BẢN ĐẶC TẢ theo mẫu CV 7991. Trả về JSON chuẩn SpecData.`;

  const text = await callGeminiApi(prompt);
  return JSON.parse(text || '{}');
};

export const generateExam = async (input: ExamInput, spec: SpecData): Promise<ExamData> => {
  const prompt = `Dựa trên BẢN ĐẶC TẢ: ${JSON.stringify(spec)} và TÀI LIỆU THAM KHẢO: "${input.referenceMaterial}"
  Hãy ra đề thi đầy đủ câu hỏi. Trả về JSON chuẩn ExamData.`;

  const text = await callGeminiApi(prompt);
  return JSON.parse(text || '{}');
};

export const generateAnswers = async (exam: ExamData): Promise<AnswerKeyData> => {
  const prompt = `Tạo ĐÁP ÁN cho đề sau: ${JSON.stringify(exam)}. Trả về JSON chuẩn AnswerKeyData.`;

  const text = await callGeminiApi(prompt);
  return JSON.parse(text || '{}');
};
