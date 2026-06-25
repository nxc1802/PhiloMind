import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';

jest.mock('./services/api', () => ({
  api: {
    debates: { topics: { list: jest.fn().mockResolvedValue([]) } },
    quizzes: { list: jest.fn().mockResolvedValue([]) },
    documents: { list: jest.fn().mockResolvedValue([]) },
    philosofun: { list: jest.fn().mockResolvedValue([]) },
    flashcards: { getDue: jest.fn().mockResolvedValue([]) },
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
  document.documentElement.classList.remove('dark');
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.colorScheme = '';
});

test('renders PhiloMind home page', () => {
  renderApp();
  expect(screen.getAllByText(/PhiloMind/i).length).toBeGreaterThan(0);
});

test('switches between light and dark themes from the navbar', () => {
  renderApp();

  fireEvent.click(screen.getByTitle('Chọn giao diện'));
  fireEvent.click(screen.getByText('Tối'));
  expect(document.documentElement).toHaveClass('dark');
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

  fireEvent.click(screen.getByTitle('Chọn giao diện'));
  fireEvent.click(screen.getByText('Sáng'));
  expect(document.documentElement).not.toHaveClass('dark');
  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
});
