import { useState, useRef } from 'react';
import { AlertCircle, FileText, ImageUp, Loader2, ScanSearch } from 'lucide-react';

export default function UploadScreen({ onAnalyze, onBack }) {
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const isReady = files.length > 0 || text.trim().length > 0;

  function handleFiles(e) {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    setError('');
    setPreviews(selectedFiles.map(file => ({
      name: file.name,
      type: file.type,
      src: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    })));
  }

  async function handleAnalyze() {
    if (!isReady) return;
    setAnalyzing(true);
    setError('');

    const form = new FormData();
    form.append('text', text);
    files.forEach(file => form.append('files', file));

    try {
      const response = await fetch('http://localhost:8000/scam-check', {
        method: 'POST',
        body: form,
      });

      const verdict = await response.json();
      if (!response.ok) {
        throw new Error(verdict?.detail || verdict?.error || 'Scam check failed');
      }

      onAnalyze(verdict);
    } catch (err) {
      setError(err.message || 'Could not reach the scam check backend.');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="screen-enter absolute inset-0 bg-[#f6f7fb] p-5 z-30 flex flex-col">
      <div className="shrink-0">
        <p className="text-[11px] font-black text-slate-400 uppercase">Finn context check</p>
        <h2 className="text-3xl font-black text-slate-950 mt-1 tracking-normal">Add evidence</h2>
        <p className="text-sm text-slate-500 mt-2">Screenshots, invoices, or pasted messages help Finn reason about intent.</p>
      </div>

      <label
        className="mt-5 border-2 border-dashed border-slate-300 rounded-[2rem] p-5 bg-white text-center flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition shrink-0 min-h-[150px]"
        onClick={() => fileRef.current?.click()}
      >
        <div className="w-14 h-14 rounded-3xl bunq-gradient text-white grid place-items-center mb-3">
          <ImageUp className="w-7 h-7" />
        </div>
        <p className="text-sm font-black text-slate-800">Upload evidence</p>
        <p className="text-xs text-slate-400 mt-1">Images, PDFs, or text files</p>
        <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf,.txt,.md" multiple onChange={handleFiles} />
      </label>

      {previews.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 shrink-0 pb-1">
          {previews.map((preview, i) => (
            preview.src ? (
              <img key={i} src={preview.src} alt={preview.name} className="h-20 w-20 object-cover rounded-2xl border border-slate-200 shrink-0 shadow-sm" />
            ) : (
              <div key={i} className="h-20 w-20 rounded-2xl border border-slate-200 bg-white shadow-sm shrink-0 p-2 flex flex-col items-center justify-center text-center">
                <FileText className="w-6 h-6 text-slate-500 mb-1" />
                <span className="text-[10px] font-bold text-slate-500 line-clamp-2 break-all">{preview.name}</span>
              </div>
            )
          ))}
        </div>
      )}

      <textarea
        rows={5}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste messages here..."
        className="w-full p-4 rounded-[2rem] border border-slate-200 text-sm focus:ring-2 focus:ring-pink-500 outline-none resize-none shadow-sm transition mt-4 bg-white"
      />

      {error && (
        <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50 p-3 text-xs font-bold text-rose-800 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-auto pt-5 space-y-3 shrink-0">
        <button
          onClick={handleAnalyze}
          disabled={!isReady || analyzing}
          className={`w-full bunq-gradient text-white font-black py-4 rounded-3xl transition-opacity flex justify-center items-center gap-2 ${!isReady || analyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {analyzing
            ? <><Loader2 className="w-5 h-5 animate-spin" />Checking backend...</>
            : <><ScanSearch className="w-5 h-5" />Analyze with Finn</>
          }
        </button>
        <button
          onClick={onBack}
          className="w-full bg-white text-slate-700 font-black py-3 rounded-3xl hover:bg-slate-50 transition border border-slate-100"
        >
          Back
        </button>
      </div>
    </div>
  );
}
