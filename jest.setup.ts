import '@testing-library/jest-dom';

// ─── Firebase SDK global mocks ────────────────────────────────────────────────
// Prevent real Firebase initialization in all tests.
jest.mock('@/lib/firebase', () => ({
  getAuthInstance: jest.fn(() => ({ currentUser: null })),
  getFirestoreInstance: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  FacebookAuthProvider: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  collection: jest.fn(),
  getDoc: jest.fn().mockResolvedValue({ exists: () => false, data: () => ({}) }),
  getDocs: jest.fn().mockResolvedValue({ docs: [], size: 0, forEach: jest.fn() }),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn((ref) => ref),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
  serverTimestamp: jest.fn(() => new Date()),
  increment: jest.fn(),
  arrayUnion: jest.fn(),
  Timestamp: { now: jest.fn(() => new Date()), fromDate: jest.fn() },
}));

jest.mock('firebase/app', () => {
  class FirebaseError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
      this.name = 'FirebaseError';
    }
  }
  return {
    initializeApp: jest.fn(),
    getApps: jest.fn(() => []),
    getApp: jest.fn(),
    FirebaseError,
  };
});

// ─── Next.js navigation global mock ──────────────────────────────────────────
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
}));

// ─── framer-motion global stub ────────────────────────────────────────────────
// Prevents animation-related jsdom errors and console noise.
jest.mock('framer-motion', () => {
  const React = require('react') as typeof import('react');
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, tag: string) {
      return React.forwardRef(function MotionEl(
        { children, ...props }: React.PropsWithChildren<Record<string, unknown>>,
        ref: React.Ref<unknown>,
      ) {
        return React.createElement(tag, { ...props, ref }, children);
      });
    },
  };
  return {
    motion: new Proxy({} as Record<string, unknown>, handler),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useAnimation: () => ({ start: jest.fn(), stop: jest.fn() }),
    useInView: () => [null, false],
  };
});

// ─── canvas-confetti global stub ─────────────────────────────────────────────
jest.mock('canvas-confetti', () => jest.fn());

// ─── ESM-only remark/unified packages (incompatible with Jest jsdom) ─────────
// react-markdown, remark-gfm and their dependencies are ESM-only. Mock them all
// so test suites that import ChatMessage or ChapterContent don't fail to parse.
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: function ReactMarkdown({ children }: { children: string }) {
    const React = require('react') as typeof import('react');
    return React.createElement('div', { 'data-testid': 'markdown-content' }, children);
  },
}));

jest.mock('remark-gfm', () => ({ __esModule: true, default: jest.fn() }));

// ─── @hello-pangea/dnd global stub ───────────────────────────────────────────
// Allows DragDropPlayer to render without real drag-and-drop in jsdom.
jest.mock('@hello-pangea/dnd', () => {
  const React = require('react') as typeof import('react');
  return {
    DragDropContext: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    Droppable: ({
      children,
    }: {
      children: (provided: Record<string, unknown>, snapshot: Record<string, unknown>) => React.ReactNode;
    }) =>
      React.createElement(
        React.Fragment,
        null,
        children(
          { innerRef: () => {}, droppableProps: {}, placeholder: null },
          { isDraggingOver: false },
        ),
      ),
    Draggable: ({
      children,
    }: {
      children: (provided: Record<string, unknown>, snapshot: Record<string, unknown>) => React.ReactNode;
    }) =>
      React.createElement(
        React.Fragment,
        null,
        children(
          { innerRef: () => {}, draggableProps: {}, dragHandleProps: {} },
          { isDragging: false },
        ),
      ),
  };
});

// ─── jsdom polyfills ──────────────────────────────────────────────────────────
// jsdom does not implement scrollIntoView; components that call it would throw
// without this polyfill.
Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: jest.fn(),
});

// ─── Reset all mocks between tests ───────────────────────────────────────────
afterEach(() => {
  jest.resetAllMocks();
});
