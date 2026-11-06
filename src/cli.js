import { Command } from 'commander';
import chalk from 'chalk';
import { listAvailable, listInstalled, install, uninstall, info } from './installer.js';
import { checkUpdate, selfUpdate } from './updater.js';
import { getPackageVersion } from './utils.js';

export function run() {
  const program = new Command();

  program
    .name('skills-manager')
    .description('Manage custom AI skills for Antigravity & Gemini code IDEs')
    .version(getPackageVersion());

  program
    .command('list')
    .description('List all available skills packaged in this repository')
    .action(() => listAvailable());

  program
    .command('installed')
    .description('List skills currently installed')
    .option('-w, --workspace', 'Inspect workspace scope (.agents/skills)')
    .option('-d, --dest <path>', 'Inspect custom destination directory')
    .option('-a, --all-locations', 'List skills across all tracked locations')
    .action((opts) => listInstalled(opts));

  program
    .command('install [names...]')
    .description('Install skills (defaults to global ~/.gemini/config/skills)')
    .option('-a, --all', 'Install all available skills')
    .option('-w, --workspace', 'Install into workspace (.agents/skills) instead of global')
    .option('-d, --dest <path>', 'Install into a custom destination directory')
    .action((names, opts) => install(names, opts));

  program
    .command('uninstall <names...>')
    .description('Remove installed skills')
    .option('-w, --workspace', 'Remove from workspace (.agents/skills)')
    .option('-d, --dest <path>', 'Remove from custom destination directory')
    .action((names, opts) => uninstall(names, opts));

  program
    .command('check')
    .alias('check-update')
    .description('Check for new version of @funtools/skills-manager on npm')
    .action(() => checkUpdate());

  program
    .command('update [names...]')
    .alias('upgrade')
    .description('Update @funtools/skills-manager package and auto-refresh all installed skills across all locations')
    .option('-c, --check', 'Check for updates without installing')
    .option('-f, --force', 'Force re-install and sync skills even if already on latest version')
    .option('--dry-run', 'Simulate update without executing npm install')
    .action(async (names, opts) => {
      if (names && names.length > 0) {
        console.log(chalk.yellow(`\nℹ️  Notice: Specific skill names (${names.join(', ')}) are ignored.`));
        console.log(chalk.yellow(`   "skills-manager update" updates the package and all installed skills across all locations automatically.\n`));
      }
      await selfUpdate(opts);
    });

  program
    .command('info <name>')
    .description('Show details and description of a specific packaged skill')
    .action((name) => info(name));

  program.parse();
}
