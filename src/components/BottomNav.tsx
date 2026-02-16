import React from 'react';
import { Home, Camera, BarChart2 } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-4 mb-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/60">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            onClick={() => onChangeView('HOME')}
            className={`flex flex-col items-center justify-center gap-0.5 px-6 py-2 rounded-xl transition-all duration-200 ${
              currentView === 'HOME'
                ? 'text-slate-900 bg-slate-100'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home size={20} strokeWidth={currentView === 'HOME' ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">홈</span>
          </button>

          <button
            onClick={() => onChangeView('SCAN')}
            className="flex flex-col items-center justify-center -mt-8"
          >
            <div className={`flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg transition-all duration-200 ${
              currentView === 'SCAN'
                ? 'bg-slate-900 shadow-slate-900/30 scale-105'
                : 'bg-slate-900 shadow-slate-900/20 hover:scale-105 active:scale-95'
            }`}>
              <Camera size={24} color="white" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium text-slate-400 mt-1.5">스캔</span>
          </button>

          <button
            onClick={() => onChangeView('STATS')}
            className={`flex flex-col items-center justify-center gap-0.5 px-6 py-2 rounded-xl transition-all duration-200 ${
              currentView === 'STATS'
                ? 'text-slate-900 bg-slate-100'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart2 size={20} strokeWidth={currentView === 'STATS' ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">통계</span>
          </button>
        </div>
      </div>
    </div>
  );
};
