/**
 * Configuration file support for AI Semantic Versioning
 */

import * as fs from 'fs';
import * as yaml from 'yaml';
import * as core from '@actions/core';

/**
 * Configuration for versioning rules
 */
export interface VersioningConfig {
  /** Custom rules for version bumping */
  rules?: {
    /** Patterns that trigger major version bump */
    major?: string[];
    /** Patterns that trigger minor version bump */
    minor?: string[];
    /** Patterns that trigger patch version bump */
    patch?: string[];
  };
  /** Changelog configuration */
  changelog?: {
    /** Include commit authors in changelog */
    includeAuthors?: boolean;
    /** Custom section titles */
    sections?: {
      breaking?: string;
      features?: string;
      fixes?: string;
    };
  };
  /** Tag configuration */
  tags?: {
    /** Tag prefix (default: 'v') */
    prefix?: string;
    /** Tag message template */
    message?: string;
  };
  /** Files to exclude from version updates */
  excludeFiles?: string[];
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: VersioningConfig = {
  rules: {
    major: ['BREAKING CHANGE', '!:'],
    minor: ['feat:', 'feature:'],
    patch: ['fix:', 'bugfix:', 'perf:', 'refactor:', 'docs:', 'chore:']
  },
  changelog: {
    includeAuthors: false,
    sections: {
      breaking: '🚨 Breaking Changes',
      features: '✨ New Features',
      fixes: '🐛 Bug Fixes'
    }
  },
  tags: {
    prefix: 'v',
    message: 'Release version {version}'
  },
  excludeFiles: []
};

/**
 * Loads configuration from .github/versioning.yml or .github/versioning.yaml
 *
 * Falls back to default configuration if file doesn't exist or is invalid.
 *
 * @returns Merged configuration with defaults
 *
 * @example
 * ```typescript
 * const config = loadConfig();
 * console.log(config.tags.prefix); // 'v'
 * ```
 */
export function loadConfig(): VersioningConfig {
  const configPaths = [
    '.github/versioning.yml',
    '.github/versioning.yaml',
    'versioning.yml',
    'versioning.yaml'
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf-8');
        const userConfig = yaml.parse(content) as Partial<VersioningConfig>;

        core.info(`Loaded configuration from ${configPath}`);

        // Deep merge with defaults
        return {
          ...DEFAULT_CONFIG,
          ...userConfig,
          rules: { ...DEFAULT_CONFIG.rules, ...userConfig.rules },
          changelog: { ...DEFAULT_CONFIG.changelog, ...userConfig.changelog },
          tags: { ...DEFAULT_CONFIG.tags, ...userConfig.tags }
        };
      } catch (error) {
        core.warning(`Failed to parse config file ${configPath}: ${error}`);
      }
    }
  }

  core.info('No configuration file found, using defaults');
  return DEFAULT_CONFIG;
}

/**
 * Validates configuration object
 *
 * @param config - Configuration to validate
 * @returns true if configuration is valid
 * @throws Error if configuration is invalid
 */
export function validateConfig(config: VersioningConfig): boolean {
  if (config.rules) {
    const { major, minor, patch } = config.rules;

    if (major && !Array.isArray(major)) {
      throw new Error('config.rules.major must be an array');
    }
    if (minor && !Array.isArray(minor)) {
      throw new Error('config.rules.minor must be an array');
    }
    if (patch && !Array.isArray(patch)) {
      throw new Error('config.rules.patch must be an array');
    }
  }

  if (config.excludeFiles && !Array.isArray(config.excludeFiles)) {
    throw new Error('config.excludeFiles must be an array');
  }

  return true;
}
