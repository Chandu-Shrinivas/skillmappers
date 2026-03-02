import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Header from "@/components/custom/Header";
import Dashboard from "@/pages/Dashboard";
import CodingPage from "@/pages/CodingPage";
import AptitudePage from "@/pages/AptitudePage";
import CommunicationPage from "@/pages/CommunicationPage";
import ProfileAnalyticsPage from "@/pages/ProfileAnalyticsPage";
import SignUpPage from "@/pages/SignUpPage";
import SignInPage from "@/pages/SignInPage";
import { Toaster } from "@/components/ui/sonner";

function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith("/sign-up") || location.pathname.startsWith("/sign-in");

  return (
    <div className="min-h-screen bg-[#050505]">
      {!isAuthPage && <Header />}
      <main className={isAuthPage ? "" : "pt-20"}>
        <Routes>
          {/* Public / Auth Routes */}
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <SignedIn><Dashboard /></SignedIn>
          } />
          <Route path="/coding" element={
            <SignedIn><CodingPage /></SignedIn>
          } />
          <Route path="/aptitude" element={
            <SignedIn><AptitudePage /></SignedIn>
          } />
          <Route path="/communication" element={
            <SignedIn><CommunicationPage /></SignedIn>
          } />
          <Route path="/profile" element={
            <SignedIn><ProfileAnalyticsPage /></SignedIn>
          } />

          {/* Fallbacks */}
          <Route path="*" element={
            <SignedOut><Navigate to="/sign-in" replace /></SignedOut>
          } />
        </Routes>

        {/* Catch-all redirect for standard unauthenticated visits to protected root */}
        <SignedOut>
          {(!isAuthPage) && <Navigate to="/sign-in" replace />}
        </SignedOut>

      </main>
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
