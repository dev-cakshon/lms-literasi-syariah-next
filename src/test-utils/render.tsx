import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';

import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';

import type { CourseContentItem } from '@/types';

interface CourseLayoutContextValue {
  contentItems: CourseContentItem[];
  refreshContentItems: () => void;
  courseTitle: string;
}

const defaultCourseLayout: CourseLayoutContextValue = {
  contentItems: [],
  refreshContentItems: jest.fn(),
  courseTitle: 'Test Course',
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
