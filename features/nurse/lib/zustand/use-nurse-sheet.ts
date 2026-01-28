import { type DayType } from '@/convex/helper';
import { create } from 'zustand';

type Props = {
  item: DayType;

  setDay: (day: DayType) => void;
  clear: () => void;
};

export const useNurseSheet = create<Props>((set) => ({
  item: {} as DayType,
  setDay: (day: DayType) => set({ item: day }),
  clear: () => set({ item: {} as DayType }),
}));
