import * as semver from 'semver';
import { GitHub } from '@actions/github/lib/utils';
import { Context } from '@actions/github/lib/context';

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
