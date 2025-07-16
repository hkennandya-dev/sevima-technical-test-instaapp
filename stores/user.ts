import { create } from "zustand";

export type User = {
    id: number;
    name: string;
    username: string;
    created_at: string;
    updated_at: string;
};

type UserStore = {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
}));