// src/utils.js
// Shared formatting and output utilities

const chalk = require('chalk');

// ── Category icons (mirrors the web app) ─────────────────────
const CATEGORY_ICONS = {
  general:   '✦', marketing: '📣', writing:  '✍️',
  coding:    '💻', seo:       '🔍', research: '🔬',
  creative:  '🎨', business:  '💼', social:   '📱',
  education: '📚', image:     '🖼', video:    '🎬',
};

const TYPE_ICONS = {
  text: '📄', code: '💻', image: '🖼',
  video: '🎬', longform: '📝', prompt: '⚡',
};

function categoryIcon(cat) {
  return CATEGORY_ICONS[cat] || '✦';
}

function typeIcon(type) {
  return TYPE_ICONS[type] || '📄';
}

// ── Text formatting ───────────────────────────────────────────
function truncate(str, len = 60) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len - 1) + '…' : str;
}

function varCount(variables) {
  if (!variables?.length) return '';
  return chalk.dim(` · ${variables.length} var${variables.length !== 1 ? 's' : ''}`);
}

// ── Divider ───────────────────────────────────────────────────
function divider(char = '─', width = 60) {
  return chalk.dim(char.repeat(width));
}

// ── Error output ──────────────────────────────────────────────
function printError(msg) {
  console.error(chalk.red('✖ ') + msg);
}

function printSuccess(msg) {
  console.log(chalk.green('✔ ') + msg);
}

function printInfo(msg) {
  console.log(chalk.blue('ℹ ') + msg);
}

function printWarn(msg) {
  console.log(chalk.yellow('⚠ ') + msg);
}

// ── Skill table row ───────────────────────────────────────────
function formatSkillRow(skill, index) {
  const icon  = categoryIcon(skill.category);
  const title = chalk.white(truncate(skill.title, 40));
  const slug  = skill.slug ? chalk.dim(`  cpg run ${skill.slug}`) : '';
  const vars  = varCount(skill.variables);
  const uses  = skill.use_count > 0 ? chalk.dim(`  ${skill.use_count} uses`) : '';
  return `  ${chalk.dim(String(index + 1).padStart(2))}  ${icon} ${title}${vars}${uses}${slug}`;
}

// ── Pack table row ────────────────────────────────────────────
function formatPackRow(pack, index) {
  const title = chalk.white(truncate(pack.title, 40));
  const count = chalk.dim(`  ${pack.skills?.length || pack.skill_count || 0} skills`);
  const slug  = pack.slug ? chalk.dim(`  cpg install ${pack.slug}`) : '';
  const installs = pack.install_count > 0 ? chalk.dim(`  ${pack.install_count} installs`) : '';
  return `  ${chalk.dim(String(index + 1).padStart(2))}  📦 ${title}${count}${installs}${slug}`;
}

module.exports = {
  categoryIcon, typeIcon, truncate, varCount,
  divider, printError, printSuccess, printInfo, printWarn,
  formatSkillRow, formatPackRow,
};
