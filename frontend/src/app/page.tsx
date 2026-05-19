'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MindmapCanvas from '../components/MindmapCanvas';
import AudioTranscriptPlayer from '../components/AudioTranscriptPlayer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const DEFAULT_USER_ID = 'default-user-id';

interface Course {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  documents: { id: string; fileName: string; status: string }[];
  _count?: { chapters: number };
}

interface ConceptNode {
  id: string;
  title: string;
  summary: string;
  originalText: string;
  quickTake: string;
  difficulty: string;
  timeToRead: string;
  orderIndex: number;
  chapterId: string;
  status?: 'locked' | 'available' | 'in_progress' | 'completed';
  flashcards?: { id: string; tag: string; question: string; answer: string }[];
  podcast?: { id: string; audioUrl: string; transcript: any };
  progress?: { status: string }[];
}

interface Chapter {
  id: string;
  title: string;
  orderIndex: number;
  nodes: ConceptNode[];
}

export default function Home() {
  // Global States
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [journeyChapters, setJourneyChapters] = useState<Chapter[]>([]);
  const [flatConcepts, setFlatConcepts] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);
  
  // Tab control in learn area
  const [activeTab, setActiveTab] = useState<'learn' | 'podcast' | 'debate' | 'flashcards'>('learn');

  // Course Upload States
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [uploadText, setUploadText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Theme state
  const [isDark, setIsDark] = useState(false);

  // Spaced Repetition States
  const [dueCards, setDueCards] = useState<any[]>([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Debate States
  const [debateHistory, setDebateHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [debateInput, setDebateInput] = useState('');
  const [isDebateLoading, setIsDebateLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // App metrics
  const [streak, setStreak] = useState(3);
  const [activeNav, setActiveNav] = useState<'dashboard' | 'spaced'>('dashboard');

  // Load user courses initially
  useEffect(() => {
    fetchCourses();
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(systemPrefersDark);
    if (systemPrefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Sync scroll for debate chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [debateHistory, isDebateLoading]);

  // Fetch all user courses
  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/courses?userId=${DEFAULT_USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  // Toggle light/dark mode
  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  // Initialize spaced repetition card review
  const loadDueFlashcards = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/flashcards/due?userId=${DEFAULT_USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        setDueCards(data);
        setCurrentCardIdx(0);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error('Failed to load flashcards:', err);
    }
  };

  // Fetch course journey concept maps
  const selectCourse = async (course: Course) => {
    setActiveCourse(course);
    setSelectedNode(null);
    setActiveTab('learn');
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${course.id}/journey?userId=${DEFAULT_USER_ID}`);
      if (res.ok) {
        const chapters: Chapter[] = await res.json();
        setJourneyChapters(chapters);
        
        // Flatten concepts for React Flow canvas parsing
        const list: any[] = [];
        chapters.forEach((chap) => {
          chap.nodes.forEach((node) => {
            list.push({
              id: node.id,
              title: node.title,
              difficulty: node.difficulty,
              status: node.progress && node.progress[0] ? node.progress[0].status : 'locked',
              orderIndex: node.orderIndex,
            });
          });
        });
        setFlatConcepts(list);
      }
    } catch (err) {
      console.error('Failed to fetch course journey:', err);
    }
  };

  // Handle click on concept nodes inside React Flow mindmap
  const handleConceptSelect = async (conceptId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/nodes/${conceptId}?userId=${DEFAULT_USER_ID}`);
      if (res.ok) {
        const details: ConceptNode = await res.json();
        const adjustedDetails = {
          ...details,
          status: details.progress && details.progress[0] ? (details.progress[0].status as any) : 'available',
        };
        setSelectedNode(adjustedDetails);
        setActiveTab('learn');
        
        // Initialize debate board
        fetchDebate(conceptId);
      }
    } catch (err) {
      console.error('Failed to get concept detail:', err);
    }
  };

  // Update study progress status of concept nodes
  const updateNodeProgress = async (nodeId: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/nodes/${nodeId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: DEFAULT_USER_ID, status }),
      });
      if (res.ok) {
        // Refresh active course details and list
        if (selectedNode && selectedNode.id === nodeId) {
          setSelectedNode((prev) => prev ? { ...prev, status: status as any } : null);
        }
        if (activeCourse) {
          selectCourse(activeCourse);
        }
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  // Socratic Debate triggers
  const fetchDebate = async (nodeId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/debates/${nodeId}?userId=${DEFAULT_USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        setDebateHistory(data.transcript || []);
      }
    } catch (err) {
      console.error('Failed to fetch debate:', err);
    }
  };

  const sendDebateArgument = async () => {
    if (!selectedNode || !debateInput.trim() || isDebateLoading) return;
    const userMsg = debateInput.trim();
    setDebateInput('');
    
    // Add locally immediately to see smooth bubble updates
    setDebateHistory((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsDebateLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/debates/${selectedNode.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: DEFAULT_USER_ID, message: userMsg }),
      });
      
      if (res.ok) {
        const updatedDebate = await res.json();
        setDebateHistory(updatedDebate.transcript);
      }
    } catch (err) {
      console.error('Debate failed:', err);
    } finally {
      setIsDebateLoading(false);
    }
  };

  // Flashcards Reviews feedback triggers
  const submitReviewScore = async (flashcardId: string, ease: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/flashcards/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: DEFAULT_USER_ID, flashcardId, ease }),
      });
      if (res.ok) {
        setIsFlipped(false);
        // Advance current study index
        setTimeout(() => {
          if (activeNav === 'spaced') {
            if (currentCardIdx < dueCards.length - 1) {
              setCurrentCardIdx((prev) => prev + 1);
            } else {
              // Mastered all cards
              setDueCards([]);
              setStreak((prev) => prev + 1);
            }
          } else {
            // Study under selected node
            if (selectedNode?.flashcards && currentCardIdx < selectedNode.flashcards.length - 1) {
              setCurrentCardIdx((prev) => prev + 1);
            } else {
              alert("Congratulations! You've reviewed all flashcards for this concept.");
              setCurrentCardIdx(0);
            }
          }
        }, 300);
      }
    } catch (err) {
      console.error('Failed to review card:', err);
    }
  };

  // Book roadmaps generation triggers
  const handleUploadCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !uploadText.trim()) {
      alert('Please fill in both the Course Title and textbook excerpt contents.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Initializing philosophy sanctuary workspace...');

    try {
      // 1. Create course entry
      const createRes = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: DEFAULT_USER_ID,
          title: newTitle,
          description: newDesc,
        }),
      });

      if (!createRes.ok) throw new Error('Failed to establish course database block.');
      const createdCourse: Course = await createRes.json();

      // 2. Upload text document to parse
      setUploadStatus('Analyzing text, generating chapters, concept nodes & spaced flashcards...');
      const uploadRes = await fetch(`${API_BASE_URL}/courses/${createdCourse.id}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: `${newTitle.toLowerCase().replace(/\s+/g, '-')}.txt`,
          content: uploadText,
        }),
      });

      if (!uploadRes.ok) throw new Error('Text parser pipeline failed.');
      
      // Polling for parsing complete
      let docStatus = 'parsing';
      let attempts = 0;
      while (docStatus === 'parsing' && attempts < 15) {
        attempts++;
        setUploadStatus(`Deep learning analysis processing (Attempt ${attempts}/15)...`);
        await new Promise((r) => setTimeout(r, 2000));
        
        const checkRes = await fetch(`${API_BASE_URL}/courses?userId=${DEFAULT_USER_ID}`);
        if (checkRes.ok) {
          const list: Course[] = await checkRes.json();
          const target = list.find((c) => c.id === createdCourse.id);
          if (target && target.documents && target.documents[0]) {
            docStatus = target.documents[0].status;
          }
        }
      }

      if (docStatus === 'completed') {
        setUploadStatus('Roadmap synthesized successfully! Loading dynamic learning dashboard...');
        await fetchCourses();
        // Open the generated course
        const finalRes = await fetch(`${API_BASE_URL}/courses?userId=${DEFAULT_USER_ID}`);
        if (finalRes.ok) {
          const freshList: Course[] = await finalRes.json();
          const targetCourse = freshList.find((c) => c.id === createdCourse.id);
          if (targetCourse) {
            selectCourse(targetCourse);
          }
        }
      } else {
        throw new Error('Socratic parser service timed out. Check local TTS/LLM keys.');
      }

    } catch (err: any) {
      console.error(err);
      alert(`Error setting up course: ${err.message}. Loading synthetic mock roadmap to guarantee application functions.`);
      // Fetch fresh list to see if a mock course loaded
      fetchCourses();
    } finally {
      setIsUploading(false);
      setUploadStatus('');
      setNewTitle('');
      setNewDesc('');
      setUploadText('');
    }
  };

  // Pre-load standard Existentialism philosophy text snippet helper
  const loadExistentialismExcerpt = () => {
    setNewTitle('Existentialism & Human Emotion');
    setNewDesc('Excerpts from Jean-Paul Sartre and Albert Camus on Absolute Responsibility and absurdity.');
    setUploadText(`Jean-Paul Sartre famously stated that "existence precedes essence." In his view, human beings do not possess an inherent nature or divine blueprint upon birth. Rather, we simply exist, emerge in the world, and only afterward define who we are through our actions and commitments. 

Because there are no cosmic moral laws or supreme creators to dictate values, humans are left completely alone, without excuse or refuge. This is what Sartre describes as being "condemned to be free." Every individual carries the absolute responsibility of shaping their own values and choosing their path. 

On the other hand, Albert Camus explores the friction between human aspiration for meaning and the freezing silence of the universe, a concept he coined as "The Absurd." For Camus, trying to search for rational purpose in a chaotic, silent cosmos results in philosophical friction. Rather than choosing intellectual suicide (religion) or physical suicide, Camus argues we must revolt against this absurdity, embracing our freedom with passion, living in defiance, and finding joy in the perpetual struggle of rolling the boulder up the mountain.`);
  };

  // Pre-load Rationalism sample
  const loadRationalismExcerpt = () => {
    setNewTitle('Rationalist Sanctuary');
    setNewDesc('Meditations on Cartesian doubt and the foundational truths of Spinoza.');
    setUploadText(`René Descartes sought to rebuild the entire structure of human knowledge on a foundation of absolute certainty. He began by systematically doubting everything that could possibly be false, including the evidence of his senses, mathematical theorems, and even the reality of the external world, suspecting an "evil demon" might be deceiving him. 

This extreme skepticism led him to a single, indubitable truth: the very act of doubting proves his existence as a thinking entity. Hence, he formulated his famous principle: "Cogito, ergo sum" — "I think, therefore I am." From this bedrock, he argued that the mind is a non-physical substance distinct from the physical body, a concept known as Cartesian Dualism.

Baruch Spinoza, writing shortly after, rejected Descartes' separation of mind and body. Instead, Spinoza proposed a radical pantheistic monism: there is only one infinite substance, which he called "God or Nature" (Deus sive Natura). Mind and body are not distinct substances, but merely two different attributes of the same infinite reality.`);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden bg-bg-color text-text-color transition-colors duration-300">
      
      {/* LEFT NAVIGATION COLUMN */}
      <aside className="w-full md:w-64 bg-surface-container border-b md:border-b-0 md:border-r border-glass-border flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="material-symbols-outlined text-white text-xl">psychology</span>
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-primary dark:text-white leading-tight font-outfit tracking-tight">PhiloMind</h1>
            <span className="text-[10px] font-black uppercase text-secondary tracking-widest block">AI Learning sanctuary</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 flex flex-col gap-1.5 py-2 overflow-y-auto">
          <button
            onClick={() => {
              setActiveNav('dashboard');
              setActiveCourse(null);
            }}
            className={`w-full py-2.5 px-4 rounded-xl flex items-center gap-3.5 text-xs font-bold transition-all ${
              activeNav === 'dashboard' && !activeCourse
                ? 'bg-purple-500/10 text-purple-500 font-extrabold shadow-sm'
                : 'hover:bg-surface-container-high text-text-muted hover:text-text-color'
            }`}
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
            Dashboard
          </button>
          
          <button
            onClick={() => {
              setActiveNav('spaced');
              setActiveCourse(null);
              loadDueFlashcards();
            }}
            className={`w-full py-2.5 px-4 rounded-xl flex items-center gap-3.5 text-xs font-bold transition-all ${
              activeNav === 'spaced'
                ? 'bg-purple-500/10 text-purple-500 font-extrabold shadow-sm'
                : 'hover:bg-surface-container-high text-text-muted hover:text-text-color'
            }`}
          >
            <span className="material-symbols-outlined text-base">style</span>
            Flashcards Repetition
            {dueCards.length > 0 && (
              <span className="ml-auto bg-purple-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {dueCards.length}
              </span>
            )}
          </button>

          <div className="border-t border-glass-border my-4 pt-4">
            <span className="text-[9px] uppercase tracking-widest font-black text-text-muted px-4 block mb-2">My Philosophy Courses</span>
            <div className="flex flex-col gap-1">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => {
                    setActiveNav('dashboard');
                    selectCourse(course);
                  }}
                  className={`w-full py-2 px-4 rounded-xl flex items-center gap-3 text-xs font-semibold text-left transition-all ${
                    activeCourse?.id === course.id
                      ? 'bg-purple-500/5 text-purple-500 border-l-4 border-purple-500 rounded-l-none pl-3'
                      : 'hover:bg-surface-container-high text-text-muted'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">school</span>
                  <span className="truncate">{course.title}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* User profile & Streak Panel */}
        <div className="p-4 border-t border-glass-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">PM</div>
            <div>
              <span className="text-xs font-bold block leading-tight">Student Workspace</span>
              <span className="text-[10px] text-text-muted">Standard Class</span>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl bg-surface-container-high flex items-center justify-center hover:bg-purple-500/10 hover:text-purple-500 transition-all"
            title="Toggle Light/Dark Theme"
          >
            <span className="material-symbols-outlined text-sm">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto mesh-bg relative">
        {/* Top Header status info */}
        <header className="h-16 px-6 border-b border-glass-border flex items-center justify-between shrink-0 glass-floating z-10 sticky top-0">
          <div>
            <h2 className="font-extrabold text-sm text-primary dark:text-white font-outfit uppercase tracking-wider">
              {activeCourse ? activeCourse.title : activeNav === 'spaced' ? 'Spaced Repetition repetition sanctuary' : 'Sanctuary Dashboard'}
            </h2>
            <p className="text-[10px] text-text-muted">
              {activeCourse ? 'Interactive Mindmap & Learning' : 'Master complex literature via structured pathways'}
            </p>
          </div>

          <div className="flex items-center gap-5">
            {/* Daily Streak Indicator */}
            <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 py-1.5 px-3 rounded-full border border-orange-500/20">
              <span className="material-symbols-outlined text-base animate-pulse">local_fire_department</span>
              <span className="text-xs font-black tracking-wide">{streak} Day Streak</span>
            </div>
          </div>
        </header>

        {/* BODY SWITCH PANELS */}
        <div className="flex-1 p-6 flex flex-col gap-6">
          
          {/* NAV MODULE 1: SPACED REPETITION FLASHCARDS */}
          {activeNav === 'spaced' && (
            <div className="max-w-2xl mx-auto w-full flex flex-col gap-6 py-8">
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl text-purple-500 mb-2">style</span>
                <h3 className="font-extrabold text-2xl text-primary dark:text-white font-outfit">Spaced Repetition Repetitions</h3>
                <p className="text-xs text-text-muted mt-1">Supercharged SM-2 spaced cards to review due philosophy principles.</p>
              </div>

              {dueCards.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-8 text-center"
                >
                  <span className="material-symbols-outlined text-4xl text-emerald-500 mb-2">check_circle</span>
                  <h4 className="font-bold text-base">Perfectly Clean Slate!</h4>
                  <p className="text-xs text-text-muted mt-1 mb-5">There are no cards due for review at this moment. Excellent study discipline!</p>
                  <button
                    onClick={() => setActiveNav('dashboard')}
                    className="py-2 px-5 bg-purple-500 text-white rounded-xl text-xs font-bold hover:scale-[1.03] transition-all shadow-md shadow-purple-500/20"
                  >
                    Return to Dashboard
                  </button>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Progress tracker */}
                  <div className="flex items-center justify-between text-xs font-bold text-text-muted px-1">
                    <span>Card {currentCardIdx + 1} of {dueCards.length}</span>
                    <span>{dueCards.length - currentCardIdx - 1} cards remaining</span>
                  </div>
                  
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${((currentCardIdx) / dueCards.length) * 100}%` }}
                    />
                  </div>

                  {/* 3D Flipping Flashcard Wrapper */}
                  <div className="w-full h-80 perspective-1000 select-none">
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className={`w-full h-full transform-style-3d transition-transform duration-500 cursor-pointer relative ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* CARD FRONT: QUESTION */}
                      <div className="absolute inset-0 bg-surface-container-lowest border-2 border-glass-border rounded-2xl p-8 flex flex-col justify-between backface-hidden shadow-lg shadow-black/5">
                        <span className="text-[10px] font-black uppercase text-purple-500 tracking-wider">Concept Question</span>
                        <div className="text-center font-bold text-lg text-primary dark:text-white px-4 leading-relaxed my-auto">
                          {dueCards[currentCardIdx]?.flashcard?.question}
                        </div>
                        <div className="text-center text-[10px] text-text-muted uppercase font-black tracking-widest">
                          Click Card to Flip & Reveal Answer
                        </div>
                      </div>

                      {/* CARD BACK: ANSWER */}
                      <div className="absolute inset-0 bg-surface-container border-2 border-purple-500/30 rounded-2xl p-8 flex flex-col justify-between backface-hidden rotate-y-180 shadow-lg shadow-purple-500/5">
                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Spaced Answer</span>
                        <div className="text-center text-sm font-semibold text-on-surface dark:text-slate-200 px-4 leading-relaxed my-auto overflow-y-auto">
                          {dueCards[currentCardIdx]?.flashcard?.answer}
                        </div>
                        <div className="text-center text-[10px] text-purple-500 font-extrabold uppercase tracking-widest">
                          Select ease level below to reschedule
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SM-2 Ease Selection Buttons */}
                  <AnimatePresence>
                    {isFlipped && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-4 gap-2.5 pt-2"
                      >
                        <button
                          onClick={() => submitReviewScore(dueCards[currentCardIdx].flashcardId, 1)}
                          className="py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          Again
                        </button>
                        <button
                          onClick={() => submitReviewScore(dueCards[currentCardIdx].flashcardId, 2)}
                          className="py-2.5 rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-500 text-xs font-bold hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                        >
                          Hard
                        </button>
                        <button
                          onClick={() => submitReviewScore(dueCards[currentCardIdx].flashcardId, 3)}
                          className="py-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 text-xs font-bold hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                        >
                          Good
                        </button>
                        <button
                          onClick={() => submitReviewScore(dueCards[currentCardIdx].flashcardId, 4)}
                          className="py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                        >
                          Easy
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* NAV MODULE 2: DASHBOARD HOME & BOOK UPLOAD */}
          {activeNav === 'dashboard' && !activeCourse && (
            <div className="flex-1 flex flex-col gap-8 max-w-5xl mx-auto w-full">
              
              {/* HEADING SECTION */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-extrabold text-2xl text-primary dark:text-white font-outfit">Socratic Learning Sanctuary</h3>
                  <p className="text-xs text-text-muted mt-1">Upload educational philosophy texts, create roadmaps, debate ideas, and master books.</p>
                </div>
              </div>

              {/* TWO COLUMN GRID: UPLOAD & ROADMAP LIST */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                
                {/* COLUMN 1 & 2: TEXT UPLOADER */}
                <div className="md:col-span-2 glass-card rounded-2xl p-6 md:p-8 flex flex-col gap-5 relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="flex items-center gap-3 border-b border-glass-border pb-4">
                    <span className="material-symbols-outlined text-purple-500 text-2xl">publish</span>
                    <div>
                      <h4 className="font-extrabold text-base text-primary dark:text-white">Upload Philosophical Excerpts</h4>
                      <span className="text-[10px] text-text-muted uppercase font-black">Supercharge linear text into interactive mindmaps</span>
                    </div>
                  </div>

                  <form onSubmit={handleUploadCourse} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">Sanctuary Workspace Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Existentialism Basics, Meditations..."
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          disabled={isUploading}
                          className="py-2.5 px-4 text-xs rounded-xl bg-surface-container border border-glass-border text-on-surface focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">Brief Description (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Master Sartrean themes on responsibility"
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          disabled={isUploading}
                          className="py-2.5 px-4 text-xs rounded-xl bg-surface-container border border-glass-border text-on-surface focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-text-muted tracking-wider">Copy/Paste Textbook Chapter or Excerpts</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={loadExistentialismExcerpt}
                            disabled={isUploading}
                            className="text-[9px] uppercase tracking-wider font-extrabold text-purple-500 bg-purple-500/10 hover:bg-purple-500 hover:text-white py-1 px-2.5 rounded-lg transition-all"
                          >
                            Load Existentialism Excerpt
                          </button>
                          <button
                            type="button"
                            onClick={loadRationalismExcerpt}
                            disabled={isUploading}
                            className="text-[9px] uppercase tracking-wider font-extrabold text-purple-500 bg-purple-500/10 hover:bg-purple-500 hover:text-white py-1 px-2.5 rounded-lg transition-all"
                          >
                            Load Rationalism Excerpt
                          </button>
                        </div>
                      </div>
                      <textarea
                        required
                        rows={8}
                        value={uploadText}
                        onChange={(e) => setUploadText(e.target.value)}
                        disabled={isUploading}
                        placeholder="Paste or type relevant philosophical arguments here..."
                        className="p-4 text-xs rounded-xl bg-surface-container border border-glass-border text-on-surface focus:outline-none focus:border-purple-500 transition-colors resize-none leading-relaxed"
                      />
                    </div>

                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <div className="w-8 h-8 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin mb-3"></div>
                        <span className="text-xs font-bold text-purple-500 animate-pulse">{uploadStatus}</span>
                      </div>
                    ) : (
                      <button
                        type="submit"
                        className="py-3 px-6 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 self-start mt-2"
                      >
                        <span className="material-symbols-outlined text-sm">sync</span>
                        Synthesize Learning Roadmap
                      </button>
                    )}
                  </form>
                </div>

                {/* COLUMN 3: ROBUST ACTIVE WORKSPACE CARD */}
                <div className="flex flex-col gap-6">
                  
                  {/* WORKSPACES CARD */}
                  <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
                    <span className="text-[10px] font-black uppercase text-secondary tracking-widest">Active Workspaces</span>
                    <h4 className="font-extrabold text-base leading-tight">My Sanctuary Roadmaps</h4>

                    {courses.length === 0 ? (
                      <div className="py-8 text-center text-text-muted">
                        <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">folder_open</span>
                        <p className="text-xs">No active mindmaps. Use the text uploader or quick excerpts to generate your first learning path!</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                        {courses.map((course) => (
                          <div
                            key={course.id}
                            onClick={() => selectCourse(course)}
                            className="p-3 rounded-xl border border-glass-border bg-surface-container hover:bg-surface-container-high cursor-pointer flex items-center justify-between transition-all"
                          >
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs truncate text-primary dark:text-white">{course.title}</h5>
                              <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest mt-1 block">
                                {course._count?.chapters || 1} Chapters Synthesized
                              </span>
                            </div>
                            <span className="material-symbols-outlined text-purple-500 text-sm">arrow_forward_ios</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* STATS HEATMAP BLOCK */}
                  <div className="glass-card rounded-2xl p-6 flex flex-col gap-3.5 bg-surface-container-lowest">
                    <span className="text-[10px] font-black uppercase text-purple-500 tracking-wider">Weekly Sanctuary Rhythm</span>
                    <div className="flex gap-1.5 items-center">
                      <div className="w-3.5 h-3.5 rounded bg-emerald-500" />
                      <div className="w-3.5 h-3.5 rounded bg-emerald-500" />
                      <div className="w-3.5 h-3.5 rounded bg-purple-500" />
                      <div className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700" />
                      <span className="text-[10px] font-bold text-text-muted ml-2">Mon - Sun Activity</span>
                    </div>
                    <p className="text-[10px] text-text-muted leading-relaxed">
                      Maintaining study rhythm triggers SM-2 spaced updates and unlocks deeper debate credits automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NAV MODULE 3: INTERACTIVE MINDMAP CANVAS & DETAILS */}
          {activeNav === 'dashboard' && activeCourse && (
            <div className="flex-1 flex flex-col gap-6 min-h-0">
              
              {/* BACK BAR */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveCourse(null)}
                  className="py-1.5 px-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold transition-all flex items-center gap-2 border border-glass-border"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Back to Dashboard
                </button>
              </div>

              {/* SPLIT SCREEN LAYOUT */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0">
                
                {/* LEFT COL: MINDMAP CANVAS PANEL (3/5 WIDTH) */}
                <div className="lg:col-span-3 flex flex-col min-h-[400px] lg:min-h-0 bg-surface-container border border-glass-border rounded-3xl overflow-hidden shadow-inner relative">
                  <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <span className="text-[9px] font-black uppercase text-purple-500 bg-surface-container-lowest/80 border border-purple-500/20 px-2.5 py-1 rounded-full tracking-widest shadow-sm">
                      Interactive React Flow Mindmap
                    </span>
                  </div>
                  <MindmapCanvas
                    concepts={flatConcepts}
                    onSelectConcept={handleConceptSelect}
                  />
                </div>

                {/* RIGHT COL: CONCEPT DETAILS & LEARN HUB PANEL (2/5 WIDTH) */}
                <div className="lg:col-span-2 flex flex-col min-h-0">
                  {selectedNode ? (
                    <div className="flex-1 flex flex-col min-h-0 glass-card rounded-3xl border border-glass-border overflow-hidden">
                      
                      {/* Node Header info */}
                      <div className="p-6 border-b border-glass-border shrink-0 flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[9px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-md">
                              {selectedNode.difficulty}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-md">
                              {selectedNode.timeToRead}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-lg text-primary dark:text-white font-outfit leading-snug">
                            {selectedNode.title}
                          </h4>
                        </div>

                        {/* Progress Quick Toggle Button */}
                        <div className="flex items-center shrink-0">
                          {selectedNode.status === 'completed' ? (
                            <button
                              onClick={() => updateNodeProgress(selectedNode.id, 'available')}
                              className="py-1.5 px-3 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                              Completed
                            </button>
                          ) : (
                            <button
                              onClick={() => updateNodeProgress(selectedNode.id, 'completed')}
                              className="py-1.5 px-3 rounded-xl bg-surface-container hover:bg-purple-500 hover:text-white text-text-muted hover:scale-[1.02] text-[10px] font-black uppercase tracking-wider transition-all border border-glass-border"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Tab buttons */}
                      <div className="flex border-b border-glass-border bg-surface-container/30 px-3 py-1.5 shrink-0">
                        <button
                          onClick={() => { setActiveTab('learn'); setCurrentCardIdx(0); }}
                          className={`py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                            activeTab === 'learn' ? 'bg-purple-500 text-white shadow-sm' : 'text-text-muted hover:text-text-color'
                          }`}
                        >
                          Core Text
                        </button>
                        <button
                          onClick={() => { setActiveTab('podcast'); }}
                          className={`py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                            activeTab === 'podcast' ? 'bg-purple-500 text-white shadow-sm' : 'text-text-muted hover:text-text-color'
                          }`}
                        >
                          AI Podcast
                        </button>
                        <button
                          onClick={() => { setActiveTab('debate'); }}
                          className={`py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                            activeTab === 'debate' ? 'bg-purple-500 text-white shadow-sm' : 'text-text-muted hover:text-text-color'
                          }`}
                        >
                          Socratic Debate
                        </button>
                        <button
                          onClick={() => { setActiveTab('flashcards'); setCurrentCardIdx(0); setIsFlipped(false); }}
                          className={`py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                            activeTab === 'flashcards' ? 'bg-purple-500 text-white shadow-sm' : 'text-text-muted hover:text-text-color'
                          }`}
                        >
                          Flashcards
                        </button>
                      </div>

                      {/* Tab content bodies */}
                      <div className="flex-1 overflow-y-auto p-6 min-h-0">
                        
                        {/* TAB 1: CORE TEXT LEARNING */}
                        {activeTab === 'learn' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col gap-6"
                          >
                            <div className="bg-surface-container/40 border border-glass-border p-4.5 rounded-2xl flex flex-col gap-2 relative">
                              <span className="text-[9px] font-black uppercase tracking-widest text-purple-500 block">Philosophical Excerpt</span>
                              <p className="text-xs text-on-surface dark:text-slate-300 italic leading-relaxed pl-3 border-l-2 border-purple-500 font-serif">
                                "{selectedNode.originalText}"
                              </p>
                            </div>

                            <div className="flex flex-col gap-2">
                              <span className="text-[9px] font-black uppercase tracking-widest text-secondary block">AI Dialectic Summary</span>
                              <p className="text-xs text-on-surface dark:text-slate-200 leading-relaxed font-sans">
                                {selectedNode.summary}
                              </p>
                            </div>

                            <div className="border-t border-glass-border pt-4">
                              <span className="text-[9px] font-black uppercase tracking-widest text-text-muted block mb-1.5">Quick Take</span>
                              <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-glass-border flex items-center gap-3">
                                <span className="material-symbols-outlined text-purple-500 text-lg">lightbulb</span>
                                <span className="text-[11px] font-bold text-on-surface-variant dark:text-slate-300">{selectedNode.quickTake}</span>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* TAB 2: AI PODCAST DIALECTIC */}
                        {activeTab === 'podcast' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col justify-start"
                          >
                            {selectedNode.podcast ? (
                              <AudioTranscriptPlayer
                                audioUrl={selectedNode.podcast.audioUrl}
                                transcript={selectedNode.podcast.transcript}
                              />
                            ) : (
                              <div className="py-12 text-center flex flex-col items-center justify-center glass-card rounded-2xl">
                                <div className="w-8 h-8 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin mb-4"></div>
                                <h5 className="font-bold text-xs text-purple-500 animate-pulse uppercase tracking-wider">Synthesizing audio podcast...</h5>
                                <p className="text-[10px] text-text-muted mt-1 px-6 max-w-sm">
                                  Kokoro-82M is preparing speech segments for Host and Guest voices. Audio will appear immediately.
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* TAB 3: SOCRATIC DEBATE CHAT */}
                        {activeTab === 'debate' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col min-h-0"
                          >
                            {/* Dialogue Messages Container */}
                            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 min-h-0 h-80">
                              {debateHistory.map((chat, i) => {
                                const isUser = chat.role === 'user';
                                return (
                                  <div
                                    key={i}
                                    className={`flex flex-col max-w-[85%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
                                  >
                                    <span className="text-[8px] font-black uppercase text-text-muted mb-1 px-1.5 tracking-wider">
                                      {isUser ? 'My Claim' : 'Socratic Rebuttal'}
                                    </span>
                                    <div
                                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                        isUser
                                          ? 'bg-purple-500 text-white rounded-tr-none'
                                          : 'bg-surface-container border border-glass-border text-on-surface rounded-tl-none'
                                      }`}
                                    >
                                      {chat.content}
                                    </div>
                                  </div>
                                );
                              })}
                              
                              {isDebateLoading && (
                                <div className="self-start flex flex-col items-start max-w-[85%]">
                                  <span className="text-[8px] font-black uppercase text-purple-500 animate-pulse px-1.5 tracking-widest">
                                    Socrates Thinking...
                                  </span>
                                  <div className="p-3 bg-surface-container border border-glass-border rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0s' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                                  </div>
                                </div>
                              )}
                              <div ref={chatBottomRef} />
                            </div>

                            {/* Chat input box */}
                            <div className="border-t border-glass-border pt-4 mt-auto shrink-0 flex gap-2">
                              <textarea
                                value={debateInput}
                                onChange={(e) => setDebateInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendDebateArgument();
                                  }
                                }}
                                disabled={isDebateLoading}
                                placeholder="Refute, challenge, or support the concept's claims..."
                                rows={2}
                                className="flex-1 p-3 text-xs bg-surface-container border border-glass-border rounded-xl text-on-surface focus:outline-none focus:border-purple-500 resize-none"
                              />
                              <button
                                onClick={sendDebateArgument}
                                disabled={isDebateLoading || !debateInput.trim()}
                                className="w-12 h-12 rounded-xl bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center transition-all disabled:opacity-50 shrink-0 self-end shadow-md shadow-purple-500/10"
                              >
                                <span className="material-symbols-outlined">send</span>
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* TAB 4: SPACED FLASHCARDS RECALL */}
                        {activeTab === 'flashcards' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col justify-start"
                          >
                            {!selectedNode.flashcards || selectedNode.flashcards.length === 0 ? (
                              <div className="py-12 text-center text-text-muted border border-dashed border-glass-border rounded-2xl">
                                <span className="material-symbols-outlined text-3xl mb-1.5">style</span>
                                <p className="text-xs">No active flashcards found for this concept node.</p>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-5">
                                {/* Flashcard flipping container */}
                                <div className="h-64 perspective-1000 select-none">
                                  <div
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    className={`w-full h-full transform-style-3d transition-transform duration-500 cursor-pointer relative ${
                                      isFlipped ? 'rotate-y-180' : ''
                                    }`}
                                  >
                                    {/* FRONT */}
                                    <div className="absolute inset-0 bg-surface-container border border-glass-border rounded-2xl p-6 flex flex-col justify-between backface-hidden shadow-sm">
                                      <span className="text-[9px] font-black uppercase text-purple-500 tracking-wider">
                                        Active Question (Card {currentCardIdx + 1}/{selectedNode.flashcards.length})
                                      </span>
                                      <div className="text-center font-bold text-sm text-primary dark:text-white px-2 leading-relaxed my-auto">
                                        {selectedNode.flashcards[currentCardIdx]?.question}
                                      </div>
                                      <span className="text-[9px] text-center text-text-muted font-black tracking-widest uppercase">
                                        Click Card to Flip
                                      </span>
                                    </div>

                                    {/* BACK */}
                                    <div className="absolute inset-0 bg-surface-container border-2 border-purple-500/30 rounded-2xl p-6 flex flex-col justify-between backface-hidden rotate-y-180 shadow-md">
                                      <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider">Concept Definition</span>
                                      <div className="text-center text-xs font-semibold text-on-surface dark:text-slate-200 px-2 leading-relaxed my-auto overflow-y-auto">
                                        {selectedNode.flashcards[currentCardIdx]?.answer}
                                      </div>
                                      <span className="text-[9px] text-center text-purple-500 font-extrabold uppercase tracking-widest">
                                        Select review score below
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Response buttons */}
                                <AnimatePresence>
                                  {isFlipped && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="grid grid-cols-4 gap-2 pt-1"
                                    >
                                      <button
                                        onClick={() => submitReviewScore(selectedNode.flashcards![currentCardIdx].id, 1)}
                                        className="py-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 text-[10px] font-bold rounded-xl border border-red-500/20 transition-all"
                                      >
                                        Again
                                      </button>
                                      <button
                                        onClick={() => submitReviewScore(selectedNode.flashcards![currentCardIdx].id, 2)}
                                        className="py-2 bg-orange-500/10 hover:bg-orange-500 hover:text-white text-orange-500 text-[10px] font-bold rounded-xl border border-orange-500/20 transition-all"
                                      >
                                        Hard
                                      </button>
                                      <button
                                        onClick={() => submitReviewScore(selectedNode.flashcards![currentCardIdx].id, 3)}
                                        className="py-2 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white text-indigo-500 text-[10px] font-bold rounded-xl border border-indigo-500/20 transition-all"
                                      >
                                        Good
                                      </button>
                                      <button
                                        onClick={() => submitReviewScore(selectedNode.flashcards![currentCardIdx].id, 4)}
                                        className="py-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 text-[10px] font-bold rounded-xl border border-emerald-500/20 transition-all"
                                      >
                                        Easy
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center glass-card rounded-3xl border border-glass-border">
                      <div className="w-16 h-16 rounded-full bg-purple-500/5 border border-purple-500/10 flex items-center justify-center mb-4.5 animate-pulse">
                        <span className="material-symbols-outlined text-purple-500 text-3xl">psychology</span>
                      </div>
                      <h4 className="font-extrabold text-base text-primary dark:text-white font-outfit">Socratic Sanctuary Active</h4>
                      <p className="text-xs text-text-muted mt-1 px-4 max-w-xs leading-relaxed">
                        Select any unlocked or in-progress concept node from the React Flow canvas to begin your multi-modal learning journey.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
