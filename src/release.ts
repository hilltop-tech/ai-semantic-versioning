import { GitHub } from '@actions/github/lib/utils';
import { Context } from '@actions/github/lib/context';
import * as core from '@actions/core';

export async function createRelease(
  octokit: InstanceType<typeof GitHub>,
  context: Context,
  version: string,
  changelog: string,
  tagPrefix: string = 'v'
): Promise<string> {
  const tagName = `${tagPrefix}${version}`;
  const releaseName = `Release ${tagName}`;

  try {
    const { data: release } = await octokit.rest.repos.createRelease({
      owner: context.repo.owner,
      repo: context.repo.repo,
      tag_name: tagName,
      name: releaseName,
      body: changelog || `## Release ${version}\n\nAutomated release created by AI Semantic Versioning action.`,
      draft: false,
      prerelease: false,
      target_commitish: context.sha
    });

    return release.html_url;
  } catch (error: any) {
    if (error.status === 422 && error.message?.includes('already_exists')) {
      core.warning(`Release ${tagName} already exists`);

      // Get existing release
      const { data: releases } = await octokit.rest.repos.listReleases({
        owner: context.repo.owner,
        repo: context.repo.repo
      });

      const existingRelease = releases.find(r => r.tag_name === tagName);
      return existingRelease?.html_url || '';
    }

    throw error;
  }
}
