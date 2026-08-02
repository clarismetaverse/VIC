import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import MemberspassVICHome from "@/pages/memberspass/MemberspassVICHome";
import MembersSeeAll from "@/pages/memberspass/MembersSeeAll";
import HangoutsSeeAll from "@/pages/memberspass/HangoutsSeeAll";

import ActivitiesHome from "@/pages/ActivitiesHome";
import ActivityDetail from "@/pages/ActivityDetail";
import ActivitiesInvite from "@/pages/ActivitiesInvite";
import VicProfile from "@/pages/VicProfile";
import Login from "@/pages/Login";
import RegisterVIC from "@/pages/RegisterVIC";
import Apply from "@/pages/Apply";
import ApplyThanks from "@/pages/ApplyThanks";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <main className="mx-auto max-w-xl pb-20">{children}</main>
      <BottomNavigation />
    </div>
  );
}

export default function App() {
  return (
    <>
    <Toaster position="top-center" />
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/apply" element={<Apply />} />
      <Route path="/apply/thanks" element={<ApplyThanks />} />
      <Route path="/register" element={<RegisterVIC />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <ProtectedLayout>
              <MemberspassVICHome />
            </ProtectedLayout>
          }
        />
        <Route
          path="/members/all"
          element={
            <ProtectedLayout>
              <MembersSeeAll />
            </ProtectedLayout>
          }
        />
        <Route
          path="/hangouts/all"
          element={
            <ProtectedLayout>
              <HangoutsSeeAll />
            </ProtectedLayout>
          }
        />

        <Route
          path="/activities"
          element={
            <ProtectedLayout>
              <ActivitiesHome />
            </ProtectedLayout>
          }
        />
        <Route
          path="/activities/:activityId"
          element={
            <ProtectedLayout>
              <ActivityDetail />
            </ProtectedLayout>
          }
        />
        <Route
          path="/activities/invite"
          element={
            <ProtectedLayout>
              <ActivitiesInvite />
            </ProtectedLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedLayout>
              <VicProfile />
            </ProtectedLayout>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>

  );
}
