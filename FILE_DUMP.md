--- FILE: tailwind.config.ts ---
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
} satisfies Config;

--- END FILE ---

--- FILE: index.html ---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VIC App</title>
  </head>
  <body class="bg-background text-foreground">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

--- END FILE ---

--- FILE: tsconfig.app.json ---
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {"@/*": ["src/*"]}
  },
  "include": ["src"]
}

--- END FILE ---

--- FILE: src/contexts/AuthProvider.tsx ---
import { createContext, useEffect, useMemo, useState } from 'react';
import type { AuthContextType, AuthUser } from './AuthContext';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (token: string) => {
    const response = await fetch(`${API_BASE}/user_turbo`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Unable to fetch user');
    return (await response.json()) as AuthUser;
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetchUser(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('auth_token');
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/user_login_Upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    const token = data.authToken ?? data.auth_token ?? data.token;
    if (!token) throw new Error('No auth token returned');
    localStorage.setItem('auth_token', token);
    const currentUser = await fetchUser(token);
    setUser(currentUser);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) throw new Error('Register failed');
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const value = useMemo(() => ({ user, isLoading, login, register, logout }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

--- END FILE ---

--- FILE: src/contexts/AuthContext.ts ---
export interface AuthUser {
  id?: number;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

--- END FILE ---

--- FILE: src/components/layout/BottomNavigation.tsx ---
import { Home, CalendarDays, Send } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/activities', label: 'Activities', icon: CalendarDays },
  { to: '/activities/invite', label: 'Invite', icon: Send },
];

export function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-xl grid-cols-3">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center gap-1 py-3 text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

--- END FILE ---

--- FILE: src/components/ProtectedRoute.tsx ---
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

--- END FILE ---

--- FILE: src/components/ui/badge.tsx ---
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', {
  variants: {
    variant: {
      default: 'border-transparent bg-primary text-primary-foreground',
      secondary: 'border-transparent bg-secondary text-secondary-foreground',
      outline: 'text-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => <div className={cn(badgeVariants({ variant }), className)} {...props} />;

--- END FILE ---

--- FILE: src/components/ui/separator.tsx ---
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

export const Separator = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>) => (
  <SeparatorPrimitive.Root className={cn('h-px w-full bg-border', className)} {...props} />
);

--- END FILE ---

--- FILE: src/components/ui/input.tsx ---
import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    className={cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };

--- END FILE ---

--- FILE: src/components/ui/label.tsx ---
import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn('text-sm font-medium', className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

--- END FILE ---

--- FILE: src/components/ui/sheet.tsx ---
import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;
export const SheetTitle = Dialog.Title;

export const SheetContent = React.forwardRef<React.ElementRef<typeof Dialog.Content>, React.ComponentPropsWithoutRef<typeof Dialog.Content>>(({ className, children, ...props }, ref) => (
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
    <Dialog.Content ref={ref} className={cn('fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-background p-6 shadow-xl', className)} {...props}>
      {children}
    </Dialog.Content>
  </Dialog.Portal>
));
SheetContent.displayName = 'SheetContent';

--- END FILE ---

--- FILE: src/components/ui/card.tsx ---
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)} {...props} />;
export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />;
export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('font-semibold leading-none tracking-tight', className)} {...props} />;
export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('p-6 pt-0', className)} {...props} />;

--- END FILE ---

--- FILE: src/components/ui/avatar.tsx ---
import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

export const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root ref={ref} className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props} />
));
Avatar.displayName = 'Avatar';

export const AvatarImage = AvatarPrimitive.Image;
export const AvatarFallback = AvatarPrimitive.Fallback;

--- END FILE ---

--- FILE: src/components/ui/button.tsx ---
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-90',
        outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
));
Button.displayName = 'Button';

export { Button, buttonVariants };

--- END FILE ---

--- FILE: src/components/vic/InviteExperienceSheet.tsx ---
import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CreatorSearchSelect } from '@/components/memberspass/CreatorSearchSelect';
import type { Creator } from '@/services/creatorSearch';
import { inviteToActivity } from '@/services/activities';

