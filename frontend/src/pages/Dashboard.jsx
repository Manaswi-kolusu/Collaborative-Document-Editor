import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import {
  Plus,
  FileText,
  Trash2,
  Copy,
  Share2,
  Edit3,
  Users,
  Clock,
  Loader2,
  X,
  Search,
  MoreVertical,
  SortAsc,
  LayoutGrid,
  List,
  Monitor,
  FolderOpen,
} from 'lucide-react';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Modals state
  const [shareDocId, setShareDocId] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState(null);

  const [renameDocId, setRenameDocId] = useState(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [renameError, setRenameError] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data } = await API.get('/documents');
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    setActionLoading(true);
    try {
      const { data } = await API.post('/documents', { title: 'Untitled Document' });
      navigate(`/documents/${data._id}`);
    } catch (err) {
      console.error('Failed to create document:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDocument = async (id, e) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setActionLoading(true);
    try {
      await API.delete(`/documents/${id}`);
      setDocuments(documents.filter((doc) => doc._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicateDocument = async (id, e) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    setActionLoading(true);
    try {
      const { data } = await API.post(`/documents/${id}/duplicate`);
      setDocuments([data, ...documents]);
    } catch (err) {
      alert(err.response?.data?.message || 'Duplicate failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openShareModal = (doc, e) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    setShareDocId(doc._id);
    setShareEmail('');
    setShareError(null);
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!shareEmail) return;
    try {
      await API.post(`/documents/${shareDocId}/share`, { email: shareEmail });
      setShareDocId(null);
      fetchDocuments();
    } catch (err) {
      setShareError(err.response?.data?.message || 'Sharing failed');
    }
  };

  const openRenameModal = (doc, e) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    setRenameDocId(doc._id);
    setRenameTitle(doc.title);
    setRenameError(null);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameTitle.trim()) return;
    try {
      await API.put(`/documents/${renameDocId}`, { title: renameTitle });
      setRenameDocId(null);
      fetchDocuments();
    } catch (err) {
      setRenameError(err.response?.data?.message || 'Rename failed');
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isOwner = doc.owner._id === user._id;
    let matchesTab = true;
    if (activeTab === 'owned') matchesTab = isOwner;
    if (activeTab === 'shared') matchesTab = !isOwner;
    return matchesSearch && matchesTab;
  });

  const sidebarItems = [
    { id: 'all', label: 'Documents', icon: FileText },
    { id: 'shared', label: 'Shared with me', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f9] text-[#202124] flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-[#f0f4f9] pt-4 pl-3 pr-2 flex flex-col gap-1 shrink-0 hidden lg:flex">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'all' && activeTab === 'owned');
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer w-full text-left ${
                  isActive
                    ? 'bg-[#d3e3fd] text-[#001d35]'
                    : 'text-[#444746] hover:bg-[#e8eaed]'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Template Section */}
          <div className="bg-[#f0f4f9] px-6 lg:px-10 pt-6 pb-5">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-sm font-medium text-[#202124] mb-4">Start a new document</h2>
              <div className="flex gap-5 items-start">
                {/* Blank Document Card */}
                <div className="group cursor-pointer" onClick={handleCreateDocument}>
                  <div className="w-[120px] h-[156px] bg-white border border-[#dadce0] rounded-md flex items-center justify-center hover:border-blue-500 transition-colors group-hover:shadow-md">
                    {actionLoading ? (
                      <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                    ) : (
                      <Plus className="h-12 w-12 text-blue-500" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-[#202124] mt-2.5 text-center">Blank</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-t-2xl min-h-[calc(100vh-340px)] px-6 lg:px-10 pt-6 pb-16 shadow-[0_-2px_6px_rgba(0,0,0,0.03)]">
            <div className="max-w-5xl mx-auto">
              {/* Header Row */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-[#202124]">Recent documents</h2>
                <div className="flex items-center gap-2">
                  {/* Mobile tabs */}
                  <div className="flex lg:hidden items-center gap-1 mr-2">
                    {['all', 'shared'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                          activeTab === tab
                            ? 'bg-[#d3e3fd] text-[#001d35]'
                            : 'text-[#444746] hover:bg-[#e8eaed]'
                        }`}
                      >
                        {tab === 'all' ? 'All' : 'Shared'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-[#e8eaed] text-[#202124]' : 'text-[#5f6368] hover:bg-[#f1f3f4]'}`}
                    title="List view"
                  >
                    <List className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-[#e8eaed] text-[#202124]' : 'text-[#5f6368] hover:bg-[#f1f3f4]'}`}
                    title="Grid view"
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-3 text-[#5f6368]">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="text-sm font-medium">Loading workspace...</span>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="bg-[#f1f3f4] p-5 rounded-full mb-4">
                    <FolderOpen className="h-10 w-10 text-[#9aa0a6]" />
                  </div>
                  <h3 className="text-base font-medium text-[#202124] mb-1">No documents found</h3>
                  <p className="text-sm text-[#5f6368] max-w-sm">
                    {searchQuery
                      ? "We couldn't find anything matching your search."
                      : "Your workspace is empty. Click the blank template above to create a new document."}
                  </p>
                </div>
              ) : viewMode === 'list' ? (
                /* ============ LIST VIEW ============ */
                <div>
                  {/* Table Header */}
                  <div className="grid grid-cols-[1fr_160px_160px] gap-4 px-4 py-2 border-b border-[#e0e0e0] text-xs font-medium text-[#5f6368] uppercase tracking-wide">
                    <span>Name</span>
                    <span>Owner</span>
                    <span>Last opened</span>
                  </div>

                  {/* Table Rows */}
                  {filteredDocuments.map((doc) => {
                    const isOwner = doc.owner._id === user._id;
                    return (
                      <div
                        key={doc._id}
                        onClick={() => navigate(`/documents/${doc._id}`)}
                        className="group grid grid-cols-[1fr_160px_160px] gap-4 items-center px-4 py-3 border-b border-[#f1f3f4] hover:bg-[#f8f9fa] cursor-pointer transition-colors rounded-lg"
                      >
                        {/* Name */}
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                          <span className="text-sm font-medium text-[#202124] truncate">{doc.title}</span>
                          {doc.collaborators.length > 0 && (
                            <span className="text-[10px] bg-[#e8eaed] text-[#5f6368] px-1.5 py-0.5 rounded font-medium shrink-0">
                              Shared
                            </span>
                          )}
                        </div>

                        {/* Owner */}
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] shrink-0 ${
                            isOwner ? 'bg-blue-500' : 'bg-emerald-500'
                          }`}>
                            {doc.owner?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-sm text-[#5f6368] truncate">
                            {isOwner ? 'Me' : doc.owner?.name?.split(' ')[0] || 'Unknown'}
                          </span>
                        </div>

                        {/* Last Opened */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#5f6368]">
                            {new Date(doc.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>

                          {/* Action dropdown */}
                          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === doc._id ? null : doc._id);
                              }}
                              className="p-1 hover:bg-[#e8eaed] rounded-full text-[#5f6368] transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {openDropdownId === doc._id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#dadce0] rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.12)] py-1.5 z-50 text-sm">
                                <div onClick={(e) => openRenameModal(doc, e)} className="flex items-center px-3 py-2 hover:bg-[#f1f3f4] cursor-pointer text-[#202124]">
                                  <Edit3 className="h-4 w-4 mr-3 text-[#5f6368]" /> Rename
                                </div>
                                <div onClick={(e) => handleDuplicateDocument(doc._id, e)} className="flex items-center px-3 py-2 hover:bg-[#f1f3f4] cursor-pointer text-[#202124]">
                                  <Copy className="h-4 w-4 mr-3 text-[#5f6368]" /> Duplicate
                                </div>
                                {isOwner && (
                                  <>
                                    <div onClick={(e) => openShareModal(doc, e)} className="flex items-center px-3 py-2 hover:bg-[#f1f3f4] cursor-pointer text-[#202124]">
                                      <Share2 className="h-4 w-4 mr-3 text-[#5f6368]" /> Share
                                    </div>
                                    <hr className="border-[#e0e0e0] my-1" />
                                    <div onClick={(e) => handleDeleteDocument(doc._id, e)} className="flex items-center px-3 py-2 hover:bg-red-50 text-red-600 cursor-pointer">
                                      <Trash2 className="h-4 w-4 mr-3" /> Delete
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <p className="text-center text-xs text-[#9aa0a6] mt-8 pb-4">
                    No more documents found in your primary workspace.
                  </p>
                </div>
              ) : (
                /* ============ GRID VIEW ============ */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredDocuments.map((doc) => {
                    const isOwner = doc.owner._id === user._id;
                    return (
                      <div
                        key={doc._id}
                        onClick={() => navigate(`/documents/${doc._id}`)}
                        className="group relative bg-white border border-[#dadce0] rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-blue-300"
                      >
                        {/* Card Preview */}
                        <div className="h-[140px] bg-[#f8f9fa] border-b border-[#e0e0e0] flex items-center justify-center relative">
                          <FileText className="h-12 w-12 text-[#dadce0]" />
                        </div>

                        {/* Card Content */}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-medium text-[#202124] truncate flex-1" title={doc.title}>
                              {doc.title}
                            </h3>
                            <div className="relative shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(openDropdownId === doc._id ? null : doc._id);
                                }}
                                className="p-1 hover:bg-[#e8eaed] rounded-full text-[#5f6368] opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {openDropdownId === doc._id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#dadce0] rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.12)] py-1.5 z-50 text-sm">
                                  <div onClick={(e) => openRenameModal(doc, e)} className="flex items-center px-3 py-2 hover:bg-[#f1f3f4] cursor-pointer text-[#202124]">
                                    <Edit3 className="h-4 w-4 mr-3 text-[#5f6368]" /> Rename
                                  </div>
                                  <div onClick={(e) => handleDuplicateDocument(doc._id, e)} className="flex items-center px-3 py-2 hover:bg-[#f1f3f4] cursor-pointer text-[#202124]">
                                    <Copy className="h-4 w-4 mr-3 text-[#5f6368]" /> Duplicate
                                  </div>
                                  {isOwner && (
                                    <>
                                      <div onClick={(e) => openShareModal(doc, e)} className="flex items-center px-3 py-2 hover:bg-[#f1f3f4] cursor-pointer text-[#202124]">
                                        <Share2 className="h-4 w-4 mr-3 text-[#5f6368]" /> Share
                                      </div>
                                      <hr className="border-[#e0e0e0] my-1" />
                                      <div onClick={(e) => handleDeleteDocument(doc._id, e)} className="flex items-center px-3 py-2 hover:bg-red-50 text-red-600 cursor-pointer">
                                        <Trash2 className="h-4 w-4 mr-3" /> Delete
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2.5 text-xs text-[#5f6368]">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center text-white font-bold text-[9px] shrink-0 ${isOwner ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                              {doc.owner?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span>{isOwner ? 'Me' : doc.owner?.name?.split(' ')[0]}</span>
                            <span className="text-[#9aa0a6]">·</span>
                            <span>{new Date(doc.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Floating Create Button (mobile) */}
      <button
        onClick={handleCreateDocument}
        disabled={actionLoading}
        className="fixed bottom-6 right-6 lg:hidden bg-[#c2e7ff] hover:bg-[#a8d8f8] text-[#001d35] p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.2)] transition-all active:scale-95 z-40"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* RENAME MODAL */}
      {renameDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40" onClick={() => setRenameDocId(null)}>
          <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setRenameDocId(null)}
              className="absolute right-4 top-4 text-[#5f6368] hover:text-[#202124] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-medium text-[#202124] mb-4">Rename</h2>
            {renameError && <p className="mb-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{renameError}</p>}
            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <input
                type="text"
                className="w-full bg-white border border-[#dadce0] rounded-lg py-2.5 px-3 text-sm text-[#202124] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                autoFocus
                required
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setRenameDocId(null)} className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-full text-sm transition-colors">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {shareDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40" onClick={() => setShareDocId(null)}>
          <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShareDocId(null)}
              className="absolute right-4 top-4 text-[#5f6368] hover:text-[#202124] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-medium text-[#202124] mb-1">Share document</h2>
            <p className="text-sm text-[#5f6368] mb-4">
              Invite someone to collaborate in real-time.
            </p>
            {shareError && <p className="mb-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{shareError}</p>}
            <form onSubmit={handleShareSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Add people by email"
                className="w-full bg-white border border-[#dadce0] rounded-lg py-2.5 px-3 text-sm text-[#202124] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-[#9aa0a6]"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                autoFocus
                required
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShareDocId(null)} className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-full text-sm transition-colors flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5" /> Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
