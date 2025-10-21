import { GitHub } from '@actions/github/lib/utils';
import { Context } from '@actions/github/lib/context';
/**
 * Gets the current version from repository tags
 *
 * Fetches all tags from the repository, filters for valid semantic version tags,
 * and returns the highest version. Returns '0.0.0' if no valid tags exist or on error.
 *
 * @param octokit - Authenticated GitHub API client
 * @param context - GitHub Actions context with repo information
 * @param tagPrefix - Prefix for version tags (default: 'v')
 * @returns Promise resolving to current version string (e.g., '1.2.3')
 *
 * @example
 * ```typescript
 * const version = await getCurrentVersion(octokit, context, 'v');
 * console.log(version); // '1.2.3'
 * ```
 */
export declare function getCurrentVersion(octokit: InstanceType<typeof GitHub>, context: Context, tagPrefix?: string): Promise<string>;
/**
 * Retrieves commit messages since the last version tag
 *
 * Compares HEAD with the last tagged version to get new commits. If no tags exist,
 * retrieves all commits. Automatically filters out merge commits and CI skip commits.
 *
 * @param octokit - Authenticated GitHub API client
 * @param context - GitHub Actions context with repo information
 * @param tagPrefix - Prefix for version tags (default: 'v')
 * @returns Promise resolving to array of commit messages
 *
 * @example
 * ```typescript
 * const commits = await getCommitsSinceLastTag(octokit, context, 'v');
 * console.log(commits); // ['feat: add feature', 'fix: bug fix']
 * ```
 */
export declare function getCommitsSinceLastTag(octokit: InstanceType<typeof GitHub>, context: Context, tagPrefix?: string): Promise<string[]>;
/**
 * Bumps a semantic version based on the bump type
 *
 * Increments the version according to semantic versioning rules:
 * - major: x.0.0 (breaking changes)
 * - minor: x.y.0 (new features)
 * - patch: x.y.z (bug fixes)
 *
 * @param currentVersion - Current semantic version (e.g., '1.2.3')
 * @param bumpType - Type of version bump ('major', 'minor', 'patch', or other defaults to 'patch')
 * @returns New version string
 * @throws Error if currentVersion is not a valid semantic version
 *
 * @example
 * ```typescript
 * bumpVersion('1.2.3', 'minor'); // '1.3.0'
 * bumpVersion('1.2.3', 'major'); // '2.0.0'
 * ```
 */
export declare function bumpVersion(currentVersion: string, bumpType: 'major' | 'minor' | 'patch' | string): string;
