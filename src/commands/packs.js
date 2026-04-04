// src/commands/packs.js
// cpg playbooks            — list your playbooks
// cpg install <slug>   — install a playbook (fork all skills into account)

const chalk    = require('chalk');
const ora      = require('ora');
const api      = require('../api');
const {
  divider, printError, printSuccess, printInfo,
  formatPlaybookRow, categoryIcon,
} = require('../utils');

// ── cpg playbooks ─────────────────────────────────────────────────
async function listPlaybooks() {
  const spinner = ora('Fetching playbooks...').start();
  try {
    const data = await api.listPlaybooks();
    spinner.stop();

    if (!data.playbooks?.length) {
      printInfo('No playbooks yet. Create one at copypastegenius.com/skills');
      return;
    }

    console.log('');
    console.log(chalk.bold(`  Your playbooks`) + chalk.dim(` (${data.playbooks.length})`));
    console.log('  ' + divider());
    data.playbooks.forEach((pack, i) => console.log(formatPlaybookRow(pack, i)));
    console.log('  ' + divider());
    console.log(chalk.dim(`\n  Install a playbook: ${chalk.cyan('cpg install <slug>')}`));
    console.log('');

  } catch (err) {
    spinner.stop();
    printError(err.message);
    process.exit(1);
  }
}

// ── cpg install <slug> ────────────────────────────────────────
async function installPlaybook(slug) {
  // First peek at what's in the playbook
  const fetchSpinner = ora(`Fetching pack "${slug}"...`).start();
  let pack;
  try {
    const data = await api.getPlaybook(slug);
    pack = data.pack;
    fetchSpinner.stop();
  } catch (err) {
    fetchSpinner.stop();
    printError(err.message);
    process.exit(1);
  }

  const icon = categoryIcon(pack.category);
  console.log('');
  console.log(chalk.bold(`  📦 ${pack.title}`));
  if (pack.description) console.log(chalk.dim(`  ${pack.description}`));
  console.log('');

  if (!pack.skills?.length) {
    printInfo('This playbook has no skills to install.');
    return;
  }

  // Show what will be installed
  console.log(chalk.bold(`  Skills included (${pack.skills.length}):`));
  pack.skills.forEach(skill => {
    const si = categoryIcon(skill.category);
    const vars = skill.variables?.length
      ? chalk.dim(` · ${skill.variables.length} var${skill.variables.length !== 1 ? 's' : ''}`)
      : '';
    console.log(`  ${si} ${skill.title}${vars}`);
  });
  console.log('');

  // Install
  const installSpinner = ora(`Installing ${pack.skills.length} skills...`).start();
  try {
    const result = await api.installPlaybook(slug);
    installSpinner.stop();

    printSuccess(`${result.count} skill${result.count !== 1 ? 's' : ''} installed from "${pack.title}"`);
    console.log('');

    result.installed.forEach(skill => {
      const runCmd = skill.slug ? chalk.dim(`  →  cpg run ${skill.slug}`) : '';
      console.log(`  ${chalk.green('✔')} ${skill.title}${runCmd}`);
    });

    console.log('');
    console.log(chalk.dim(`  View all skills: ${chalk.cyan('cpg skills')}`));
    console.log('');

  } catch (err) {
    installSpinner.stop();
    printError(err.message);
    process.exit(1);
  }
}

module.exports = { listPlaybooks, installPlaybook };
