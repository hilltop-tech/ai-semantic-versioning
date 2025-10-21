/**
 * Retry utilities for handling transient failures
 */

/**
 * Options for retry behavior
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts?: number;
  /** Initial delay in milliseconds */
  initialDelay?: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Backoff multiplier for exponential backoff */
  backoffMultiplier?: number;
  /** Whether to log retry attempts */
  logRetries?: boolean;
}

/**
 * Default retry options
 */
const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  logRetries: true
};

/**
 * Sleeps for the specified duration
 *
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Executes a function with exponential backoff retry logic
 *
 * @param fn - Async function to execute
 * @param options - Retry configuration options
 * @returns Promise resolving to the function result
 * @throws Error if all retry attempts fail
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   async () => await apiCall(),
 *   { maxAttempts: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === opts.maxAttempts) {
        break;
      }

      if (opts.logRetries) {
        console.log(
          `Attempt ${attempt}/${opts.maxAttempts} failed: ${lastError.message}. Retrying in ${delay}ms...`
        );
      }

      await sleep(delay);
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
    }
  }

  throw new Error(
    `Failed after ${opts.maxAttempts} attempts. Last error: ${lastError?.message}`
  );
}

/**
 * Determines if an error is retryable
 *
 * @param error - Error to check
 * @returns true if the error should trigger a retry
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /ECONNRESET/,
    /ETIMEDOUT/,
    /ENOTFOUND/,
    /rate limit/i,
    /429/,
    /500/,
    /502/,
    /503/,
    /504/
  ];

  return retryablePatterns.some(pattern => pattern.test(error.message));
}
