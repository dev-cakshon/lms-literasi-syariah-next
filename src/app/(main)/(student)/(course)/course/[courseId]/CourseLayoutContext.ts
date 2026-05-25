import { createContext } from 'react';

import type { CourseContentItem } from '@/types';

export type CourseLayoutContextType = {
  contentItems: CourseContentItem[];
  refreshContentItems: () => void;
  courseTitle: string;
  courseDescription: string;
  isRoadmapOpen: boolean;
  setRoadmapOpen: (open: boolean) => void;
  myRank: number | null;
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  isChatFabHidden: boolean;
  setChatFabHidden: (hidden: boolean) => void;
};

export const CourseLayoutContext = createContext<CourseLayoutContextType>({
  contentItems: [],
  refreshContentItems: () => undefined,
  courseTitle: '',
  courseDescription: '',
  isRoadmapOpen: false,
  setRoadmapOpen: () => undefined,
  myRank: null,
  isChatOpen: false,
  setChatOpen: () => undefined,
  isChatFabHidden: false,
  setChatFabHidden: () => undefined,
});
