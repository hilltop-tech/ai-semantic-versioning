export interface CommitAnalysis {
    bumpType: 'major' | 'minor' | 'patch';
    changelog: string;
    reasons: string[];
    breakingChanges: string[];
    features: string[];
    fixes: string[];
}
export declare function analyzeCommits(commits: string[], apiKey: string, model?: string): Promise<CommitAnalysis>;
