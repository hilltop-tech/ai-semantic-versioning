# AI Semantic VersioningAction

🤖 Automatically determine semantic version bumps using AI to analyze your commit messages.

🤖 Automatically determine semantic version bumps using AI to analyze your commit messages.

## 🌟 Features

- **AI-Powered Analysis**: Uses OpenAI GPT to understand commit messages and determine appropriate version bumps
- **Multi-Language Support**: Supports Python, Node.js, Rust, Go, Java, C#, Ruby, PHP, Swift and more
- **Conventional Commits**: Follows conventional commit standards
- **Automatic Releases**: Creates GitHub releases with auto-generated changelogs
- **Customizable**: Configure behavior through inputs and configuration files

## 📦 Supported Languages and Files

| language    | The file will be updated                          |
| ------- | ------------------------------------------- |
| Python  | `pyproject.toml`, `setup.py`, `__init__.py` |
| Node.js | `package.json`, `package-lock.json`         |
| Rust    | `Cargo.toml`                                |
| Go      | `version.go` (auto generate)                     |
| Java    | `pom.xml`, `build.gradle`                   |
| C#      | `*.csproj`                                  |
| Ruby    | `*.gemspec`, `version.rb`                   |
| PHP     | `composer.json`                             |
| Swift   | `Package.swift`                             |

LanguageUpdated Files-------------------------auto-generated

## 🚀 Quick StartQuick Start

### 1. Set up GitHub SecretsSecrets

Add the following secret to your repository (SettingsAdd the following secret to your repository (Settings > Secrets and variables)variables):

- `OPENAI_API_KEY`: Your OpenAI API key (required)API key (required)

### 2. Create WorkflowCreate Workflow

Create Create `.github/workflows/versioning.yml` in your repository in your repository:

```yaml
name: Semantic Versioning

on:
  push:
    branches:
      - main
      - master

jobs:
  version:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: AI Semantic Versioning
        uses: hilltech/svc-ai-actions@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_API_MODEL: 'gpt-4o-mini' # optional
          create_release: true # optional
          commit_changes: true # optional
          push_changes: true # optional
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: AI Semantic Versioning
        uses: hilltech/svc-ai-actions@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_API_MODEL: 'gpt-4o-mini'  # optional
          create_release: true              # optional
          commit_changes: true              # optional
          push_changes: true                # optional
```

## 📋 Versioning Rules

### Semantic Versioning

- **MAJOR (x.0.0)**: Breaking changes, backwards incompatible API changes
- **MINOR (0.x.0)**: New features, backwards compatible functionality additions
- **PATCH (0.0.x)**: Bug fixes, minor improvements, documentation updates

### Conventional Commits

| Commit Type              | Version Bump | Example                         |
| ------------------------ | ------------ | ------------------------------- |
| `BREAKING CHANGE`, `!:`  | MAJOR        | `feat!: remove deprecated API`  |
| `feat:`, `feature:`      | MINOR        | `feat: add user authentication` |
| `fix:`, `perf:`, `docs:` | PATCH        | `fix: resolve memory leak`      |

## 📊 Action Inputs

| Input              | Required | Default       | Description                 |
| ------------------ | -------- | ------------- | --------------------------- |
| `GITHUB_TOKEN`     | Yes      | -             | GitHub token for API access |
| `OPENAI_API_KEY`   | Yes      | -             | OpenAI API key              |
| `OPENAI_API_MODEL` | No       | `gpt-4o-mini` | OpenAI model to use         |
| `force_version`    | No       | -             | Force a specific version    |
| `create_release`   | No       | `true`        | Create GitHub release       |
| `tag_prefix`       | No       | `v`           | Prefix for version tags     |
| `update_files`     | No       | `true`        | Update version files        |
| `commit_changes`   | No       | `true`        | Commit version changes      |
| `push_changes`     | No       | `true`        | Push changes and tags       |

## 📤 'Action Outputs

| Output             | Description                                  |
| ------------------ | -------------------------------------------- |
| '`version`         | 'The 'new version number                     |
| `previous_version` | The previous version number                  |
| `bump_type`        | The type of version bump (major/minor/patch) |
| `changelog`        | Generated changelog for the release          |

## 🔧 Manual 'Trigger

You can manually trigger the action from GitHub Actions UI:

1. Go to the Actions tab
2. Select "Semantic Versioning" workflow
3. Click "Run workflow"
4. Optionally specify a version to force

## 📝 How It Works

### Example Commits

```
feat: add user profile page
fix: correct validation error in login form
docs: update API documentation
BREAKING CHANGE: remove deprecated endpoints
```

### AI Analysis Result

```json
{
  "bump_type": "major",
  "reasons": [
    "Breaking change detected: remove deprecated endpoints",
    "New feature added: user profile page",
    "Bug fix: validation error correction"
  ],
  "breaking_changes": ["remove deprecated endpoints"],
  "features": ["add user profile page"],
  "fixes": ["correct validation error in login form"]
}
```

### Result

- Version: `1.0.0` → `2.0.0`
- Tag: `v2.0.0`
- Auto-generated release notes

## 📊⚙️ Action InputsAdvanced Configuration

| Input              | Required | Default       | Description                 |
| ------------------ | -------- | ------------- | --------------------------- |
| `GITHUB_TOKEN`     | Yes      | -             | GitHub token for API access |
| `OPENAI_API_KEY`   | Yes      | -             | OpenAI API key              |
| `OPENAI_API_MODEL` | No       | `gpt-4o-mini` | OpenAI model to use         |
| `force_version`    | No       | -             | Force a specific version    |
| `create_release`   | No       | `true`        | Create GitHub release       |
| `tag_prefix`       | No       | `v`           | Prefix for version tags     |
| `update_files`     | No       | `true`        | Update version files        |
| `commit_changes`   | No       | `true`        | Commit version changes      |
| `push_changes`     | No       | `true`        | Push changes and tags       |

You can customize the behavior by creating `githubversioning.yml`:

## 📤 Action Outputs

| Output             | Description                                  |
| ------------------ | -------------------------------------------- |
| `version`          | The new version number                       |
| `previous_version` | The previous version number                  |
| `bump_type`        | The type of version bump (major/minor/patch) |
| `changelog`        | Generated changelog for the release          |

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build the action
npm run build

# Run tests
npm test

# Format code
npm run format
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

```yaml
# AI Configuration
ai:
  model: 'gpt-4o-mini' # Model to use
  enabled: true # Enable/disable AI analysis

# Version Rules
version_rules:
  major_keywords:
    - 'BREAKING CHANGE'
  minor_keywords:
    - 'feat:'
  patch_keywords:
    - 'fix:'

# Release Settings
release:
  create_release: true
  tag_prefix: 'v'
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build the action
npm run build

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Issues

If you encounter any problems or have suggestions, please [open an issue](https://github.com/hilltech/svc-ai-actions/issues).

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for providing the AI models
- [Semantic Versioning](https://semver.org) for the versioning specification
- [Conventional Commits](https://www.conventionalcommits.org) for commit message conventions
