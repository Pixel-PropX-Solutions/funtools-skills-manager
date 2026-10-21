import { Command } from 'commander';
import { listAvailable, listInstalled, install, uninstall, info } from './installer.js';

export function run() {
  const program = new Command();

  program
    .name('skills-manager')
    .description('Manage custom AI skills for Antigravity & Gemini code IDEs')
    .version('1.0.0');

  program
    .command('list')
    .description('List all available skills packaged in this repository')
    .action(() => listAvailable());

  program
    .command('installed')
    .description('List skills currently installed')
    .option('-w, --workspace', 'Inspect workspace scope (.agents/skills)')
    .option('-d, --dest <path>', 'Inspect custom destination directory')
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
    .command('update [names...]')
    .description('Update skills to latest versions')
    .option('-a, --all', 'Update all installed skills')
    .option('-w, --workspace', 'Update in workspace (.agents/skills)')
    .option('-d, --dest <path>', 'Update in custom destination directory')
    .action((names, opts) => install(names, { ...opts, update: true }));

  program
    .command('info <name>')
    .description('Show details and description of a specific packaged skill')
    .action((name) => info(name));

  program.parse();
}
