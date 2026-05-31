import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import RichTextEditor from '../components/RichTextEditor';
import CollaboratorPanel from '../components/CollaboratorPanel';
import VersionHistory from '../components/VersionHistory';
import ActivityTimeline from '../components/ActivityTimeline';
import OfflineIndicator from '../components/OfflineIndicator';
import { useSocket } from '../hooks/useSocket';
import {
  Save,
  Users,
  History,
  Activity,
  FileEdit,
  Loader2,
  CheckCircle,
  Star,
  FilePlus,
  Copy,
  Trash2,
  Printer,
  Undo2,
  Redo2,
  Link2,
  Bold,
  Italic,
  Underline,
  BookOpen,
  Eraser,
  FileText,
  ChevronLeft,
  MoreHorizontal,
  X,
  Share2,
  Clock,
  Zap,
} from 'lucide-react';

const Editor = () => {
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const [docDetails, setDocDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [activeCollaborators, setActiveCollaborators] = useState([]);
  const [activities, setActivities] = useState([]);
  const [titleInput, setTitleInput] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [isStarred, setIsStarred] = useState(false);
  const titleInputRef = useRef(null);

  const addActivity = (type, message) => {
    setActivities(prev => [{ type, message, timestamp: Date.now() }, ...prev]);
  };

  const handleRenameClick = () => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  };

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const { data } = await API.get(`/documents/${documentId}`);
        setDocDetails(data);
        setTitleInput(data.title);
      } catch (err) {
        alert(err.response?.data?.message || 'Access denied or not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [documentId]);

  const socketHandlers = {
    'user:joined': ({ collaborators }) => {
      setActiveCollaborators(collaborators);
      addActivity('join', 'A collaborator joined the document');
    },
    'user:left': ({ collaborators }) => {
      setActiveCollaborators(collaborators);
      addActivity('leave', 'A collaborator left the document');
    },
    'cursor:moved': ({ socketId, name, cursor, isTyping }) => {
      setActiveCollaborators((prev) =>
        prev.map((c) =>
          c.socketId === socketId ? { ...c, cursor, isTyping } : c
        )
      );
    },
    'version:created': () => {
      setSaveSuccess(true);
      addActivity('save', 'Version history snapshot saved');
      setTimeout(() => setSaveSuccess(false), 2000);
    },
  };

  const { socket, emit } = useSocket(documentId, socketHandlers);

  const handleTitleSave = async () => {
    if (!titleInput.trim() || titleInput === docDetails?.title) return;
    try {
      setDocDetails((prev) => ({ ...prev, title: titleInput }));
      await API.put(`/documents/${documentId}`, { title: titleInput });
    } catch (err) {
      console.error('Failed to save title:', err);
    }
  };

  const handleNewDoc = async () => {
    try {
      const { data } = await API.post('/documents', { title: 'Untitled Document' });
      navigate(`/documents/${data._id}`);
      window.location.reload();
    } catch (err) { alert('Failed to create new document'); }
  };

  const handleDuplicateDoc = async () => {
    try {
      const { data } = await API.post(`/documents/${documentId}/duplicate`);
      navigate(`/documents/${data._id}`);
      window.location.reload();
    } catch (err) { alert('Failed to duplicate document'); }
  };

  const handleDeleteDoc = async () => {
    if (!window.confirm('Are you sure you want to move this document to trash?')) return;
    try {
      await API.delete(`/documents/${documentId}`);
      navigate('/');
    } catch (err) { alert('Failed to delete document'); }
  };

  const handleWordCount = () => {
    if (window.__quill) {
      const text = window.__quill.getText() || '';
      const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
      const chars = text.length;
      alert(`Word Count: ${words} words\nCharacter Count: ${chars} characters`);
    } else { alert('Editor not loaded.'); }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter link URL:');
    if (url && window.__quill) {
      window.__quill.focus();
      const range = window.__quill.getSelection();
      if (range) { window.__quill.format('link', url); }
      else { alert('Please place your cursor or highlight text to insert a link.'); }
    }
  };

  const triggerFormat = (type) => {
    if (window.__quill) {
      window.__quill.focus();
      const current = window.__quill.getFormat()[type];
      window.__quill.format(type, !current);
    }
  };

  const handleClearFormatting = () => {
    if (window.__quill) {
      window.__quill.focus();
      const range = window.__quill.getSelection();
      if (range) { window.__quill.removeFormat(range.index, range.length); }
      else { window.__quill.removeFormat(0, window.__quill.getLength()); }
    }
  };

  const handleSaveSnapshot = () => {
    if (!window.__getYjsDocState) return;
    setSaving(true);
    const contentState = window.__getYjsDocState();
    emit('save:document', { documentId, content: contentState });
    setTimeout(() => { setSaving(false); }, 1000);
  };

  const handleVersionRestored = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center animate-pulse">
            <FileText className="h-6 w-6 text-white" />
          </div>
        </div>
        <span className="text-sm text-slate-400 font-medium">Loading workspace...</span>
      </div>
    );
  }

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  // Menu item component
  const MenuItem = ({ icon: Icon, label, shortcut, onClick, danger }) => (
    <div
      onClick={() => { onClick?.(); setActiveMenu(null); }}
      className={`flex items-center px-3 py-2 cursor-pointer text-[13px] transition-colors ${
        danger ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:bg-white/5'
      }`}
    >
      <Icon className={`h-4 w-4 mr-3 ${danger ? 'text-red-400' : 'text-slate-500'}`} />
      <span className="flex-grow">{label}</span>
      {shortcut && <span className="text-[10px] text-slate-600 ml-4 font-mono">{shortcut}</span>}
    </div>
  );

  const DropdownMenu = ({ children }) => (
    <div className="absolute left-0 top-full mt-1 w-56 bg-[#1e1e2e] border border-white/10 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.4)] py-1.5 z-[60] backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );

  const MenuDivider = () => <hr className="border-white/8 my-1 mx-2" />;

  return (
    <div className="min-h-screen bg-[#0f0f14] text-white flex flex-col h-screen overflow-hidden" onClick={() => setActiveMenu(null)}>
      
      {/* ═══════════ TOP HEADER BAR ═══════════ */}
      <header className="bg-[#16161e] border-b border-white/8 px-3 sm:px-4 flex flex-col relative z-50 shrink-0">
        
        {/* Primary Row: Logo, Title, Actions */}
        <div className="flex items-center justify-between h-12 gap-3">
          
          {/* Left: Back + Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={() => navigate('/')}
              className="shrink-0 p-1.5 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer"
              title="Back to Dashboard"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
              <FileText className="h-3.5 w-3.5 text-white" />
            </div>

            <input
              ref={titleInputRef}
              type="text"
              className="bg-transparent border-none text-[15px] font-semibold text-white focus:outline-none focus:bg-white/5 rounded px-2 py-1 min-w-0 flex-1 max-w-[260px] truncate transition-all placeholder:text-slate-600"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
            />

            <button
              onClick={() => setIsStarred(!isStarred)}
              className="p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <Star className={`h-4 w-4 ${isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-600 hover:text-slate-400'}`} />
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 ml-1 shrink-0">
              <Clock className="h-3 w-3" />
              <span>Auto-saved</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Avatar Stack */}
            <div className="hidden sm:flex items-center -space-x-2 mr-1">
              {activeCollaborators.slice(0, 3).map((collab, index) => {
                const colors = ['from-blue-400 to-blue-600', 'from-emerald-400 to-emerald-600', 'from-purple-400 to-purple-600'];
                return (
                  <div
                    key={collab.email}
                    title={`${collab.name} (${collab.email})`}
                    className={`h-7 w-7 rounded-full bg-gradient-to-br ${colors[index % 3]} border-2 border-[#16161e] flex items-center justify-center text-white font-bold text-[10px] select-none shadow-sm`}
                  >
                    {collab?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                );
              })}
              {activeCollaborators.length > 3 && (
                <div className="h-7 w-7 rounded-full border-2 border-[#16161e] bg-[#2a2a3a] text-slate-400 flex items-center justify-center text-[10px] font-bold">
                  +{activeCollaborators.length - 3}
                </div>
              )}
            </div>

            <button
              onClick={handleSaveSnapshot}
              disabled={saving}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : saveSuccess ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">{saveSuccess ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={() => setActiveTab(activeTab === 'collaborators' ? '' : 'collaborators')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-1.5 px-4 rounded-lg text-xs transition-all cursor-pointer shadow-md shadow-violet-600/20 shrink-0"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Panel Toggles */}
            <div className="flex items-center bg-white/5 border border-white/8 rounded-lg p-0.5 gap-0.5 shrink-0">
              {[
                { key: 'collaborators', icon: Users, tip: 'People' },
                { key: 'versions', icon: History, tip: 'History' },
                { key: 'activity', icon: Activity, tip: 'Activity' },
              ].map(({ key, icon: Icon, tip }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(activeTab === key ? '' : key)}
                  className={`p-1.5 rounded-md flex items-center justify-center cursor-pointer transition-all ${
                    activeTab === key
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                  title={tip}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Row: Menu bar */}
        <div className="flex items-center gap-0.5 h-8 text-[12px] text-slate-400 font-medium select-none -ml-1 overflow-x-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
          {[
            {
              label: 'File',
              key: 'file',
              items: (
                <DropdownMenu>
                  <MenuItem icon={FilePlus} label="New Document" onClick={handleNewDoc} />
                  <MenuItem icon={Copy} label="Make a copy" onClick={handleDuplicateDoc} />
                  <MenuItem icon={FileEdit} label="Rename" onClick={handleRenameClick} />
                  <MenuItem icon={History} label="Version history" onClick={() => setActiveTab('versions')} />
                  <MenuDivider />
                  <MenuItem icon={Printer} label="Print" shortcut="⌘P" onClick={() => window.print()} />
                  <MenuDivider />
                  <MenuItem icon={Trash2} label="Move to bin" onClick={handleDeleteDoc} danger />
                </DropdownMenu>
              ),
            },
            {
              label: 'Edit',
              key: 'edit',
              items: (
                <DropdownMenu>
                  <MenuItem icon={Undo2} label="Undo" shortcut="⌘Z" onClick={() => window.__quill?.history.undo()} />
                  <MenuItem icon={Redo2} label="Redo" shortcut="⌘Y" onClick={() => window.__quill?.history.redo()} />
                </DropdownMenu>
              ),
            },
            {
              label: 'View',
              key: 'view',
              items: (
                <DropdownMenu>
                  <MenuItem icon={Users} label="Collaborators" onClick={() => setActiveTab('collaborators')} />
                  <MenuItem icon={History} label="Version History" onClick={() => setActiveTab('versions')} />
                  <MenuItem icon={Activity} label="Activity Timeline" onClick={() => setActiveTab('activity')} />
                </DropdownMenu>
              ),
            },
            {
              label: 'Insert',
              key: 'insert',
              items: (
                <DropdownMenu>
                  <MenuItem icon={Link2} label="Link" shortcut="⌘K" onClick={handleInsertLink} />
                </DropdownMenu>
              ),
            },
            {
              label: 'Format',
              key: 'format',
              items: (
                <DropdownMenu>
                  <MenuItem icon={Bold} label="Bold" shortcut="⌘B" onClick={() => triggerFormat('bold')} />
                  <MenuItem icon={Italic} label="Italic" shortcut="⌘I" onClick={() => triggerFormat('italic')} />
                  <MenuItem icon={Underline} label="Underline" shortcut="⌘U" onClick={() => triggerFormat('underline')} />
                  <MenuDivider />
                  <MenuItem icon={Eraser} label="Clear formatting" shortcut="⌘\\" onClick={handleClearFormatting} />
                </DropdownMenu>
              ),
            },
            {
              label: 'Tools',
              key: 'tools',
              items: (
                <DropdownMenu>
                  <MenuItem icon={BookOpen} label="Word count" shortcut="⌘⇧C" onClick={handleWordCount} />
                </DropdownMenu>
              ),
            },
          ].map(({ label, key, items }) => (
            <div key={key} className="relative">
              <span
                onClick={(e) => { e.stopPropagation(); toggleMenu(key); }}
                className={`px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                  activeMenu === key ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                {label}
              </span>
              {activeMenu === key && items}
            </div>
          ))}
        </div>
      </header>

      {/* ═══════════ MAIN EDITOR + PANEL ═══════════ */}
      <div className="flex-1 flex overflow-hidden">
        <RichTextEditor
          documentId={documentId}
          socket={socket}
          emit={emit}
        />

        {/* Side Panel with slide animation */}
        {activeTab && (
          <div className="animate-[slideIn_0.2s_ease-out]" style={{ animation: 'slideIn 0.2s ease-out' }}>
            {activeTab === 'collaborators' && (
              <CollaboratorPanel 
                collaborators={activeCollaborators} 
                documentId={documentId}
                docDetails={docDetails}
                setDocDetails={setDocDetails}
              />
            )}
            {activeTab === 'versions' && (
              <VersionHistory
                documentId={documentId}
                onVersionRestored={handleVersionRestored}
              />
            )}
            {activeTab === 'activity' && (
              <ActivityTimeline activities={activities} />
            )}
          </div>
        )}
      </div>
      
      <OfflineIndicator />
    </div>
  );
};

export default Editor;
// 
