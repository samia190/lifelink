import { create } from 'zustand';
import { authAPI } from './api';

interface User {
  id: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  profile?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    if (data.data.accessToken) {
      localStorage.setItem('lifelink_token', data.data.accessToken);
      localStorage.setItem('lifelink_refresh', data.data.refreshToken);
      set({ user: data.data.user, isAuthenticated: true });
    }
    return data;
  },

  register: async (formData) => {
    const { data } = await authAPI.register(formData);
    if (data.data.accessToken) {
      localStorage.setItem('lifelink_token', data.data.accessToken);
      localStorage.setItem('lifelink_refresh', data.data.refreshToken);
      set({ user: data.data.user, isAuthenticated: true });
    }
    return data;
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch {}
    localStorage.removeItem('lifelink_token');
    localStorage.removeItem('lifelink_refresh');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('lifelink_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const { data } = await authAPI.profile();
      set({ user: data.data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('lifelink_token');
      localStorage.removeItem('lifelink_refresh');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));

// Chat state
interface ChatState {
  isOpen: boolean;
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
  conversationId: string | null;
  toggle: () => void;
  addMessage: (msg: { role: 'user' | 'assistant'; content: string }) => void;
  setConversationId: (id: string) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  messages: [],
  conversationId: null,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  addMessage: (msg) => set((s) => ({
    messages: [...s.messages, { ...msg, timestamp: new Date() }],
  })),
  setConversationId: (id) => set({ conversationId: id }),
  clear: () => set({ messages: [], conversationId: null }),
}));
