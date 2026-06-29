import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import App from './App';

vi.mock('./services/api', () => ({
  api: {
    auth: { login: vi.fn() },
  },
}));

test('renders admin login screen for unauthenticated users', () => {
  localStorage.clear();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
  });

  expect(container.textContent).toMatch(/PhiloMind Admin/i);

  act(() => {
    root.unmount();
  });
  document.body.removeChild(container);
});
