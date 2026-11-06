import chalk from 'chalk';
import { join } from 'node:path';
import { getAvailableSkills } from './registry.js';
import { recordInstall, recordUninstall, getTrackedLocations } from './store.js';
import {
  resolveTarget,
  ensureDir,
  copySkill,
  removeSkill,
  readManifest,
  writeManifest,
  getPackageVersion,
} from './utils.js';

export function listAvailable() {
  const skills = getAvailableSkills();
  if (!skills.length) {
    console.log(chalk.yellow('\nNo skills found in package skills/ directory.'));
    return;
  }
  console.log(chalk.bold('\n📦 Available Skills in @funtools/skills-manager:\n'));
  for (const s of skills) {
    console.log(`  ${chalk.green('●')} ${chalk.bold(s.name)} (dir: ${chalk.gray(s.dirName)})`);
    console.log(`    ${chalk.dim(s.description)}\n`);
  }
}

export function listInstalled(options = {}) {
  if (options.allLocations) {
    const locations = getTrackedLocations();
    console.log(chalk.bold('\n🌍 All Tracked Skill Locations across System:\n'));
    if (!locations.length) {
      console.log(chalk.yellow('  No installed skills recorded across system.\n'));
      return;
    }
    for (const loc of locations) {
      console.log(`  📍 Scope: ${chalk.cyan(loc.scope)}`);
      console.log(`     Directory: ${chalk.gray(loc.skillsDir)}`);
      console.log(`     Skills:    ${loc.skills.map(s => chalk.green(s)).join(', ') || chalk.dim('none')}`);
      console.log(`     Updated:   ${chalk.dim(loc.updatedAt || 'unknown')}\n`);
    }
    return;
  }

  const target = resolveTarget(options);
  const manifest = readManifest(target.manifestPath);
  const names = Object.keys(manifest.installed || {});

  console.log(chalk.bold(`\n📍 Scope: ${chalk.cyan(target.scope)}`));
  console.log(chalk.gray(`   Directory: ${target.skillsDir}`));
  console.log(chalk.gray(`   Manifest:  ${target.manifestPath}\n`));

  if (!names.length) {
    console.log(chalk.yellow('  No skills installed in this target.\n'));
    return;
  }

  console.log(chalk.bold('✅ Installed Skills:\n'));
  for (const name of names) {
    const info = manifest.installed[name];
    console.log(`  ${chalk.green('●')} ${chalk.bold(name)}`);
    console.log(`    Installed at: ${chalk.dim(info.installedAt)}`);
    console.log(`    Version:      ${chalk.dim(info.version || getPackageVersion())}\n`);
  }
}

export function install(names = [], options = {}) {
  const target = resolveTarget(options);
  const available = getAvailableSkills();
  const currentVersion = getPackageVersion();

  if (!available.length) {
    console.log(chalk.red('\nNo skills found in the package registry to install.\n'));
    return;
  }

  let toInstall = [];
  if (options.all) {
    toInstall = available;
  } else if (names && names.length > 0) {
    toInstall = available.filter(
      s => names.includes(s.dirName) || names.includes(s.name)
    );
  }

  if (!toInstall.length) {
    console.log(chalk.red('\nNo matching skills specified.'));
    console.log(`Use ${chalk.cyan('--all')} to install all, or choose from:`);
    for (const s of available) {
      console.log(`  - ${chalk.yellow(s.dirName)}`);
    }
    console.log();
    return;
  }

  ensureDir(target.skillsDir);
  const manifest = readManifest(target.manifestPath);
  manifest.installed = manifest.installed || {};

  console.log(chalk.bold(`\n🚀 Installing to ${chalk.cyan(target.scope)}:`));
  console.log(chalk.gray(`   Target: ${target.skillsDir}\n`));

  const installedDirNames = [];
  for (const skill of toInstall) {
    const dest = join(target.skillsDir, skill.dirName);
    copySkill(skill.path, dest);
    manifest.installed[skill.dirName] = {
      name: skill.name,
      installedAt: new Date().toISOString(),
      version: currentVersion,
    };
    installedDirNames.push(skill.dirName);
    console.log(`  ${chalk.green('✔')} Installed ${chalk.bold(skill.name)} → ${chalk.gray(dest)}`);
  }

  writeManifest(target.manifestPath, manifest);
  recordInstall(target, installedDirNames);

  console.log(chalk.green(`\n✨ Successfully installed ${toInstall.length} skill(s)!\n`));
}

export function uninstall(names = [], options = {}) {
  const target = resolveTarget(options);
  const manifest = readManifest(target.manifestPath);
  manifest.installed = manifest.installed || {};

  if (!names || !names.length) {
    console.log(chalk.red('\nPlease provide one or more skill names to uninstall.\n'));
    return;
  }

  console.log(chalk.bold(`\n🗑️  Uninstalling from ${chalk.cyan(target.scope)}:`));
  console.log(chalk.gray(`   Target: ${target.skillsDir}\n`));

  const removedSkillNames = [];
  for (const name of names) {
    if (manifest.installed[name]) {
      const dest = join(target.skillsDir, name);
      removeSkill(dest);
      delete manifest.installed[name];
      removedSkillNames.push(name);
      console.log(`  ${chalk.red('✖')} Removed ${chalk.bold(name)}`);
    } else {
      console.log(`  ${chalk.yellow('⚠')} ${name} was not recorded in this target manifest, skipping`);
    }
  }

  writeManifest(target.manifestPath, manifest);
  recordUninstall(target, removedSkillNames);

  if (removedSkillNames.length > 0) {
    console.log(chalk.green(`\n✅ Removed ${removedSkillNames.length} skill(s).\n`));
  } else {
    console.log(chalk.yellow('\nNo matching installed skills were removed.\n'));
  }
}

export function info(name) {
  const skills = getAvailableSkills();
  const skill = skills.find(s => s.dirName === name || s.name === name);
  if (!skill) {
    console.log(chalk.red(`\nSkill "${name}" not found in available package skills.\n`));
    return;
  }
  console.log(chalk.bold(`\n📄 Skill Details: ${chalk.green(skill.name)}\n`));
  console.log(`  Directory:   ${skill.dirName}`);
  console.log(`  Description: ${skill.description}`);
  console.log(`  Source:      ${skill.path}\n`);
}
