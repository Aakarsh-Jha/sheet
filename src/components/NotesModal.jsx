import React, { useState, useRef, useEffect } from 'react';
import { X, Bold, Italic, Underline, List } from 'lucide-react';

export default function NotesModal({ isOpen, onClose, onSave, initialNote = '', questionTitle }) {
  const [isEmpty, setIsEmpty] = useState(!initialNote);
  const editorRef = useRef(null);

  useEffect(() => {
    setIsEmpty(!initialNote);
    if (editorRef.current) {
      editorRef.current.innerHTML = initialNote || '';
    }
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleCommand = (e, command, value = null) => {
    e.preventDefault();
    document.execCommand(command, false, value);
    // Refocus the editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
    checkEmpty();
  };

  const checkEmpty = () => {
    if (editorRef.current) {
      const text = editorRef.current.textContent || '';
      setIsEmpty(text.trim() === '');
    }
  };

  const handleSave = () => {
    const html = editorRef.current ? editorRef.current.innerHTML : '';
    onSave(html);
    onClose();
  };

  const handleCancel = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialNote || '';
    }
    setIsEmpty(!initialNote);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={handleCancel}
      />

      {/* Modal Container */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-800 z-[101] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-xs font-semibold text-brand tracking-wider uppercase mb-1">Question Notes</h3>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{questionTitle}</h2>
          </div>
          <button 
            onClick={handleCancel}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Editor Toolbar */}
        <div className="px-6 py-2 bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-1">
          <button
            onMouseDown={(e) => handleCommand(e, 'bold')}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded text-gray-700 dark:text-zinc-300 transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => handleCommand(e, 'italic')}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded text-gray-700 dark:text-zinc-300 transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => handleCommand(e, 'underline')}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded text-gray-700 dark:text-zinc-300 transition-colors"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800 mx-1" />
          <button
            onMouseDown={(e) => handleCommand(e, 'insertUnorderedList')}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded text-gray-700 dark:text-zinc-300 transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[250px] relative bg-white dark:bg-zinc-900">
          {isEmpty && (
            <div className="absolute top-6 left-6 pointer-events-none text-gray-400 dark:text-zinc-600 select-none">
              Start typing your notes here...
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            onInput={checkEmpty}
            className="w-full h-full min-h-[250px] outline-none text-gray-800 dark:text-zinc-200 focus:ring-0 leading-relaxed font-primary"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 font-medium transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors text-sm shadow-md shadow-brand/20"
          >
            Save Note
          </button>
        </div>
      </div>
    </>
  );
}
