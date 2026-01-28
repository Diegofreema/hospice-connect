import { type Id } from '@/convex/_generated/dataModel';
import { create } from 'zustand';

type Props = {
  id: Id<'assignments'> | null;
  setId: (id: Id<'assignments'>) => void;
  clear: () => void;
};

export const useSelectAssignment = create<Props>((set) => ({
  id: null,
  setId: (id: Id<'assignments'>) => set({ id }),
  clear: () => set({ id: null }),
}));
