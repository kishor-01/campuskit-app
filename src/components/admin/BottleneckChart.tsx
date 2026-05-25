'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export type BottleneckData = {
  title: string;
  unlocked: number;
  completed: number;
};

interface BottleneckChartProps {
  data: BottleneckData[];
}

export default function BottleneckChart({ data }: BottleneckChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full rounded-2xl border border-slate-800/40 bg-slate-900/20 py-12">
        <p className="text-slate-500 text-sm font-semibold mb-1">No Bottleneck Data</p>
        <p className="text-slate-600 text-xs">Users have not unlocked enough nodes to form a bottleneck.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[320px] pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="title" 
            stroke="#64748b" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dy={8}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            allowDecimals={false}
            dx={-8}
          />
          <Tooltip 
            cursor={{ fill: '#0f172a', opacity: 0.4 }}
            contentStyle={{ 
              backgroundColor: '#020817', 
              borderColor: '#1e293b',
              borderRadius: '12px',
              fontSize: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
            }}
            itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
          />
          <Legend 
            iconType="circle" 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
          />
          <Bar dataKey="unlocked" name="Attempting (Unlocked)" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={48} />
          <Bar dataKey="completed" name="Conquered (Completed)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
