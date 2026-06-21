import React from 'react';
import { Newspaper, Pencil, Plus, Star } from 'lucide-react';
import { useStore } from '../store/useStore';

// Custom SVG for YouTube Play Button
const YoutubeIcon = () => (
  <svg width="24" height="18" viewBox="0 0 26 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M10.4 14.403L17.147 10.3651L10.4 6.3272V14.403ZM25.428 3.86409C25.597 4.49669 25.714 5.34465 25.792 6.42142C25.883 7.49819 25.922 8.4269 25.922 9.23448L26 10.3651C26 13.3127 25.792 15.4797 25.428 16.8661C25.103 18.0774 24.349 18.8581 23.179 19.1946C22.568 19.3696 21.45 19.4907 19.734 19.5715C18.044 19.6657 16.497 19.706 15.067 19.706L13 19.7868C7.553 19.7868 4.16 19.5715 2.821 19.1946C1.651 18.8581 0.897 18.0774 0.572 16.8661C0.403 16.2335 0.286 15.3855 0.208 14.3087C0.117 13.232 0.0779999 12.3033 0.0779999 11.4957L0 10.3651C0 7.41743 0.208 5.25043 0.572 3.86409C0.897 2.65273 1.651 1.87207 2.821 1.53558C3.432 1.36061 4.55 1.23947 6.266 1.15871C7.956 1.0645 9.503 1.02412 10.933 1.02412L13 0.943359C18.447 0.943359 21.84 1.15871 23.179 1.53558C24.349 1.87207 25.103 2.65273 25.428 3.86409Z" 
      fill="#FF0000"
    />
  </svg>
);

// Custom SVG for LeetCode Logo
const LeetCodeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M16.102 17.93l-2.697 2.607c-.466.451-1.211.451-1.677 0l-4.51-4.36a1.14 1.14 0 010-1.62l9.02-8.72a1.13 1.13 0 011.676 0l2.697 2.607c.466.451.466 1.17 0 1.621l-4.51 4.36V17.93zm-5.01-14.77l2.697 2.607c.466.451.466 1.17 0 1.621L4.769 16.108a1.14 1.14 0 01-1.677 0l-2.697-2.607a1.13 1.13 0 010-1.62L9.416 3.16a1.14 1.14 0 011.677 0z" 
      fill="#ffa116"
    />
  </svg>
);

// Custom SVG for GeeksforGeeks Logo
const GfgIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5c-3.03 0-5.5-2.47-5.5-5.5s2.47-5.5 5.5-5.5c1.87 0 3.51.93 4.5 2.35l-1.9 1.9c-.6-.68-1.5-.75-2.6-.75-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5c1.2 0 2.2-.6 2.8-1.5h-2.8v-2.5h5.5v5.5c-1 1.4-2.63 2.3-4.5 2.3z" 
      fill="#2f8d46"
    />
  </svg>
);

export default function QuestionsTable({ questions, onOpenNotes }) {
  const { 
    isQuestionCompleted, 
    toggleQuestion, 
    isRevisionMarked, 
    toggleRevision, 
    getNote 
  } = useStore();

  const getDifficultyClass = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-700 dark:bg-[#0B2816] dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-[#2E1E05] dark:text-yellow-400';
      case 'hard':
        return 'bg-red-100 text-red-700 dark:bg-[#2E0505] dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-400';
    }
  };

  const getPracticeIcon = (link) => {
    if (!link) return null;
    if (link.includes('leetcode.com')) return <LeetCodeIcon />;
    return <GfgIcon />; // Default to GeeksforGeeks
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="table-auto w-full divide-y divide-gray-200 dark:divide-zinc-800 text-left">
        <thead className="bg-gray-50 dark:bg-zinc-900/30 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-center w-16">Status</th>
            <th className="px-4 py-3 w-[45%]">Problem</th>
            <th className="px-4 py-3 text-center w-20">Article</th>
            <th className="px-4 py-3 text-center w-20">Video</th>
            <th className="px-4 py-3 text-center w-20">Practice</th>
            <th className="px-4 py-3 text-center w-20">Note</th>
            <th className="px-4 py-3 text-center w-28">Difficulty</th>
            <th className="px-4 py-3 text-center w-20">Revision</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-150 dark:divide-zinc-800/80 text-sm">
          {questions.map((question) => {
            const hasNote = !!getNote(question.id);
            const isCompleted = isQuestionCompleted(question.id);
            const isStarred = isRevisionMarked(question.id);

            return (
              <tr 
                key={question.id} 
                className={`hover:bg-gray-50/50 dark:hover:bg-zinc-900/20 transition-colors ${
                  isCompleted ? 'bg-green-50/10 dark:bg-green-950/5' : ''
                }`}
              >
                {/* Status */}
                <td className="px-4 py-3.5 text-center">
                  <input
                    id={`status-${question.id}`}
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => toggleQuestion(question.id)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-brand focus:ring-brand dark:bg-zinc-800 cursor-pointer form-checkbox"
                  />
                </td>

                {/* Problem Title */}
                <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-zinc-200">
                  <span className={isCompleted ? 'line-through text-gray-400 dark:text-zinc-500' : ''}>
                    {question.title}
                  </span>
                </td>

                {/* Article Link */}
                <td className="px-4 py-3.5 text-center">
                  {question.articleLink ? (
                    <a
                      href={question.articleLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-gray-500 hover:text-brand dark:text-zinc-400 dark:hover:text-brand transition-colors p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                    >
                      <Newspaper className="w-5 h-5" />
                    </a>
                  ) : (
                    <span className="text-gray-300 dark:text-zinc-700">-</span>
                  )}
                </td>

                {/* Youtube Link */}
                <td className="px-4 py-3.5 text-center">
                  {question.youtubeLink ? (
                    <a
                      href={question.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center hover:opacity-85 transition-opacity"
                    >
                      <YoutubeIcon />
                    </a>
                  ) : (
                    <span className="text-gray-300 dark:text-zinc-700">-</span>
                  )}
                </td>

                {/* Practice Link */}
                <td className="px-4 py-3.5 text-center">
                  {question.practiceLink ? (
                    <a
                      href={question.practiceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center hover:scale-105 transition-transform"
                      title={question.practiceLink.includes('leetcode.com') ? 'LeetCode' : 'GeeksforGeeks'}
                    >
                      {getPracticeIcon(question.practiceLink)}
                    </a>
                  ) : (
                    <span className="text-gray-300 dark:text-zinc-700">-</span>
                  )}
                </td>

                {/* Note Indicator */}
                <td className="px-4 py-3.5 text-center">
                  <button
                    onClick={() => onOpenNotes(question)}
                    className={`inline-flex p-1.5 rounded-lg border transition-colors ${
                      hasNote 
                        ? 'bg-brand/10 border-brand/20 text-brand dark:bg-brand/20 dark:border-brand/30' 
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700 dark:bg-zinc-800/40 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {hasNote ? <Pencil className="w-4.5 h-4.5" /> : <Plus className="w-4.5 h-4.5" />}
                  </button>
                </td>

                {/* Difficulty */}
                <td className="px-4 py-3.5 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getDifficultyClass(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                </td>

                {/* Revision */}
                <td className="px-4 py-3.5 text-center">
                  <button
                    onClick={() => toggleRevision(question.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors group"
                  >
                    <Star 
                      className={`w-5 h-5 transition-all ${
                        isStarred 
                          ? 'fill-yellow-400 stroke-yellow-400' 
                          : 'stroke-gray-300 dark:stroke-zinc-700 group-hover:stroke-gray-400 dark:group-hover:stroke-zinc-500'
                      }`}
                    />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
