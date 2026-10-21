import chalk from 'chalk';
import { join } from 'node:path';
import { getAvailableSkills } from './registry.js';
import {
  resolveTarget,
  ensureDir,
  copySkill,
  removeSkill,
  readManifest,
  writeManifest,
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
    console.log(`    Version:      ${chalk.dim(info.version || '1.0.0')}\n`);
  }
}

export function install(names = [], options = {}) {
  const target = resolveTarget(options);
  const available = getAvailableSkills();

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

  for (const skill of toInstall) {
    const dest = join(target.skillsDir, skill.dirName);
    const action = options.update ? 'Updated' : 'Installed';
    copySkill(skill.path, dest);
    manifest.installed[skill.dirName] = {
      name: skill.name,
      installedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    console.log(`  ${chalk.green('✔')} ${action} ${chalk.bold(skill.name)} → ${chalk.gray(dest)}`);
  }

  writeManifest(target.manifestPath, manifest);
  console.log(chalk.green(`\n✨ Successfully ${options.update ? 'updated' : 'installed'} ${toInstall.length} skill(s)!\n`));
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

  let removed = 0;
  for (const name of names) {
    if (manifest.installed[name]) {
      const dest = join(target.skillsDir, name);
      removeSkill(dest);
      delete manifest.installed[name];
      console.log(`  ${chalk.red('✖')} Removed ${chalk.bold(name)}`);
      removed++;
    } else {
      console.log(`  ${chalk.yellow('⚠')} ${name} was not recorded in this target manifest, skipping`);
    }
  }

  writeManifest(target.manifestPath, manifest);
  if (removed > 0) {
    console.log(chalk.green(`\n✅ Removed ${removed} skill(s).\n`));
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
