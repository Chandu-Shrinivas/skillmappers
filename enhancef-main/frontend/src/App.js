import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "@/components/custom/Header";
import Dashboard from "@/pages/Dashboard";
import CodingPage from "@/pages/CodingPage";
import AptitudePage from "@/pages/AptitudePage";
import CommunicationPage from "@/pages/CommunicationPage";
import ProfilePage from "@/pages/ProfilePage";
import OnboardingPage from "@/pages/OnboardingPage";
import { Toaster } from "@/components/ui/sonner";
import { useUser } from "@/context/UserContext";

function AppLayout() {
  const location = useLocation();
  const { user, loading } = useUser();
  const isOnboarding = location.pathname === "/onboarding";

  // Show nothing while checking localStorage
  if (loading) return null;

  // Not logged in and not on onboarding → show onboarding
  if (!user && !isOnboarding) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <OnboardingPage />
        <Toaster position="bottom-right" theme="dark" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {!isOnboarding && <Header />}
      <main className={isOnboarding ? "" : "pt-20"}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/coding" element={<CodingPage />} />
          <Route path="/aptitude" element={<AptitudePage />} />
          <Route path="/communication" element={<CommunicationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
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
