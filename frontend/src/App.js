import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./context/AuthContext";
import { api } from "./services/api";
import { queryKeys } from "./services/queryKeys";

import Home from "./pages/Home";
import Practice from "./pages/Practice";
import FlashcardDetail from "./pages/FlashcardDetail";
import DebateCorner from "./pages/DebateCorner";
import Lesson from "./pages/Lesson";
import Docs from "./pages/Docs";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Philosofun from "./pages/Philosofun";

// QUIZ SUB-PAGES
import MatchingQuiz from "./pages/MatchingQuiz";
import AnalysisQuiz from "./pages/AnalysisQuiz";
import EssayQuiz from "./pages/EssayQuiz";
import ImageQuiz from "./pages/ImageQuiz";
import MCQQuiz from "./pages/MCQQuiz";

function App() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Prefetch resources when accessing the website with an active session, or upon logging in
  useEffect(() => {
    if (!isAuthenticated || !user) return; // Wait until authenticated to avoid 401 errors on protected routes

    // 1. Prefetch public resources (shared across all authenticated users)
    queryClient.prefetchQuery({
      queryKey: queryKeys.quizzes.list(null),
      queryFn: async () => {
        const res = await api.quizzes.list();
        return (res || []).filter((q) => !q.nodeId);
      },
      staleTime: 1000 * 60 * 10,
    });

    queryClient.prefetchQuery({
      queryKey: queryKeys.debates.topics(),
      queryFn: () => api.debates.topics.list(),
      staleTime: 1000 * 60 * 10,
    });

    queryClient.prefetchQuery({
      queryKey: queryKeys.documents.list(),
      queryFn: () => api.documents.list(),
      staleTime: 1000 * 60 * 10,
    });

    queryClient.prefetchQuery({
      queryKey: queryKeys.philosofun.list(),
      queryFn: () => api.philosofun.list(),
      staleTime: 1000 * 60 * 10,
    });

    // 2. Prefetch user-specific resources
    const userId = user?.id || JSON.parse(localStorage.getItem('mln_auth_current'))?.id;
    if (userId) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.flashcards.due(userId),
        queryFn: () => api.flashcards.getDue(userId),
        staleTime: 1000 * 60 * 2,
      });
    }
  }, [isAuthenticated, user, queryClient]);

  return (
    <Routes>
      {/* Default -> / */}
      <Route path="/" element={<ProtectedPage><Home /></ProtectedPage>} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/practice" element={<ProtectedPage><Practice /></ProtectedPage>} />
      <Route path="/practice/shinkei/:id" element={<ProtectedPage><FlashcardDetail /></ProtectedPage>} />
      <Route path="/debate" element={<ProtectedPage><DebateCorner /></ProtectedPage>} />
      <Route path="/lessons" element={<ProtectedPage><Lesson /></ProtectedPage>} />
      <Route path="/philosofun" element={<ProtectedPage><Philosofun /></ProtectedPage>} />
      <Route path="/docs" element={<ProtectedPage><Docs /></ProtectedPage>} />
      <Route path="/settings" element={<ProtectedPage><Settings /></ProtectedPage>} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Quiz sub-pages */}
      <Route path="/quiz/matching/:id" element={<ProtectedPage><MatchingQuiz /></ProtectedPage>} />
      <Route path="/quiz/analysis/:id" element={<ProtectedPage><AnalysisQuiz /></ProtectedPage>} />
      <Route path="/quiz/essay/:id" element={<ProtectedPage><EssayQuiz /></ProtectedPage>} />
      <Route path="/quiz/mcq/:id" element={<ProtectedPage><MCQQuiz /></ProtectedPage>} />
      <Route path="/image-quiz/:id" element={<ProtectedPage><ImageQuiz /></ProtectedPage>} />

      {/* Catch-all 404 */}
      <Route path="*" element={<ProtectedPage><NotFound /></ProtectedPage>} />
    </Routes>
  );
}

function RequireAuth({ children }) {
  const { authReady, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Đang kiểm tra phiên đăng nhập...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function ProtectedPage({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}

export default App;
