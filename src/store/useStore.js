import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Check if IndexedDB is available and working
let useIndexedDB = true;
try {
  if (!window.indexedDB) {
    useIndexedDB = false;
  }
} catch (e) {
  useIndexedDB = false;
}

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    const request = indexedDB.open('dsa-tracker-db', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('store')) {
        db.createObjectStore('store');
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

const parseState = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.state) {
      parsed.state.completedQuestions = new Set(parsed.state.completedQuestions || []);
      parsed.state.revisionQuestions = new Set(parsed.state.revisionQuestions || []);
      parsed.state.notes = new Map(Object.entries(parsed.state.notes || {}));
    }
    return parsed;
  } catch (e) {
    console.error("Failed to parse state", e);
    return null;
  }
};

const serializeState = (value) => {
  const stateToSave = { ...value };
  if (stateToSave.state) {
    stateToSave.state = {
      ...stateToSave.state,
      completedQuestions: Array.from(stateToSave.state.completedQuestions),
      revisionQuestions: Array.from(stateToSave.state.revisionQuestions),
      notes: Object.fromEntries(stateToSave.state.notes),
    };
  }
  return JSON.stringify(stateToSave);
};

const showQuotaAlert = (e) => {
  if (e.name === 'QuotaExceededError' || e.code === 22 || e.number === 0x8007000E) {
    alert("⚠️ Local Storage is Full! The note could not be saved because your browser's storage limit was exceeded. Try clearing some notes or using smaller images.");
  }
};

const customStorage = {
  getItem: async (name) => {
    if (!useIndexedDB) {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      return parseState(raw);
    }

    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction('store', 'readonly');
        const store = tx.objectStore('store');
        const request = store.get(name);
        request.onsuccess = async () => {
          let raw = request.result;
          if (!raw) {
            // Migrate from legacy localStorage
            const legacyRaw = localStorage.getItem(name);
            if (legacyRaw) {
              console.log("Migrating legacy localStorage data to IndexedDB...");
              raw = legacyRaw;
              try {
                const writeTx = db.transaction('store', 'readwrite');
                const writeStore = writeTx.objectStore('store');
                writeStore.put(legacyRaw, name);
              } catch (err) {
                console.error("Migration write failed", err);
              }
            }
          }
          if (!raw) {
            resolve(null);
            return;
          }
          resolve(parseState(raw));
        };
        request.onerror = () => {
          const legacyRaw = localStorage.getItem(name);
          resolve(legacyRaw ? parseState(legacyRaw) : null);
        };
      });
    } catch (e) {
      console.error("IndexedDB failed, falling back to localStorage", e);
      const raw = localStorage.getItem(name);
      return raw ? parseState(raw) : null;
    }
  },

  setItem: async (name, value) => {
    const serialized = serializeState(value);

    if (!useIndexedDB) {
      try {
        localStorage.setItem(name, serialized);
      } catch (e) {
        showQuotaAlert(e);
      }
      return;
    }

    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('store', 'readwrite');
        const store = tx.objectStore('store');
        const request = store.put(serialized, name);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error("IndexedDB setItem failed, falling back to localStorage", e);
      try {
        localStorage.setItem(name, serialized);
      } catch (err) {
        showQuotaAlert(err);
      }
    }
  },

  removeItem: async (name) => {
    localStorage.removeItem(name);
    if (!useIndexedDB) return;

    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction('store', 'readwrite');
        const store = tx.objectStore('store');
        const request = store.delete(name);
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    } catch (e) {
      console.error("IndexedDB removeItem failed", e);
    }
  }
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
          // Support both flat format and raw Zustand storage format
          const targetState = parsed.state ? parsed.state : parsed;
          
          const completed = targetState.completedQuestions || [];
          const revision = targetState.revisionQuestions || [];
          const notesRaw = targetState.notes || {};
          
          let notesMap;
          if (Array.isArray(notesRaw)) {
            notesMap = new Map(notesRaw);
          } else {
            notesMap = new Map(Object.entries(notesRaw));
          }

          set({
            completedQuestions: new Set(completed),
            revisionQuestions: new Set(revision),
            notes: notesMap,
            theme: targetState.theme || 'dark',
          });

          const loadedTheme = targetState.theme || 'dark';
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
