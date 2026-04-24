import { useEffect, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement } from 'chart.js';
import { TriangleAlert, PhoneOff, Ban } from 'lucide-react';

ChartJS.register(ArcElement);

export default function AnalysisResultScreen({ score, reasons, onStop, onContinue }) {
  const chartData = {
    datasets: [{
      data: [score, 100 - score],
      backgroundColor: ['#e11d48', '#eef2f7'],
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
        <h2 className="text-3xl font-black mt-1 bunq-text-gradient tracking-normal">Scam risk found</h2>
        <div className="relative w-[168px] h-[168px] mx-auto mt-5">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
            <span className="text-4xl font-black text-rose-600">{score}%</span>
            <span className="text-[10px] font-black text-slate-400 uppercase">risk score</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-3xl bg-rose-50 border border-rose-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <TriangleAlert className="w-5 h-5 text-rose-600" />
          <h3 className="text-sm font-black text-rose-900">Finn findings</h3>
        </div>
        <ul className="space-y-3">
          {reasons.map((r, i) => (
            <li key={i} className="flex gap-3 text-xs text-slate-700 font-bold leading-relaxed">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-rose-500 shrink-0" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-3xl bg-white border border-slate-100 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase">Recommendation</p>
            <p className="font-black text-slate-950 mt-1">Stop and verify outside the call</p>
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
