const WORKER = (import.meta.env.VITE_WORKER_URL || '').replace(/\/$/, '');
const SECRET = import.meta.env.VITE_WORKER_SECRET || '';

export const storage = {
  async get(key) {
    try {
      const r = await fetch(
        `${WORKER}/kv/${encodeURIComponent(key)}?secret=${encodeURIComponent(SECRET)}`
      );
      if (r.status === 404) return null;
      if (!r.ok) return null;
      return await r.json(); // { key, value }
    } catch {
      return null;
    }
  },

  async set(key, value) {
    try {
      await fetch(
        `${WORKER}/kv/${encodeURIComponent(key)}?secret=${encodeURIComponent(SECRET)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value }),
        }
      );
      return { key, value };
    } catch {
      return null;
    }
  },
};
