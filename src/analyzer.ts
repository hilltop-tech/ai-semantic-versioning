import OpenAI from 'openai';
import * as core from '@actions/core';

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
export async function analyzeCommits(
  commits: string[],
  apiKey: string,
  model: string = 'gpt-4o-mini'
): Promise<CommitAnalysis> {
  try {
    // Try AI analysis first
    return await analyzeWithAI(commits, apiKey, model);
  } catch (error) {
    core.warning(`AI analysis failed: ${error}, falling back to conventional commits`);
    return analyzeConventionalCommits(commits);
  }
}

/**
 * Analyzes commits using OpenAI GPT models
 *
 * @param commits - Array of commit messages to analyze
 * @param apiKey - OpenAI API key
 * @param model - OpenAI model identifier
 * @returns Promise resolving to commit analysis
 * @throws Error if API call fails or returns invalid data
 * @internal
 */
async function analyzeWithAI(
  commits: string[],
  apiKey: string,
  model: string
): Promise<CommitAnalysis> {
  const openai = new OpenAI({ apiKey });

  const commitText = commits.join('\n');

  const prompt = `Analyze these git commit messages and determine the appropriate semantic version bump.

Semantic Versioning Rules:
- MAJOR (x.0.0): Breaking changes, incompatible API changes to THIS project's public API
- MINOR (0.x.0): New features, backwards compatible functionality additions
- PATCH (0.0.x): Bug fixes, minor improvements, documentation, dependency updates

Important Notes:
- Dependency updates (including major version updates of dependencies) should be treated as PATCH unless they cause breaking changes to THIS project's API
- Examples of dependency updates that are PATCH:
  * "chore(deps): bump axios from 0.x to 1.x"
  * "Update React from v17 to v18"
  * "Upgrade dependencies to latest versions"
  * "chore: update package-lock.json"
- Only mark as MAJOR if the project's own API has breaking changes for its users
- Internal refactoring without API changes is PATCH, not MAJOR

Conventional Commit Patterns to look for:
- BREAKING CHANGE, !: Major version (only if it affects this project's API)
- feat, feature: Minor version
- fix, bugfix, perf, refactor, style, docs, test, chore: Patch version

Commits to analyze:
${commitText}

Respond with a JSON object containing:
1. "bump_type": "major", "minor", or "patch"
2. "reasons": array of strings explaining the decision
3. "breaking_changes": array of breaking changes if any
4. "features": array of new features if any
5. "fixes": array of bug fixes if any

Response format:
{
  "bump_type": "patch",
  "reasons": ["reason1", "reason2"],
  "breaking_changes": ["change1"],
  "features": ["feature1"],
  "fixes": ["fix1"]
}`;

  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a semantic versioning expert. Analyze commit messages and determine appropriate version bumps. Remember that dependency updates (even major versions) are typically PATCH changes unless they break the project\'s own public API.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');

  // Generate changelog
  const changelog = generateChangelog(result);

  return {
    bumpType: result.bump_type || 'patch',
    changelog,
    reasons: result.reasons || [],
    breakingChanges: result.breaking_changes || [],
    features: result.features || [],
    fixes: result.fixes || []
  };
}

/**
 * Analyzes commits using conventional commit standards as fallback
 *
 * Parses commit messages according to conventional commit format:
 * - BREAKING CHANGE or !: triggers major bump
 * - feat/feature: triggers minor bump
 * - fix/bugfix/perf/refactor: triggers patch bump
 *
 * @param commits - Array of commit messages to analyze
 * @returns Commit analysis based on conventional commit patterns
 * @internal
 */
function analyzeConventionalCommits(commits: string[]): CommitAnalysis {
  let hasBreaking = false;
  let hasFeature = false;
  const reasons: string[] = [];
  const breakingChanges: string[] = [];
  const features: string[] = [];
  const fixes: string[] = [];

  const breakingPattern = /BREAKING CHANGE|^[^:]+!:/i;
  const featurePattern = /^(feat|feature)(\(.+\))?:/i;
  const fixPattern = /^(fix|bugfix|perf|refactor)(\(.+\))?:/i;

  for (const commit of commits) {
    if (breakingPattern.test(commit)) {
      hasBreaking = true;
      breakingChanges.push(commit.substring(0, 100));
      reasons.push(`Breaking change: ${commit.substring(0, 50)}`);
    } else if (featurePattern.test(commit)) {
      hasFeature = true;
      features.push(commit.substring(0, 100));
      reasons.push(`New feature: ${commit.substring(0, 50)}`);
    } else if (fixPattern.test(commit)) {
      fixes.push(commit.substring(0, 100));
      reasons.push(`Bug fix: ${commit.substring(0, 50)}`);
    }
  }

  let bumpType: 'major' | 'minor' | 'patch';
  if (hasBreaking) {
    bumpType = 'major';
  } else if (hasFeature) {
    bumpType = 'minor';
  } else if (fixes.length > 0) {
    bumpType = 'patch';
  } else {
    bumpType = 'patch';
  }

  const analysis = {
    bumpType,
    reasons,
    breakingChanges,
    features,
    fixes
  };

  return {
    ...analysis,
    changelog: generateChangelog(analysis)
  };
}

/**
 * Generates a formatted changelog from analysis results
 *
 * Creates a markdown-formatted changelog with sections for:
 * - Breaking Changes
 * - New Features
 * - Bug Fixes
 * - Additional Details
 *
 * @param analysis - Analysis object containing changes
 * @returns Formatted changelog in markdown
 * @internal
 */
function generateChangelog(analysis: {
  breaking_changes?: string[];
  breakingChanges?: string[];
  features?: string[];
  fixes?: string[];
  reasons?: string[];
}): string {
  const breaking = analysis.breaking_changes || analysis.breakingChanges || [];
  const features = analysis.features || [];
  const fixes = analysis.fixes || [];
  const reasons = analysis.reasons || [];

  let changelog = `## 📦 Release Notes\n\n`;

  if (breaking.length > 0) {
    changelog += `### 🚨 Breaking Changes\n`;
    for (const change of breaking) {
      changelog += `- ${change}\n`;
    }
    changelog += '\n';
  }

  if (features.length > 0) {
    changelog += `### ✨ New Features\n`;
    for (const feature of features) {
      changelog += `- ${feature}\n`;
    }
    changelog += '\n';
  }

  if (fixes.length > 0) {
    changelog += `### 🐛 Bug Fixes\n`;
    for (const fix of fixes) {
      changelog += `- ${fix}\n`;
    }
    changelog += '\n';
  }

  if (reasons.length > 0) {
    changelog += `### 📝 Details\n`;
    for (const reason of reasons) {
      changelog += `- ${reason}\n`;
    }
  }

  return changelog;
}
