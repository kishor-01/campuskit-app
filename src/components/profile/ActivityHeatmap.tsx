'use client';

import { useMemo } from 'react';
import { subDays, format, isSameDay, eachDayOfInterval } from 'date-fns';
import { motion } from 'framer-motion';

export interface HeatmapEvent {
  id: string;
  eventType: string;
  createdAt: Date;
}

interface ActivityHeatmapProps {
  events: HeatmapEvent[];
}

export default function ActivityHeatmap({ events }: ActivityHeatmapProps) {
  const days = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 29); // 30 days total including today
    return eachDayOfInterval({ start, end });
  }, []);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-muted/30';
    if (count <= 2) return 'bg-primary/40';
    if (count <= 5) return 'bg-primary/70';
    return 'bg-primary';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Contribution Activity</h3>
        <span className="text-xs text-muted-foreground">Last 30 Days</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {days.map((day, index) => {
          // Count events that occurred on this day
          const dayEvents = events.filter(event => isSameDay(new Date(event.createdAt), day));
          const count = dayEvents.length;
          
          return (
            <motion.div
              key={day.toISOString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
              title={`${format(day, 'MMM d, yyyy')}: ${count} contributions`}
              className={`w-4 h-4 rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-primary ${getIntensity(count)}`}
            />
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-muted/30" />
        <div className="w-3 h-3 rounded-sm bg-primary/40" />
        <div className="w-3 h-3 rounded-sm bg-primary/70" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}
