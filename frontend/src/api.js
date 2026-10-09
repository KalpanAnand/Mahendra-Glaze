export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/** Long enough for a sleeping Render instance to wake, without hanging forever. */
export const API_TIMEOUT_MS = 60000;

export class ApiRequestError extends Error {
  constructor(message, { code, status } = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.status = status;
  }
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
    if (err.name === 'AbortError') {
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
