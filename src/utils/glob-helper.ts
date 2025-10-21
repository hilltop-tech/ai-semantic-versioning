/**
 * Helper utilities for file globbing using fast-glob
 */

import fg from 'fast-glob';

/**
 * Finds files matching a glob pattern
 *
 * @param pattern - Glob pattern (e.g., '**\/__init__.py', '*.gemspec')
 * @param options - Additional options
 * @returns Promise resolving to array of matching file paths
 *
 * @example
 * ```typescript
 * const files = await findFiles('**\/__init__.py');
 * console.log(files); // ['src/__init__.py', 'lib/__init__.py']
 * ```
 */
export async function findFiles(
  pattern: string,
  options: {
    ignore?: string[];
    cwd?: string;
    absolute?: boolean;
  } = {}
): Promise<string[]> {
  const defaultIgnore = [
    '**/node_modules/**',
    '**/venv/**',
    '**/env/**',
    '**/.venv/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**'
  ];

  return await fg(pattern, {
    ignore: [...defaultIgnore, ...(options.ignore || [])],
    cwd: options.cwd || process.cwd(),
    absolute: options.absolute || false,
    dot: false,
    onlyFiles: true
  });
}

/**
 * Checks if any files match a glob pattern
 *
 * @param pattern - Glob pattern to check
 * @returns Promise resolving to true if any files match
 */
export async function hasFiles(pattern: string): Promise<boolean> {
  const files = await findFiles(pattern);
  return files.length > 0;
}

/**
 * Finds a single file matching a pattern
 *
 * @param pattern - Glob pattern
 * @returns Promise resolving to first matching file path or null
 */
export async function findFile(pattern: string): Promise<string | null> {
  const files = await findFiles(pattern);
  return files.length > 0 ? files[0] : null;
}
