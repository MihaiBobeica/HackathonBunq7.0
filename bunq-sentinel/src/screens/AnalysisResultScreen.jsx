import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement } from 'chart.js';
import { Ban, CheckCircle2, PhoneOff, ShieldAlert, TriangleAlert } from 'lucide-react';

ChartJS.register(ArcElement);

export default function AnalysisResultScreen({ verdict, score, reasons, onStop, onContinue }) {
  const riskScore = verdict?.risk_score ?? score ?? 0;
  const riskLevel = verdict?.risk_level ?? (riskScore >= 70 ? 'high' : riskScore >= 35 ? 'medium' : 'low');
  const headline = verdict?.headline ?? 'Finn completed the scam check.';
  const reasonItems = (verdict?.reasons ?? reasons ?? []).map(reason => (
    typeof reason === 'string'
      ? { headline: reason, detail: '', severity: riskLevel }
      : reason
  ));
  const safeActions = verdict?.safe_actions ?? [];
  const isHigh = riskLevel === 'high';
  const isMedium = riskLevel === 'medium';
  const riskColor = isHigh ? '#e11d48' : isMedium ? '#f59e0b' : '#10b981';
  const resultTitle = isHigh ? 'Scam risk found' : isMedium ? 'Review before sending' : 'Looks low risk';

  const chartData = {
    datasets: [{
      data: [riskScore, 100 - riskScore],
      backgroundColor: [riskColor, '#eef2f7'],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    circumference: 280,
    rotation: 220,
    plugins: { tooltip: { enabled: false } },
    animation: { animateScale: true, duration: 650 },
  };

  return (
    <div className="screen-enter absolute inset-0 bg-[#f6f7fb] p-5 z-40 overflow-y-auto no-scrollbar">
      <div className="rounded-[2rem] bg-white border border-slate-100 p-5 shadow-sm text-center">
        <p className="text-[11px] font-black text-slate-400 uppercase">bunqAI by Finn</p>
        <h2 className="text-3xl font-black mt-1 bunq-text-gradient tracking-normal">{resultTitle}</h2>
        <div className="relative w-[168px] h-[168px] mx-auto mt-5">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
            <span className={`${isHigh ? 'text-rose-600' : isMedium ? 'text-amber-500' : 'text-emerald-600'} text-4xl font-black`}>{riskScore}%</span>
            <span className="text-[10px] font-black text-slate-400 uppercase">risk score</span>
          </div>
        </div>
        <p className="text-sm font-black text-slate-800 mt-4">{headline}</p>
        {verdict?.confidence && (
          <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Confidence: {verdict.confidence}</p>
        )}
      </div>

      <div className={`mt-4 rounded-3xl border p-5 shadow-sm ${isHigh ? 'bg-rose-50 border-rose-100' : isMedium ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
        <div className="flex items-center gap-2 mb-3">
          {isHigh ? <TriangleAlert className="w-5 h-5 text-rose-600" /> : isMedium ? <ShieldAlert className="w-5 h-5 text-amber-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          <h3 className={`text-sm font-black ${isHigh ? 'text-rose-900' : isMedium ? 'text-amber-900' : 'text-emerald-900'}`}>Finn findings</h3>
        </div>
        <ul className="space-y-3">
          {reasonItems.map((reason, i) => (
            <li key={i} className="flex gap-3 text-xs text-slate-700 font-bold leading-relaxed">
              <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${isHigh ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span>
                <span className="block text-slate-900">{reason.headline}</span>
                {reason.detail && <span className="block text-slate-600 font-semibold mt-0.5">{reason.detail}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {safeActions.length > 0 && (
        <div className="mt-4 rounded-3xl bg-white border border-slate-100 p-4 shadow-sm space-y-3">
          <p className="text-[11px] font-black text-slate-400 uppercase">Suggested actions</p>
          {safeActions.map(action => (
            <div key={action.action_id} className="rounded-2xl bg-slate-50 p-3">
              <p className="text-sm font-black text-slate-900">{action.label}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">{action.rationale}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-3xl bg-white border border-slate-100 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase">Recommendation</p>
            <p className="font-black text-slate-950 mt-1">
              {isHigh ? 'Stop and verify outside the call' : isMedium ? 'Verify details before sending' : 'Proceed carefully if details match'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-950 text-white grid place-items-center shrink-0">
            <PhoneOff className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3 pb-2">
        <button
          onClick={onStop}
          className="w-full bg-slate-950 text-white font-black py-4 rounded-3xl shadow-lg hover:bg-slate-800 transition flex justify-center items-center gap-2"
        >
          <Ban className="w-5 h-5" />Stop payment
        </button>
        <button
          onClick={onContinue}
          className="w-full bg-white text-slate-600 font-black py-4 rounded-3xl text-sm hover:bg-slate-50 transition border border-slate-100"
        >
          Continue at own risk
        </button>
      </div>
    </div>
  );
}
