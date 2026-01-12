
import { ExamInput, MatrixData, SpecData, ExamData, AnswerKeyData } from "../types";

const SYSTEM_INSTRUCTION = `Bạn là một TRỢ LÝ AI CHUYÊN TRÁCH KIỂM TRA – ĐÁNH GIÁ trong trường THCS/THPT tại Việt Nam. 
Nhiệm vụ: Thiết kế Ma trận, Bản đặc tả, Đề thi và Đáp án chuẩn xác theo Công văn 7991/BGDĐT-GDTrH ngày 17/12/2024.
Yêu cầu: Xuất dữ liệu dưới dạng JSON thuần túy, đúng cấu trúc interface đã định nghĩa.`;

async function callVercelApi(prompt: string): Promise<string> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstruction: SYSTEM_INSTRUCTION }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Lỗi không xác định từ máy chủ.');
  }

  return data.text;
}

export const generateMatrix = async (input: ExamInput): Promise<MatrixData> => {
  const prompt = `Tạo MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ (Môn: ${input.subject}, Lớp: ${input.grade}, ${input.semester}).
  Chủ đề: ${input.topics}. Yêu cầu cần đạt: ${input.outcomes}.
  Số câu: MCQ=${input.mcqCount}, Đúng-Sai=${input.tfCount}, Ngắn=${input.shortCount}, Tự luận=${input.essayCount}.
  Tỉ lệ: 40% Nhận biết, 30% Thông hiểu, 30% Vận dụng.`;

  const text = await callVercelApi(prompt);
  return JSON.parse(text || '{}');
};

export const generateSpecification = async (input: ExamInput, matrix: MatrixData): Promise<SpecData> => {
  const prompt = `Tạo BẢN ĐẶC TẢ chi tiết dựa trên Ma trận: ${JSON.stringify(matrix)}.`;
  const text = await callVercelApi(prompt);
  return JSON.parse(text || '{}');
};

export const generateExam = async (input: ExamInput, spec: SpecData): Promise<ExamData> => {
  const prompt = `Dựa trên Bản đặc tả: ${JSON.stringify(spec)}, hãy soạn ĐỀ THI chính thức.`;
  const text = await callVercelApi(prompt);
  return JSON.parse(text || '{}');
};

export const generateAnswers = async (exam: ExamData): Promise<AnswerKeyData> => {
  const prompt = `Tạo ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM cho đề thi: ${JSON.stringify(exam)}.`;
  const text = await callVercelApi(prompt);
  return JSON.parse(text || '{}');
};
