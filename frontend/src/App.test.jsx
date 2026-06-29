import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, expect, test, vi } from 'vitest';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';

vi.mock('./utils/supabaseClient', () => ({
  isMock: true,
  supabase: {
    auth: {
      onAuthStateChange: vi.fn((callback) => {
        callback('SIGNED_OUT', null);
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        };
      }),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

vi.mock('./services/api', () => ({
  api: {
    courses: {
      list: vi.fn().mockResolvedValue([{ id: 'course-1', title: 'Triết học Mác – Lênin' }]),
      getJourney: vi.fn().mockResolvedValue([]),
    },
    debates: { topics: { list: vi.fn().mockResolvedValue([]) } },
    quizzes: { list: vi.fn().mockResolvedValue([]) },
    documents: { list: vi.fn().mockResolvedValue([]) },
    philosofun: { list: vi.fn().mockResolvedValue([]) },
    flashcards: { getDue: vi.fn().mockResolvedValue([]) },
  },
}));

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('auth_provider', 'local');
  localStorage.setItem('mln_auth_current', JSON.stringify({
    id: 'user-1',
    email: 'student@philomind.local',
    name: 'Test Student',
    role: 'student',
  }));
  document.documentElement.classList.remove('dark');
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.colorScheme = '';
});

test('renders PhiloMind home page', async () => {
  renderApp();
  expect((await screen.findAllByText(/PhiloMind/i)).length).toBeGreaterThan(0);
});

test('switches between light and dark themes from the navbar', async () => {
  renderApp();

  fireEvent.click(await screen.findByTitle('Chọn giao diện'));
  fireEvent.click(screen.getByText('Tối'));
  expect(document.documentElement).toHaveClass('dark');
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

  fireEvent.click(screen.getByTitle('Chọn giao diện'));
  fireEvent.click(screen.getByText('Sáng'));
  expect(document.documentElement).not.toHaveClass('dark');
  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
});
