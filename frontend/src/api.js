export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

/** Long enough for a sleeping Render instance to wake, without hanging forever. */
export const API_TIMEOUT_MS = 90000;
const MAX_ATTEMPTS = 3;

export class ApiRequestError extends Error {
  constructor(message, { code, status } = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.status = status;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function isRetryableError(err) {
  if (!(err instanceof ApiRequestError)) return true;
  if (err.code === 'TIMEOUT' || err.code === 'NETWORK') return true;
  return typeof err.status === 'number' && err.status >= 500;
}

export async function fetchJson(url, options = {}) {
  const { timeoutMs = API_TIMEOUT_MS, signal: externalSignal, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', onExternalAbort);
    }
  }

  try {
    const res = await fetch(url, { ...fetchOptions, signal: controller.signal });
    if (!res.ok) {
      throw new ApiRequestError(
        res.status >= 500
          ? 'The catalog is temporarily unavailable. Please try again.'
          : `Could not load data (${res.status}).`,
        { code: 'HTTP', status: res.status }
      );
    }
    return await res.json();
  } catch (err) {
    if (externalSignal?.aborted) {
      throw err;
    }
    if (err?.name === 'AbortError') {
      throw new ApiRequestError('The request took too long. Please try again.', {
        code: 'TIMEOUT',
      });
    }
    if (err instanceof ApiRequestError) {
      throw err;
    }
    throw new ApiRequestError(
      'Unable to reach the catalog. Check your connection and try again.',
      { code: 'NETWORK' }
    );
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }
}

/**
 * Retries timeouts, network errors, and 5xx responses.
 * Does not abort on remount — a cancelled first request can kill a Render cold start.
 */
export async function fetchJsonWithRetry(url, options = {}) {
  const { attempts = MAX_ATTEMPTS, ...fetchOptions } = options;
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fetchJson(url, fetchOptions);
    } catch (err) {
      lastError = err;
      if (err?.name === 'AbortError') throw err;
      if (attempt >= attempts || !isRetryableError(err)) throw err;
      await sleep(2000 * attempt);
    }
  }

  throw lastError;
}

/** Fire-and-forget so opening the homepage can wake a sleeping API before Shop Collection. */
export function wakeCatalog() {
  fetch(`${API_BASE}/api/products`).catch(() => {});
}
