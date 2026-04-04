#!/usr/bin/env node
// src/index.js
// CopyPasteGenius CLI — main entry point

const { Command } = require('commander');
const chalk = require('chalk');
const { isLoggedIn } = require('./config');

const program = new Command();

// ── Banner ────────────────────────────────────────────────────
const BANNER = `
  ${chalk.bold('CopyPaste')}${chalk.bold.hex('#7f77dd')('Genius')} ${chalk.dim('CLI')}
`;

// ── Program setup ─────────────────────────────────────────────
program
  .name('cpg')
  .description('Run AI skills from your terminal')
  .version('0.1.0', '-v, --version')
  .addHelpText('before', BANNER);

// ── auth commands ─────────────────────────────────────────────
const authCmd = program.command('auth').description('Manage authentication');

authCmd
  .command('login')
  .description('Log in with your API key')
  .action(async () => {
    const { login } = require('./commands/auth');
    await login();
  });

authCmd
  .command('logout')
  .description('Remove saved API key')
  .action(async () => {
    const { logout } = require('./commands/auth');
    await logout();
  });

authCmd
  .command('status')
  .description('Show current auth status')
  .action(async () => {
    const { status } = require('./commands/auth');
    await status();
  });

// ── skills commands ───────────────────────────────────────────
program
  .command('skills [slug]')
  .description('List your skills, or show detail for a specific skill')
  .option('-c, --category <category>', 'Filter by category')
  .option('-s, --search <query>',      'Search by title or description')
  .action(async (slug, options) => {
    const { listSkills, showSkill } = require('./commands/skills');
    if (slug) {
      await showSkill(slug);
    } else {
      await listSkills(options);
    }
  });

// ── run command ───────────────────────────────────────────────
program
  .command('run <slug>')
  .description('Run a skill — fills variables and copies prompt to clipboard')
  .option('--var <key=value...>', 'Pre-fill a variable (repeatable): --var tone=formal --var topic=AI')
  .option('--print', 'Print assembled prompt instead of copying to clipboard')
  .action(async (slug, options) => {
    const { runSkill } = require('./commands/skills');
    await runSkill(slug, options);
  });

// ── packs commands ────────────────────────────────────────────
program
  .command('playbooks')
  .description('List your playbooks')
  .action(async () => {
    const { listPlaybooks } = require('./commands/packs');
    await listPlaybooks();
  });

program
  .command('install <slug>')
  .description('Install a playbook — forks all skills into your account')
  .action(async (slug) => {
    const { installPlaybook } = require('./commands/packs');
    await installPlaybook(slug);
  });

// ── Shortcut: cpg whoami ──────────────────────────────────────
program
  .command('whoami')
  .description('Show who you are logged in as')
  .action(async () => {
    const { status } = require('./commands/auth');
    await status();
  });

// ── Default: show help if no args ─────────────────────────────
if (process.argv.length <= 2) {
  console.log(BANNER);
  console.log(chalk.bold('  Quick start:'));
  console.log('');
  console.log(`  ${chalk.cyan('cpg auth login')}          Log in with your API key`);
  console.log(`  ${chalk.cyan('cpg skills')}              List your skills`);
  console.log(`  ${chalk.cyan('cpg run <slug>')}          Run a skill`);
  console.log(`  ${chalk.cyan('cpg playbooks')}               List your playbooks`);
  console.log(`  ${chalk.cyan('cpg install <slug>')}      Install a playbook`);
  console.log('');
  console.log(chalk.dim(`  Get your API key at: https://www.copypastegenius.com/settings`));
  console.log('');
  process.exit(0);
}

program.parse(process.argv);
