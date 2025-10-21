import * as semver from 'semver';
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
export async function getCurrentVersion(
  octokit: InstanceType<typeof GitHub>,
  context: Context,
  tagPrefix: string = 'v'
): Promise<string> {
  try {
    // Get all tags
    const { data: tags } = await octokit.rest.repos.listTags({
      owner: context.repo.owner,
      repo: context.repo.repo,
      per_page: 100
    });

    // Filter and sort semantic version tags
    const versionTags = tags
      .map(tag => tag.name)
      .filter(name => {
        const version = name.replace(tagPrefix, '');
        return semver.valid(version) !== null;
      })
      .map(name => name.replace(tagPrefix, ''))
      .sort(semver.rcompare);

    if (versionTags.length > 0) {
      return versionTags[0];
    }
  } catch (error) {
    console.log('Failed to fetch tags:', error);
  }

  return '0.0.0';
}

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
export async function getCommitsSinceLastTag(
  octokit: InstanceType<typeof GitHub>,
  context: Context,
  tagPrefix: string = 'v'
): Promise<string[]> {
  const currentVersion = await getCurrentVersion(octokit, context, tagPrefix);
  const tagName = currentVersion !== '0.0.0' ? `${tagPrefix}${currentVersion}` : null;

  let commits: string[] = [];

  if (tagName) {
    // Get commits since last tag
    const { data: comparison } = await octokit.rest.repos.compareCommitsWithBasehead({
      owner: context.repo.owner,
      repo: context.repo.repo,
      basehead: `${tagName}...HEAD`
    });

    commits = comparison.commits.map(commit => commit.commit.message);
  } else {
    // Get all commits if no tags exist
    const { data: allCommits } = await octokit.rest.repos.listCommits({
      owner: context.repo.owner,
      repo: context.repo.repo,
      per_page: 100
    });

    commits = allCommits.map(commit => commit.commit.message);
  }

  // Filter out merge commits and CI skip commits
  return commits.filter(msg =>
    !msg.startsWith('Merge') &&
    !msg.includes('[skip ci]') &&
    !msg.includes('[ci skip]')
  );
}

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
export function bumpVersion(
  currentVersion: string,
  bumpType: 'major' | 'minor' | 'patch' | string
): string {
  const version = semver.parse(currentVersion);

  if (!version) {
    throw new Error(`Invalid version: ${currentVersion}`);
  }

  switch (bumpType) {
    case 'major':
      return semver.inc(currentVersion, 'major') || currentVersion;
    case 'minor':
      return semver.inc(currentVersion, 'minor') || currentVersion;
    case 'patch':
    default:
      return semver.inc(currentVersion, 'patch') || currentVersion;
  }
}
