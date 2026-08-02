export interface User {
  id: number;
  Name: string;
  email?: string;
  Diamonds?: number;
  Invites?: number;
  bio?: string;
  Picture?: { url?: string } | null;
  [key: string]: unknown;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
