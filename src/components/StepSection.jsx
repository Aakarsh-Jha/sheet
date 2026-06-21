import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import TopicSection from './TopicSection';

export default function StepSection({ step, onOpenNotes, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { 
    isQuestionCompleted, 
    isRevisionMarked, 
    revisionFilterActive, 
    searchQuery 
  } = useStore();

  // We need to check if this step matches the active filters.
  // We check if any of the topics contain questions matching search/revision filters.
  const hasMatchingQuestions = step.topics.some((topic) => {
    return topic.questions.some((question) => {
      if (revisionFilterActive && !isRevisionMarked(question.id)) {
        return false;
      }
      if (searchQuery.trim() && !question.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  });

  // If no questions in this step match our search/revision filters, hide the step
  if (!hasMatchingQuestions) return null;

  // Flatten questions list to calculate total progress stats
  const allQuestions = step.topics.flatMap(t => t.questions);
  const filteredAllQuestions = allQuestions.filter((q) => {
    if (revisionFilterActive && !isRevisionMarked(q.id)) return false;
    if (searchQuery.trim() && !q.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const total = filteredAllQuestions.length;
  const easyQuestions = filteredAllQuestions.filter(q => q.difficulty.toLowerCase() === 'easy');
  const mediumQuestions = filteredAllQuestions.filter(q => q.difficulty.toLowerCase() === 'medium');
  const hardQuestions = filteredAllQuestions.filter(q => q.difficulty.toLowerCase() === 'hard');

  const easyCompleted = easyQuestions.filter(q => isQuestionCompleted(q.id)).length;
  const mediumCompleted = mediumQuestions.filter(q => isQuestionCompleted(q.id)).length;
  const hardCompleted = hardQuestions.filter(q => isQuestionCompleted(q.id)).length;

  const totalCompleted = easyCompleted + mediumCompleted + hardCompleted;
  const percentCompleted = total > 0 ? Math.round((totalCompleted / total) * 100) : 0;

  // Reopen automatically if filters are active and matches are found
  useEffect(() => {
    if (searchQuery.trim() || revisionFilterActive) {
      setIsOpen(true);
    }
  }, [searchQuery, revisionFilterActive]);

  return (
    <div 
      id={step.id} 
      className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/40 shadow-sm transition-all duration-200"
    >
      {/* Header Panel */}
      <div className="bg-white dark:bg-zinc-900 px-6 py-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col sm:flex-row sm:items-center justify-between w-full text-left gap-4 group"
          aria-expanded={isOpen}
        >
          {/* Title & Stats */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 group-hover:text-brand transition-colors truncate">
              {step.title}
            </h2>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-zinc-400">
              <span>{totalCompleted} of {total} Solved ({percentCompleted}%)</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>{easyCompleted}/{easyQuestions.length}</span>
                <span className="w-2 h-2 rounded-full bg-yellow-500 ml-1" />
                <span>{mediumCompleted}/{mediumQuestions.length}</span>
                <span className="w-2 h-2 rounded-full bg-red-500 ml-1" />
                <span>{hardCompleted}/{hardQuestions.length}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Toggle Icon */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Linear Progress Bar */}
            <div className="flex-1 sm:w-36 h-2.5 bg-gray-150 dark:bg-zinc-800 rounded-full overflow-hidden relative">
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

            <ChevronDown 
              className={`w-5 h-5 text-gray-400 group-hover:text-brand transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-brand' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {/* Topics list (Expanded) */}
      {isOpen && (
        <div className="p-6 bg-gray-50/50 dark:bg-zinc-950/20 border-t border-gray-100 dark:border-zinc-800/80 space-y-5">
          {step.topics.map((topic) => (
            <TopicSection
              key={topic.id}
              topic={topic}
              onOpenNotes={onOpenNotes}
              defaultOpen={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
