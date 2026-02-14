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
