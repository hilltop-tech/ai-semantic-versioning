import * as fs from 'fs';
import * as path from 'path';
import * as core from '@actions/core';
import * as toml from 'toml';

export async function updateVersionFiles(version: string): Promise<string[]> {
  const updatedFiles: string[] = [];
  const projectTypes = detectProjectTypes();

  core.info(`Detected project types: ${projectTypes.join(', ')}`);

  // Update language-specific files
  for (const projectType of projectTypes) {
    const files = await updateProjectFiles(projectType, version);
    updatedFiles.push(...files);
  }

  // Always update generic version file
  updateGenericVersionFile(version);
  updatedFiles.push('.version');

  return updatedFiles;
}

function detectProjectTypes(): string[] {
  const types: string[] = [];

  const checks: Record<string, string[]> = {
    python: ['setup.py', 'pyproject.toml', 'setup.cfg'],
    nodejs: ['package.json'],
    rust: ['Cargo.toml'],
    go: ['go.mod'],
    java: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
    csharp: ['.csproj', '.fsproj'],
    ruby: ['.gemspec', 'Gemfile'],
    php: ['composer.json'],
    swift: ['Package.swift']
  };

  for (const [type, files] of Object.entries(checks)) {
    for (const file of files) {
      if (file.includes('.')) {
        if (fs.existsSync(file)) {
          types.push(type);
          break;
        }
      } else {
        // Check for files with extensions
        const filesWithExt = fs.readdirSync('.').filter(f => f.endsWith(file));
        if (filesWithExt.length > 0) {
          types.push(type);
          break;
        }
      }
    }
  }

  return types;
}

async function updateProjectFiles(projectType: string, version: string): Promise<string[]> {
  const updatedFiles: string[] = [];

  switch (projectType) {
    case 'python':
      updatedFiles.push(...updatePythonFiles(version));
      break;
    case 'nodejs':
      updatedFiles.push(...updateNodeFiles(version));
      break;
    case 'rust':
      updatedFiles.push(...updateRustFiles(version));
      break;
    case 'go':
      updatedFiles.push(...updateGoFiles(version));
      break;
    case 'java':
      updatedFiles.push(...updateJavaFiles(version));
      break;
    case 'csharp':
      updatedFiles.push(...updateCSharpFiles(version));
      break;
    case 'ruby':
      updatedFiles.push(...updateRubyFiles(version));
      break;
    case 'php':
      updatedFiles.push(...updatePhpFiles(version));
      break;
    case 'swift':
      updatedFiles.push(...updateSwiftFiles(version));
      break;
  }

  return updatedFiles;
}

function updatePythonFiles(version: string): string[] {
  const updated: string[] = [];

  // pyproject.toml
  if (fs.existsSync('pyproject.toml')) {
    const content = fs.readFileSync('pyproject.toml', 'utf-8');
    const data = toml.parse(content);

    if (data.project) {
      data.project.version = version;
    } else if (data.tool?.poetry) {
      data.tool.poetry.version = version;
    }

    // Convert back to TOML string
    const newContent = Object.entries(data)
      .map(([key, value]) => `[${key}]\n${formatTomlSection(value)}`)
      .join('\n');

    fs.writeFileSync('pyproject.toml', newContent);
    updated.push('pyproject.toml');
  }

  // setup.py
  if (fs.existsSync('setup.py')) {
    let content = fs.readFileSync('setup.py', 'utf-8');
    content = content.replace(/version\s*=\s*["'][^"']+["']/, `version="${version}"`);
    fs.writeFileSync('setup.py', content);
    updated.push('setup.py');
  }

  // __init__.py files
  const initFiles = findFiles('**/__init__.py');
  for (const file of initFiles) {
    if (file.includes('node_modules') || file.includes('venv')) continue;

    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('__version__')) {
      const newContent = content.replace(
        /__version__\s*=\s*["'][^"']+["']/,
        `__version__ = "${version}"`
      );
      fs.writeFileSync(file, newContent);
      updated.push(file);
    }
  }

  return updated;
}

function updateNodeFiles(version: string): string[] {
  const updated: string[] = [];

  if (fs.existsSync('package.json')) {
    const data = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    data.version = version;
    fs.writeFileSync('package.json', JSON.stringify(data, null, 2));
    updated.push('package.json');
  }

  if (fs.existsSync('package-lock.json')) {
    const data = JSON.parse(fs.readFileSync('package-lock.json', 'utf-8'));
    data.version = version;
    if (data.packages && data.packages['']) {
      data.packages[''].version = version;
    }
    fs.writeFileSync('package-lock.json', JSON.stringify(data, null, 2));
    updated.push('package-lock.json');
  }

  return updated;
}

