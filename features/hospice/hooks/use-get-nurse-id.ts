import { Id } from '@/convex/_generated/dataModel';
import { create } from 'zustand';

type Props = {
  id: Id<'nurses'> | null;
  setId: (id: Id<'nurses'>) => void;
  clear: () => void;
};

export const useGetNurseId = create<Props>((set) => ({
  id: null,
  setId: (id: Id<'nurses'>) => set({ id }),
  clear: () => set({ id: null }),
}));
