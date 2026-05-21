import { createContext } from 'react';

import type { CourseContentItem } from '@/types';

export type AdminCourseLayoutContextType = {
  refreshContentItems: () => Promise<void>;
  contentItems: CourseContentItem[];
  loading: boolean;
};

export const AdminCourseLayoutContext =
  createContext<AdminCourseLayoutContextType>({
    refreshContentItems: () => Promise.resolve(),
    contentItems: [],
    loading: true,
  });
