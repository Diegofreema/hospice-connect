import { create } from 'zustand';

type AnimationStore = {
  isFinished: boolean;
  setIsFinished: (isFinished: boolean) => void;
};

export const useAnimationStore = create<AnimationStore>((set) => ({
  isFinished: false,
  setIsFinished: (isFinished) => set({ isFinished }),
}));
