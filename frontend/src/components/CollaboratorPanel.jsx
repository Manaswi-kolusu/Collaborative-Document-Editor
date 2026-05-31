import React, { useState } from 'react';
import { Users, UserPlus, ShieldAlert, Check, Copy, Crown, Circle, Mail, Send, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import API from '../services/api';

const AVATAR_GRADIENTS = [
  'from-violet-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-600',
  'from-sky-400 to-blue-600',
  'from-fuchsia-400 to-purple-600',
];

const CollaboratorPanel = ({ 
  collaborators = [], 
  documentId, 
  docDetails, 
  setDocDetails 
}) => {
  const { user: currentUser } = useAuthStore();
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Use toString() to ensure proper comparison of MongoDB ObjectIds
  const isOwner = docDetails?.owner?._id?.toString() === currentUser?._id?.toString();
  const inviteLink = docDetails?.inviteToken 
    ? `${window.location.origin}/invite/${documentId}/${docDetails.inviteToken}`
    : null;

  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleShareByEmail = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) return;
    setShareLoading(true);
    setShareError(null);
    try {
      const { data } = await API.post(`/documents/${documentId}/share`, { email: shareEmail.trim() });
      setDocDetails(data);
      setShareEmail('');
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    } catch (err) {
      setShareError(err.response?.data?.message || 'Failed to share');
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="w-[320px] bg-[#16161e] border-l border-white/8 flex flex-col h-full select-none overflow-hidden">
      
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-white/8">
        <h3 className="text-sm font-bold text-white">People</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">{collaborators.length} online · {1 + (docDetails?.collaborators?.length || 0)} members</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

        {/* Share Section */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <UserPlus className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Invite</span>
          </div>

          {isOwner ? (
            <div className="space-y-3">
              {/* Share by Email */}
              <div>
                <p className="text-[11px] text-slate-500 mb-2">Add by email address</p>
                <form onSubmit={handleShareByEmail} className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-600" />
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={shareEmail}
                      onChange={(e) => { setShareEmail(e.target.value); setShareError(null); }}
                      className="w-full bg-white/5 border border-white/8 rounded-lg pl-8 pr-3 py-2 text-[11px] text-white focus:outline-none focus:border-violet-500/30 transition-all placeholder:text-slate-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={shareLoading || !shareEmail.trim()}
                    className="shrink-0 p-2 rounded-lg bg-violet-600/15 text-violet-300 border border-violet-500/20 hover:bg-violet-600/25 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    {shareSuccess ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Send className="h-3.5 w-3.5" />}
                  </button>
                </form>
                {shareError && (
                  <p className="text-[10px] text-red-400 mt-1.5 flex items-center gap-1">
                    <X className="h-3 w-3" /> {shareError}
                  </p>
                )}
                {shareSuccess && (
                  <p className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Collaborator added!
                  </p>
                )}
              </div>

              {/* Invite Link */}
              {inviteLink && (
                <div>
                  <p className="text-[11px] text-slate-500 mb-2">Or share invite link</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/5 border border-white/8 rounded-lg px-3 py-2 overflow-hidden">
                      <p className="text-[10px] text-slate-400 truncate font-mono select-all" title={inviteLink}>
                        {inviteLink}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className={`shrink-0 px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        linkCopied
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-violet-600/15 text-violet-300 border border-violet-500/20 hover:bg-violet-600/25'
                      }`}
                    >
                      {linkCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {linkCopied ? 'Done' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/15 rounded-lg p-3">
              <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                Only <strong className="text-amber-300">{docDetails?.owner?.name || 'the owner'}</strong> can share this document.
              </p>
            </div>
          )}
        </div>

        {/* Online Now */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Circle className="h-2 w-2 text-emerald-400 fill-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Online</span>
            </div>
            <span className="text-[10px] text-violet-400 font-bold bg-violet-500/15 px-2 py-0.5 rounded-full">
              {collaborators.length}
            </span>
          </div>

          <div className="space-y-1">
            {collaborators.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-5 w-5 text-slate-700 mx-auto mb-2" />
                <p className="text-[11px] text-slate-600">No one else is here yet.</p>
              </div>
            ) : (
              collaborators.map((collab, idx) => {
                const gradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
                return (
                  <div key={collab.email || idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="relative shrink-0">
                      <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-[11px] shadow-sm`}>
                        {collab?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#16161e]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[12px] font-semibold text-white truncate">{collab.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{collab.email}</p>
                    </div>
                    {collab.isTyping && (
                      <div className="flex gap-0.5 items-center px-2 py-1 bg-violet-500/15 rounded-full shrink-0">
                        <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]"></span>
                        <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]"></span>
                        <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]"></span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Access */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-3 w-3 text-amber-400" />
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Access</span>
          </div>

          <div className="space-y-1">
            {docDetails?.owner && (
              <div className="flex items-center gap-3 p-2 rounded-xl">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                  {docDetails.owner.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-white truncate">{docDetails.owner.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{docDetails.owner.email}</p>
                </div>
                <span className="text-[9px] text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded-full shrink-0">Owner</span>
              </div>
            )}

            {docDetails?.collaborators?.map((collab, idx) => (
              <div key={collab._id || collab.email || idx} className="flex items-center gap-3 p-2 rounded-xl">
                <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[(idx + 1) % AVATAR_GRADIENTS.length]} flex items-center justify-center text-white font-bold text-[10px] shrink-0`}>
                  {collab?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-white truncate">{collab.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{collab.email}</p>
                </div>
                <span className="text-[9px] text-slate-400 font-medium bg-white/5 px-2 py-0.5 rounded-full shrink-0">Editor</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorPanel;
