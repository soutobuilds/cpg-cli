// src/commands/auth.js
// cpg auth login   — save API key
// cpg auth logout  — remove API key
// cpg auth status  — show current auth state

const chalk   = require('chalk');
const { prompt } = require('enquirer');
const { setApiKey, clearApiKey, clearUsername, getApiKey, getUsername, isLoggedIn, configPath } = require('../config');
const { printSuccess, printError, printInfo } = require('../utils');
const api = require('../api');

async function login() {
  console.log('');
  console.log(chalk.bold('  CopyPasteGenius CLI — Login'));
  console.log(chalk.dim('  Get your API key at: ') + chalk.cyan('https://www.copypastegenius.com/settings'));
  console.log('');

  const { key } = await prompt({
    type:    'password',
    name:    'key',
    message: 'Paste your API key:',
    validate: v => v.startsWith('cpg_') ? true : 'Key must start with cpg_',
  });

  // Verify the key works by hitting the API
  const ora = require('ora');
  const spinner = ora('Verifying key...').start();

  try {
    setApiKey(key.trim());
    const data = await api.listSkills({ limit: 1 });
    const username = data.user?.username || 'user';
    const { setUsername } = require('../config');
    setUsername(username);
    spinner.succeed(chalk.green(`Logged in as @${username}`));
    printInfo(`Config saved to: ${configPath()}`);
    console.log('');
    console.log(`  Run ${chalk.cyan('cpg skills')} to see your skills`);
    console.log(`  Run ${chalk.cyan('cpg help')} for all commands`);
    console.log('');
  } catch (err) {
    clearApiKey();
    spinner.fail('Invalid API key');
    printError(err.message);
    process.exit(1);
  }
}

async function logout() {
  if (!isLoggedIn()) {
    printInfo('Not logged in.');
    return;
  }
  clearApiKey();
  clearUsername();
  printSuccess('Logged out successfully.');
}

async function status() {
  if (!isLoggedIn()) {
    console.log(chalk.dim('  Not logged in'));
    console.log(`  Run ${chalk.cyan('cpg auth login')} to authenticate`);
    return;
  }
  const username = getUsername();
  const key = getApiKey();
  const masked = key ? key.slice(0, 12) + '••••••••' : '—';
  console.log('');
  console.log(chalk.bold('  Auth status'));
  console.log(`  ${chalk.dim('User:')}     @${username || 'unknown'}`);
  console.log(`  ${chalk.dim('API key:')} ${masked}`);
  console.log(`  ${chalk.dim('Config:')}  ${configPath()}`);
  console.log('');
}

module.exports = { login, logout, status };
