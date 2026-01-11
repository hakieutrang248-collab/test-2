
import React, { useState, useRef, useEffect } from 'react';
import mammoth from 'mammoth';
import { 
  generateMatrix, 
  generateSpecification, 
  generateExam, 
  generateAnswers 
} from './services/geminiService';
import { 
  AppStep, ExamInput, MatrixData, SpecData, ExamData, AnswerKeyData, MatrixRow, ExamQuestion 
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

  const getStorageKey = () => `exam_7991_v3_${input.subject}_${input.grade}_${input.semester}`.replace(/\s+/g, '_');

  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      const parsed = JSON.parse(saved);
      setMatrix(parsed.matrix || null);
      setSpec(parsed.spec || null);
      setExam(parsed.exam || null);
      setAnswers(parsed.answers || null);
    }
  }, [input.subject, input.grade, input.semester]);

  useEffect(() => {
    const data = { matrix, spec, exam, answers };
    localStorage.setItem(getStorageKey(), JSON.stringify(data));
  }, [matrix, spec, exam, answers]);

  const updateCount = (key: keyof Pick<ExamInput, 'mcqCount' | 'tfCount' | 'shortCount' | 'essayCount'>, delta: number) => {
    setInput(prev => ({ ...prev, [key]: Math.max(0, (prev[key] as number) + delta) }));
  };

  const handleGenerate = async (step: AppStep) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (step === 'MATRIX') {
        const res = await generateMatrix(input);
        setMatrix(res);
      } else if (step === 'SPEC' && matrix) {
        const res = await generateSpecification(input, matrix);
        setSpec(res);
      } else if (step === 'EXAM' && spec) {
        const res = await generateExam(input, spec);
        setExam(res);
      } else if (step === 'ANSWERS' && exam) {
        const res = await generateAnswers(exam);
        setAnswers(res);
      }
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
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid black; padding: 3px; text-align: center; font-family: 'Times New Roman'; font-size: 9pt; } .text-left { text-align: left; } .font-bold { font-weight: bold; } .page-break { page-break-after: always; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Ho_so_7991_${input.subject}_Lop${input.grade}.doc`;
    link.click();
  };

  const MatrixTableHeader = () => (
    <thead>
      <tr className="bg-slate-50">
        <th rowSpan={4} className="border border-black p-1 w-8 text-center text-[9px] font-bold">TT</th>
        <th rowSpan={4} className="border border-black p-1 w-24 text-center text-[9px] font-bold">Chủ đề/Chương</th>
        <th rowSpan={4} className="border border-black p-1 w-40 text-center text-[9px] font-bold">Nội dung/đơn vị kiến thức</th>
        <th colSpan={12} className="border border-black p-1 text-center text-[9px] font-bold">Mức độ đánh giá</th>
        <th colSpan={3} rowSpan={2} className="border border-black p-1 text-center text-[9px] font-bold">Tổng</th>
        <th rowSpan={4} className="border border-black p-1 w-12 text-center text-[9px] font-bold">Tỉ lệ % điểm</th>
      </tr>
      <tr className="bg-slate-50">
        <th colSpan={9} className="border border-black p-1 text-center text-[9px] font-bold">TNKQ</th>
        <th colSpan={3} className="border border-black p-1 text-center text-[9px] font-bold">Tự luận</th>
      </tr>
      <tr className="bg-slate-50">
        <th colSpan={3} className="border border-black p-1 text-center font-normal italic text-[8px]">Nhiều lựa chọn</th>
        <th colSpan={3} className="border border-black p-1 text-center font-normal italic text-[8px]">“Đúng – Sai”<sup>2</sup></th>
        <th colSpan={3} className="border border-black p-1 text-center font-normal italic text-[8px]">Trả lời ngắn<sup>3</sup></th>
        <th rowSpan={2} className="border border-black p-1 text-[8px] font-bold">Biết</th>
        <th rowSpan={2} className="border border-black p-1 text-[8px] font-bold">Hiểu</th>
        <th rowSpan={2} className="border border-black p-1 text-[8px] font-bold">VD</th>
        <th rowSpan={2} className="border border-black p-1 text-[8px] font-bold">Biết</th>
        <th rowSpan={2} className="border border-black p-1 text-[8px] font-bold">Hiểu</th>
        <th rowSpan={2} className="border border-black p-1 text-[8px] font-bold">VD</th>
      </tr>
      <tr className="bg-slate-50">
        <th className="border border-black p-1 text-[8px] font-bold">Biết</th>
        <th className="border border-black p-1 text-[8px] font-bold">Hiểu</th>
        <th className="border border-black p-1 text-[8px] font-bold">VD</th>
        <th className="border border-black p-1 text-[8px] font-bold">Biết</th>
        <th className="border border-black p-1 text-[8px] font-bold">Hiểu</th>
        <th className="border border-black p-1 text-[8px] font-bold">VD</th>
        <th className="border border-black p-1 text-[8px] font-bold">Biết</th>
        <th className="border border-black p-1 text-[8px] font-bold">Hiểu</th>
        <th className="border border-black p-1 text-[8px] font-bold">VD</th>
      </tr>
    </thead>
  );

  const MatrixTable = ({ data, isPrint = false, editable = true }: { data: MatrixData, isPrint?: boolean, editable?: boolean }) => {
    const sum = (field: keyof MatrixRow) => data.rows.reduce((a, b) => a + ((b[field] as number) || 0), 0);
    return (
      <div className="overflow-x-auto">
        <table className={`w-full border-collapse border border-black text-center leading-tight ${isPrint ? 'text-[8pt]' : 'text-[10px]'}`}>
          <MatrixTableHeader />
          <tbody>
            {data.rows.map((row, idx) => (
              <tr key={idx}>
                <td className="border border-black p-1">{idx + 1}</td>
                <td className="border border-black p-1 text-left">
                   {editable ? <input className="w-full bg-transparent border-none p-0 text-left font-medium" value={row.topic} onChange={e => {
                     const newRows = [...data.rows]; newRows[idx] = { ...newRows[idx], topic: e.target.value }; setMatrix({ ...data, rows: newRows });
                   }} /> : row.topic}
                </td>
                <td className="border border-black p-1 text-left">
                   {editable ? <input className="w-full bg-transparent border-none p-0 text-left" value={row.content} onChange={e => {
                     const newRows = [...data.rows]; newRows[idx] = { ...newRows[idx], content: e.target.value }; setMatrix({ ...data, rows: newRows });
                   }} /> : row.content}
                </td>
                {[ 'mcq_nb', 'mcq_th', 'mcq_vd', 'tf_nb', 'tf_th', 'tf_vd', 'short_nb', 'short_th', 'short_vd', 'essay_nb', 'essay_th', 'essay_vd' ].map(f => (
                  <td key={f} className="border border-black p-1">
                    {editable ? <input type="number" className="w-6 bg-transparent border-none p-0 text-center" value={row[f as keyof MatrixRow] || 0} onChange={e => {
                      const newRows = [...data.rows]; newRows[idx] = { ...newRows[idx], [f]: parseInt(e.target.value) || 0 }; setMatrix({ ...data, rows: newRows });
                    }} /> : (row[f as keyof MatrixRow] || '')}
                  </td>
                ))}
                <td className="border border-black p-1 font-bold">{(row.mcq_nb||0)+(row.tf_nb||0)+(row.short_nb||0)+(row.essay_nb||0) || ''}</td>
                <td className="border border-black p-1 font-bold">{(row.mcq_th||0)+(row.tf_th||0)+(row.short_th||0)+(row.essay_th||0) || ''}</td>
                <td className="border border-black p-1 font-bold">{(row.mcq_vd||0)+(row.tf_vd||0)+(row.short_vd||0)+(row.essay_vd||0) || ''}</td>
                <td className="border border-black p-1 font-bold">{row.percent}%</td>
              </tr>
            ))}
            <tr className="font-bold bg-slate-50">
              <td colSpan={3} className="border border-black p-1">Tổng số câu</td>
              <td className="border border-black p-1">{sum('mcq_nb')||''}</td><td className="border border-black p-1">{sum('mcq_th')||''}</td><td className="border border-black p-1">{sum('mcq_vd')||''}</td>
              <td className="border border-black p-1">{sum('tf_nb')||''}</td><td className="border border-black p-1">{sum('tf_th')||''}</td><td className="border border-black p-1">{sum('tf_vd')||''}</td>
              <td className="border border-black p-1">{sum('short_nb')||''}</td><td className="border border-black p-1">{sum('short_th')||''}</td><td className="border border-black p-1">{sum('short_vd')||''}</td>
              <td className="border border-black p-1">{sum('essay_nb')||''}</td><td className="border border-black p-1">{sum('essay_th')||''}</td><td className="border border-black p-1">{sum('essay_vd')||''}</td>
              <td className="border border-black p-1">{sum('mcq_nb')+sum('tf_nb')+sum('short_nb')+sum('essay_nb')||''}</td>
              <td className="border border-black p-1">{sum('mcq_th')+sum('tf_th')+sum('short_th')+sum('essay_th')||''}</td>
              <td className="border border-black p-1">{sum('mcq_vd')+sum('tf_vd')+sum('short_vd')+sum('essay_vd')||''}</td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr className="font-bold">
              <td colSpan={3} className="border border-black p-1">Tổng số điểm</td>
              <td colSpan={3} className="border border-black p-1">3,0<sup>5</sup></td>
              <td colSpan={3} className="border border-black p-1">2,0</td>
              <td colSpan={3} className="border border-black p-1">2,0</td>
              <td colSpan={3} className="border border-black p-1">3,0</td>
              <td className="border border-black p-1">4,0</td>
              <td className="border border-black p-1">3,0</td>
              <td className="border border-black p-1">3,0</td>
              <td className="border border-black p-1">10,0</td>
            </tr>
            <tr className="font-bold bg-slate-50">
              <td colSpan={3} className="border border-black p-1">Tỉ lệ %</td>
              <td colSpan={3} className="border border-black p-1">30%</td>
              <td colSpan={3} className="border border-black p-1">20%</td>
              <td colSpan={3} className="border border-black p-1">20%</td>
              <td colSpan={3} className="border border-black p-1">30%</td>
              <td className="border border-black p-1">40%</td>
              <td className="border border-black p-1">30%</td>
              <td className="border border-black p-1">30%</td>
              <td className="border border-black p-1">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      <header className="bg-indigo-900 text-white py-4 px-6 shadow-md no-print sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => setCurrentStep('INPUT')} className="flex items-center gap-3 group">
            <div className="bg-white p-2 rounded-lg group-hover:rotate-12 transition-transform"><i className="fas fa-graduation-cap text-indigo-900"></i></div>
            <div className="text-left">
              <h1 className="text-lg font-bold uppercase tracking-wide">Trợ lý 7991</h1>
              <p className="text-[10px] text-indigo-200 uppercase font-medium">Workspace Kiểm tra - Đánh giá</p>
            </div>
          </button>
          <div className="flex items-center gap-4">
             <button onClick={() => window.print()} className="bg-white text-indigo-900 px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-slate-100 transition-colors">In toàn bộ hồ sơ</button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-8">
        {errorMessage && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300 no-print">
            <i className="fas fa-exclamation-triangle text-red-500 mt-1"></i>
            <div>
              <p className="text-sm text-red-700 font-bold">Lỗi hệ thống</p>
              <p className="text-xs text-red-600">{errorMessage}</p>
              <button onClick={() => handleGenerate(currentStep)} className="mt-2 text-[10px] bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 font-bold uppercase">Thử lại ngay</button>
            </div>
          </div>
        )}

        {currentStep === 'INPUT' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-8 border-b pb-4 flex items-center gap-2"><i className="fas fa-sliders text-indigo-600"></i> Thông tin cơ bản</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Trường</label><input className="w-full border-slate-200 rounded-xl p-3 border text-sm" value={input.schoolName} onChange={e => setInput({...input, schoolName: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Môn học</label><input className="w-full border-slate-200 rounded-xl p-3 border text-sm" value={input.subject} onChange={e => setInput({...input, subject: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Lớp</label><select className="w-full border-slate-200 rounded-xl p-3 border text-sm" value={input.grade} onChange={e => setInput({...input, grade: e.target.value})}>{[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Lớp {g}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Học kì</label><select className="w-full border-slate-200 rounded-xl p-3 border text-sm" value={input.semester} onChange={e => setInput({...input, semester: e.target.value})}><option>Học kì 1</option><option>Học kì 2</option><option>Giữa kì 1</option><option>Giữa kì 2</option></select></div>
              </div>

              <div className="mb-10">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><i className="fas fa-list-ol"></i> Định dạng đề (Số lượng câu hỏi)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[ { label: 'MCQ (Nhiều LC)', key: 'mcqCount' }, { label: 'Đúng - Sai', key: 'tfCount' }, { label: 'Trả lời ngắn', key: 'shortCount' }, { label: 'Tự luận', key: 'essayCount' } ].map(c => (
                    <div key={c.key} className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-bold text-slate-600 mb-2 uppercase">{c.label}</p>
                      <div className="flex items-center justify-between">
                        <button onClick={() => updateCount(c.key as any, -1)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100"><i className="fas fa-minus text-[10px]"></i></button>
                        <span className="text-xl font-bold text-slate-900">{input[c.key as keyof ExamInput]}</span>
                        <button onClick={() => updateCount(c.key as any, 1)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100"><i className="fas fa-plus text-[10px]"></i></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mb-8">
                <div className="flex justify-between items-center mb-4"><h3 className="text-[10px] font-bold text-amber-900 uppercase flex items-center gap-2"><i className="fas fa-book-open"></i> Đề cương / Ma trận mẫu</h3><button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-bold bg-amber-600 text-white px-3 py-1.5 rounded-lg"><i className="fas fa-upload mr-2"></i>Tải tệp (.docx)</button><input type="file" className="hidden" ref={fileInputRef} onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  try {
                    const buffer = await file.arrayBuffer();
                    const res = await mammoth.extractRawText({ arrayBuffer: buffer });
                    setInput(prev => ({ ...prev, referenceMaterial: res.value }));
                  } catch (e) { alert("Lỗi đọc tệp"); }
                }} /></div>
                <textarea rows={6} className="w-full border-amber-200 rounded-xl p-3 border text-sm bg-white focus:ring-2 ring-amber-500/20" value={input.referenceMaterial} onChange={e => setInput({...input, referenceMaterial: e.target.value})} placeholder="Dán nội dung đề cương hoặc ma trận cũ vào đây..." />
              </div>

              <button onClick={() => handleGenerate('MATRIX')} disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all">
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-rocket"></i> BẮT ĐẦU TẠO HỒ SƠ 7991</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 no-print">
              {STEPS.filter(s => s.key !== 'INPUT').map(s => {
                const isGenerated = (s.key === 'MATRIX' && !!matrix) || (s.key === 'SPEC' && !!spec) || (s.key === 'EXAM' && !!exam) || (s.key === 'ANSWERS' && !!answers);
                return (
                  <button key={s.key} onClick={() => isGenerated ? setCurrentStep(s.key) : handleGenerate(s.key)} disabled={loading} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center ${currentStep === s.key ? `border-${s.color}-500 bg-${s.color}-50 shadow-md` : isGenerated ? `border-emerald-200 bg-emerald-50/20` : `border-slate-100 bg-white opacity-60`}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isGenerated ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}><i className={`fas ${loading && currentStep === s.key ? 'fa-circle-notch fa-spin' : s.icon}`}></i></div>
                    <span className="text-xs font-bold uppercase text-slate-800">{s.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[600px] relative">
              {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-50 flex flex-col items-center justify-center gap-4 text-center">
                   <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                   <div className="space-y-2">
                     <p className="font-bold text-indigo-900 uppercase tracking-widest text-xs animate-pulse">Đang thiết kế tài liệu...</p>
                     <p className="text-[10px] text-slate-500 italic max-w-xs px-4">Đang xử lý thông tin chuyên môn, vui lòng đợi trong giây lát.</p>
                   </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-8 no-print">
                <h2 className="text-xl font-bold uppercase text-slate-800 border-l-4 border-indigo-600 pl-3">{STEPS.find(s => s.key === currentStep)?.label}</h2>
                <div className="flex gap-2">
                   <button onClick={() => handleGenerate(currentStep)} disabled={loading} className="text-xs font-bold text-slate-600 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"><i className="fas fa-sync-alt mr-2"></i>Tạo lại</button>
                   <button onClick={downloadWord} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-indigo-700"><i className="fas fa-file-word"></i>Tải Word</button>
                </div>
              </div>

              {currentStep === 'MATRIX' && matrix && <MatrixTable data={matrix} />}
              
              {currentStep === 'SPEC' && spec && (
                 <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-black text-xs">
                       <thead className="bg-slate-50">
                          <tr><th className="border border-black p-2 w-8">TT</th><th className="border border-black p-2 w-32">Chủ đề</th><th className="border border-black p-2">Yêu cầu cần đạt</th><th className="border border-black p-2 w-32">Mức độ</th></tr>
                       </thead>
                       <tbody>
                          {spec.items.map((it, idx) => (
                             <tr key={idx}>
                                <td className="border border-black p-2 text-center">{idx+1}</td>
                                <td className="border border-black p-2 font-bold">{it.topic}</td>
                                <td className="border border-black p-2 italic text-justify"><textarea className="w-full bg-transparent border-none p-0 outline-none" rows={3} value={it.outcome} onChange={e => {
                                  const newItems = [...spec.items]; newItems[idx] = { ...newItems[idx], outcome: e.target.value }; setSpec({ ...spec, items: newItems });
                                }} /></td>
                                <td className="border border-black p-2 text-center">B: {it.mcq_nb+it.tf_nb+it.short_nb}<br/>H: {it.mcq_th+it.tf_th+it.short_th}<br/>V: {it.mcq_vd+it.tf_vd+it.short_vd}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              )}

              {currentStep === 'EXAM' && exam && (
                 <div className="font-serif text-[12pt] space-y-8">
                    <div className="flex justify-between items-start mb-8 text-center uppercase font-bold text-[10pt]">
                       <div className="w-5/12">{input.schoolName}<br/><span className="underline italic font-normal text-[9pt]">Tổ: .................</span></div>
                       <div className="w-6/12">Đề kiểm tra {input.semester}<br/><span className="text-[9pt]">Môn: {input.subject} - Lớp: {input.grade}</span><br/><span className="italic font-normal text-[9pt]">Thời gian: {input.time} phút</span></div>
                    </div>
                    {exam.questions.map((q, i) => (
                      <div key={q.id} className="mb-4">
                        <p><span className="font-bold">Câu {i+1}.</span> <span contentEditable className="outline-none" onBlur={e => {
                          const newQs = exam.questions.map(item => item.id === q.id ? { ...item, text: e.currentTarget.textContent || '' } : item); setExam({ ...exam, questions: newQs });
                        }}>{q.text}</span></p>
                        {q.options && <div className="grid grid-cols-2 gap-2 ml-6 mt-1">
                          {q.options.map((o, idx) => <div key={idx}>{String.fromCharCode(65+idx)}. {o}</div>)}
                        </div>}
                      </div>
                    ))}
                 </div>
              )}

              {currentStep === 'ANSWERS' && answers && (
                 <div className="space-y-6">
                    <h3 className="font-bold uppercase text-center border-b pb-4">ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM</h3>
                    <div className="grid grid-cols-5 gap-2">
                       {answers.mcqAnswers.map(ans => <div key={ans.id} className="border p-2 text-center rounded bg-slate-50"><span className="font-bold">C{ans.questionNum}:</span> {ans.ans}</div>)}
                    </div>
                    <div className="mt-8 space-y-4">
                       <h4 className="font-bold italic underline">Hướng dẫn chấm Tự luận:</h4>
                       {answers.essayGuides.map(g => (
                          <div key={g.id} className="border-l-4 border-rose-500 pl-4 py-2 bg-slate-50">
                             <p className="font-bold">Câu {g.questionNum} ({g.points}đ):</p>
                             <p className="whitespace-pre-line text-sm">{g.guide}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
            </div>

            <div id="printable-area" className="hidden print-only">
               <div className="text-center font-bold text-[10pt] uppercase mb-1">PHỤ LỤC</div>
               <div className="text-center italic text-[9pt] mb-8">(Kèm theo Công văn số 7991/BGDĐT-GDTrH ngày 17/12/2024 của Bộ GDĐT)</div>
               
               {matrix && <div className="page-break mb-12"><h2 className="text-center font-bold uppercase text-[11pt] mb-6">1. MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ</h2><MatrixTable data={matrix} isPrint={true} editable={false} /></div>}
               {spec && <div className="page-break mb-12"><h2 className="text-center font-bold uppercase text-[11pt] mb-6">2. BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KỲ</h2>{/* Content */}</div>}
               {exam && <div className="page-break mb-12"><h2 className="text-center font-bold uppercase text-[11pt] mb-6">3. ĐỀ THI MINH HỌA</h2>{/* Content */}</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
