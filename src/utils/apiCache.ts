/**
 * API Cache & Client-Side Revision Manager for Libra
 * Handles on-demand cached data fetching with server-side revision invalidation.
 */

interface CacheEntry<T> {
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    startIndex: number;
    endIndex: number;
  };
  revision: number | string;
  cachedAt: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const CACHE_PREFIX = 'libra_page_cache_';
const MAX_LOCAL_CACHE_ITEMS = 150;

// Revisions cache
let serverRevisions: Record<string, number> = {};
let lastRevisionFetchTime = 0;

/**
 * Fetch current collection revisions from the server.
 * Avoids aggressive requests by caching revision check for 5 seconds.
 */
export async function getServerRevisions(force = false): Promise<Record<string, number>> {
  const now = Date.now();
  if (!force && now - lastRevisionFetchTime < 5000 && Object.keys(serverRevisions).length > 0) {
    return serverRevisions;
  }

  try {
    const res = await fetch('/api/data-revisions', {
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.revisions) {
        serverRevisions = json.revisions;
        lastRevisionFetchTime = now;
        return serverRevisions;
      }
    }
  } catch (err) {
    console.warn('[Cache] Could not fetch server revisions, using local:', err);
  }

  return serverRevisions;
}

/**
 * Invalidate client cache for a collection when local user mutates data
 */
export function invalidateClientCache(
  collectionName: string,
  mutation?: { type?: 'upsert' | 'delete'; item?: any; id?: string }
) {
  // Bump local revision so existing cached pages become stale
  serverRevisions[collectionName] = Date.now();
  lastRevisionFetchTime = Date.now();

  // Clear memory cache keys starting with collection
  const prefix = `${collectionName}_`;
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }

  // Clear localStorage keys
  try {
    const localKeys = Object.keys(localStorage);
    for (const k of localKeys) {
      if (k.startsWith(CACHE_PREFIX + prefix)) {
        localStorage.removeItem(k);
      }
    }
  } catch {}

  // Notify server of mutation with payload so server updates in-place with ZERO Firestore reads
  try {
    fetch('/api/notify-mutation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection: collectionName,
        type: mutation?.type || 'upsert',
        item: mutation?.item,
        id: mutation?.id || mutation?.item?.id
      })
    }).catch(() => {});
  } catch {}
}

/**
 * Build stable cache key from endpoint and parameters
 */
function buildCacheKey(collectionName: string, params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort();
  const serialized = sortedKeys.map(k => `${k}=${encodeURIComponent(String(params[k] ?? ''))}`).join('&');
  return `${collectionName}_${serialized}`;
}

/**
 * Fetch paginated data on-demand from server with cache & revision checking
 */
export async function fetchPaginatedData<T = any>(
  collectionName: string,
  params: Record<string, any>,
  options: { forceRefresh?: boolean } = {}
): Promise<{
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    startIndex: number;
    endIndex: number;
  };
  fromCache: boolean;
}> {
  const revisions = await getServerRevisions(options.forceRefresh);
  const currentRevision = revisions[collectionName] || 1;
  const cacheKey = buildCacheKey(collectionName, params);

  // 1. Check Memory Cache
  if (!options.forceRefresh && memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey)!;
    if (entry.revision === currentRevision) {
      return {
        data: entry.data,
        pagination: entry.pagination,
        fromCache: true
      };
    }
  }

  // 2. Check LocalStorage Cache
  if (!options.forceRefresh) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + cacheKey);
      if (raw) {
        const entry: CacheEntry<T[]> = JSON.parse(raw);
        if (entry && entry.revision === currentRevision) {
          memoryCache.set(cacheKey, entry);
          return {
            data: entry.data,
            pagination: entry.pagination,
            fromCache: true
          };
        }
      }
    } catch {}
  }

  // 3. Fetch from Server
  const queryParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      queryParams.set(k, String(v));
    }
  }

  if (options.forceRefresh) {
    queryParams.set('force', 'true');
  }

  const res = await fetch(`/api/${collectionName}?${queryParams.toString()}`, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}: Gagal memuat data ${collectionName}`);
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || `Gagal memuat data ${collectionName}`);
  }

  const resultData = (json.data || []) as T[];
  const pagination = json.pagination || {
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 25,
    total: resultData.length,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    startIndex: resultData.length ? 1 : 0,
    endIndex: resultData.length
  };

  const responseRevision = json.revision || currentRevision;

  // 4. Save to Cache
  const newEntry: CacheEntry<T[]> = {
    data: resultData,
    pagination,
    revision: responseRevision,
    cachedAt: Date.now()
  };

  memoryCache.set(cacheKey, newEntry);
  try {
    localStorage.setItem(CACHE_PREFIX + cacheKey, JSON.stringify(newEntry));
    // Cleanup old items if storage grows
    pruneOldLocalStorageCache();
  } catch {}

  return {
    data: resultData,
    pagination,
    fromCache: false
  };
}

function pruneOldLocalStorageCache() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    if (keys.length > MAX_LOCAL_CACHE_ITEMS) {
      // Remove first 15 oldest keys
      for (let i = 0; i < 15; i++) {
        localStorage.removeItem(keys[i]);
      }
    }
  } catch {}
}
