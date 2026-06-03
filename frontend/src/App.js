import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
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
  return (
    <Routes>
      {/* Default -> /dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Main pages */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/practice" element={<Practice />} />
      <Route path="/practice/shinkei/:id" element={<FlashcardDetail />} />
      <Route path="/debate" element={<DebateCorner />} />
      <Route path="/lessons" element={<Lesson />} />
      <Route path="/philosofun" element={<Philosofun />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/settings" element={<Settings />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Quiz sub-pages */}
      <Route path="/quiz/matching/:id" element={<MatchingQuiz />} />
      <Route path="/quiz/analysis/:id" element={<AnalysisQuiz />} />
      <Route path="/quiz/essay/:id" element={<EssayQuiz />} />
      <Route path="/quiz/mcq/:id" element={<MCQQuiz />} />
      <Route path="/image-quiz/:id" element={<ImageQuiz />} />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
