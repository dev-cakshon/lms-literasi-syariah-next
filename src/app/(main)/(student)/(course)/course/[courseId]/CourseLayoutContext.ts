import { createContext } from 'react';

import type { CourseContentItem } from '@/types';

export type CourseLayoutContextType = {
  contentItems: CourseContentItem[];
  refreshContentItems: () => void;
  courseTitle: string;
  isPetaOpen: boolean;
  setPetaOpen: (open: boolean) => void;
  myRank: number | null;
};

export const CourseLayoutContext = createContext<CourseLayoutContextType>({
  contentItems: [],
  refreshContentItems: () => undefined,
  courseTitle: '',
  isPetaOpen: false,
  setPetaOpen: () => undefined,
  myRank: null,
});
