import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import QuestionsTable from './QuestionsTable';

export default function TopicSection({ topic, onOpenNotes, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { 
    isQuestionCompleted, 
    isRevisionMarked, 
    revisionFilterActive, 
    searchQuery 
  } = useStore();

  // Apply search query and revision filters to the questions list
  const filteredQuestions = topic.questions.filter((question) => {
    // 1. Revision Filter
    if (revisionFilterActive && !isRevisionMarked(question.id)) {
      return false;
    }
    // 2. Search Query Filter
    if (searchQuery.trim() && !question.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // If no questions match the filters, hide the topic section entirely
  if (filteredQuestions.length === 0) return null;

  // Calculate difficulty-wise progress stats
  const total = filteredQuestions.length;
  const easyQuestions = filteredQuestions.filter(q => q.difficulty.toLowerCase() === 'easy');
  const mediumQuestions = filteredQuestions.filter(q => q.difficulty.toLowerCase() === 'medium');
  const hardQuestions = filteredQuestions.filter(q => q.difficulty.toLowerCase() === 'hard');

  const easyCompleted = easyQuestions.filter(q => isQuestionCompleted(q.id)).length;
  const mediumCompleted = mediumQuestions.filter(q => isQuestionCompleted(q.id)).length;
  const hardCompleted = hardQuestions.filter(q => isQuestionCompleted(q.id)).length;

  const totalCompleted = easyCompleted + mediumCompleted + hardCompleted;

  // Reopen automatically if filters are active and matches are found
  useEffect(() => {
    if (searchQuery.trim() || revisionFilterActive) {
      setIsOpen(true);
    }
  }, [searchQuery, revisionFilterActive]);

  return (
    <div className="bg-white dark:bg-zinc-900 flex flex-col shadow-sm rounded-lg border border-gray-200 dark:border-zinc-800 transition-all duration-200 overflow-hidden">
      
      {/* Segmented Top Border Progress Bar */}
      <div className="relative h-1 bg-gray-100 dark:bg-zinc-800 overflow-hidden">
        <div className="absolute inset-0 flex">
          {easyCompleted > 0 && (
            <div 
              className="h-full bg-green-500 transition-all duration-500" 
              style={{ width: `${(easyCompleted / total) * 100}%` }}
            />
          )}
          {mediumCompleted > 0 && (
            <div 
              className="h-full bg-yellow-500 transition-all duration-500" 
              style={{ width: `${(mediumCompleted / total) * 100}%` }}
            />
          )}
          {hardCompleted > 0 && (
            <div 
              className="h-full bg-red-500 transition-all duration-500" 
              style={{ width: `${(hardCompleted / total) * 100}%` }}
            />
          )}
        </div>
      </div>

      {/* Header Button Toggle */}
      <div className="px-4 py-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left group"
          aria-expanded={isOpen}
        >
          <div className="text-base font-bold text-gray-800 dark:text-zinc-100 group-hover:text-brand transition-colors">
            {topic.title}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 rounded text-xs font-semibold border bg-gray-50 border-gray-200 text-gray-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">
              {totalCompleted} / {total}
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 group-hover:text-brand transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-brand' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {/* Questions list (Expanded) */}
      {isOpen && (
        <div className="border-t border-gray-100 dark:border-zinc-800 p-4 bg-gray-50/10 dark:bg-zinc-900/10">
          <QuestionsTable 
            questions={filteredQuestions} 
            onOpenNotes={onOpenNotes} 
          />
        </div>
      )}
    </div>
  );
}
