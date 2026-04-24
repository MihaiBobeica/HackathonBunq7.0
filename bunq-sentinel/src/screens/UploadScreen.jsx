import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ImageUp, ScanSearch, Loader2, X } from 'lucide-react';

const spring = { type: 'spring', stiffness: 420, damping: 28 };

export default function UploadScreen({ onAnalyze, onBack }) {
  const [previews, setPreviews] = useState([]);
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef(null);

  const isReady = previews.length > 0 || text.trim().length > 0;

  function handleFiles(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(p => [...p, { name: file.name, src: ev.target.result, type: file.type }]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  function removePreview(i) {
    setPreviews(p => p.filter((_, idx) => idx !== i));
  }

  function handleAnalyze() {
    if (!isReady) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      onAnalyze(89, [
        'Invoice screenshot contains mismatched beneficiary details.',
        'Messages use coercive timing: pay now, stay on the call, do not contact the bank.',
        'Recipient IBAN is unrelated to the merchant name in the context.',
      ]);
    }, 900);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="absolute inset-0 bg-slate-50 p-6 z-30 flex flex-col">
      <div className="shrink-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em]">Warden context check</p>
        <h2 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">Add evidence</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed font-semibold">
          Screenshots, invoices, or pasted messages help Warden reason about intent.
        </p>
      </div>

      <motion.div onClick={() => fileRef.current?.click()} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={spring} className="mt-5 rounded-[2rem] p-5 bg-white flex items-center gap-4 cursor-pointer soft-shadow shrink-0">
        <div className="w-12 h-12 rounded-3xl bunq-gradient text-white grid place-items-center shrink-0 rainbow-shadow">
          <ImageUp className="w-6 h-6" />
        </div>
        <div className="text-left">
          <p className="text-sm font-black text-slate-900">Upload files</p>
          <p className="text-xs text-slate-500 mt-0.5 font-semibold">Images, PDF, DOC</p>
        </div>
        <input ref={fileRef} type="file" className="hidden" accept="image/*,application/pdf,.pdf,.doc,.docx" multiple onChange={handleFiles} />
      </motion.div>

      {previews.length > 0 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar mt-4 shrink-0 pb-2 pt-2">
          {previews.map((file, i) => (
            <div key={i} className="relative shrink-0">
              {file.type.startsWith('image/') ? (
                <img src={file.src} alt="preview" className="h-20 w-20 object-cover rounded-3xl shadow-xl shadow-slate-200" />
              ) : (
                <div className="h-20 w-20 rounded-3xl bg-white flex flex-col items-center justify-center gap-1 px-1 soft-shadow">
                  <span className="text-[10px] font-black text-pink-500 uppercase">{file.name.split('.').pop()}</span>
                  <span className="text-[9px] text-slate-400 text-center leading-tight truncate w-full px-1">{file.name}</span>
                </div>
              )}
              <button onClick={() => removePreview(i)} className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 grid place-items-center shadow-lg">
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <textarea
        rows={5}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Paste messages here..."
        className="w-full p-5 rounded-[2rem] bg-white text-sm text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-pink-400 outline-none resize-none transition mt-5 soft-shadow font-semibold"
      />

      <div className="mt-auto pt-5 space-y-3 shrink-0">
        <motion.button onClick={handleAnalyze} disabled={!isReady || analyzing} whileHover={isReady && !analyzing ? { y: -3 } : undefined} whileTap={isReady && !analyzing ? { scale: 0.98 } : undefined} transition={spring} className={`w-full bunq-gradient text-white font-black py-5 rounded-3xl flex justify-center items-center gap-2 rainbow-shadow ${!isReady || analyzing ? 'opacity-45 cursor-not-allowed' : ''}`}>
          {analyzing
            ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing...</>
            : <><ScanSearch className="w-5 h-5" />Analyze with Warden</>
          }
        </motion.button>
        <motion.button onClick={onBack} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={spring} className="w-full bg-white text-slate-600 font-black py-4 rounded-3xl soft-shadow">
          Back
        </motion.button>
      </div>
    </motion.div>
  );
}
