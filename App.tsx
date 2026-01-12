
import React, { useState, useRef, useEffect } from 'react';
import mammoth from 'mammoth';
import { 
  generateMatrix, 
  generateSpecification, 
  generateExam, 
  generateAnswers 
} from './services/geminiService';
import { 
  AppStep, ExamInput, MatrixData, SpecData, ExamData, AnswerKeyData, MatrixRow 
} from './types';

const STEPS: { key: AppStep; label: string; icon: string; color: string }[] = [
  { key: 'INPUT', label: 'Thông tin', icon: 'fa-edit', color: 'slate' },
  { key: 'MATRIX', label: 'Ma trận', icon: 'fa-table', color: 'indigo' },
  { key: 'SPEC', label: 'Đặc tả', icon: 'fa-list-check', color: 'emerald' },
  { key: 'EXAM', label: 'Đề thi', icon: 'fa-file-lines', color: 'amber' },
  { key: 'ANSWERS', label: 'Đáp án', icon: 'fa-check-double', color: 'rose' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('INPUT');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [input, setInput] = useState<ExamInput>({
    subject: 'Toán học',
    grade: '10',
    time: '90',
    semester: 'Học kì 1',
    topics: 'Mệnh đề và tập hợp; Bất phương trình bậc nhất hai ẩn',
    outcomes: 'Nhận biết mệnh đề, xác định được các tập hợp con, biểu diễn miền nghiệm của bất phương trình...',
    schoolName: 'TRƯỜNG THCS & THPT ...',
    referenceMaterial: '',
    mcqCount: 12,
    tfCount: 4,
    shortCount: 6,
    essayCount: 3
  });

  const [matrix, setMatrix] = useState<MatrixData | null>(null);
  const [spec, setSpec] = useState<SpecData | null>(null);
  const [exam, setExam] = useState<ExamData | null>(null);
  const [answers, setAnswers] = useState<AnswerKeyData | null>(null);

  const getStorageKey = () => `exam_7991_final_${input.subject}_${input.grade}`.replace(/\s+/g, '_');

  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      const parsed = JSON.parse(saved);
      setMatrix(parsed.matrix || null);
      setSpec(parsed.spec || null);
      setExam(parsed.exam || null);
      setAnswers(parsed.answers || null);
    }
  }, [input.subject, input.grade]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(), JSON.stringify({ matrix, spec, exam, answers }));
  }, [matrix, spec, exam, answers]);

  const handleGenerate = async (step: AppStep) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (step === 'MATRIX') setMatrix(await generateMatrix(input));
      else if (step === 'SPEC' && matrix) setSpec(await generateSpecification(input, matrix));
      else if (step === 'EXAM' && spec) setExam(await generateExam(input, spec));
      else if (step === 'ANSWERS' && exam) setAnswers(await generateAnswers(exam));
      setCurrentStep(step);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadWord = () => {
    const content = document.getElementById('printable-area')?.innerHTML;
    if (!content) return;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 3px; text-align: center; font-family: 'Times New Roman'; font-size: 9pt; } .text-left { text-align: left; } .page-break { page-break-after: always; }</style></head><body>";
    const blob = new Blob(['\ufeff', header + content + "</body></html>"], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Ho_so_7991_${input.subject}.doc`;
    link.click();
  };

  const MatrixTable = ({ data }: { data: MatrixData }) => {
    const sum = (field: keyof MatrixRow) => data.rows.reduce((a, b) => a + ((b[field] as number) || 0), 0);
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black text-center text-[10px]">
          <thead className="bg-slate-50 font-bold">
            <tr>
              <th rowSpan={4} className="border border-black p-1 w-8">TT</th>
              <th rowSpan={4} className="border border-black p-1 w-24">Chủ đề</th>
              <th rowSpan={4} className="border border-black p-1">Nội dung</th>
              <th colSpan={12} className="border border-black p-1">Mức độ đánh giá</th>
              <th colSpan={3} rowSpan={2} className="border border-black p-1">Tổng</th>
              <th rowSpan={4} className="border border-black p-1 w-12">Tỉ lệ</th>
            </tr>
            <tr><th colSpan={9} className="border border-black p-1">TNKQ</th><th colSpan={3} className="border border-black p-1">Tự luận</th></tr>
            <tr className="italic font-normal">
              <th colSpan={3} className="border border-black p-1">Nhiều LC</th>
              <th colSpan={3} className="border border-black p-1">Đúng-Sai</th>
              <th colSpan={3} className="border border-black p-1">Ngắn</th>
              <th rowSpan={2} className="border border-black p-1">B</th><th rowSpan={2} className="border border-black p-1">H</th><th rowSpan={2} className="border border-black p-1">V</th>
            </tr>
            <tr>
              {['B','H','V','B','H','V','B','H','V'].map((l, i) => <th key={i} className="border border-black p-1">{l}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, idx) => (
              <tr key={idx}>
                <td className="border border-black p-1">{idx+1}</td>
                <td className="border border-black p-1 text-left">{row.topic}</td>
                <td className="border border-black p-1 text-left">{row.content}</td>
                {[ 'mcq_nb', 'mcq_th', 'mcq_vd', 'tf_nb', 'tf_th', 'tf_vd', 'short_nb', 'short_th', 'short_vd', 'essay_nb', 'essay_th', 'essay_vd' ].map(f => (
                  <td key={f} className="border border-black p-1">{(row[f as keyof MatrixRow] as number) || ''}</td>
                ))}
                <td className="border border-black p-1 font-bold">{(row.mcq_nb||0)+(row.tf_nb||0)+(row.short_nb||0)+(row.essay_nb||0) || ''}</td>
                <td className="border border-black p-1 font-bold">{(row.mcq_th||0)+(row.tf_th||0)+(row.short_th||0)+(row.essay_th||0) || ''}</td>
                <td className="border border-black p-1 font-bold">{(row.mcq_vd||0)+(row.tf_vd||0)+(row.short_vd||0)+(row.essay_vd||0) || ''}</td>
                <td className="border border-black p-1">{row.percent}%</td>
              </tr>
            ))}
            <tr className="font-bold bg-slate-50">
              <td colSpan={3} className="border border-black p-1">Tổng cộng</td>
              <td colSpan={12} className="border border-black p-1 italic">Theo thiết kế 7.0 TNKQ - 3.0 TL</td>
              <td className="border border-black p-1">4.0</td><td className="border border-black p-1">3.0</td><td className="border border-black p-1">3.0</td>
              <td className="border border-black p-1">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-indigo-900 text-white py-4 px-6 shadow-md no-print sticky top-0 z-30 flex justify-between items-center">
        <button onClick={() => setCurrentStep('INPUT')} className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg text-indigo-900"><i className="fas fa-graduation-cap"></i></div>
          <div className="text-left"><h1 className="text-lg font-bold uppercase">Trợ lý 7991</h1><p className="text-[10px] uppercase opacity-70">Vercel Cloud Integration</p></div>
        </button>
        <button onClick={() => window.print()} className="bg-white text-indigo-900 px-4 py-2 rounded-full text-xs font-bold">In Hồ Sơ</button>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-6">
        {errorMessage && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-center justify-between no-print">
            <span className="text-red-700 text-sm font-medium">{errorMessage}</span>
            <button onClick={() => handleGenerate(currentStep)} className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded font-bold uppercase">Thử lại</button>
          </div>
        )}

        {currentStep === 'INPUT' ? (
          <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-8 animate-in fade-in duration-500">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-4"><i className="fas fa-sliders text-indigo-600 mr-2"></i> Thiết lập môn học</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Môn học</label><input className="w-full border rounded-xl p-3 text-sm" value={input.subject} onChange={e => setInput({...input, subject: e.target.value})} /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Lớp</label><select className="w-full border rounded-xl p-3 text-sm" value={input.grade} onChange={e => setInput({...input, grade: e.target.value})}>{[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}</select></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Học kỳ</label><select className="w-full border rounded-xl p-3 text-sm" value={input.semester} onChange={e => setInput({...input, semester: e.target.value})}><option>Học kì 1</option><option>Học kì 2</option></select></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Thời gian</label><input type="number" className="w-full border rounded-xl p-3 text-sm" value={input.time} onChange={e => setInput({...input, time: e.target.value})} /></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[ {k:'mcqCount', l:'Trắc nghiệm'}, {k:'tfCount', l:'Đúng-Sai'}, {k:'shortCount', l:'Trả lời ngắn'}, {k:'essayCount', l:'Tự luận'} ].map(it => (
                <div key={it.k} className="bg-slate-50 p-4 rounded-2xl text-center border">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">{it.l}</p>
                  <div className="flex justify-between items-center px-2">
                    <button onClick={() => setInput({...input, [it.k]: Math.max(0, (input[it.k as keyof ExamInput] as number)-1)})} className="w-8 h-8 rounded-lg bg-white border text-xs">-</button>
                    <span className="text-xl font-bold">{input[it.k as keyof ExamInput]}</span>
                    <button onClick={() => setInput({...input, [it.k]: (input[it.k as keyof ExamInput] as number)+1})} className="w-8 h-8 rounded-lg bg-white border text-xs">+</button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => handleGenerate('MATRIX')} disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3">
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : "BẮT ĐẦU THIẾT KẾ HỒ SƠ"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
              {STEPS.filter(s => s.key !== 'INPUT').map(s => (
                <button key={s.key} onClick={() => handleGenerate(s.key)} disabled={loading} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 ${currentStep === s.key ? `border-${s.color}-500 bg-${s.color}-50` : 'bg-white opacity-60'}`}>
                  <i className={`fas ${loading && currentStep === s.key ? 'fa-circle-notch fa-spin' : s.icon} text-lg`}></i>
                  <span className="text-[10px] font-bold uppercase">{s.label}</span>
                </button>
              ))}
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border min-h-[500px] relative">
              {loading && <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}
              
              <div className="flex justify-between items-center mb-6 no-print">
                <h2 className="text-lg font-bold uppercase border-l-4 border-indigo-600 pl-3">{STEPS.find(s => s.key === currentStep)?.label}</h2>
                <button onClick={downloadWord} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold"><i className="fas fa-file-word mr-2"></i>Tải Word</button>
              </div>

              {currentStep === 'MATRIX' && matrix && <MatrixTable data={matrix} />}
              {currentStep === 'SPEC' && spec && <div className="text-sm whitespace-pre-line">{JSON.stringify(spec, null, 2)}</div>}
              {currentStep === 'EXAM' && exam && (
                <div className="font-serif text-[12pt] leading-relaxed">
                   <div className="flex justify-between uppercase font-bold text-center text-[10pt] mb-10">
                     <div className="w-1/2">{input.schoolName}</div>
                     <div className="w-1/2">ĐỀ KIỂM TRA {input.semester}<br/>Môn: {input.subject} - Lớp {input.grade}</div>
                   </div>
                   {exam.questions.map((q, i) => (
                     <div key={q.id} className="mb-4">
                       <p><b>Câu {i+1}.</b> {q.text}</p>
                       {q.options && <div className="grid grid-cols-2 gap-2 ml-6">{q.options.map((o, idx) => <div key={idx}>{String.fromCharCode(65+idx)}. {o}</div>)}</div>}
                     </div>
                   ))}
                </div>
              )}
            </div>

            <div id="printable-area" className="hidden print-only">
               <MatrixTable data={matrix!} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
