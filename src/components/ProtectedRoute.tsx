import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getAuthToken } from "@/services";

export function ProtectedRoute() {
  const { isLoading } = useAuth();
  const token = getAuthToken();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-600" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }


  return <Outlet />;
}
