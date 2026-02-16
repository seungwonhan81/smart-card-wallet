import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BusinessCardData, CardGroup } from '../types';

interface StatsChartProps {
  cards: BusinessCardData[];
}

const COLOR_MAP: Record<CardGroup, string> = {
  [CardGroup.WORK]: '#3b82f6',
  [CardGroup.FRIEND]: '#10b981',
  [CardGroup.FAMILY]: '#fb7185',
  [CardGroup.OTHER]: '#94a3b8',
};

export const StatsChart: React.FC<StatsChartProps> = ({ cards }) => {
  const data = Object.values(CardGroup).map(group => ({
    name: group,
    value: cards.filter(c => c.group === group).length
  })).filter(item => item.value > 0);

  const totalCards = cards.length;

  return (
    <div className="px-5 pt-14 pb-28 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-slate-400 font-medium mb-1">Overview</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">통계</h1>
      </div>

      {/* Total Card */}
      <div className="bg-slate-900 rounded-2xl p-6 mb-6">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">총 저장된 명함</p>
        <p className="text-5xl font-bold text-white tracking-tight">
          {totalCards}
          <span className="text-lg font-normal text-slate-500 ml-1">개</span>
        </p>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 mb-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-6">그룹별 분포</h3>

        {totalCards === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-300 text-sm">
            데이터가 없습니다
          </div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.name as CardGroup]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    fontSize: '13px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Group Breakdown */}
      <div className="space-y-2">
        {Object.values(CardGroup).map((group) => {
          const count = cards.filter(c => c.group === group).length;
          const percentage = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
          return (
            <div key={group} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_MAP[group] }}></div>
                <span className="text-sm font-medium text-slate-700">{group}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: COLOR_MAP[group] }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-slate-900 w-8 text-right">{count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
