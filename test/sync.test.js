import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { syncAllInstalledSkills } from '../src/updater.js';
import { recordInstall } from '../src/store.js';

describe('syncAllInstalledSkills', () => {
  let tempDir;
  let storeFile;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'skills-sync-test-'));
    storeFile = join(tempDir, '.skills-manager-store.json');
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  test('syncs skills to multiple target directories tracked in store', () => {
    // 1. Create a fake packaged skill
    const skillSourceDir = join(tempDir, 'packaged-skills', 'dummy-skill');
    mkdirSync(skillSourceDir, { recursive: true });
    writeFileSync(join(skillSourceDir, 'SKILL.md'), '---\nname: dummy-skill\ndescription: test\n---\nv2-content');

    const availableSkills = [
      {
        dirName: 'dummy-skill',
        name: 'dummy-skill',
        description: 'test',
        path: skillSourceDir,
      },
    ];

    // 2. Setup target 1 (global)
    const target1Dir = join(tempDir, 'global', 'skills');
    const target1SkillDir = join(target1Dir, 'dummy-skill');
    mkdirSync(target1SkillDir, { recursive: true });
    writeFileSync(join(target1SkillDir, 'SKILL.md'), 'v1-content');

    const target1 = {
      scope: 'global',
      skillsDir: target1Dir,
      manifestPath: join(tempDir, 'global', '.skills-manager-manifest.json'),
    };
    recordInstall(target1, ['dummy-skill'], storeFile);

    // 3. Setup target 2 (workspace)
    const target2Dir = join(tempDir, 'workspace', '.agents', 'skills');
    const target2SkillDir = join(target2Dir, 'dummy-skill');
    mkdirSync(target2SkillDir, { recursive: true });
    writeFileSync(join(target2SkillDir, 'SKILL.md'), 'v1-content');

    const target2 = {
      scope: 'workspace',
      skillsDir: target2Dir,
      manifestPath: join(tempDir, 'workspace', '.agents', '.skills-manager-manifest.json'),
    };
    recordInstall(target2, ['dummy-skill'], storeFile);

    // 4. Run sync
    const result = syncAllInstalledSkills(availableSkills, storeFile);
    assert.strictEqual(result.updatedCount, 2);
    assert.strictEqual(result.targetCount, 2);

    // 5. Verify contents were overwritten with v2
    const target1Content = readFileSync(join(target1SkillDir, 'SKILL.md'), 'utf-8');
    assert.ok(target1Content.includes('v2-content'));

    const target2Content = readFileSync(join(target2SkillDir, 'SKILL.md'), 'utf-8');
    assert.ok(target2Content.includes('v2-content'));

    // 6. Verify manifests were written
    const m1 = JSON.parse(readFileSync(target1.manifestPath, 'utf-8'));
    assert.strictEqual(m1.installed['dummy-skill'].name, 'dummy-skill');
    assert.ok(m1.installed['dummy-skill'].version);
  });
});