function updateRustFiles(version: string): string[] {
  const updated: string[] = [];

  if (fs.existsSync('Cargo.toml')) {
    let content = fs.readFileSync('Cargo.toml', 'utf-8');
    content = content.replace(/^version\s*=\s*"[^"]+"/m, `version = "${version}"`);
    fs.writeFileSync('Cargo.toml', content);
    updated.push('Cargo.toml');
  }

  return updated;
}

function updateGoFiles(version: string): string[] {
  const versionFile = 'version.go';
  const content = `package main

const Version = "${version}"
`;
  fs.writeFileSync(versionFile, content);
  return [versionFile];
}

function updateJavaFiles(version: string): string[] {
  const updated: string[] = [];

  // Maven pom.xml
  if (fs.existsSync('pom.xml')) {
    let content = fs.readFileSync('pom.xml', 'utf-8');
    content = content.replace(/<version>[^<]+<\/version>/, `<version>${version}</version>`);
    fs.writeFileSync('pom.xml', content);
    updated.push('pom.xml');
  }

  // Gradle files
  for (const gradleFile of ['build.gradle', 'build.gradle.kts']) {
    if (fs.existsSync(gradleFile)) {
      let content = fs.readFileSync(gradleFile, 'utf-8');
      content = content.replace(/version\s*=\s*["'][^"']+["']/, `version = "${version}"`);
      fs.writeFileSync(gradleFile, content);
      updated.push(gradleFile);
    }
  }

  return updated;
}

function updateCSharpFiles(version: string): string[] {
  const updated: string[] = [];
  const projFiles = fs.readdirSync('.').filter(f => f.endsWith('.csproj'));

  for (const file of projFiles) {
    let content = fs.readFileSync(file, 'utf-8');

    // Update or add version tags
    const versionTags = ['Version', 'AssemblyVersion', 'FileVersion'];
    for (const tag of versionTags) {
      const regex = new RegExp(`<${tag}>[^<]+</${tag}>`, 'g');
      if (content.match(regex)) {
        content = content.replace(regex, `<${tag}>${version}</${tag}>`);
      }
    }

    // Add version if not present
    if (!content.includes('<Version>') && content.includes('</PropertyGroup>')) {
      content = content.replace(
        '</PropertyGroup>',
        `    <Version>${version}</Version>\n  </PropertyGroup>`
      );
    }

    fs.writeFileSync(file, content);
    updated.push(file);
  }

  return updated;
}

function updateRubyFiles(version: string): string[] {
  const updated: string[] = [];

  // .gemspec files
  const gemspecs = fs.readdirSync('.').filter(f => f.endsWith('.gemspec'));
  for (const file of gemspecs) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/\.version\s*=\s*["'][^"']+["']/, `.version = "${version}"`);
    fs.writeFileSync(file, content);
    updated.push(file);
  }

  // version.rb
  const versionFiles = findFiles('**/version.rb');
  for (const file of versionFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/VERSION\s*=\s*["'][^"']+["']/, `VERSION = "${version}"`);
    fs.writeFileSync(file, content);
    updated.push(file);
  }

  return updated;
}

function updatePhpFiles(version: string): string[] {
  const updated: string[] = [];

  if (fs.existsSync('composer.json')) {
    const data = JSON.parse(fs.readFileSync('composer.json', 'utf-8'));
    data.version = version;
    fs.writeFileSync('composer.json', JSON.stringify(data, null, 4));
    updated.push('composer.json');
  }

  return updated;
}

function updateSwiftFiles(version: string): string[] {
  const updated: string[] = [];

  if (fs.existsSync('Package.swift')) {
    let content = fs.readFileSync('Package.swift', 'utf-8');
    content = content.replace(/let\s+version\s*=\s*"[^"]+"/, `let version = "${version}"`);
    fs.writeFileSync('Package.swift', content);
    updated.push('Package.swift');
  }

  return updated;
}

function updateGenericVersionFile(version: string): void {
  fs.writeFileSync('.version', version);
}

function findFiles(pattern: string): string[] {
  // Simple file finder (you might want to use glob package for more complex patterns)
  const files: string[] = [];
  const walkDir = (dir: string) => {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walkDir(fullPath);
      } else if (stat.isFile() && fullPath.match(pattern.replace('**/', ''))) {
        files.push(fullPath);
      }
    }
  };

  if (pattern.startsWith('**/')) {
    walkDir('.');
  }

  return files;
}

function formatTomlSection(obj: any, indent: string = ''): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (typeof value === 'object' && !Array.isArray(value)) {
        return `${indent}[${key}]\n${formatTomlSection(value, indent + '  ')}`;
      }
      return `${indent}${key} = ${JSON.stringify(value)}`;
    })
    .join('\n');
}
