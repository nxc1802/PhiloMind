type CacheEntry<T> = {
  expiresAt: number;
  value: Promise<T>;
};

export class TtlCache<T = unknown> {
  private readonly store = new Map<string, CacheEntry<T>>();

  async getOrSet(
    key: string,
    ttlMs: number,
    loader: () => Promise<T>,
  ): Promise<T> {
    const now = Date.now();
    const cached = this.store.get(key);

    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const value = loader().catch((error) => {
      const current = this.store.get(key);
      if (current?.value === value) {
        this.store.delete(key);
      }
      throw error;
    });

    this.store.set(key, {
      expiresAt: now + ttlMs,
      value,
    });

    return value;
  }

  clear() {
    this.store.clear();
  }

  deletePrefix(prefix: string) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
}
