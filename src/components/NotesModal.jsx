import React, { useState, useRef, useEffect } from 'react';
import { X, Bold, Italic, Underline, List, Image } from 'lucide-react';

const compressImage = (dataUrl, maxWidth = 1000, maxHeight = 1000, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    img.src = dataUrl;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Scale dimensions down if they exceed maximum limits
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Using image/jpeg for excellent compression compared to raw png
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
  });
};

export default function NotesModal({ isOpen, onClose, onSave, initialNote = '', questionTitle }) {
  const [isEmpty, setIsEmpty] = useState(!initialNote);
  const [stats, setStats] = useState({ characters: 0, words: 0 });
  const [formatStates, setFormatStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    list: false,
  });

  const editorRef = useRef(null);
  const imageInputRef = useRef(null);

  // Monitor selection change to update toolbar active states (bold, italic, etc.)
  useEffect(() => {
    const handleSelectionChange = () => {
      if (
        isOpen && 
        editorRef.current && 
        document.activeElement === editorRef.current
      ) {
        setFormatStates({
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline'),
          list: document.queryCommandState('insertUnorderedList'),
        });
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isOpen]);

  useEffect(() => {
    setIsEmpty(!initialNote);
    if (editorRef.current) {
      editorRef.current.innerHTML = initialNote || '';
      // Initial count calculation
      const text = editorRef.current.textContent || '';
      const charCount = text.length;
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      setStats({ characters: charCount, words: wordCount });
    }
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleCommand = (e, command, value = null) => {
    e.preventDefault();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    checkEmpty();
    // Force format update
    setFormatStates({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      list: document.queryCommandState('insertUnorderedList'),
    });
  };

  const checkEmpty = () => {
    if (editorRef.current) {
      const text = editorRef.current.textContent || '';
      const hasImages = editorRef.current.getElementsByTagName('img').length > 0;
      setIsEmpty(text.trim() === '' && !hasImages);

      // Recalculate character and word counts
      const charCount = text.length;
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      setStats({ characters: charCount, words: wordCount });
    }
  };

  const insertImage = async (dataUrl) => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      let finalDataUrl = dataUrl;
      try {
        finalDataUrl = await compressImage(dataUrl);
      } catch (err) {
        console.error('Image compression failed, using original', err);
      }

      const selection = window.getSelection();
      let inserted = false;

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          range.deleteContents();
          
          const img = document.createElement('img');
          img.src = finalDataUrl;
          img.className = 'my-3 max-w-full rounded-lg shadow-md border border-gray-200 dark:border-zinc-800 block';
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          
          range.insertNode(img);
          
          const nextRange = document.createRange();
          nextRange.setStartAfter(img);
          nextRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(nextRange);
          inserted = true;
        }
      }

      if (!inserted) {
        const imgHtml = `<img src="${finalDataUrl}" class="my-3 max-w-full rounded-lg shadow-md border border-gray-200 dark:border-zinc-800 block" style="max-width: 100%; height: auto;" />`;
        editorRef.current.innerHTML += imgHtml;
      }
      
      checkEmpty();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      insertImage(event.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          insertImage(event.target.result);
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  };

  // Drag and Drop File Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          insertImage(event.target.result);
        };
        reader.readAsDataURL(file);
      }
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
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900">
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
            className={`p-1.5 rounded transition-all ${
              formatStates.bold 
                ? 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand' 
                : 'hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => handleCommand(e, 'italic')}
            className={`p-1.5 rounded transition-all ${
              formatStates.italic 
                ? 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand' 
                : 'hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => handleCommand(e, 'underline')}
            className={`p-1.5 rounded transition-all ${
              formatStates.underline 
                ? 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand' 
                : 'hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'
            }`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800 mx-1" />
          
          <button
            onMouseDown={(e) => handleCommand(e, 'insertUnorderedList')}
            className={`p-1.5 rounded transition-all ${
              formatStates.list 
                ? 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand' 
                : 'hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800 mx-1" />

          {/* Insert Image Button */}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              imageInputRef.current?.click();
            }}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded text-gray-700 dark:text-zinc-300 transition-colors"
            title="Insert Image (or paste with Ctrl+V)"
          >
            <Image className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Editor Body Wrapper */}
        <div 
          className="flex-1 overflow-y-auto p-6 min-h-[300px] relative bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-brand/20 dark:focus-within:ring-brand/10 transition-shadow"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isEmpty && (
            <div className="absolute top-6 left-6 pointer-events-none text-gray-400 dark:text-zinc-600 select-none text-sm">
              Start typing your notes here... (drag & drop images or paste Ctrl+V)
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            onInput={checkEmpty}
            onPaste={handlePaste}
            className="w-full h-full min-h-[300px] outline-none text-gray-800 dark:text-zinc-200 focus:ring-0 leading-relaxed font-primary text-sm"
          />
        </div>

        {/* Editor Stats & Tips Info Bar */}
        <div className="px-6 py-2 bg-gray-50/50 dark:bg-zinc-900/30 border-t border-gray-150 dark:border-zinc-800/80 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500 select-none">
          <div className="flex gap-4">
            <span>Words: <strong className="font-semibold text-gray-700 dark:text-zinc-400">{stats.words}</strong></span>
            <span>Characters: <strong className="font-semibold text-gray-700 dark:text-zinc-400">{stats.characters}</strong></span>
          </div>
          <div className="hidden sm:block">
            💡 Drag & drop images or paste (Ctrl+V) directly
          </div>
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
