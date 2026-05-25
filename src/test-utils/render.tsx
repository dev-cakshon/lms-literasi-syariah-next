import { type RenderOptions, render } from '@testing-library/react';
import React from 'react';

import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';

import type { CourseContentItem } from '@/types';

interface CourseLayoutContextValue {
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
}

const defaultCourseLayout: CourseLayoutContextValue = {
  contentItems: [],
  refreshContentItems: jest.fn(),
  courseTitle: 'Test Course',
  courseDescription: '',
  isRoadmapOpen: false,
  setRoadmapOpen: jest.fn(),
  myRank: null,
  isChatOpen: false,
  setChatOpen: jest.fn(),
  isChatFabHidden: false,
  setChatFabHidden: jest.fn(),
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  courseLayout?: Partial<CourseLayoutContextValue>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {},
) {
  const { courseLayout, ...renderOptions } = options;

  const contextValue: CourseLayoutContextValue = {
    ...defaultCourseLayout,
    ...courseLayout,
  };

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <CourseLayoutContext.Provider value={contextValue}>
        {children}
      </CourseLayoutContext.Provider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';
