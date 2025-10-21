/**
 * Result of commit analysis containing version bump information
 */
export interface CommitAnalysis {
    /** Type of version bump to perform */
    bumpType: 'major' | 'minor' | 'patch';
    /** Generated changelog in markdown format */
    changelog: string;
    /** Reasons for the version bump decision */
    reasons: string[];
    /** List of breaking changes found */
    breakingChanges: string[];
    /** List of new features found */
    features: string[];
    /** List of bug fixes found */
    fixes: string[];
}
/**
 * Analyzes commit messages to determine the appropriate semantic version bump
 *
 * Uses OpenAI GPT to intelligently analyze commits. Falls back to conventional
 * commit parsing if AI analysis fails.
 *
 * @param commits - Array of commit messages to analyze
 * @param apiKey - OpenAI API key for AI analysis
 * @param model - OpenAI model to use (default: 'gpt-4o-mini')
 * @returns Promise resolving to commit analysis result
 *
 * @example
 * ```typescript
 * const commits = ['feat: add login', 'fix: resolve crash'];
 * const analysis = await analyzeCommits(commits, apiKey, 'gpt-4o-mini');
 * console.log(analysis.bumpType); // 'minor'
 * ```
 */
export declare function analyzeCommits(commits: string[], apiKey: string, model?: string): Promise<CommitAnalysis>;
