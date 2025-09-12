import { GitHub } from '@actions/github/lib/utils';
import { Context } from '@actions/github/lib/context';
export declare function createRelease(octokit: InstanceType<typeof GitHub>, context: Context, version: string, changelog: string, tagPrefix?: string): Promise<string>;
