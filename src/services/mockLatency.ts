const MOCK_LATENCY_MS = 250;

/** Resolve o valor após a latência simulada, respeitando o cancelamento. */
export function fromMock<T>(produce: () => T, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      try {
        resolve(produce());
      } catch (error) {
        reject(error);
      }
    }, MOCK_LATENCY_MS);

    function onAbort() {
      window.clearTimeout(timer);
      reject(signal?.reason);
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
