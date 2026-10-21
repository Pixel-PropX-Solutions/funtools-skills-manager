import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { cpSync, rmSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

export const GLOBAL_BASE = join(homedir(), '.gemini', 'config');
export const GLOBAL_SKILLS_DIR = join(GLOBAL_BASE, 'skills');

/**
 * Locate project root by walking up looking for .git or .agents
 */
export function findProjectRoot(startDir = process.cwd()) {
  let current = resolve(startDir);
  while (true) {
    if (existsSync(join(current, '.git')) || existsSync(join(current, '.agents'))) {
      return current;
    }
    const parent = resolve(current, '..');
    if (parent === current) break;
    current = parent;
  }
  return process.cwd();
}

/**
 * Resolve target directory and manifest path based on CLI options:
 * - options.dest: custom path
 * - options.workspace: <projectRoot>/.agents/skills
 * - default: ~/.gemini/config/skills
 */
export function resolveTarget(options = {}) {
  if (options.dest) {
    const destDir = resolve(process.cwd(), options.dest);
    return {
      scope: 'custom',
      skillsDir: destDir,
      manifestPath: join(destDir, '.skills-manager-manifest.json'),
    };
  }

  if (options.workspace) {
    const root = findProjectRoot();
    const agentsDir = join(root, '.agents');
    return {
      scope: 'workspace',
      skillsDir: join(agentsDir, 'skills'),
      manifestPath: join(agentsDir, '.skills-manager-manifest.json'),
    };
  }

  return {
    scope: 'global',
    skillsDir: GLOBAL_SKILLS_DIR,
    manifestPath: join(GLOBAL_BASE, '.skills-manager-manifest.json'),
  };
}

export function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

export function copySkill(src, dest) {
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }
  cpSync(src, dest, { recursive: true });
}

export function removeSkill(dest) {
  if (existsSync(dest)) {
    rmSync(dest, { recursive: true, force: true });
  }
}

export function readManifest(manifestPath) {
  if (!existsSync(manifestPath)) return { installed: {} };
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf-8'));
  } catch {
    return { installed: {} };
  }
}

export function writeManifest(manifestPath, manifest) {
  const dir = resolve(manifestPath, '..');
  ensureDir(dir);
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
}
