import { create } from 'zustand';

type Store = {
  unread: number;
  setUnread: (unread: number) => void;
};

export const useUnread = create<Store>((set) => ({
  unread: 0,
  setUnread: (unread: number) => set({ unread }),
}));
