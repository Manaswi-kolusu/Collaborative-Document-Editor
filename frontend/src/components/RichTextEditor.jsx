import React, { useEffect, useRef, useState, useCallback } from 'react';
import Quill from 'quill';
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { IndexeddbPersistence } from 'y-indexeddb';
import { 
  Bold, Italic, Underline, Strikethrough, 
  List, ListOrdered, Link2, Quote, 
  Type, ChevronDown,
} from 'lucide-react';

// ═══════════ CURSOR COLORS ═══════════
const CURSOR_COLORS = [
  '#ef4444', '#f97316', '#10b981', '#3b82f6', 
  '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1',
];

const getCursorColor = (userId) => {
  if (!userId) return CURSOR_COLORS[0];
  const hash = String(userId).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
};

// ═══════════ CURSOR MANAGER (vanilla DOM — no React) ═══════════
class CursorManager {
  constructor(quill) {
    this.quill = quill;
    this.cursors = {}; // { socketId: { el, flagEl, range, name, color, timeout } }
    
    // Create a cursor layer inside ql-container
    this.layer = document.createElement('div');
    this.layer.className = 'ql-cursor-layer';
    this.layer.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:10;';
    
    const qlContainer = quill.container;
    qlContainer.style.position = 'relative';
    qlContainer.appendChild(this.layer);

    // Re-render on scroll
    const scrollEl = quill.scrollingContainer || qlContainer;
    this._onScroll = () => this.updateAll();
    scrollEl.addEventListener('scroll', this._onScroll);
  }

  setCursor(socketId, range, name, color) {
    if (!range) return;

    let entry = this.cursors[socketId];
    if (!entry) {
      // Create cursor DOM elements
      const el = document.createElement('div');
      el.style.cssText = 'position:absolute;width:2.5px;pointer-events:none;transition:top 80ms ease-out,left 80ms ease-out;border-radius:1px;';
      
      const flag = document.createElement('div');
      flag.style.cssText = `
        position:absolute;top:-22px;left:-1px;
        padding:2px 8px;font-size:11px;font-weight:700;color:#fff;
        white-space:nowrap;border-radius:4px 4px 4px 0;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);line-height:16px;
        pointer-events:none;user-select:none;
        animation:cursorFadeIn 0.2s ease-out;
      `;
      flag.textContent = name;
      flag.style.backgroundColor = color;
      el.style.backgroundColor = color;

      // Blinking animation
      el.animate([
        { opacity: 1 }, { opacity: 0.3 }, { opacity: 1 }
      ], { duration: 1200, iterations: Infinity });

      el.appendChild(flag);
      this.layer.appendChild(el);
      
      entry = { el, flag, range: null, name, color, timeout: null };
      this.cursors[socketId] = entry;
    }

    // Update stored range
    entry.range = range;
    entry.name = name;
    entry.flag.textContent = name;

    // Position it
    this._position(entry);

    // Show the element
    entry.el.style.display = 'block';

    // Auto-hide after 15 seconds of no updates
    if (entry.timeout) clearTimeout(entry.timeout);
    entry.timeout = setTimeout(() => {
      if (entry.el) entry.el.style.display = 'none';
    }, 15000);
  }

  removeCursor(socketId) {
    const entry = this.cursors[socketId];
    if (entry) {
      if (entry.timeout) clearTimeout(entry.timeout);
      entry.el.remove();
      delete this.cursors[socketId];
    }
  }

  updateAll() {
    Object.values(this.cursors).forEach(entry => {
      if (entry.el.style.display !== 'none') {
        this._position(entry);
      }
    });
  }

  _position(entry) {
    try {
      const bounds = this.quill.getBounds(entry.range.index, entry.range.length || 0);
      if (!bounds) { entry.el.style.display = 'none'; return; }
      
      entry.el.style.top = bounds.top + 'px';
      entry.el.style.left = bounds.left + 'px';
      entry.el.style.height = bounds.height + 'px';
    } catch (e) {
      entry.el.style.display = 'none';
    }
  }

  destroy() {
    Object.keys(this.cursors).forEach(id => this.removeCursor(id));
    if (this.layer.parentNode) this.layer.remove();
    const scrollEl = this.quill.scrollingContainer || this.quill.container;
    scrollEl.removeEventListener('scroll', this._onScroll);
  }
}

