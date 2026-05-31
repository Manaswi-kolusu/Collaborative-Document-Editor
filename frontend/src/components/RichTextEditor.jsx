import React, { useEffect, useRef, useState, useCallback } from 'react';
import Quill from 'quill';
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { IndexeddbPersistence } from 'y-indexeddb';
import { 
  Bold, Italic, Underline, Strikethrough, 
  List, ListOrdered, Link2, Quote, 
  Heading1, Heading2, Heading3, Type,
  AlignLeft, AlignCenter, AlignRight, Minus,
  ChevronDown,
} from 'lucide-react';

const CURSOR_COLORS = [
  { bg: '#ef4444', name: 'red' },
  { bg: '#f97316', name: 'orange' },
  { bg: '#10b981', name: 'emerald' },
  { bg: '#3b82f6', name: 'blue' },
  { bg: '#8b5cf6', name: 'violet' },
  { bg: '#ec4899', name: 'pink' },
  { bg: '#14b8a6', name: 'teal' },
  { bg: '#f59e0b', name: 'amber' },
  { bg: '#6366f1', name: 'indigo' },
];

const getCursorColor = (userId) => {
  if (!userId) return CURSOR_COLORS[0].bg;
  const hash = String(userId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return CURSOR_COLORS[hash % CURSOR_COLORS.length].bg;
};

const CustomToolbar = ({ quill, activeFormats }) => {
  if (!quill) return null;

  const toggleFormat = (format, value = true) => {
    const current = quill.getFormat()[format];
    quill.format(format, current === value ? false : value);
    quill.focus();
  };

  const handleLink = () => {
    const value = prompt('Enter link URL:');
    if (value) {
      quill.format('link', value);
    } else {
      quill.format('link', false);
    }
    quill.focus();
  };

  const handleBlockquote = () => {
    const current = quill.getFormat()['blockquote'];
    quill.format('blockquote', !current);
    quill.focus();
  };

  const ToolbarButton = ({ icon: Icon, format, value = true, onClick, title, label }) => {
    let isActive = false;
    if (value === true) {
      isActive = !!activeFormats[format];
    } else if (value === false) {
      isActive = !activeFormats[format] || activeFormats[format] === false;
    } else {
      isActive = activeFormats[format] === value;
    }

    return (
      <button
        type="button"
        title={title}
        onMouseDown={(e) => {
          e.preventDefault();
          onClick ? onClick() : toggleFormat(format, value);
        }}
        className={`h-8 min-w-[32px] px-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer text-xs font-medium ${
          isActive 
            ? 'bg-violet-600/20 text-violet-300 shadow-sm ring-1 ring-violet-500/30' 
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        }`}
      >
        <Icon className="w-[15px] h-[15px]" />
        {label && <span className="text-[11px]">{label}</span>}
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
      
      {/* Heading Dropdown */}
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

// ═══════════ REMOTE CURSOR COMPONENT ═══════════
const RemoteCursor = ({ quill, range, name, color, scrollContainer }) => {
  const [pos, setPos] = useState(null);

  const updatePosition = useCallback(() => {
    if (!quill || !range) return;
    try {
      const bounds = quill.getBounds(range.index, range.length || 0);
      if (!bounds) { setPos(null); return; }
      
      // Get scroll offset from the scrollable container
      const scrollTop = scrollContainer?.scrollTop || 0;
      const scrollLeft = scrollContainer?.scrollLeft || 0;

      // getBounds returns positions relative to the editor container, 
      // but we need to account for scroll
      setPos({
        top: bounds.top,
        left: bounds.left,
        height: bounds.height,
        selectionWidth: bounds.width || 0,
      });
    } catch (e) {
      setPos(null);
    }
  }, [quill, range, scrollContainer]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  // Also update on scroll
  useEffect(() => {
    if (!scrollContainer) return;
    const handleScroll = () => updatePosition();
    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [scrollContainer, updatePosition]);

  if (!pos) return null;

  return (
    <>
      {/* Cursor line */}
      <div
        className="absolute pointer-events-none z-[15] transition-all duration-75 ease-out"
        style={{
          top: `${pos.top}px`,
          left: `${pos.left}px`,
          height: `${pos.height}px`,
          width: '2.5px',
          backgroundColor: color,
          borderRadius: '1px',
        }}
      >
        {/* Name flag */}
        <div
          className="absolute whitespace-nowrap pointer-events-none select-none"
          style={{
            top: '-22px',
            left: '-1px',
            backgroundColor: color,
            color: '#fff',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px 4px 4px 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            lineHeight: '16px',
          }}
        >
          {name}
        </div>
      </div>

      {/* Selection highlight */}
      {pos.selectionWidth > 0 && (
        <div
          className="absolute pointer-events-none z-[14]"
          style={{
            top: `${pos.top}px`,
            left: `${pos.left}px`,
            height: `${pos.height}px`,
            width: `${pos.selectionWidth}px`,
            backgroundColor: color,
            opacity: 0.2,
            borderRadius: '2px',
          }}
        />
      )}
    </>
  );
};

const RichTextEditor = ({ documentId, socket, emit }) => {
  const editorContainerRef = useRef(null);
  const quillRef = useRef(null);
  const ydocRef = useRef(null);
  const bindingRef = useRef(null);
  const providerRef = useRef(null);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [activeFormats, setActiveFormats] = useState({});
  const [remoteCursors, setRemoteCursors] = useState({});
  const [scrollContainer, setScrollContainer] = useState(null);
  const cursorTimeoutsRef = useRef({});

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

    // Find the scroll container (ql-container)
    setTimeout(() => {
      const qlContainer = wrapper.querySelector('.ql-container');
      if (qlContainer) setScrollContainer(qlContainer);
    }, 100);

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    const ytext = ydoc.getText('quill-content');

    const provider = new IndexeddbPersistence(documentId, ydoc);
    providerRef.current = provider;

    provider.on('synced', () => {
      console.log('IndexedDB loaded local state');
    });

    const binding = new QuillBinding(ytext, quill);
    bindingRef.current = binding;

    const handleEditorChange = () => {
      setActiveFormats(quill.getFormat() || {});
    };
    quill.on('editor-change', handleEditorChange);

    setEditorLoaded(true);

    return () => {
      quill.off('editor-change', handleEditorChange);
      binding.destroy();
      provider.destroy();
      ydoc.destroy();
      setEditorLoaded(false);
      delete window.__quill;
      wrapper.innerHTML = '';
    };
  }, [documentId]);

  // Yjs sync
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

    return () => {
      if (ydocRef.current) {
        ydocRef.current.off('update', handleYjsUpdate);
      }
    };
  }, [editorLoaded, socket, documentId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleDocUpdated = ({ update }) => {
      try {
        if (ydocRef.current) {
          const binaryUpdate = Uint8Array.from(atob(update), (c) => c.charCodeAt(0));
          Y.applyUpdate(ydocRef.current, binaryUpdate, socket);
        }
      } catch (err) {
        console.error('Error applying remote Yjs update:', err);
      }
    };

    const handleDocLoad = ({ content }) => {
      if (content && ydocRef.current) {
        try {
          const binaryUpdate = Uint8Array.from(atob(content), (c) => c.charCodeAt(0));
          Y.applyUpdate(ydocRef.current, binaryUpdate, socket);
        } catch (err) {
          console.error('Failed to load initial Yjs doc state:', err);
        }
      }
    };

    // Receive remote cursor updates — keep cursor visible for 10 seconds
    const handleCursorMoved = ({ socketId, userId, name, cursor, isTyping }) => {
      if (cursor) {
        setRemoteCursors(prev => ({
          ...prev,
          [socketId]: { range: cursor, name, color: getCursorColor(userId) }
        }));

        // Clear any existing timeout for this cursor
        if (cursorTimeoutsRef.current[socketId]) {
          clearTimeout(cursorTimeoutsRef.current[socketId]);
        }

        // Auto-hide cursor after 10 seconds of inactivity
        cursorTimeoutsRef.current[socketId] = setTimeout(() => {
          setRemoteCursors(prev => {
            const updated = { ...prev };
            delete updated[socketId];
            return updated;
          });
          delete cursorTimeoutsRef.current[socketId];
        }, 10000);
      }
    };

    const handleUserLeft = ({ socketId }) => {
      setRemoteCursors(prev => {
        const updated = { ...prev };
        delete updated[socketId];
        return updated;
      });
      if (cursorTimeoutsRef.current[socketId]) {
        clearTimeout(cursorTimeoutsRef.current[socketId]);
        delete cursorTimeoutsRef.current[socketId];
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
      // Clean up all cursor timeouts
      Object.values(cursorTimeoutsRef.current).forEach(clearTimeout);
      cursorTimeoutsRef.current = {};
    };
  }, [socket]);

  // Emit local cursor position — always send cursor, not just when "typing"
  useEffect(() => {
    if (!quillRef.current || !socket) return;

    const handleSelectionChange = (range) => {
      if (range) {
        emit('cursor:update', {
          documentId,
          range,
          isTyping: true,
        });
      }
    };

    // Also emit cursor on text changes (so cursor position updates as user types)
    const handleTextChange = () => {
      const range = quillRef.current.getSelection();
      if (range) {
        emit('cursor:update', {
          documentId,
          range,
          isTyping: true,
        });
      }
    };

    quillRef.current.on('selection-change', handleSelectionChange);
    quillRef.current.on('text-change', handleTextChange);

    return () => {
      if (quillRef.current) {
        quillRef.current.off('selection-change', handleSelectionChange);
        quillRef.current.off('text-change', handleTextChange);
      }
    };
  }, [editorLoaded, socket, documentId]);

  // Yjs doc state getter
  useEffect(() => {
    if (!editorLoaded || !ydocRef.current) return;
    
    window.__getYjsDocState = () => {
      const state = Y.encodeStateAsUpdate(ydocRef.current);
      return btoa(String.fromCharCode(...state));
    };

    return () => {
      delete window.__getYjsDocState;
    };
  }, [editorLoaded]);

  return (
    <div className="flex-1 bg-[#0f0f14] flex flex-col overflow-hidden relative">
      <div className="overflow-x-auto scrollbar-hide">
        <CustomToolbar quill={quillRef.current} activeFormats={activeFormats} />
      </div>
      
      <div 
        ref={editorContainerRef} 
        className="flex-1 flex flex-col overflow-hidden relative
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

      {/* Remote Cursors — rendered inside the ql-container so they scroll with the document */}
      {editorLoaded && quillRef.current && Object.entries(remoteCursors).map(([socketId, cursorData]) => (
        <RemoteCursor
          key={socketId}
          quill={quillRef.current}
          range={cursorData.range}
          name={cursorData.name}
          color={cursorData.color}
          scrollContainer={scrollContainer}
        />
      ))}
    </div>
  );
};

export default RichTextEditor;
