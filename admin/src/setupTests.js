import { vi } from 'vitest';

function createStorageMock() {
  const store = new Map();

  return {
    get length() {
      return store.size;
    },
    clear: vi.fn(() => store.clear()),
    getItem: vi.fn((key) => {
      const normalizedKey = String(key);
      return store.has(normalizedKey) ? store.get(normalizedKey) : null;
    }),
    key: vi.fn((index) => Array.from(store.keys())[index] ?? null),
    removeItem: vi.fn((key) => store.delete(String(key))),
    setItem: vi.fn((key, value) => store.set(String(key), String(value))),
  };
}

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: createStorageMock(),
});

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
