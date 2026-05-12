import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { App as CapacitorApp } from "@capacitor/app";
import { auth } from "./firebase";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import WorkerFeed from "./pages/WorkerFeed";
import EmployerDashboard from "./pages/EmployerDashboard";
import Profile from "./pages/Profile";
import { getUserProfile } from "./services/userService";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const profileData = await getUserProfile(currentUser.uid);
        setUser({ ...currentUser, ...profileData });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Hardware Back Button (Android)
    const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      const path = window.location.pathname;
      if (path === '/worker/feed' || path === '/employer/dashboard' || path === '/') {
        CapacitorApp.exitApp();
      } else if (!canGoBack) {
        CapacitorApp.exitApp();
      } else {
        window.history.back();
      }
    });

    return () => {
      unsubscribe();
      backButtonListener.remove();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          user 
            ? <Navigate to={!user.userRole ? "/profile" : (user.userRole === 'employer' ? "/employer/dashboard" : "/worker/feed")} replace /> 
            : <LandingPage />
        } />
        <Route path="/auth/worker" element={
          user 
            ? <Navigate to={!user.userRole ? "/profile" : (user.userRole === 'employer' ? "/employer/dashboard" : "/worker/feed")} replace /> 
            : <AuthPage type="worker" />
        } />
        <Route path="/auth/employer" element={
          user 
            ? <Navigate to={!user.userRole ? "/profile" : (user.userRole === 'employer' ? "/employer/dashboard" : "/worker/feed")} replace /> 
            : <AuthPage type="employer" />
        } />
        <Route path="/worker/feed" element={<WorkerFeed />} />
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
