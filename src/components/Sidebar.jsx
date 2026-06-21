import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Cloud, CloudOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import sheetData from '../data/sheetData';

// Circular Donut Chart Progress Component
function DonutProgress() {
  const { isQuestionCompleted, revisionFilterActive, isRevisionMarked } = useStore();

  // Flatten all questions
  let allQuestions = sheetData.flatMap(step => step.topics.flatMap(topic => topic.questions));
  if (revisionFilterActive) {
    allQuestions = allQuestions.filter(q => isRevisionMarked(q.id));
  }

  const total = allQuestions.length;
  const easyQuestions = allQuestions.filter(q => q.difficulty.toLowerCase() === 'easy');
  const mediumQuestions = allQuestions.filter(q => q.difficulty.toLowerCase() === 'medium');
  const hardQuestions = allQuestions.filter(q => q.difficulty.toLowerCase() === 'hard');

  const easyCompleted = easyQuestions.filter(q => isQuestionCompleted(q.id)).length;
  const mediumCompleted = mediumQuestions.filter(q => isQuestionCompleted(q.id)).length;
  const hardCompleted = hardQuestions.filter(q => isQuestionCompleted(q.id)).length;

  const totalCompleted = easyCompleted + mediumCompleted + hardCompleted;

  const easyPercent = easyQuestions.length > 0 ? (easyCompleted / easyQuestions.length) * 100 : 0;
  const mediumPercent = mediumQuestions.length > 0 ? (mediumCompleted / mediumQuestions.length) * 100 : 0;
  const hardPercent = hardQuestions.length > 0 ? (hardCompleted / hardQuestions.length) * 100 : 0;

  // Donut SVG Math
  const size = 180;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius; // ~515.2

  // Portions of strokes
  const easyLen = total > 0 ? (easyCompleted / total) * circumference : 0;
  const mediumLen = total > 0 ? (mediumCompleted / total) * circumference : 0;
  const hardLen = total > 0 ? (hardCompleted / total) * circumference : 0;

  const easyOffset = 0;
  const mediumOffset = -easyLen;
  const hardOffset = -(easyLen + mediumLen);

  return (
    <div className="flex flex-col items-center p-2 select-none">
      {/* SVG Circle Donut */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Base Background Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-100 dark:text-zinc-800"
          />
          {/* Easy Progress Segment (Green) */}
          {easyCompleted > 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#22c55e"
              strokeWidth={strokeWidth}
              strokeDasharray={`${easyLen} ${circumference}`}
              strokeDashoffset={easyOffset}
              className="transition-all duration-500 ease-out"
              strokeLinecap="round"
            />
          )}
          {/* Medium Progress Segment (Yellow) */}
          {mediumCompleted > 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#eab308"
              strokeWidth={strokeWidth}
              strokeDasharray={`${mediumLen} ${circumference}`}
              strokeDashoffset={mediumOffset}
              className="transition-all duration-500 ease-out"
              strokeLinecap="round"
            />
          )}
          {/* Hard Progress Segment (Red) */}
          {hardCompleted > 0 && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth={strokeWidth}
              strokeDasharray={`${hardLen} ${circumference}`}
              strokeDashoffset={hardOffset}
              className="transition-all duration-500 ease-out"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Center Labels */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            {totalCompleted}
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
            of {total}
          </div>
          <div className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">
            Solved
          </div>
        </div>
      </div>

      {/* Difficulty Stats List */}
      <div className="mt-5 w-full space-y-2.5 px-2">
        {/* Easy */}
        <div className="flex items-center text-xs font-semibold">
          <div className="flex items-center gap-2 flex-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-zinc-400">Easy</span>
          </div>
          <span className="text-gray-900 dark:text-gray-200 w-14 text-right">
            {easyCompleted} / {easyQuestions.length}
          </span>
          <span className="text-gray-400 dark:text-zinc-500 w-10 text-right">
            {easyPercent.toFixed(0)}%
          </span>
        </div>
        {/* Medium */}
        <div className="flex items-center text-xs font-semibold">
          <div className="flex items-center gap-2 flex-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="text-gray-600 dark:text-zinc-400">Medium</span>
          </div>
          <span className="text-gray-900 dark:text-gray-200 w-14 text-right">
            {mediumCompleted} / {mediumQuestions.length}
          </span>
          <span className="text-gray-400 dark:text-zinc-500 w-10 text-right">
            {mediumPercent.toFixed(0)}%
          </span>
        </div>
        {/* Hard */}
        <div className="flex items-center text-xs font-semibold">
          <div className="flex items-center gap-2 flex-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-gray-600 dark:text-zinc-400">Hard</span>
          </div>
          <span className="text-gray-900 dark:text-gray-200 w-14 text-right">
            {hardCompleted} / {hardQuestions.length}
          </span>
          <span className="text-gray-400 dark:text-zinc-500 w-10 text-right">
            {hardPercent.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { 
    isQuestionCompleted, 
    revisionFilterActive, 
    isRevisionMarked,
    theme 
  } = useStore();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

  const MIN_WIDTH = 280;
  const MAX_WIDTH = 480;

  // Handle Resize Mouse Events
  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Calculate stats for a single step
  const getStepStats = (step) => {
    const questions = step.topics.flatMap(t => t.questions);
    const filteredQuestions = revisionFilterActive 
      ? questions.filter(q => isRevisionMarked(q.id))
      : questions;

    const totalQuestions = filteredQuestions.length;
    const easy = filteredQuestions.filter(q => q.difficulty.toLowerCase() === 'easy');
    const medium = filteredQuestions.filter(q => q.difficulty.toLowerCase() === 'medium');
    const hard = filteredQuestions.filter(q => q.difficulty.toLowerCase() === 'hard');

    const easyCompleted = easy.filter(q => isQuestionCompleted(q.id)).length;
    const mediumCompleted = medium.filter(q => isQuestionCompleted(q.id)).length;
    const hardCompleted = hard.filter(q => isQuestionCompleted(q.id)).length;

    const totalCompleted = easyCompleted + mediumCompleted + hardCompleted;

    return {
      totalQuestions,
      totalCompleted,
      easyCompleted,
      mediumCompleted,
      hardCompleted,
    };
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs" 
          onClick={onClose}
        />
      )}

      {/* Main Aside Sidebar */}
      <aside
        ref={sidebarRef}
        style={{
          width: isCollapsed ? '64px' : `${sidebarWidth}px`,
          minWidth: isCollapsed ? '64px' : `${MIN_WIDTH}px`,
          maxWidth: isCollapsed ? '64px' : `${MAX_WIDTH}px`,
        }}
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800
          transform transition-all duration-300 ease-in-out flex flex-col select-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isResizing ? 'transition-none border-r-2 border-brand' : ''}
        `}
      >
        {/* Resize Handle Handle (hidden on mobile and collapsed) */}
        {!isCollapsed && (
          <div
            onMouseDown={startResizing}
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-brand/20 transition-colors z-50 hidden lg:block"
          />
        )}

        {/* Mobile Header (Close Menu) */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 lg:hidden">
          {!isCollapsed && (
            <h2 className="font-bold text-gray-900 dark:text-zinc-200">Steps</h2>
          )}
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 ml-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Collapse/Expand Button (top right of sidebar) */}
        <div className="hidden lg:flex items-center justify-end p-2 border-b border-gray-200 dark:border-zinc-800">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-all"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* EXPANDED VIEW CONTENT */}
        {!isCollapsed && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Overall Donut Progress Chart */}
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
              <DonutProgress />
            </div>

            {/* Steps Scrollable Navigation */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <nav className="space-y-2.5">
                {sheetData
                  .filter((step) => {
                    // Filter steps that have matching revision starred questions if filter is active
                    if (!revisionFilterActive) return true;
                    return step.topics.some(t => t.questions.some(q => isRevisionMarked(q.id)));
                  })
                  .map((step, idx) => {
                    const stats = getStepStats(step);
                    if (stats.totalQuestions === 0) return null;

                    return (
                      <a
                        key={step.id}
                        href={`#${step.id}`}
                        onClick={(e) => {
                          // mobile close sidebar on click
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className="block group"
                      >
                        <div className="px-3 py-2 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-all">
                          <div className="flex items-center justify-between mb-1.5 gap-2">
                            <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 group-hover:text-brand transition-colors truncate">
                              {step.title}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded flex-shrink-0">
                              {stats.totalCompleted}/{stats.totalQuestions}
                            </span>
                          </div>
                          
                          {/* Mini Segmented Bar */}
                          <div className="relative h-1.5 bg-gray-150 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="absolute inset-0 flex">
                              {stats.easyCompleted > 0 && (
                                <div 
                                  className="h-full bg-green-500 transition-all duration-300"
                                  style={{ width: `${(stats.easyCompleted / stats.totalQuestions) * 100}%` }}
                                />
                              )}
                              {stats.mediumCompleted > 0 && (
                                <div 
                                  className="h-full bg-yellow-500 transition-all duration-300"
                                  style={{ width: `${(stats.mediumCompleted / stats.totalQuestions) * 100}%` }}
                                />
                              )}
                              {stats.hardCompleted > 0 && (
                                <div 
                                  className="h-full bg-red-500 transition-all duration-300"
                                  style={{ width: `${(stats.hardCompleted / stats.totalQuestions) * 100}%` }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  })}
              </nav>
            </div>
          </div>
        )}

        {/* COLLAPSED VIEW CONTENT (60px) */}
        {isCollapsed && (
          <div className="flex-1 overflow-y-auto py-4 flex flex-col items-center gap-3 custom-scrollbar">
            {sheetData
              .filter((step) => {
                if (!revisionFilterActive) return true;
                return step.topics.some(t => t.questions.some(q => isRevisionMarked(q.id)));
              })
              .map((step, idx) => {
                const stats = getStepStats(step);
                if (stats.totalQuestions === 0) return null;
                const percent = stats.totalQuestions > 0 ? (stats.totalCompleted / stats.totalQuestions) * 100 : 0;

                return (
                  <a
                    key={step.id}
                    href={`#${step.id}`}
                    className="block group relative"
                    title={`${step.title} - ${stats.totalCompleted}/${stats.totalQuestions} solved`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 hover:border-brand dark:bg-zinc-800 dark:border-zinc-800 flex flex-col items-center justify-center hover:bg-brand/10 dark:hover:bg-brand/10 transition-all relative">
                      <span className="text-xs font-black text-gray-700 dark:text-zinc-300 group-hover:text-brand">
                        {idx + 1}
                      </span>
                      {/* Mini indicator line at the bottom */}
                      {stats.totalCompleted > 0 && (
                        <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden flex">
                          {stats.easyCompleted > 0 && (
                            <div className="h-full bg-green-500" style={{ width: `${(stats.easyCompleted / stats.totalQuestions) * 100}%` }} />
                          )}
                          {stats.mediumCompleted > 0 && (
                            <div className="h-full bg-yellow-500" style={{ width: `${(stats.mediumCompleted / stats.totalQuestions) * 100}%` }} />
                          )}
                          {stats.hardCompleted > 0 && (
                            <div className="h-full bg-red-500" style={{ width: `${(stats.hardCompleted / stats.totalQuestions) * 100}%` }} />
                          )}
                        </div>
                      )}
                    </div>
                  </a>
                );
              })}
          </div>
        )}

        {/* BOTTOM SAVE PANEL */}
        <div className="border-t border-gray-200 dark:border-zinc-800 p-4 bg-gray-50/50 dark:bg-zinc-900/30 flex-shrink-0 flex items-center justify-center">
          {isCollapsed ? (
            <Cloud className="w-5 h-5 text-green-500" title="Progress saved locally" />
          ) : (
            <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-500 dark:text-zinc-400">
              <Cloud className="w-4 h-4 text-green-500" />
              <span>Progress Saved Locally</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
