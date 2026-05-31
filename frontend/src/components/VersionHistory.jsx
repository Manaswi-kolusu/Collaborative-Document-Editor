import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { History, RotateCcw, Calendar, User, Loader2, Clock, Search, Eye } from 'lucide-react';

const AVATAR_COLORS = [
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-purple-400 to-purple-600',
  'from-rose-400 to-rose-600',
  'from-amber-400 to-amber-600',
  'from-cyan-400 to-cyan-600',
];

const VersionHistory = ({ documentId, onVersionRestored }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchVersions(); }, [documentId]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/documents/${documentId}/versions`);
      setVersions(data);
    } catch (err) { console.error('Failed to load versions:', err); }
    finally { setLoading(false); }
  };

  const handleRestore = async (versionId) => {
    if (!window.confirm('Restore this version? Current content will be saved first.')) return;
    setRestoringId(versionId);
    try {
      const { data } = await API.post(`/documents/${documentId}/versions/${versionId}/restore`);
      onVersionRestored(data.content);
      fetchVersions();
    } catch (err) { alert(err.response?.data?.message || 'Failed to restore version'); }
    finally { setRestoringId(null); }
  };

  const getRelativeTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const filtered = versions.filter(v => {
    if (!searchQuery) return true;
    return (v.editedBy?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-[320px] bg-[#16161e] border-l border-white/8 flex flex-col h-full select-none overflow-hidden">
      
      <div className="px-5 pt-4 pb-3 border-b border-white/8">
        <h3 className="text-sm font-bold text-white mb-2">Version History</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/8 focus:border-violet-500/30 rounded-lg py-2 pl-9 pr-3 text-[11px] text-white focus:outline-none transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
            <span className="text-[11px] text-slate-500">Loading...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="h-5 w-5 text-slate-700 mx-auto mb-2" />
            <p className="text-[11px] text-slate-500">No snapshots yet.</p>
          </div>
        ) : (
          filtered.map((ver, idx) => {
            const gradient = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const isLatest = idx === 0;
            const isSelected = selectedVersion === ver._id;
            return (
              <div
                key={ver._id}
                onClick={() => setSelectedVersion(isSelected ? null : ver._id)}
                className={`px-3 py-3 rounded-xl cursor-pointer transition-all border ${
                  isSelected ? 'bg-violet-600/10 border-violet-500/30' : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 h-8 w-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-[10px] mt-0.5`}>
                    {(ver.editedBy?.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[12px] font-semibold text-white truncate">{ver.editedBy?.name || 'Unknown'}</h4>
                      <span className="text-[10px] text-slate-600 shrink-0">{getRelativeTime(ver.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Version snapshot</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {isLatest && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">Current</span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(ver.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <button
                          disabled={restoringId !== null}
                          onClick={(e) => { e.stopPropagation(); handleRestore(ver._id); }}
                          className="w-full bg-white/5 hover:bg-violet-600/15 text-violet-300 text-[11px] font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer border border-white/8 hover:border-violet-500/20"
                        >
                          {restoringId === ver._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                          Restore
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {versions.length > 0 && (
        <div className="px-5 py-3 border-t border-white/8">
          <button className="w-full flex items-center justify-center gap-2 text-violet-400 text-[11px] font-semibold hover:bg-violet-600/10 rounded-lg py-2 transition-colors cursor-pointer">
            <Eye className="h-3.5 w-3.5" />
            View Full Log
          </button>
        </div>
      )}
    </div>
  );
};

export default VersionHistory;