// ═══════════ TOOLBAR ═══════════
const CustomToolbar = ({ quill, activeFormats }) => {
  if (!quill) return null;

  const toggleFormat = (format, value = true) => {
    const current = quill.getFormat()[format];
    quill.format(format, current === value ? false : value);
    quill.focus();
  };

  const handleLink = () => {
    const value = prompt('Enter link URL:');
    if (value) { quill.format('link', value); }
    else { quill.format('link', false); }
    quill.focus();
  };

  const handleBlockquote = () => {
    const current = quill.getFormat()['blockquote'];
    quill.format('blockquote', !current);
    quill.focus();
  };

  const ToolbarButton = ({ icon: Icon, format, value = true, onClick, title }) => {
    let isActive = false;
    if (value === true) isActive = !!activeFormats[format];
    else if (value === false) isActive = !activeFormats[format];
    else isActive = activeFormats[format] === value;

    return (
      <button
        type="button"
        title={title}
        onMouseDown={(e) => {
          e.preventDefault();
          onClick ? onClick() : toggleFormat(format, value);
        }}
        className={`h-8 min-w-[32px] px-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
          isActive 
            ? 'bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30' 
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        }`}
      >
        <Icon className="w-[15px] h-[15px]" />
      </button>
    );
  };

  const Divider = () => <div className="w-px h-5 bg-white/8 mx-1" />;

  const getHeadingLabel = () => {
    const h = activeFormats.header;
    if (h === 1) return 'Heading 1';
    if (h === 2) return 'Heading 2';
    if (h === 3) return 'Heading 3';
    return 'Normal';
  };

  const [showHeadingMenu, setShowHeadingMenu] = useState(false);

  return (
    <div className="bg-[#16161e] border-b border-white/8 flex items-center justify-center gap-1 py-2 px-4 z-20 shrink-0 select-none">
      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); setShowHeadingMenu(!showHeadingMenu); }}
          className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-slate-400 hover:bg-white/5 hover:text-slate-200 text-[12px] font-medium min-w-[100px]"
        >
          <Type className="w-[14px] h-[14px]" />
          <span>{getHeadingLabel()}</span>
          <ChevronDown className="w-3 h-3 ml-auto" />
        </button>
        {showHeadingMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowHeadingMenu(false)} />
            <div className="absolute top-full left-0 mt-1 w-40 bg-[#1e1e2e] border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] py-1.5 z-50">
              {[
                { label: 'Normal text', value: false },
                { label: 'Heading 1', value: 1 },
                { label: 'Heading 2', value: 2 },
                { label: 'Heading 3', value: 3 },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    toggleFormat('header', opt.value);
                    setShowHeadingMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer ${
                    (opt.value === false && !activeFormats.header) || activeFormats.header === opt.value
                      ? 'bg-violet-600/15 text-violet-300'
                      : 'text-slate-300 hover:bg-white/5'
                  } ${opt.value === 1 ? 'text-lg font-bold' : opt.value === 2 ? 'text-base font-semibold' : opt.value === 3 ? 'text-sm font-medium' : 'text-[12px]'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Divider />
      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={Bold} format="bold" title="Bold (⌘B)" />
        <ToolbarButton icon={Italic} format="italic" title="Italic (⌘I)" />
        <ToolbarButton icon={Underline} format="underline" title="Underline (⌘U)" />
        <ToolbarButton icon={Strikethrough} format="strike" title="Strikethrough" />
      </div>
      <Divider />
      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={ListOrdered} format="list" value="ordered" title="Numbered list" />
        <ToolbarButton icon={List} format="list" value="bullet" title="Bulleted list" />
      </div>
      <Divider />
      <div className="flex items-center gap-0.5">
        <ToolbarButton icon={Link2} format="link" onClick={handleLink} title="Insert link (⌘K)" />
        <ToolbarButton icon={Quote} format="blockquote" onClick={handleBlockquote} title="Block quote" />
      </div>
    </div>
  );
};

// ═══════════ MAIN EDITOR ═══════════
const RichTextEditor = ({ documentId, socket, emit }) => {
  const editorContainerRef = useRef(null);
  const quillRef = useRef(null);
  const ydocRef = useRef(null);
  const bindingRef = useRef(null);
  const providerRef = useRef(null);
  const cursorMgrRef = useRef(null);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [activeFormats, setActiveFormats] = useState({});

  // 1. Initialize Quill + Y.js
  useEffect(() => {
    const wrapper = editorContainerRef.current;
    if (!wrapper) return;

    wrapper.innerHTML = '<div id="editor-elem"></div>';
    const editor = wrapper.firstChild;

    const quill = new Quill(editor, {
      modules: { toolbar: false },
      placeholder: 'Start writing your document...',
    });
    quillRef.current = quill;
    window.__quill = quill;

    // Create cursor manager
    cursorMgrRef.current = new CursorManager(quill);

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    const ytext = ydoc.getText('quill-content');

    const provider = new IndexeddbPersistence(documentId, ydoc);
    providerRef.current = provider;
    provider.on('synced', () => console.log('IndexedDB loaded local state'));

    const binding = new QuillBinding(ytext, quill);
    bindingRef.current = binding;

    const handleEditorChange = () => {
      setActiveFormats(quill.getFormat() || {});
    };
    quill.on('editor-change', handleEditorChange);

    setEditorLoaded(true);

    return () => {
      quill.off('editor-change', handleEditorChange);
      if (cursorMgrRef.current) { cursorMgrRef.current.destroy(); cursorMgrRef.current = null; }
      binding.destroy();
      provider.destroy();
      ydoc.destroy();
      setEditorLoaded(false);
      delete window.__quill;
      wrapper.innerHTML = '';
    };
  }, [documentId]);

  // 2. Y.js sync outgoing
  useEffect(() => {
    if (!editorLoaded || !ydocRef.current || !socket) return;

    const handleYjsUpdate = (update, origin) => {
      if (origin !== socket && origin !== providerRef.current) {
        const base64Update = btoa(String.fromCharCode(...update));
        emit('document:update', { documentId, update: base64Update });
        
        const fullState = Y.encodeStateAsUpdate(ydocRef.current);
        const fullStateBase64 = btoa(String.fromCharCode(...fullState));
        emit('document:autosave', { documentId, content: fullStateBase64 });
      }
    };

    ydocRef.current.on('update', handleYjsUpdate);
    return () => { if (ydocRef.current) ydocRef.current.off('update', handleYjsUpdate); };
  }, [editorLoaded, socket, documentId]);

  // 3. Socket handlers — incoming updates + cursors
  useEffect(() => {
    if (!socket) return;

    const handleDocUpdated = ({ update }) => {
      try {
        if (ydocRef.current) {
          const bin = Uint8Array.from(atob(update), c => c.charCodeAt(0));
          Y.applyUpdate(ydocRef.current, bin, socket);
        }
      } catch (err) { console.error('Error applying remote Yjs update:', err); }
    };

    const handleDocLoad = ({ content }) => {
      if (content && ydocRef.current) {
        try {
          const bin = Uint8Array.from(atob(content), c => c.charCodeAt(0));
          Y.applyUpdate(ydocRef.current, bin, socket);
        } catch (err) { console.error('Failed to load initial Yjs doc state:', err); }
      }
    };

    const handleCursorMoved = ({ socketId, userId, name, cursor }) => {
      if (cursor && cursorMgrRef.current) {
        cursorMgrRef.current.setCursor(socketId, cursor, name, getCursorColor(userId));
      }
    };

    const handleUserLeft = ({ socketId }) => {
      if (cursorMgrRef.current) {
        cursorMgrRef.current.removeCursor(socketId);
      }
    };

    socket.on('document:updated', handleDocUpdated);
    socket.on('document:load', handleDocLoad);
    socket.on('cursor:moved', handleCursorMoved);
    socket.on('user:left', handleUserLeft);

    return () => {
      socket.off('document:updated', handleDocUpdated);
      socket.off('document:load', handleDocLoad);
      socket.off('cursor:moved', handleCursorMoved);
      socket.off('user:left', handleUserLeft);
    };
  }, [socket]);

  // 4. Emit local cursor on selection or text change
  useEffect(() => {
    if (!quillRef.current || !socket) return;

    const sendCursor = () => {
      const range = quillRef.current.getSelection();
      if (range) {
        emit('cursor:update', { documentId, range, isTyping: true });
      }
    };

    quillRef.current.on('selection-change', (range) => { if (range) sendCursor(); });
    quillRef.current.on('text-change', sendCursor);

    return () => {
      if (quillRef.current) {
        quillRef.current.off('selection-change');
        quillRef.current.off('text-change');
      }
    };
  }, [editorLoaded, socket, documentId]);

  // 5. Expose Y.js state getter
  useEffect(() => {
    if (!editorLoaded || !ydocRef.current) return;
    window.__getYjsDocState = () => {
      const state = Y.encodeStateAsUpdate(ydocRef.current);
      return btoa(String.fromCharCode(...state));
    };
    return () => { delete window.__getYjsDocState; };
  }, [editorLoaded]);

  return (
    <div className="flex-1 bg-[#0f0f14] flex flex-col overflow-hidden relative">
      <div className="overflow-x-auto scrollbar-hide">
        <CustomToolbar quill={quillRef.current} activeFormats={activeFormats} />
      </div>
      
      <div 
        ref={editorContainerRef} 
        className="flex-1 flex flex-col overflow-hidden
          [&_.ql-container]:border-none [&_.ql-container]:bg-transparent [&_.ql-container]:flex-1 [&_.ql-container]:overflow-y-auto [&_.ql-container]:relative
          
          [&_.ql-editor]:relative [&_.ql-editor]:bg-white [&_.ql-editor]:text-[#202124] [&_.ql-editor]:w-full [&_.ql-editor]:max-w-[816px] [&_.ql-editor]:min-h-[1056px] [&_.ql-editor]:my-8 [&_.ql-editor]:mx-auto [&_.ql-editor]:p-8 sm:[&_.ql-editor]:p-[96px] [&_.ql-editor]:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.3)] [&_.ql-editor]:rounded-lg [&_.ql-editor]:outline-none [&_.ql-editor]:font-sans [&_.ql-editor]:text-[15px] [&_.ql-editor]:leading-[1.75] [&_.ql-editor]:cursor-text [&_.ql-editor]:whitespace-pre-wrap
          
          [&_.ql-editor.ql-blank::before]:absolute [&_.ql-editor.ql-blank::before]:left-8 sm:[&_.ql-editor.ql-blank::before]:left-[96px] [&_.ql-editor.ql-blank::before]:top-8 sm:[&_.ql-editor.ql-blank::before]:top-[96px] [&_.ql-editor.ql-blank::before]:text-[#9aa0a6] [&_.ql-editor.ql-blank::before]:not-italic [&_.ql-editor.ql-blank::before]:pointer-events-none [&_.ql-editor.ql-blank::before]:content-[attr(data-placeholder)]
          
          [&_.ql-editor_h1]:text-3xl [&_.ql-editor_h1]:font-bold [&_.ql-editor_h1]:text-[#202124] [&_.ql-editor_h1]:mt-6 [&_.ql-editor_h1]:mb-4
          [&_.ql-editor_h2]:text-2xl [&_.ql-editor_h2]:font-bold [&_.ql-editor_h2]:text-[#202124] [&_.ql-editor_h2]:mt-5 [&_.ql-editor_h2]:mb-3
          [&_.ql-editor_h3]:text-xl [&_.ql-editor_h3]:font-semibold [&_.ql-editor_h3]:text-[#202124] [&_.ql-editor_h3]:mt-4 [&_.ql-editor_h3]:mb-2
          
          [&_.ql-editor_ol]:list-decimal [&_.ql-editor_ol]:pl-6 [&_.ql-editor_ol]:my-3
          [&_.ql-editor_ul]:list-disc [&_.ql-editor_ul]:pl-6 [&_.ql-editor_ul]:my-3
          [&_.ql-editor_li]:pl-2 [&_.ql-editor_li]:mb-1.5
          
          [&_.ql-editor_blockquote]:border-l-4 [&_.ql-editor_blockquote]:border-violet-400 [&_.ql-editor_blockquote]:pl-4 [&_.ql-editor_blockquote]:my-4 [&_.ql-editor_blockquote]:text-[#5f6368] [&_.ql-editor_blockquote]:italic
          
          [&_.ql-editor_a]:text-violet-600 [&_.ql-editor_a]:underline hover:[&_.ql-editor_a]:text-violet-800
        " 
      />
    </div>
  );
};

export default RichTextEditor;
