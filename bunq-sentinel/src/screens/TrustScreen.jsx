import { ShieldAlert, BookmarkCheck, Clock3 } from 'lucide-react';

export default function TrustScreen({ onTrust, onOnce, onBack }) {
  return (
    <div className="screen-enter absolute inset-0 bg-[#f6f7fb] p-5 z-50 flex flex-col justify-center">
      <div className="text-center mb-6 shrink-0">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 grid place-items-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <p className="text-[11px] font-black text-slate-400 uppercase">Final confirmation</p>
        <h2 className="text-3xl font-black text-slate-950 mt-1 tracking-normal">Proceed anyway?</h2>
        <p className="text-sm text-slate-500 mt-2">Finn will remember your choice for this beneficiary.</p>
      </div>

      <div className="space-y-3 shrink-0">
        <button
          onClick={onTrust}
          className="w-full bg-white border border-slate-100 text-slate-900 p-5 rounded-3xl text-left hover:bg-slate-50 transition shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 grid place-items-center shrink-0">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-lg">Trust IBAN</div>
              <div className="text-xs mt-1 text-slate-500">Save account and reduce future warnings.</div>
            </div>
          </div>
        </button>

        <button
          onClick={onOnce}
          className="w-full bg-white border border-slate-100 text-slate-900 p-5 rounded-3xl text-left hover:bg-slate-50 transition shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 grid place-items-center shrink-0">
              <Clock3 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-lg">Continue once</div>
              <div className="text-xs mt-1 text-slate-500">Keep Finn warnings for later payments.</div>
            </div>
          </div>
        </button>

        <button
          onClick={onBack}
          className="w-full text-slate-500 font-black py-3 hover:text-slate-700 transition"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
