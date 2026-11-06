import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import {
  GLOBAL_BASE,
  GLOBAL_SKILLS_DIR,
  STORE_FILE_PATH,
  ensureDir,
  readManifest,
} from './utils.js';

/**
 * Load the central store. If it doesn't exist, auto-seed with any existing global manifest.
 */
export function loadStore(storePath = STORE_FILE_PATH) {
  if (existsSync(storePath)) {
    try {
      const data = JSON.parse(readFileSync(storePath, 'utf-8'));
      if (data && typeof data === 'object' && data.installations) {
        return data;
      }
    } catch {
      // If corrupted, initialize fresh
    }
  }

  const initialStore = {
    version: 1,
    installations: {},
  };

  // Auto-seed from existing global manifest if available (only for default store path)
  const globalManifestPath = join(GLOBAL_BASE, '.skills-manager-manifest.json');
  if (storePath === STORE_FILE_PATH && existsSync(globalManifestPath)) {
    try {
      const globalManifest = readManifest(globalManifestPath);
      const installedNames = Object.keys(globalManifest.installed || {});
      if (installedNames.length > 0) {
        const key = resolve(GLOBAL_SKILLS_DIR);
        initialStore.installations[key] = {
          scope: 'global',
          skillsDir: key,
          manifestPath: resolve(globalManifestPath),
          skills: installedNames.sort(),
          updatedAt: new Date().toISOString(),
        };
        saveStore(initialStore, storePath);
      }
    } catch {
      // Ignore seeding errors
    }
  }

  return initialStore;
}

/**
 * Save store data atomically to disk
 */
export function saveStore(storeData, storePath = STORE_FILE_PATH) {
  try {
    const dir = dirname(resolve(storePath));
    ensureDir(dir);
    writeFileSync(storePath, JSON.stringify(storeData, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Warning: Could not save store to ${storePath}:`, err.message);
  }
}

/**
 * Record skill installations in the central store
 */
export function recordInstall(target, skillDirNames = [], storePath = STORE_FILE_PATH) {
  if (!skillDirNames.length) return;

  const store = loadStore(storePath);
  const key = resolve(target.skillsDir);
  const existingSkills = new Set(store.installations[key]?.skills || []);

  for (const name of skillDirNames) {
    existingSkills.add(name);
  }

  store.installations[key] = {
    scope: target.scope || 'global',
    skillsDir: key,
    manifestPath: resolve(target.manifestPath),
    skills: Array.from(existingSkills).sort(),
    updatedAt: new Date().toISOString(),
  };

  saveStore(store, storePath);
}

/**
 * Record skill uninstalls in the central store
 */
export function recordUninstall(target, skillDirNames = [], storePath = STORE_FILE_PATH) {
  if (!skillDirNames.length) return;

  const store = loadStore(storePath);
  const key = resolve(target.skillsDir);

  if (store.installations[key]) {
    const toRemove = new Set(skillDirNames);
    const remaining = store.installations[key].skills.filter(s => !toRemove.has(s));

    if (remaining.length === 0) {
      delete store.installations[key];
    } else {
      store.installations[key].skills = remaining;
      store.installations[key].updatedAt = new Date().toISOString();
    }

    saveStore(store, storePath);
  }
}

/**
 * Retrieve all valid tracked installation locations.
 * Automatically prunes targets whose directory no longer exists on disk.
 */
export function getTrackedLocations(storePath = STORE_FILE_PATH) {
  const store = loadStore(storePath);
  const locations = [];
  let modified = false;

  for (const [key, item] of Object.entries(store.installations || {})) {
    if (!existsSync(item.skillsDir)) {
      // Clean up stale directory
      delete store.installations[key];
      modified = true;
      continue;
    }
    locations.push(item);
  }

  if (modified) {
    saveStore(store, storePath);
  }

  return locations;
}
