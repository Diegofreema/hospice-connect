import { type Id } from '@/convex/_generated/dataModel';
import { create } from 'zustand';

type Props = {
  id: Id<'schedules'> | null;
  setId: (id: Id<'schedules'>) => void;
  clear: () => void;
};

export const useGetScheduleId = create<Props>((set) => ({
  id: null,
  setId: (id: Id<'schedules'>) => set({ id }),
  clear: () => set({ id: null }),
}));
