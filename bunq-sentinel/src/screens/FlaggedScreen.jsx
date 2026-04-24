import { OctagonAlert, Sparkles, UploadCloud } from 'lucide-react';

export default function FlaggedScreen({ onUpload, onCancel, onIgnore }) {
  return (
    <div className="screen-enter absolute inset-0 bg-[#f6f7fb] p-5 pb-7 z-20 overflow-y-auto no-scrollbar">
      <div className="rounded-[2rem] bg-white border border-slate-100 p-5 shadow-sm">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 grid place-items-center mb-4">
          <OctagonAlert className="w-8 h-8" />
        </div>
        <p className="text-[11px] font-black text-rose-600 uppercase">Finn Sentinel alert</p>
        <h2 className="text-3xl font-black text-slate-950 mt-1 tracking-normal">Wait a moment</h2>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
          This IBAN matches signals in the bunq fraud network and has no trusted history with your account.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white border border-slate-100 p-4 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase">Risk signal</p>
          <p className="text-sm font-black text-slate-900 mt-1">New beneficiary</p>
        </div>
        <div className="rounded-3xl bg-white border border-slate-100 p-4 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase">Amount</p>
          <p className="text-sm font-black text-slate-900 mt-1">High for first payment</p>
        </div>
      </div>

      <div className="mt-4 rounded-3xl bg-slate-950 text-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 grid place-items-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black">Let Finn double-check</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Add screenshots, invoices, or chat messages related to this transfer.
            </p>
          </div>
        </div>
        <button
          onClick={onUpload}
          className="mt-5 w-full bunq-gradient text-white py-4 rounded-3xl text-sm font-black flex justify-center items-center gap-2 shadow-md"
        >
          <UploadCloud className="w-5 h-5" />Upload context
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <button
          onClick={onCancel}
          className="w-full bg-white text-slate-900 font-black py-4 rounded-3xl hover:bg-slate-50 transition shadow-sm"
        >
          Cancel payment
        </button>
        <button
          onClick={onIgnore}
          className="w-full text-sm text-slate-500 font-black py-3 hover:text-slate-700 transition"
        >
          Ignore and continue
        </button>
      </div>
    </div>
  );
}
