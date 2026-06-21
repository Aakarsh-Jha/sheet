import React, { useRef } from 'react';
import { Search, Star, Sun, Moon, Download, Upload, Menu } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Header({ onOpenSidebar }) {
  const {
    searchQuery,
    setSearchQuery,
    revisionFilterActive,
    setRevisionFilterActive,
    theme,
    setTheme,
    exportData,
    importData
  } = useStore();

  const fileInputRef = useRef(null);

  // Toggle dark/light theme
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Export progress data to JSON file
  const handleExport = () => {
    try {
      const dataStr = exportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `a2z-dsa-progress-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export progress data.');
      console.error(e);
    }
  };

  // Import progress data from JSON file
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const success = importData(event.target.result);
      if (success) {
        alert('Progress data imported successfully!');
      } else {
        alert('Failed to import data. Please check if the file format is valid.');
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between shadow-sm select-none">
      
      {/* Mobile Menu Icon & Brand Name */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500 dark:text-zinc-400 lg:hidden transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-1.5">
          <span className="font-amaranth text-lg sm:text-xl font-bold bg-gradient-to-r from-brand to-orange-500 bg-clip-text text-transparent">
            A2Z DSA Sheet
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-brand/10 text-brand border border-brand/20 dark:bg-brand/20">
            Clone
          </span>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-850 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-1 focus:ring-brand focus:border-brand transition-all"
          />
        </div>
      </div>

      {/* Right Controls Panel */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Mobile Search Icon placeholder/button if needed, but keeping it clean */}

        {/* Revision filter button */}
        <button
          onClick={() => setRevisionFilterActive(!revisionFilterActive)}
          className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-semibold ${
            revisionFilterActive
              ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-500 dark:bg-yellow-400/20'
              : 'bg-white border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800'
          }`}
          title="Revision Mode (Starred questions)"
        >
          <Star className={`w-4 h-4 ${revisionFilterActive ? 'fill-yellow-500' : ''}`} />
          <span className="hidden sm:inline">Revision</span>
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800 hidden sm:block" />

        {/* Backup Buttons (Export/Import) */}
        <button
          onClick={handleExport}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          title="Export Progress Backup (.json)"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          title="Import Progress Backup (.json)"
        >
          <Upload className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800" />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>
      </div>

    </header>
  );
}
