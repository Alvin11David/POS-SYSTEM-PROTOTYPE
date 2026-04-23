// Offline response cache for GET requests
// Stores API responses in IndexedDB for offline access

import { openDB, DBSchema, IDBPDatabase } from "idb";

interface CacheEntry {
  id?: string;
  url: string;
  data: string; // JSON stringified
  timestamp: number;
  ttl: number; // time to live in ms
}

interface CacheDB extends DBSchema {
  responses: {
    key: string;
    value: CacheEntry;
  };
}

let db: IDBPDatabase<CacheDB> | null = null;

async function getDb(): Promise<IDBPDatabase<CacheDB>> {
  if (db) return db;

  db = await openDB<CacheDB>("pos-offline-cache", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("responses")) {
        db.createObjectStore("responses", { keyPath: "url" });
      }
    },
  });

  return db;
}

/**
 * Cache a GET response for offline use
 * Default TTL: 24 hours
 */
export async function cacheResponse(
  url: string,
  data: unknown,
  ttlMs: number = 24 * 60 * 60 * 1000,
): Promise<void> {
  try {
    const database = await getDb();
    await database.put("responses", {
      url,
      data: JSON.stringify(data),
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  } catch (error) {
    console.warn("Failed to cache response:", error);
  }
}

/**
 * Retrieve a cached response if it exists and hasn't expired
 */
export async function getCachedResponse(url: string): Promise<unknown | null> {
  try {
    const database = await getDb();
    const entry = await database.get("responses", url);

    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      await database.delete("responses", url);
      return null;
    }

    return JSON.parse(entry.data);
  } catch (error) {
    console.warn("Failed to retrieve cached response:", error);
    return null;
  }
}

/**
 * Clear all cached responses
 */
export async function clearCache(): Promise<void> {
  try {
    const database = await getDb();
    await database.clear("responses");
  } catch (error) {
    console.warn("Failed to clear cache:", error);
  }
}

/**
 * Clear expired entries
 */
export async function clearExpiredCache(): Promise<void> {
  try {
    const database = await getDb();
    const allEntries = await database.getAll("responses");

    for (const entry of allEntries) {
      const isExpired = Date.now() - entry.timestamp > entry.ttl;
      if (isExpired) {
        await database.delete("responses", entry.url);
      }
    }
  } catch (error) {
    console.warn("Failed to clear expired cache:", error);
  }
}
