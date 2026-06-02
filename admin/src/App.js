import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Courses from './pages/Courses';
import Chapters from './pages/Chapters';
import Nodes from './pages/Nodes';
import Flashcards from './pages/Flashcards';
import Quizzes from './pages/Quizzes';
import Podcasts from './pages/Podcasts';
import Debates from './pages/Debates';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/chapters" element={<Chapters />} />
        <Route path="/nodes" element={<Nodes />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/podcasts" element={<Podcasts />} />
        <Route path="/debates" element={<Debates />} />
      </Routes>
    </ToastProvider>
  );
}
