import { createContext } from 'react';

import type { CourseContentItem } from '@/types';

export type AdminCourseLayoutContextType = {
  refreshContentItems: () => void;
  contentItems: CourseContentItem[];
  loading: boolean;
};

export const AdminCourseLayoutContext =
  createContext<AdminCourseLayoutContextType>({
    refreshContentItems: () => undefined,
    contentItems: [],
    loading: true,
  });
