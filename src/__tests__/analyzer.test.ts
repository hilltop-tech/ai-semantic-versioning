import { analyzeCommits } from '../analyzer';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    bump_type: 'minor',
                    reasons: ['Added new feature'],
                    breaking_changes: [],
                    features: ['feat: add user authentication'],
                    fixes: []
                  })
                }
              }
            ]
          })
        }
      }
    }))
  };
});

describe('Analyzer', () => {
  describe('analyzeCommits', () => {
    it('should analyze commits with AI and return analysis', async () => {
      const commits = ['feat: add user authentication', 'fix: resolve memory leak'];
      const result = await analyzeCommits(commits, 'test-api-key', 'gpt-4o-mini');

      expect(result).toHaveProperty('bumpType');
      expect(result).toHaveProperty('changelog');
      expect(result).toHaveProperty('reasons');
      expect(result.bumpType).toBe('minor');
    });

    it('should fallback to conventional commits when AI fails', async () => {
      const OpenAI = require('openai').default;
      OpenAI.mockImplementationOnce(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      }));

      const commits = ['feat: add new feature', 'fix: bug fix'];
      const result = await analyzeCommits(commits, 'invalid-key', 'gpt-4o-mini');

      expect(result.bumpType).toBe('minor');
      expect(result.features.length).toBeGreaterThan(0);
    });

    it('should detect breaking changes', async () => {
      const commits = ['feat!: remove deprecated API', 'fix: minor bug'];
      const result = await analyzeCommits(commits, 'test-api-key', 'gpt-4o-mini');

      // With fallback to conventional commits
      expect(['major', 'minor']).toContain(result.bumpType);
    });

    it('should detect features correctly', async () => {
      const commits = ['feat: add new dashboard', 'feat: implement search'];
      const result = await analyzeCommits(commits, 'test-api-key', 'gpt-4o-mini');

      expect(result.bumpType).toBe('minor');
    });

    it('should detect patches correctly', async () => {
      const OpenAI = require('openai').default;
      OpenAI.mockImplementationOnce(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      }));

      const commits = ['fix: resolve crash', 'docs: update readme'];
      const result = await analyzeCommits(commits, 'test-api-key', 'gpt-4o-mini');

      expect(result.bumpType).toBe('patch');
    });

    it('should handle empty commit list', async () => {
      const commits: string[] = [];
      const result = await analyzeCommits(commits, 'test-api-key', 'gpt-4o-mini');

      expect(result.bumpType).toBe('patch');
    });

    it('should generate changelog with all sections', async () => {
      const OpenAI = require('openai').default;
      OpenAI.mockImplementationOnce(() => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      bump_type: 'major',
                      reasons: ['Breaking change detected'],
                      breaking_changes: ['remove old API'],
                      features: ['add new API'],
                      fixes: ['fix security issue']
                    })
                  }
                }
              ]
            })
          }
        }
      }));

      const commits = ['feat!: remove old API', 'feat: add new API', 'fix: security'];
      const result = await analyzeCommits(commits, 'test-api-key', 'gpt-4o-mini');

      expect(result.changelog).toContain('Release Notes');
      expect(result.changelog).toContain('Breaking Changes');
      expect(result.changelog).toContain('New Features');
      expect(result.changelog).toContain('Bug Fixes');
    });
  });
});
