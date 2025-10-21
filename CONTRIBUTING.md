# Contributing to AI Semantic Versioning

Thank you for your interest in contributing to AI Semantic Versioning! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

1. **Clear title** - Brief description of the issue
2. **Description** - Detailed explanation of the problem
3. **Steps to reproduce** - How to recreate the issue
4. **Expected behavior** - What should happen
5. **Actual behavior** - What actually happens
6. **Environment** - OS, Node version, etc.
7. **Logs** - Any relevant error messages or logs

### Suggesting Features

We welcome feature suggestions! Please create an issue with:

1. **Clear title** - Brief description of the feature
2. **Use case** - Why this feature would be useful
3. **Proposed solution** - How you envision it working
4. **Alternatives** - Other approaches you've considered

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** for any new functionality
4. **Update documentation** if needed
5. **Run tests** to ensure everything passes
6. **Submit your PR** with a clear description

## Development Setup

### Prerequisites

- Node.js 20 or higher
- npm 9 or higher

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ai-semantic-versioning.git
cd ai-semantic-versioning

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
```

### Project Structure

```
ai-semantic-versioning/
├── src/
│   ├── __tests__/          # Test files
│   ├── utils/              # Utility modules
│   ├── analyzer.ts         # Commit analysis logic
│   ├── version.ts          # Version management
│   ├── updater.ts          # File update logic
│   ├── release.ts          # Release creation
│   ├── config.ts           # Configuration handling
│   └── index.ts            # Main entry point
├── dist/                   # Compiled output (committed)
├── .github/                # GitHub Actions workflows
└── docs/                   # Generated documentation
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Add JSDoc comments for all public functions
- Use meaningful variable and function names
- Follow the existing code style

### Formatting

```bash
# Format code
npm run format

# Lint code
npm run lint
```

### Testing

- Write tests for all new features
- Maintain or improve code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe('Feature', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = doSomething(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `chore:` - Build/config changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements

Examples:
```
feat: add support for Kotlin version files
fix: correct version detection in monorepos
docs: update README with new examples
test: add tests for analyzer module
```

### Breaking Changes

If your change introduces breaking changes:

1. Add `BREAKING CHANGE:` in the commit message body
2. Update the major version
3. Document the migration path

## Pull Request Process

1. **Update tests** - Ensure all tests pass
2. **Update documentation** - Keep README and docs current
3. **Update CHANGELOG** - Add entry for your changes (if applicable)
4. **Request review** - Tag maintainers for review
5. **Address feedback** - Make requested changes promptly
6. **Squash commits** - Clean up commit history before merge

### PR Checklist

- [ ] Tests pass locally (`npm test`)
- [ ] Code follows style guidelines (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] No unnecessary dependencies added
- [ ] Breaking changes are documented

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- analyzer.test.ts
```

### Writing Tests

- Place tests in `src/__tests__/` directory
- Name test files as `*.test.ts`
- Mock external dependencies
- Test edge cases and error conditions
- Aim for high coverage (>70%)

## Building

```bash
# Build TypeScript to JavaScript
npm run build

# Watch mode for development
npm run dev
```

## Documentation

- Keep README.md up to date
- Add JSDoc comments to all public APIs
- Generate documentation: `npm run docs`
- Include examples in documentation

## Release Process

Releases are automated through GitHub Actions:

1. Commits are analyzed with AI
2. Version is bumped automatically
3. Changelog is generated
4. GitHub release is created
5. npm package is published (if configured)

## Questions?

If you have questions:

1. Check existing issues and discussions
2. Read the documentation
3. Create a new issue with the `question` label

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!
