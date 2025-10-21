import * as fs from 'fs';
import * as path from 'path';
import { updateVersionFiles } from '../updater';

// Mock fs module
jest.mock('fs');

describe('Updater', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  const testVersion = '1.2.3';

  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.existsSync.mockReturnValue(false);
    mockFs.readdirSync.mockReturnValue([] as any);
  });

  describe('updateVersionFiles', () => {
    it('should update Node.js package.json', async () => {
      mockFs.existsSync.mockImplementation((filePath: any) => {
        return filePath === 'package.json';
      });

      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({ name: 'test', version: '1.0.0' })
      );

      const updated = await updateVersionFiles(testVersion);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'package.json',
        expect.stringContaining('"version": "1.2.3"')
      );
      expect(updated).toContain('package.json');
    });

    it('should update Node.js package-lock.json', async () => {
      mockFs.existsSync.mockImplementation((filePath: any) => {
        return filePath === 'package.json' || filePath === 'package-lock.json';
      });

      mockFs.readFileSync.mockImplementation((filePath: any) => {
        if (filePath === 'package.json') {
          return JSON.stringify({ name: 'test', version: '1.0.0' });
        }
        return JSON.stringify({
          name: 'test',
          version: '1.0.0',
          packages: { '': { version: '1.0.0' } }
        });
      });

      const updated = await updateVersionFiles(testVersion);

      expect(updated).toContain('package-lock.json');
    });

    it('should update Python pyproject.toml', async () => {
      mockFs.existsSync.mockImplementation((filePath: any) => {
        return filePath === 'pyproject.toml';
      });

      mockFs.readFileSync.mockReturnValue(`
[project]
name = "test"
version = "1.0.0"
      `);

      const updated = await updateVersionFiles(testVersion);

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      expect(updated).toContain('pyproject.toml');
    });

    it('should update Rust Cargo.toml', async () => {
      mockFs.existsSync.mockImplementation((filePath: any) => {
        return filePath === 'Cargo.toml';
      });

      mockFs.readFileSync.mockReturnValue(`
[package]
name = "test"
version = "1.0.0"
      `);

      const updated = await updateVersionFiles(testVersion);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'Cargo.toml',
        expect.stringContaining('version = "1.2.3"')
      );
      expect(updated).toContain('Cargo.toml');
    });

    it('should create Go version.go file', async () => {
      mockFs.existsSync.mockImplementation((filePath: any) => {
        return filePath === 'go.mod';
      });

      const updated = await updateVersionFiles(testVersion);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'version.go',
        expect.stringContaining('const Version = "1.2.3"')
      );
      expect(updated).toContain('version.go');
    });

    it('should update Java pom.xml', async () => {
      mockFs.existsSync.mockImplementation((filePath: any) => {
        return filePath === 'pom.xml';
      });

      mockFs.readFileSync.mockReturnValue(`
<project>
  <version>1.0.0</version>
</project>
      `);

      const updated = await updateVersionFiles(testVersion);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'pom.xml',
        expect.stringContaining('<version>1.2.3</version>')
      );
      expect(updated).toContain('pom.xml');
    });

    it('should update PHP composer.json', async () => {
      mockFs.existsSync.mockImplementation((filePath: any) => {
        return filePath === 'composer.json';
      });

      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({ name: 'test/package', version: '1.0.0' })
      );

      const updated = await updateVersionFiles(testVersion);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'composer.json',
        expect.stringContaining('"version": "1.2.3"')
      );
      expect(updated).toContain('composer.json');
    });

    it('should always create .version file', async () => {
      const updated = await updateVersionFiles(testVersion);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith('.version', testVersion);
      expect(updated).toContain('.version');
    });

    it('should handle multiple project types', async () => {
      mockFs.existsSync.mockImplementation((filePath: any) => {
        return filePath === 'package.json' || filePath === 'Cargo.toml';
      });

      mockFs.readFileSync.mockImplementation((filePath: any) => {
        if (filePath === 'package.json') {
          return JSON.stringify({ name: 'test', version: '1.0.0' });
        }
        return `[package]\nname = "test"\nversion = "1.0.0"`;
      });

      const updated = await updateVersionFiles(testVersion);

      expect(updated.length).toBeGreaterThan(2); // nodejs files + rust + .version
    });
  });
});
