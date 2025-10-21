import { createRelease } from '../release';
import * as core from '@actions/core';

// Mock @actions/core
jest.mock('@actions/core');

const mockOctokit = {
  rest: {
    repos: {
      createRelease: jest.fn(),
      listReleases: jest.fn()
    }
  }
} as any;

const mockContext = {
  repo: {
    owner: 'test-owner',
    repo: 'test-repo'
  },
  sha: 'abc123'
} as any;

describe('Release', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRelease', () => {
    it('should create a new release successfully', async () => {
      const mockReleaseUrl = 'https://github.com/test/repo/releases/tag/v1.0.0';
      mockOctokit.rest.repos.createRelease.mockResolvedValue({
        data: { html_url: mockReleaseUrl }
      });

      const url = await createRelease(
        mockOctokit,
        mockContext,
        '1.0.0',
        '## Release Notes\n- New feature',
        'v'
      );

      expect(url).toBe(mockReleaseUrl);
      expect(mockOctokit.rest.repos.createRelease).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        tag_name: 'v1.0.0',
        name: 'Release v1.0.0',
        body: '## Release Notes\n- New feature',
        draft: false,
        prerelease: false,
        target_commitish: 'abc123'
      });
    });

    it('should use default changelog when none provided', async () => {
      mockOctokit.rest.repos.createRelease.mockResolvedValue({
        data: { html_url: 'https://example.com' }
      });

      await createRelease(mockOctokit, mockContext, '1.0.0', '', 'v');

      expect(mockOctokit.rest.repos.createRelease).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('Automated release')
        })
      );
    });

    it('should handle custom tag prefix', async () => {
      mockOctokit.rest.repos.createRelease.mockResolvedValue({
        data: { html_url: 'https://example.com' }
      });

      await createRelease(mockOctokit, mockContext, '1.0.0', 'changelog', 'release-');

      expect(mockOctokit.rest.repos.createRelease).toHaveBeenCalledWith(
        expect.objectContaining({
          tag_name: 'release-1.0.0',
          name: 'Release release-1.0.0'
        })
      );
    });

    it('should handle existing release gracefully', async () => {
      const existingUrl = 'https://github.com/test/repo/releases/tag/v1.0.0';
      mockOctokit.rest.repos.createRelease.mockRejectedValue({
        status: 422,
        message: 'Release already_exists'
      });

      mockOctokit.rest.repos.listReleases.mockResolvedValue({
        data: [
          { tag_name: 'v1.0.0', html_url: existingUrl },
          { tag_name: 'v0.9.0', html_url: 'https://example.com/old' }
        ]
      });

      const url = await createRelease(mockOctokit, mockContext, '1.0.0', 'changelog', 'v');

      expect(url).toBe(existingUrl);
      expect(core.warning).toHaveBeenCalledWith('Release v1.0.0 already exists');
    });

    it('should handle existing release with no URL', async () => {
      mockOctokit.rest.repos.createRelease.mockRejectedValue({
        status: 422,
        message: 'already_exists'
      });

      mockOctokit.rest.repos.listReleases.mockResolvedValue({
        data: [{ tag_name: 'v0.9.0', html_url: 'https://example.com' }]
      });

      const url = await createRelease(mockOctokit, mockContext, '1.0.0', 'changelog', 'v');

      expect(url).toBe('');
    });

    it('should throw error for non-duplicate errors', async () => {
      mockOctokit.rest.repos.createRelease.mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        createRelease(mockOctokit, mockContext, '1.0.0', 'changelog', 'v')
      ).rejects.toThrow('Network error');
    });
  });
});
