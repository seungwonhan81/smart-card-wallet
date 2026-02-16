import React from 'react';
import { Home, Camera, BarChart2 } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe-area shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        <button 
          onClick={() => onChangeView('HOME')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'HOME' ? 'text-brand-600' : 'text-gray-500'}`}
        >
          <Home size={24} />
          <span className="text-xs font-medium">홈</span>
        </button>
        
        <button 
          onClick={() => onChangeView('SCAN')}
          className="flex flex-col items-center justify-center w-full h-full -mt-6"
        >
          <div className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform ${currentView === 'SCAN' ? 'bg-brand-700 scale-110' : 'bg-brand-600 hover:scale-105'}`}>
            <Camera size={28} color="white" />
          </div>
          <span className="text-xs font-medium text-gray-500 mt-1">촬영</span>
        </button>

        <button 
          onClick={() => onChangeView('STATS')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === 'STATS' ? 'text-brand-600' : 'text-gray-500'}`}
        >
          <BarChart2 size={24} />
          <span className="text-xs font-medium">통계</span>
        </button>
      </div>
    </div>
  );
};