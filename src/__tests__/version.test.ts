import { bumpVersion, getCurrentVersion, getCommitsSinceLastTag } from '../version';
import * as github from '@actions/github';

// Mock GitHub API
const mockOctokit = {
  rest: {
    repos: {
      listTags: jest.fn(),
      compareCommitsWithBasehead: jest.fn(),
      listCommits: jest.fn()
    }
  }
} as any;

const mockContext = {
  repo: {
    owner: 'test-owner',
    repo: 'test-repo'
  },
  ref: 'refs/heads/main',
  sha: 'abc123'
} as any;

describe('Version', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('bumpVersion', () => {
    it('should bump major version correctly', () => {
      expect(bumpVersion('1.2.3', 'major')).toBe('2.0.0');
      expect(bumpVersion('0.1.0', 'major')).toBe('1.0.0');
    });

    it('should bump minor version correctly', () => {
      expect(bumpVersion('1.2.3', 'minor')).toBe('1.3.0');
      expect(bumpVersion('1.0.0', 'minor')).toBe('1.1.0');
    });

    it('should bump patch version correctly', () => {
      expect(bumpVersion('1.2.3', 'patch')).toBe('1.2.4');
      expect(bumpVersion('1.0.0', 'patch')).toBe('1.0.1');
    });

    it('should default to patch for unknown bump types', () => {
      expect(bumpVersion('1.2.3', 'unknown')).toBe('1.2.4');
    });

    it('should throw error for invalid version', () => {
      expect(() => bumpVersion('invalid', 'major')).toThrow();
    });
  });

  describe('getCurrentVersion', () => {
    it('should return latest version from tags', async () => {
      mockOctokit.rest.repos.listTags.mockResolvedValue({
        data: [
          { name: 'v1.2.3' },
          { name: 'v1.2.2' },
          { name: 'v1.2.1' }
        ]
      });

      const version = await getCurrentVersion(mockOctokit, mockContext, 'v');
      expect(version).toBe('1.2.3');
    });

    it('should filter invalid version tags', async () => {
      mockOctokit.rest.repos.listTags.mockResolvedValue({
        data: [
          { name: 'v1.2.3' },
          { name: 'invalid-tag' },
          { name: 'v1.2.2' }
        ]
      });

      const version = await getCurrentVersion(mockOctokit, mockContext, 'v');
      expect(version).toBe('1.2.3');
    });

    it('should return 0.0.0 when no tags exist', async () => {
      mockOctokit.rest.repos.listTags.mockResolvedValue({ data: [] });

      const version = await getCurrentVersion(mockOctokit, mockContext, 'v');
      expect(version).toBe('0.0.0');
    });

    it('should handle custom tag prefix', async () => {
      mockOctokit.rest.repos.listTags.mockResolvedValue({
        data: [
          { name: 'release-1.2.3' },
          { name: 'release-1.2.2' }
        ]
      });

      const version = await getCurrentVersion(mockOctokit, mockContext, 'release-');
      expect(version).toBe('1.2.3');
    });

    it('should return 0.0.0 on API error', async () => {
      mockOctokit.rest.repos.listTags.mockRejectedValue(new Error('API Error'));

      const version = await getCurrentVersion(mockOctokit, mockContext, 'v');
      expect(version).toBe('0.0.0');
    });
  });

  describe('getCommitsSinceLastTag', () => {
    it('should get commits since last tag', async () => {
      mockOctokit.rest.repos.listTags.mockResolvedValue({
        data: [{ name: 'v1.0.0' }]
      });

      mockOctokit.rest.repos.compareCommitsWithBasehead.mockResolvedValue({
        data: {
          commits: [
            { commit: { message: 'feat: new feature' } },
            { commit: { message: 'fix: bug fix' } }
          ]
        }
      });

      const commits = await getCommitsSinceLastTag(mockOctokit, mockContext, 'v');
      expect(commits).toHaveLength(2);
      expect(commits[0]).toBe('feat: new feature');
    });

    it('should get all commits when no tags exist', async () => {
      mockOctokit.rest.repos.listTags.mockResolvedValue({ data: [] });

      mockOctokit.rest.repos.listCommits.mockResolvedValue({
        data: [
          { commit: { message: 'feat: initial commit' } },
          { commit: { message: 'fix: first bug' } }
        ]
      });

      const commits = await getCommitsSinceLastTag(mockOctokit, mockContext, 'v');
      expect(commits).toHaveLength(2);
    });

    it('should filter out merge commits', async () => {
      mockOctokit.rest.repos.listTags.mockResolvedValue({
        data: [{ name: 'v1.0.0' }]
      });

      mockOctokit.rest.repos.compareCommitsWithBasehead.mockResolvedValue({
        data: {
          commits: [
            { commit: { message: 'feat: new feature' } },
            { commit: { message: 'Merge pull request #1' } },
            { commit: { message: 'fix: bug fix' } }
          ]
        }
      });

      const commits = await getCommitsSinceLastTag(mockOctokit, mockContext, 'v');
      expect(commits).toHaveLength(2);
      expect(commits.some(c => c.startsWith('Merge'))).toBe(false);
    });

    it('should filter out CI skip commits', async () => {
      mockOctokit.rest.repos.listTags.mockResolvedValue({
        data: [{ name: 'v1.0.0' }]
      });

      mockOctokit.rest.repos.compareCommitsWithBasehead.mockResolvedValue({
        data: {
          commits: [
            { commit: { message: 'feat: new feature' } },
            { commit: { message: 'chore: build [skip ci]' } },
            { commit: { message: 'fix: bug fix [ci skip]' } }
          ]
        }
      });

      const commits = await getCommitsSinceLastTag(mockOctokit, mockContext, 'v');
      expect(commits).toHaveLength(1);
      expect(commits[0]).toBe('feat: new feature');
    });
  });
});
