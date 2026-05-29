import { Routes, Route, Navigate } from "react-router-dom";

import HomePages from "./pages/HomePages";
import Flashcards from "./pages/Flashcards";
import FlashcardDetail from "./pages/FlashcardDetail";
import DebateCorner from "./pages/DebateCorner";
import Quiz from "./pages/Quiz";
import Lesson from "./pages/Lesson";
import Docs from "./pages/Docs";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// QUIZ SUB-PAGES
import MatchingQuiz from "./pages/MatchingQuiz";
import AnalysisQuiz from "./pages/AnalysisQuiz";
import EssayQuiz from "./pages/EssayQuiz";
import ImageQuiz from "./pages/ImageQuiz";
import MCQQuiz from "./pages/MCQQuiz";

function App() {
  return (
    <Routes>
      {/* Default -> /home */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Main pages */}
      <Route path="/home" element={<HomePages />} />
      <Route path="/flashcards" element={<Flashcards />} />
      <Route path="/flashcards/:id" element={<FlashcardDetail />} />
      <Route path="/debate" element={<DebateCorner />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/lessons" element={<Lesson />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/settings" element={<Settings />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Quiz sub-pages */}
      <Route path="/quiz/matching" element={<MatchingQuiz />} />
      <Route path="/quiz/analysis" element={<AnalysisQuiz />} />
      <Route path="/quiz/essay" element={<EssayQuiz />} />
      <Route path="/quiz/mcq" element={<MCQQuiz />} />
      <Route path="/image-quiz" element={<ImageQuiz />} />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
