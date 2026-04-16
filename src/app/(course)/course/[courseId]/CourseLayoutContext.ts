import { createContext } from 'react';

import type { CourseContentItem } from '@/types';

export type CourseLayoutContextType = {
  contentItems: CourseContentItem[];
  refreshContentItems: () => void;
};

export const CourseLayoutContext = createContext<CourseLayoutContextType>({
  contentItems: [],
  refreshContentItems: () => undefined,
});
