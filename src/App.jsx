import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useStore } from './store/useStore';
import sheetData from './data/sheetData';
import { compressImage } from './utils/image';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import StepSection from './components/StepSection';
import NotesModal from './components/NotesModal';

export default function App() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeNoteQuestion, setActiveNoteQuestion] = useState(null);

  const {
    completedQuestions,
    revisionQuestions,
    revisionFilterActive,
    searchQuery,
    setSearchQuery,
    getNote,
    setNote,
    theme,
    setTheme
  } = useStore();

  // Load and apply initial theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // On startup, find and automatically compress any uncompressed legacy images in existing notes to free up space
  useEffect(() => {
    const optimizeExistingNotes = async () => {
      const { notes, setNote } = useStore.getState();
      let updatedAny = false;

      for (const [questionId, content] of notes.entries()) {
        // Look for raw uncompressed PNG base64 images in saved HTML notes
        if (content.includes('data:image/png;base64,')) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = content;
          const imgs = tempDiv.getElementsByTagName('img');
          let noteUpdated = false;

          for (let img of imgs) {
            if (img.src.startsWith('data:image/png;base64,')) {
              try {
                const compressed = await compressImage(img.src);
                img.src = compressed;
                noteUpdated = true;
              } catch (err) {
                console.error('Failed to compress legacy note image', err);
              }
            }
          }

          if (noteUpdated) {
            setNote(questionId, tempDiv.innerHTML);
            updatedAny = true;
          }
        }
      }

      if (updatedAny) {
        console.log('Successfully optimized and compressed legacy notes in localStorage!');
      }
    };

    optimizeExistingNotes();
  }, []);

  // Check if there are any revision questions matches in sheetData
  const hasRevisionQuestions = sheetData.some((step) => {
    return step.topics.some((topic) => {
      return topic.questions.some(q => revisionQuestions.has(q.id));
    });
  });

  // Calculate overall completed count
  const allQuestions = sheetData.flatMap(step => step.topics.flatMap(topic => topic.questions));
  const completedCount = allQuestions.filter(q => completedQuestions.has(q.id)).length;
  const totalCount = allQuestions.length;

  // Trigger celebration on 100% completion
  useEffect(() => {
    if (completedCount > 0 && completedCount === totalCount) {
      // Fire confetti!
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [completedCount, totalCount]);

  // Handle Note Save callback
  const handleSaveNote = (noteContent) => {
    if (activeNoteQuestion) {
      setNote(activeNoteQuestion.id, noteContent);
    }
  };

  // Determine if there are matching questions in the entire sheet based on search and filters
  const hasFilteredQuestions = sheetData.some((step) => {
    return step.topics.some((topic) => {
      return topic.questions.some((question) => {
        if (revisionFilterActive && !revisionQuestions.has(question.id)) {
          return false;
        }
        if (searchQuery.trim() && !question.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        return true;
      });
    });
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 font-primary transition-colors duration-200">
      
      {/* Top Header */}
      <Header onOpenSidebar={() => setIsMobileSidebarOpen(true)} />

      {/* Main Layout Container */}
      <div className="flex">
        
        {/* Sidebar panel */}
        <Sidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
        />

        {/* Main Content Panels */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
          
          {/* Dashboard Summary Info Card */}
          <div className="bg-gradient-to-r from-brand/10 to-orange-500/10 dark:from-brand/20 dark:to-orange-500/20 border border-brand/20 rounded-xl p-5 sm:p-6 shadow-xs select-none">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-zinc-100 leading-tight">
              A2Z DSA Course Tracker
            </h1>
            <p className="text-gray-600 dark:text-zinc-400 mt-1.5 text-sm max-w-xl font-medium">
              A complete structured roadmap to master Data Structures and Algorithms from scratch, inspired by Striver's A2Z DSA Sheet.
            </p>
          </div>

          {/* Render Warning / Placeholder if no revision items are matched */}
          {revisionFilterActive && !hasRevisionQuestions ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xs animate-in fade-in duration-200">
              <div className="bg-gray-100 dark:bg-zinc-800 rounded-full p-6 mb-6">
                <svg className="w-16 h-16 text-gray-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c-.105-.21-.334-.338-.578-.294l-3.5 3.322c-.122.122-.18.29-.142.459l.99 4.316-3.14 2.82c-.118.118-.163.29-.115.45l.93 4.296-3.23 3.036c-.1.1-.144.25-.102.395l1.37 5.922c.04.143.143.25.285.29l5.9 1.636a.6.6 0 00.32 0l5.9-1.636c.143-.04.246-.147.286-.29l1.37-5.922a.4.4 0 00-.1-.395l-3.23-3.036.93-4.296a.4.4 0 00-.114-.45l-3.14-2.82.99-4.316a.4.4 0 00-.142-.46l-3.5-3.322a.4.4 0 00-.578.295z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-2">No Revision Questions Yet</h3>
              <p className="text-gray-500 dark:text-zinc-400 text-center max-w-sm text-sm">
                Mark questions for revision by clicking the star icon. They will show up here when the revision filter is turned on.
              </p>
            </div>
          ) : !hasFilteredQuestions && searchQuery.trim() ? (
            /* Search Empty State */
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xs animate-in fade-in duration-200">
              <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-2">No Problems Found</h3>
              <p className="text-gray-500 dark:text-zinc-400 text-center max-w-sm text-sm">
                No questions matched your search query "{searchQuery}". Try searching for another topic or check spelling.
              </p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold transition-colors hover:bg-brand/90"
              >
                Clear Search
              </button>
            </div>
          ) : (
            /* Step Sections List */
            <div className="space-y-6">
              {sheetData.map((step, idx) => (
                <StepSection
                  key={step.id}
                  step={step}
                  onOpenNotes={(question) => setActiveNoteQuestion(question)}
                  defaultOpen={idx === 0} // Open Step 1 by default
                />
              ))}
            </div>
          )}

          {/* Footer branding */}
          <footer className="text-center text-xs text-gray-400 dark:text-zinc-600 py-8 border-t border-gray-150 dark:border-zinc-900 mt-12">
            <p>
              Problem sets, structured learning roadmap, and external links are based on Striver's A2Z DSA Course/Sheet created by Raj Vikramaditya.
            </p>
            <p className="mt-1">
              Clone built locally. Progress, revision bookmarks, and rich notes are saved in your local web storage.
            </p>
          </footer>

        </main>
      </div>

      {/* Rich Text Editor Modal for Notes */}
      <NotesModal
        isOpen={activeNoteQuestion !== null}
        onClose={() => setActiveNoteQuestion(null)}
        onSave={handleSaveNote}
        initialNote={activeNoteQuestion ? getNote(activeNoteQuestion.id) : ''}
        questionTitle={activeNoteQuestion ? activeNoteQuestion.title : ''}
      />
    </div>
  );
}
