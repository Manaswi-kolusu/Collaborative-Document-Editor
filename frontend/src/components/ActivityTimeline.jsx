import React from 'react';
import { Activity, LogIn, LogOut, Save, Edit3, Clock } from 'lucide-react';

const ActivityTimeline = ({ activities = [] }) => {

  const getRelativeTime = (ts) => {
    const diff = Date.now() - ts;
    const secs = Math.floor(diff / 1000);
    if (secs < 10) return 'Just now';
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const getConfig = (type) => {
    const map = {
      join: { icon: LogIn, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
      leave: { icon: LogOut, color: 'text-rose-400', bg: 'bg-rose-500/15' },
      save: { icon: Save, color: 'text-blue-400', bg: 'bg-blue-500/15' },
      edit: { icon: Edit3, color: 'text-amber-400', bg: 'bg-amber-500/15' },
    };
    return map[type] || map.edit;
  };

  return (
    <div className="w-[320px] bg-[#16161e] border-l border-white/8 flex flex-col h-full select-none overflow-hidden">
      
      <div className="px-5 pt-4 pb-3 border-b border-white/8">
        <h3 className="text-sm font-bold text-white">Activity</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">{activities.length} events this session</p>
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {activities.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="h-5 w-5 text-slate-700 mx-auto mb-2" />
            <p className="text-[11px] text-slate-500">No recent activity.</p>
            <p className="text-[10px] text-slate-600 mt-1">Events appear as they happen.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((act, idx) => {
              const config = getConfig(act.type);
              const Icon = config.icon;
              return (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors relative">
                  {idx !== activities.length - 1 && (
                    <div className="absolute left-[22px] top-10 bottom-[-4px] w-px bg-white/5" />
                  )}
                  <div className={`shrink-0 w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center z-10`}>
                    <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[12px] text-slate-200 font-medium leading-snug">{act.message}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{getRelativeTime(act.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
