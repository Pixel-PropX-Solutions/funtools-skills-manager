import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  loadStore,
  saveStore,
  recordInstall,
  recordUninstall,
  getTrackedLocations,
} from '../src/store.js';

describe('Central Store', () => {
  let tempDir;
  let storeFile;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'skills-store-test-'));
    storeFile = join(tempDir, '.skills-manager-store.json');
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  test('loadStore returns default empty store when file does not exist', () => {
    const store = loadStore(storeFile);
    assert.strictEqual(store.version, 1);
    assert.ok(typeof store.installations === 'object');
  });

  test('recordInstall records new installation target and skills', () => {
    const fakeSkillsDir = join(tempDir, 'global-skills');
    mkdirSync(fakeSkillsDir, { recursive: true });

    const target = {
      scope: 'global',
      skillsDir: fakeSkillsDir,
      manifestPath: join(tempDir, '.skills-manifest.json'),
    };

    recordInstall(target, ['code-review', 'git-commit-helper'], storeFile);

    const store = loadStore(storeFile);
    assert.ok(store.installations[fakeSkillsDir]);
    assert.deepStrictEqual(store.installations[fakeSkillsDir].skills, ['code-review', 'git-commit-helper']);
    assert.strictEqual(store.installations[fakeSkillsDir].scope, 'global');
  });

  test('recordInstall deduplicates skills when called multiple times', () => {
    const fakeSkillsDir = join(tempDir, 'workspace-skills');
    mkdirSync(fakeSkillsDir, { recursive: true });

    const target = {
      scope: 'workspace',
      skillsDir: fakeSkillsDir,
      manifestPath: join(tempDir, '.manifest.json'),
    };

    recordInstall(target, ['hello-world'], storeFile);
    recordInstall(target, ['hello-world', 'code-review'], storeFile);

    const store = loadStore(storeFile);
    assert.deepStrictEqual(store.installations[fakeSkillsDir].skills, ['code-review', 'hello-world']);
  });

  test('recordUninstall removes skills and removes target when all skills are uninstalled', () => {
    const fakeSkillsDir = join(tempDir, 'skills');
    mkdirSync(fakeSkillsDir, { recursive: true });

    const target = {
      scope: 'custom',
      skillsDir: fakeSkillsDir,
      manifestPath: join(tempDir, '.manifest.json'),
    };

    recordInstall(target, ['skill-a', 'skill-b'], storeFile);
    recordUninstall(target, ['skill-a'], storeFile);

    let store = loadStore(storeFile);
    assert.deepStrictEqual(store.installations[fakeSkillsDir].skills, ['skill-b']);

    recordUninstall(target, ['skill-b'], storeFile);
    store = loadStore(storeFile);
    assert.strictEqual(store.installations[fakeSkillsDir], undefined);
  });

  test('getTrackedLocations filters out non-existent directories', () => {
    const existingDir = join(tempDir, 'existing');
    const missingDir = join(tempDir, 'missing');
    mkdirSync(existingDir, { recursive: true });

    const targetExisting = {
      scope: 'global',
      skillsDir: existingDir,
      manifestPath: join(tempDir, '.m1.json'),
    };
    const targetMissing = {
      scope: 'workspace',
      skillsDir: missingDir,
      manifestPath: join(tempDir, '.m2.json'),
    };

    recordInstall(targetExisting, ['skill-1'], storeFile);
    recordInstall(targetMissing, ['skill-2'], storeFile);

    const activeLocations = getTrackedLocations(storeFile);
    assert.strictEqual(activeLocations.length, 1);
    assert.strictEqual(activeLocations[0].skillsDir, existingDir);

    // Verify missing was pruned from store file
    const store = loadStore(storeFile);
    assert.strictEqual(store.installations[missingDir], undefined);
  });
});
