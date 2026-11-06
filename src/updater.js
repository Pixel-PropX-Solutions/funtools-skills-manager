import chalk from 'chalk';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { getAvailableSkills } from './registry.js';
import { getTrackedLocations } from './store.js';
import {
  getPackageVersion,
  copySkill,
  readManifest,
  writeManifest,
  STORE_FILE_PATH,
} from './utils.js';

const PACKAGE_NAME = '@funtools/skills-manager';

/**
 * Compare two semver strings: returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareSemver(v1 = '', v2 = '') {
  const clean1 = String(v1).replace(/^v/, '').split('-')[0].trim();
  const clean2 = String(v2).replace(/^v/, '').split('-')[0].trim();

  const parts1 = clean1.split('.').map(n => parseInt(n, 10) || 0);
  const parts2 = clean2.split('.').map(n => parseInt(n, 10) || 0);

  const maxLen = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLen; i++) {
    const num1 = parts1[i] ?? 0;
    const num2 = parts2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Fetch the latest published version from npm registry
 */
export async function fetchLatestVersion(packageName = PACKAGE_NAME, timeoutMs = 5000) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.version) {
        return data.version;
      }
    }
  } catch {
    // Direct registry fetch failed or timed out, attempt fallback
  }

  // Fallback to npm view
  try {
    const output = execSync(`npm view ${packageName} version`, {
      encoding: 'utf-8',
      timeout: timeoutMs,
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const ver = output.trim();
    if (ver) return ver;
  } catch {
    // Both failed
  }

  throw new Error(`Could not determine latest version for ${packageName}.`);
}

/**
 * Check if a new version is available on npm
 */
export async function checkUpdate(options = {}) {
  const currentVersion = getPackageVersion();
  console.log(chalk.bold(`\n🔍 Checking for updates for ${chalk.cyan(PACKAGE_NAME)}...`));

  let latestVersion;
  try {
    latestVersion = await fetchLatestVersion();
  } catch (err) {
    console.log(chalk.red(`\n⚠ Failed to check latest version: ${err.message}`));
    console.log(chalk.gray(`  Current installed version: ${currentVersion}\n`));
    return { updateAvailable: false, current: currentVersion, error: err };
  }

  const comparison = compareSemver(latestVersion, currentVersion);
  console.log(`  Current version: ${chalk.bold(currentVersion)}`);
  console.log(`  Latest version:  ${chalk.bold(chalk.green(latestVersion))}\n`);

  if (comparison > 0) {
    console.log(chalk.yellow(`✨ A new version is available: ${chalk.bold(latestVersion)}`));
    console.log(`   Run ${chalk.cyan('skills-manager update')} to automatically update.\n`);
    return { updateAvailable: true, current: currentVersion, latest: latestVersion };
  } else {
    console.log(chalk.green(`✅ You are using the latest version of ${PACKAGE_NAME}.\n`));
    return { updateAvailable: false, current: currentVersion, latest: latestVersion };
  }
}

/**
 * Synchronize all installed skills across all locations tracked in the central store
 */
export function syncAllInstalledSkills(availableSkills = null, storePath = STORE_FILE_PATH) {
  const skills = availableSkills || getAvailableSkills();
  const currentVersion = getPackageVersion();
  const locations = getTrackedLocations(storePath);

  if (!locations.length) {
    console.log(chalk.yellow('  No tracked skill installations found to synchronize.\n'));
    return { updatedCount: 0, targetCount: 0 };
  }

  console.log(chalk.bold(`\n🔁 Syncing installed skills across ${chalk.cyan(locations.length)} location(s):\n`));

  let totalUpdated = 0;

  for (const loc of locations) {
    console.log(`  📍 Scope: ${chalk.bold(chalk.cyan(loc.scope))} (${chalk.gray(loc.skillsDir)})`);
    const manifest = readManifest(loc.manifestPath);
    manifest.installed = manifest.installed || {};

    let locUpdated = 0;
    for (const skillName of loc.skills || []) {
      const skill = skills.find(s => s.dirName === skillName || s.name === skillName);
      if (skill) {
        const dest = join(loc.skillsDir, skill.dirName);
        copySkill(skill.path, dest);
        manifest.installed[skill.dirName] = {
          name: skill.name,
          installedAt: new Date().toISOString(),
          version: currentVersion,
        };
        console.log(`     ${chalk.green('✔')} Updated ${chalk.bold(skill.name)}`);
        locUpdated++;
        totalUpdated++;
      } else {
        console.log(`     ${chalk.yellow('⚠')} Skill "${skillName}" is no longer in packaged skills`);
      }
    }

    writeManifest(loc.manifestPath, manifest);
    console.log();
  }

  console.log(chalk.green(`✨ Successfully refreshed ${totalUpdated} skill installation(s)!\n`));
  return { updatedCount: totalUpdated, targetCount: locations.length };
}

/**
 * Handle self-updating the CLI and refreshing all installed skills
 */
export async function selfUpdate(options = {}) {
  if (options.check) {
    return checkUpdate(options);
  }

  const currentVersion = getPackageVersion();
  console.log(chalk.bold(`\n📦 Checking for updates for ${chalk.cyan(PACKAGE_NAME)}...`));

  let latestVersion = null;
  try {
    latestVersion = await fetchLatestVersion();
  } catch (err) {
    if (!options.force) {
      console.log(chalk.red(`\n⚠ Could not check latest version: ${err.message}`));
      console.log(chalk.gray(`  Current installed version: ${currentVersion}`));
      console.log(`  Use ${chalk.cyan('--force')} to sync installed skills offline.\n`);
      return;
    }
  }

  const isNewer = latestVersion && compareSemver(latestVersion, currentVersion) > 0;

  if (isNewer || options.force) {
    const targetVer = latestVersion || currentVersion;
    console.log(chalk.bold(`\n🚀 Updating ${chalk.cyan(PACKAGE_NAME)} to v${targetVer}...`));

    if (!options.dryRun) {
      try {
        execSync(`npm install -g ${PACKAGE_NAME}@latest`, {
          stdio: 'inherit',
        });
        console.log(chalk.green(`\n✔ Package successfully updated to v${targetVer}!`));
      } catch (err) {
        console.log(chalk.red(`\n❌ Failed to update package automatically:`));
        console.log(chalk.yellow(`  ${err.message}`));
        console.log(`\n  Please run manually with appropriate permissions:`);
        console.log(chalk.cyan(`    npm install -g ${PACKAGE_NAME}@latest\n`));
        return;
      }
    } else {
      console.log(chalk.gray('  [dry-run] Skipped npm install -g'));
    }
  } else {
    console.log(chalk.green(`\n✅ You are already on the latest version (v${currentVersion}).`));
  }

  // Auto-sync all installed skills
  syncAllInstalledSkills();
}
