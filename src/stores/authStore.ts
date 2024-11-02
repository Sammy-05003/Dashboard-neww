import create from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  userRole: 'admin' | 'user' | null;
  userData: {
    id: string;
    username: string;
  } | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userRole: null,
  userData: null,
  login: async (username, password) => {
    // Mock authentication - replace with actual API call
    if (username === 'admin' && password === 'admin123') {
      set({
        isAuthenticated: true,
        userRole: 'admin',
        userData: { id: '1', username: 'admin' }
      });
    } else if (username === 'user' && password === 'user123') {
      set({
        isAuthenticated: true,
        userRole: 'user',
        userData: { id: '2', username: 'user' }
      });
    } else {
      throw new Error('Invalid credentials');
    }
  },
  logout: () => {
    set({
      isAuthenticated: false,
      userRole: null,
      userData: null
    });
  }
}));