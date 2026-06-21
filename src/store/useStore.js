import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Custom storage to serialize/deserialize ES6 Set and Map types
const customStorage = {
  getItem: (name) => {
    const raw = localStorage.getItem(name);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.state) {
        parsed.state.completedQuestions = new Set(parsed.state.completedQuestions || []);
        parsed.state.revisionQuestions = new Set(parsed.state.revisionQuestions || []);
        parsed.state.notes = new Map(Object.entries(parsed.state.notes || {}));
      }
      return parsed;
    } catch (e) {
      console.error('Error parsing state from localStorage:', e);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      const stateToSave = { ...value };
      if (stateToSave.state) {
        stateToSave.state = {
          ...stateToSave.state,
          completedQuestions: Array.from(stateToSave.state.completedQuestions),
          revisionQuestions: Array.from(stateToSave.state.revisionQuestions),
          notes: Object.fromEntries(stateToSave.state.notes),
        };
      }
      localStorage.setItem(name, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
};

export const useStore = create(
  persist(
    (set, get) => ({
      completedQuestions: new Set(),
      notes: new Map(),
      revisionQuestions: new Set(),
      revisionFilterActive: false,
      searchQuery: '',
      theme: 'dark', // default theme is dark, matching the visual style
      user: null,
      isLoading: false,

      // Theme toggle
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      // Question Completion
      toggleQuestion: (questionId) => {
        set((state) => {
          const next = new Set(state.completedQuestions);
          if (next.has(questionId)) {
            next.delete(questionId);
          } else {
            next.add(questionId);
          }
          return { completedQuestions: next };
        });
      },
      isQuestionCompleted: (questionId) => {
        return get().completedQuestions.has(questionId);
      },

      // Revision Stars
      toggleRevision: (questionId) => {
        set((state) => {
          const next = new Set(state.revisionQuestions);
          if (next.has(questionId)) {
            next.delete(questionId);
          } else {
            next.add(questionId);
          }
          return { revisionQuestions: next };
        });
      },
      isRevisionMarked: (questionId) => {
        return get().revisionQuestions.has(questionId);
      },

      // Notes
      setNote: (questionId, content) => {
        set((state) => {
          const next = new Map(state.notes);
          if (content.trim()) {
            next.set(questionId, content);
          } else {
            next.delete(questionId);
          }
          return { notes: next };
        });
      },
      getNote: (questionId) => {
        return get().notes.get(questionId) || '';
      },
      deleteNote: (questionId) => {
        set((state) => {
          const next = new Map(state.notes);
          next.delete(questionId);
          return { notes: next };
        });
      },

      // Search & Filter
      setSearchQuery: (query) => set({ searchQuery: query }),
      setRevisionFilterActive: (active) => set({ revisionFilterActive: active }),

      // Import / Export backup
      exportData: () => {
        const state = get();
        return JSON.stringify({
          completedQuestions: Array.from(state.completedQuestions),
          revisionQuestions: Array.from(state.revisionQuestions),
          notes: Object.fromEntries(state.notes),
          theme: state.theme,
        });
      },
      importData: (jsonStr) => {
        try {
          const parsed = JSON.parse(jsonStr);
          set({
            completedQuestions: new Set(parsed.completedQuestions || []),
            revisionQuestions: new Set(parsed.revisionQuestions || []),
            notes: new Map(Object.entries(parsed.notes || {})),
            theme: parsed.theme || 'dark',
          });
          const loadedTheme = parsed.theme || 'dark';
          if (loadedTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return true;
        } catch (e) {
          console.error('Failed to import data:', e);
          return false;
        }
      },
    }),
    {
      name: 'dsa-progress-storage',
      storage: customStorage,
    }
  )
);
