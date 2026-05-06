import { createContext } from 'react';

export type AdminCourseLayoutContextType = {
  refreshContentItems: () => void;
};

export const AdminCourseLayoutContext =
  createContext<AdminCourseLayoutContextType>({
    refreshContentItems: () => undefined,
  });