export function InviteExperienceSheet({ open, onOpenChange, activityId }: { open: boolean; onOpenChange: (open: boolean) => void; activityId: number }) {
  const [selected, setSelected] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(false);

  const onInvite = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await inviteToActivity({ activity_id: activityId, creator_id: selected.id });
      onOpenChange(false);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="space-y-4">
          <SheetTitle>Invite Creator</SheetTitle>
          <CreatorSearchSelect onSelect={setSelected} />
          <Button className="w-full" disabled={!selected || loading} onClick={onInvite}>
            {loading ? 'Inviting...' : selected ? `Invite ${selected.name}` : 'Select creator'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

--- END FILE ---

--- FILE: src/components/memberspass/CreatorCard.tsx ---
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { Creator } from '@/services/creatorSearch';

export function CreatorCard({ creator, onClick }: { creator: Creator; onClick?: () => void }) {
  return (
    <Card className="cursor-pointer hover:bg-accent" onClick={onClick}>
      <CardContent className="flex items-center gap-3 p-4">
        <Avatar>
          <AvatarImage src={creator.avatar} />
          <AvatarFallback>{creator.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{creator.name}</p>
          {creator.username && <p className="text-sm text-muted-foreground">@{creator.username}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

--- END FILE ---

--- FILE: src/components/memberspass/CreatorSearchSelect.tsx ---
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { searchCreators, type Creator } from '@/services/creatorSearch';

export function CreatorSearchSelect({ onSelect }: { onSelect: (creator: Creator) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Creator[]>([]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query) return setResults([]);
      try {
        setResults(await searchCreators(query));
      } catch {
        setResults([]);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="space-y-3">
      <Input placeholder="Search creator" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="space-y-2">
        {results.map((creator) => (
          <button key={creator.id} className="w-full rounded-md border p-2 text-left hover:bg-accent" onClick={() => onSelect(creator)}>
            {creator.name}
          </button>
        ))}
      </div>
    </div>
  );
}

--- END FILE ---

--- FILE: src/components/memberspass/CreatorProfileSheet.tsx ---
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Creator } from '@/services/creatorSearch';

export function CreatorProfileSheet({ creator, open, onOpenChange }: { creator: Creator | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {creator && (
          <div className="space-y-4">
            <SheetTitle>{creator.name}</SheetTitle>
            <Avatar className="h-16 w-16">
              <AvatarImage src={creator.avatar} />
              <AvatarFallback>{creator.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">{creator.bio || 'No bio available.'}</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

--- END FILE ---

--- FILE: src/hooks/useAuth.ts ---
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthProvider';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

--- END FILE ---

--- FILE: src/App.tsx ---
import { Navigate, Route, Routes } from 'react-router-dom';
import MemberspassVICHome from '@/pages/memberspass/MemberspassVICHome';
import ActivitiesHome from '@/pages/ActivitiesHome';
import ActivityDetail from '@/pages/ActivityDetail';
import ActivitiesInvite from '@/pages/ActivitiesInvite';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <span className="font-semibold">VIC</span>
          <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
        </div>
      </header>
      <main className="mx-auto max-w-xl">{children}</main>
      <BottomNavigation />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<ProtectedLayout><MemberspassVICHome /></ProtectedLayout>} />
        <Route path="/activities" element={<ProtectedLayout><ActivitiesHome /></ProtectedLayout>} />
        <Route path="/activities/:id" element={<ProtectedLayout><ActivityDetail /></ProtectedLayout>} />
        <Route path="/activities/invite" element={<ProtectedLayout><ActivitiesInvite /></ProtectedLayout>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

--- END FILE ---

--- FILE: src/main.tsx ---
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthProvider';

document.documentElement.classList.add('dark');

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
);

--- END FILE ---

--- FILE: src/services/xano.ts ---
const API_BASE = 'https://xbut-eryu-hhsg.f2.xano.io/api:vGd6XDW3';

export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

export async function xanoFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!response.ok) throw new Error(`Xano request failed: ${response.status}`);
  return (await response.json()) as T;
}

--- END FILE ---

--- FILE: src/services/activities.ts ---
import { xanoFetch } from './xano';

export interface Activity {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  image?: string;
  date?: string;
  [key: string]: unknown;
}

export const getActivities = () => xanoFetch<Activity[]>('/activities');
export const getActivityDetail = (id: string | number) => xanoFetch<Activity>(`/activities/${id}`);
export const inviteToActivity = (payload: { activity_id: number; creator_id: number }) =>
  xanoFetch('/activities/invite', { method: 'POST', body: JSON.stringify(payload) });

--- END FILE ---

--- FILE: src/services/newInTown.ts ---
import { xanoFetch } from './xano';
import type { Creator } from './creatorSearch';

export const getNewInTown = () => xanoFetch<Creator[]>('/new_in_town');

--- END FILE ---

--- FILE: src/services/creatorSearch.ts ---
import { xanoFetch } from './xano';

export interface Creator {
  id: number;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
}

export const searchCreators = (query: string) => xanoFetch<Creator[]>(`/creator_search?q=${encodeURIComponent(query)}`);

--- END FILE ---

--- FILE: src/lib/utils.ts ---
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

--- END FILE ---

--- FILE: src/index.css ---
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 222 84% 5%;
  --foreground: 210 40% 98%;
  --card: 222 47% 11%;
  --card-foreground: 210 40% 98%;
  --primary: 262 83% 58%;
  --primary-foreground: 210 40% 98%;
  --secondary: 217 33% 17%;
  --secondary-foreground: 210 40% 98%;
  --muted: 215 28% 17%;
  --muted-foreground: 217 9% 65%;
  --accent: 214 32% 13%;
  --accent-foreground: 210 40% 98%;
  --border: 214 32% 20%;
  --input: 214 32% 20%;
  --ring: 262 83% 58%;
  --radius: 0.75rem;
}

* {
  @apply border-border;
}

body {
  @apply min-h-screen bg-background text-foreground antialiased;
}

--- END FILE ---

--- FILE: src/pages/ActivityDetail.tsx ---
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getActivityDetail } from '@/services/activities';
import { InviteExperienceSheet } from '@/components/vic/InviteExperienceSheet';

export default function ActivityDetail() {
  const { id = '' } = useParams();
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data } = useQuery({ queryKey: ['activity', id], queryFn: () => getActivityDetail(id) });

  if (!data) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold">{data.title || data.name}</h1>
      <p className="text-muted-foreground">{data.description}</p>
      <Button onClick={() => setInviteOpen(true)}>Invite creator</Button>
      <InviteExperienceSheet open={inviteOpen} onOpenChange={setInviteOpen} activityId={Number(id)} />
    </div>
  );
}

--- END FILE ---

--- FILE: src/pages/ActivitiesInvite.tsx ---
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getActivities } from '@/services/activities';

export default function ActivitiesInvite() {
  const { data = [] } = useQuery({ queryKey: ['activities-invite'], queryFn: getActivities });

  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold">Invite to activity</h1>
      <div className="space-y-2">
        {data.map((activity) => (
          <Link key={activity.id} className="block rounded-md border p-3 hover:bg-accent" to={`/activities/${activity.id}`}>
            {activity.title || activity.name || `Activity #${activity.id}`}
          </Link>
        ))}
      </div>
    </div>
  );
}

--- END FILE ---

--- FILE: src/pages/ActivitiesHome.tsx ---
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getActivities } from '@/services/activities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ActivitiesHome() {
  const { data = [] } = useQuery({ queryKey: ['activities'], queryFn: getActivities });

  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-2xl font-bold">Activities</h1>
      {data.map((activity) => (
        <Link key={activity.id} to={`/activities/${activity.id}`}>
          <Card className="mb-3 hover:bg-accent">
            <CardHeader><CardTitle>{activity.title || activity.name || `Activity #${activity.id}`}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground line-clamp-2">{activity.description || 'No description'}</p></CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

--- END FILE ---

--- FILE: src/pages/Register.tsx ---
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return;
    await register(name, email, password);
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Create account</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Confirm password</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div>
            <Button className="w-full">Register</Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">Already registered? <Link className="text-primary" to="/login">Login</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}

--- END FILE ---

--- FILE: src/pages/memberspass/MemberspassVICHome.tsx ---
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { CreatorCard } from '@/components/memberspass/CreatorCard';
import { CreatorProfileSheet } from '@/components/memberspass/CreatorProfileSheet';
import { getNewInTown } from '@/services/newInTown';
import { useState } from 'react';
import type { Creator } from '@/services/creatorSearch';

export default function MemberspassVICHome() {
  const { data = [] } = useQuery({ queryKey: ['new-in-town'], queryFn: getNewInTown });
  const [selected, setSelected] = useState<Creator | null>(null);

  return (
    <div className="space-y-4 p-4 pb-24">
      <Helmet><title>VIC Home</title></Helmet>
      <h1 className="text-2xl font-bold">Very Important Creator</h1>
      <p className="text-sm text-muted-foreground">Discover creators and invite them to experiences.</p>
      <div className="space-y-3">
        {data.map((creator, idx) => (
          <motion.div key={creator.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
            <CreatorCard creator={creator} onClick={() => setSelected(creator)} />
          </motion.div>
        ))}
      </div>
      <CreatorProfileSheet creator={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}

--- END FILE ---

--- FILE: src/pages/Login.tsx ---
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Login VIC</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Password</Label><div className="relative"><Input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" className="absolute right-3 top-2.5" onClick={() => setShow((s) => !s)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
            <Button className="w-full" disabled={loading}>{loading ? 'Accessing...' : 'Login'}</Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">No account? <Link className="text-primary" to="/register">Register</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}

--- END FILE ---

--- FILE: tsconfig.json ---
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}

--- END FILE ---

--- FILE: package.json ---
{
  "name": "vic-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-popover": "^1.1.2",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.1",
    "@tanstack/react-query": "^5.59.15",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "framer-motion": "^11.11.11",
    "lucide-react": "^0.462.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-helmet-async": "^2.0.5",
    "react-router-dom": "^6.28.0",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "^5.6.3",
    "vite": "^5.4.10"
  }
}

--- END FILE ---

--- FILE: vite.config.ts ---
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

--- END FILE ---

--- FILE: readme ---
App fòr VIC

--- END FILE ---

--- FILE: tsconfig.node.json ---
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}

--- END FILE ---

--- FILE: postcss.config.js ---
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

--- END FILE ---
