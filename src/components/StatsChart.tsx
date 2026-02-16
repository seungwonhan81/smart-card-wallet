import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BusinessCardData, CardGroup } from '../types';

interface StatsChartProps {
  cards: BusinessCardData[];
}

// Map Tailwind classes to Hex codes for Recharts
const COLOR_MAP: Record<CardGroup, string> = {
  [CardGroup.WORK]: '#3b82f6',   // blue-500
  [CardGroup.FRIEND]: '#22c55e', // green-500
  [CardGroup.FAMILY]: '#ec4899', // pink-500
  [CardGroup.OTHER]: '#6b7280',   // gray-500
};

export const StatsChart: React.FC<StatsChartProps> = ({ cards }) => {
  
  const data = Object.values(CardGroup).map(group => ({
    name: group,
    value: cards.filter(c => c.group === group).length
  })).filter(item => item.value > 0);

  const totalCards = cards.length;

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">명함 통계</h1>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
            <h2 className="text-slate-500 text-sm font-medium mb-1">총 저장된 명함</h2>
            <p className="text-4xl font-bold text-slate-900">{totalCards}<span className="text-lg font-normal text-slate-400 ml-1">개</span></p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
            <h3 className="text-lg font-bold text-slate-800 mb-4">그룹별 분포</h3>
            
            {totalCards === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400">
                    데이터가 없습니다.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.name as CardGroup]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
             {data.map((item) => (
                 <div key={item.name} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_MAP[item.name as CardGroup] }}></div>
                         <span className="font-medium text-slate-700">{item.name}</span>
                     </div>
                     <span className="font-bold text-slate-900">{item.value}</span>
                 </div>
             ))}
        </div>
    </div>
  );
};