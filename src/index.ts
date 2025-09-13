import * as core from '@actions/core';
import * as github from '@actions/github';
import { execSync } from 'child_process';
import { analyzeCommits } from './analyzer';
import { updateVersionFiles } from './updater';
import { createRelease } from './release';
import { getCommitsSinceLastTag, getCurrentVersion, bumpVersion } from './version';

async function run(): Promise<void> {
  try {
    // Get inputs
    const githubToken = core.getInput('GITHUB_TOKEN', { required: true });
    const openaiApiKey = core.getInput('OPENAI_API_KEY', { required: true });
    const openaiModel = core.getInput('OPENAI_API_MODEL') || 'gpt-4o-mini';
    const forceVersion = core.getInput('force_version');
    const shouldCreateRelease = core.getBooleanInput('create_release');
    const tagPrefix = core.getInput('tag_prefix') || 'v';
    const shouldUpdateFiles = core.getBooleanInput('update_files');
    const shouldCommit = core.getBooleanInput('commit_changes');
    const shouldPush = core.getBooleanInput('push_changes');

    const octokit = github.getOctokit(githubToken);
    const context = github.context;

    // Get current version
    const currentVersion = await getCurrentVersion(octokit, context, tagPrefix);
    core.info(`Current version: ${currentVersion}`);
    core.setOutput('previous_version', currentVersion);

    let newVersion: string;
    let bumpType: string;
    let changelog: string = '';

    if (forceVersion) {
      // Use forced version
      newVersion = forceVersion;
      bumpType = 'forced';
      core.info(`Using forced version: ${newVersion}`);
    } else {
      // Get commits since last tag
      const commits = await getCommitsSinceLastTag(octokit, context, tagPrefix);

      if (commits.length === 0) {
        core.warning('No commits found since last tag');
        return;
      }

      core.info(`Found ${commits.length} commits to analyze`);

      // Analyze commits with AI
      const analysis = await analyzeCommits(commits, openaiApiKey, openaiModel);
      bumpType = analysis.bumpType;
      changelog = analysis.changelog;

      // Calculate new version
      newVersion = bumpVersion(currentVersion, bumpType);
      core.info(`Determined bump type: ${bumpType}`);
      core.info(`New version: ${newVersion}`);
    }

    // Set outputs
    core.setOutput('version', newVersion);
    core.setOutput('bump_type', bumpType);
    core.setOutput('changelog', changelog);

    // Update version files
    if (shouldUpdateFiles) {
      core.info('Updating version files...');
      const updatedFiles = await updateVersionFiles(newVersion);
      core.info(`Updated ${updatedFiles.length} files`);
    }

    // Commit and push changes
    if (shouldCommit && shouldUpdateFiles) {
      // Configure git
      execSync('git config --local user.email "action@github.com"');
      execSync('git config --local user.name "GitHub Action"');

      // Add and commit changes
      execSync('git add -A');

      try {
        execSync(`git commit -m "chore(release): bump version to ${newVersion} [skip ci]"`);
        core.info('Committed version changes');

        // Create tag
        const tagName = `${tagPrefix}${newVersion}`;
        execSync(`git tag ${tagName} -m "Release version ${newVersion}"`);
        core.info(`Created tag: ${tagName}`);

        // Push if enabled
        if (shouldPush) {
          execSync(`git push origin HEAD:${context.ref.replace('refs/heads/', '')}`);
          execSync(`git push origin ${tagName}`);
          core.info('Pushed changes and tag');
        }
      } catch (error) {
        core.info('No changes to commit');
      }
    }

    // Create GitHub release
    if (shouldCreateRelease) {
      core.info('Creating GitHub release...');
      const releaseUrl = await createRelease(octokit, context, newVersion, changelog, tagPrefix);
      core.info(`Release created: ${releaseUrl}`);
    }

    core.info('✅ Semantic versioning completed successfully!');
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unknown error occurred');
    }
  }
}

run();
