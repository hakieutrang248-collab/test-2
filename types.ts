
export type AppStep = 'INPUT' | 'MATRIX' | 'SPEC' | 'EXAM' | 'ANSWERS';

export interface ExamInput {
  subject: string;
  grade: string;
  time: string;
  semester: string;
  topics: string;
  outcomes: string;
  schoolName: string;
  referenceMaterial: string; // Đề cương hoặc ma trận có sẵn
  // Cấu hình số câu
  mcqCount: number;      // Nhiều lựa chọn
  tfCount: number;       // Đúng - Sai
  shortCount: number;    // Trả lời ngắn
  essayCount: number;    // Tự luận
}

export interface MatrixRow {
  topic: string;
  content: string;
  mcq_nb: number; mcq_th: number; mcq_vd: number;
  tf_nb: number; tf_th: number; tf_vd: number;
  short_nb: number; short_th: number; short_vd: number;
  essay_nb: number; essay_th: number; essay_vd: number;
  total_nb: number; total_th: number; total_vd: number;
  percent: number;
}

export interface MatrixData {
  rows: MatrixRow[];
  totalPoints: {
    mcq: number; tf: number; short: number; essay: number;
    total_nb: number; total_th: number; total_vd: number;
  };
  totalRatio: {
    mcq: number; tf: number; short: number; essay: number;
    total_nb: number; total_th: number; total_vd: number;
  };
}

export interface SpecRow {
  topic: string;
  content: string;
  outcome: string; 
  mcq_nb: number; mcq_th: number; mcq_vd: number;
  tf_nb: number; tf_th: number; tf_vd: number;
  short_nb: number; short_th: number; short_vd: number;
  essay_nb: number; essay_th: number; essay_vd: number;
}

export interface SpecData {
  items: SpecRow[];
  totalPoints: {
    mcq: number; tf: number; short: number; essay: number;
    total_nb: number; total_th: number; total_vd: number;
  };
  totalRatio: {
    mcq: number; tf: number; short: number; essay: number;
    total_nb: number; total_th: number; total_vd: number;
  };
}

export interface ExamQuestion {
  id: string;
  type: 'MCQ' | 'TF' | 'SHORT' | 'ESSAY';
  text: string;
  options?: string[];
  subQuestions?: Array<{ text: string; id: string }>;
  points: number;
  level: string;
}

export interface ExamData {
  title: string;
  questions: ExamQuestion[];
}

export interface AnswerKeyData {
  mcqAnswers: Array<{ id: string; questionNum: number; ans: string }>;
  tfAnswers: Array<{ id: string; questionNum: number; answers: string[] }>;
  shortAnswers: Array<{ id: string; questionNum: number; ans: string }>;
  essayGuides: Array<{ id: string; questionNum: number; guide: string; points: number }>;
}
