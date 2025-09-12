import { GitHub } from '@actions/github/lib/utils';
import { Context } from '@actions/github/lib/context';
export declare function getCurrentVersion(octokit: InstanceType<typeof GitHub>, context: Context, tagPrefix?: string): Promise<string>;
export declare function getCommitsSinceLastTag(octokit: InstanceType<typeof GitHub>, context: Context, tagPrefix?: string): Promise<string[]>;
export declare function bumpVersion(currentVersion: string, bumpType: 'major' | 'minor' | 'patch' | string): string;
