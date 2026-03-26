// src/commands/skills.js
// cpg skills           — list your skills
// cpg skills <slug>    — show a skill detail
// cpg run <slug>       — run a skill (fill vars + copy prompt)

const chalk    = require('chalk');
const { prompt } = require('enquirer');
const ora      = require('ora');
const clipboardy = require('clipboardy');
const api      = require('../api');
const {
  divider, printError, printSuccess, printInfo,
  formatSkillRow, categoryIcon, truncate,
} = require('../utils');

// ── cpg skills ────────────────────────────────────────────────
async function listSkills(options = {}) {
  const spinner = ora('Fetching skills...').start();
  try {
    const data = await api.listSkills({
      ...(options.category && { category: options.category }),
      ...(options.search   && { search:   options.search   }),
    });
    spinner.stop();

    if (!data.skills?.length) {
      printInfo('No skills found. Create one at copypastegenius.com/skills');
      return;
    }

    console.log('');
    console.log(chalk.bold(`  Your skills`) + chalk.dim(` (${data.skills.length})`));
    console.log('  ' + divider());
    data.skills.forEach((skill, i) => console.log(formatSkillRow(skill, i)));
    console.log('  ' + divider());
    console.log(chalk.dim(`\n  Run a skill: ${chalk.cyan('cpg run <slug>')}`));
    console.log('');

  } catch (err) {
    spinner.stop();
    printError(err.message);
    process.exit(1);
  }
}

// ── cpg skills <slug> — show skill detail ─────────────────────
async function showSkill(slug) {
  const spinner = ora(`Fetching skill "${slug}"...`).start();
  try {
    const { skill } = await api.getSkill(slug);
    spinner.stop();

    const icon = categoryIcon(skill.category);
    console.log('');
    console.log(chalk.bold(`  ${icon} ${skill.title}`));
    if (skill.description) {
      console.log(chalk.dim(`  ${skill.description}`));
    }
    console.log('');
    console.log(`  ${chalk.dim('Slug:')}     ${chalk.cyan(skill.slug || '—')}`);
    console.log(`  ${chalk.dim('Category:')} ${skill.category}`);
    console.log(`  ${chalk.dim('Type:')}     ${skill.type}`);
    if (skill.model) console.log(`  ${chalk.dim('Model:')}    ${skill.model}`);
    if (skill.tags?.length) console.log(`  ${chalk.dim('Tags:')}     ${skill.tags.join(', ')}`);
    console.log('');

    if (skill.variables?.length) {
      console.log(chalk.bold('  Variables'));
      console.log('  ' + divider('─', 40));
      skill.variables.forEach(v => {
        const req = v.required ? chalk.red(' *') : chalk.dim(' (optional)');
        const hint = v.placeholder ? chalk.dim(` — ${v.placeholder}`) : '';
        console.log(`  ${chalk.cyan('{{' + v.name + '}}')}${req}${hint}`);
      });
      console.log('');
    }

    console.log(chalk.bold('  Prompt template'));
    console.log('  ' + divider('─', 40));
    const lines = skill.prompt.split('\n');
    lines.forEach(line => console.log(chalk.dim('  ') + line));
    console.log('');

    if (skill.output_example) {
      console.log(chalk.bold('  Example output'));
      console.log('  ' + divider('─', 40));
      const exLines = skill.output_example.slice(0, 300).split('\n');
      exLines.forEach(line => console.log(chalk.dim('  ') + chalk.italic(line)));
      if (skill.output_example.length > 300) console.log(chalk.dim('  …'));
      console.log('');
    }

    console.log(chalk.dim(`  Run it: ${chalk.cyan('cpg run ' + (skill.slug || slug))}`));
    console.log('');

  } catch (err) {
    spinner.stop();
    printError(err.message);
    process.exit(1);
  }
}

// ── cpg run <slug> ────────────────────────────────────────────
async function runSkill(slug, options = {}) {
  // First fetch the skill to get variables
  const spinner = ora(`Loading skill "${slug}"...`).start();
  let skill;
  try {
    const data = await api.getSkill(slug);
    skill = data.skill;
    spinner.stop();
  } catch (err) {
    spinner.stop();
    printError(err.message);
    process.exit(1);
  }

  const icon = categoryIcon(skill.category);
  console.log('');
  console.log(chalk.bold(`  ${icon} ${skill.title}`));
  if (skill.description) console.log(chalk.dim(`  ${skill.description}`));
  console.log('');

  // Collect variable values
  const variables = {};
  const vars = skill.variables || [];

  if (vars.length === 0) {
    // No variables — just run directly
  } else {
    // Check if variables were passed as --var key=value flags
    const cliVars = {};
    if (options.var) {
      const varArgs = Array.isArray(options.var) ? options.var : [options.var];
      varArgs.forEach(v => {
        const [key, ...rest] = v.split('=');
        if (key && rest.length) cliVars[key.trim()] = rest.join('=').trim();
      });
    }

    console.log(chalk.bold(`  Fill in ${vars.length} variable${vars.length !== 1 ? 's' : ''}:`));
    console.log('');

    for (const v of vars) {
      // Use CLI flag if provided
      if (cliVars[v.name]) {
        variables[v.name] = cliVars[v.name];
        console.log(`  ${chalk.cyan('{{' + v.name + '}}')} ${chalk.dim('→')} ${variables[v.name]}`);
        continue;
      }

      const label = v.label || v.name;
      const hint  = v.placeholder ? chalk.dim(` (${v.placeholder})`) : '';
      const req   = v.required ? chalk.red('*') : chalk.dim('?');

      if (v.multiline) {
        const { value } = await prompt({
          type:    'input',
          name:    'value',
          message: `${req} ${label}${hint}`,
          initial: '',
        });
        if (!value && v.required) {
          printError(`${label} is required`);
          process.exit(1);
        }
        variables[v.name] = value;
      } else {
        const { value } = await prompt({
          type:    'input',
          name:    'value',
          message: `${req} ${label}${hint}`,
        });
        if (!value && v.required) {
          printError(`${label} is required`);
          process.exit(1);
        }
        variables[v.name] = value || '';
      }
    }
    console.log('');
  }

  // Run the skill
  const runSpinner = ora('Assembling prompt...').start();
  try {
    const result = await api.runSkill(slug, variables);
    runSpinner.stop();

    if (result.unfilled_variables?.length) {
      printError(`Missing required variables: ${result.unfilled_variables.join(', ')}`);
      process.exit(1);
    }

    const assembled = result.assembled_prompt;

    // Output modes
    if (options.output === 'print' || options.print) {
      console.log('');
      console.log(divider('─', 60));
      console.log(assembled);
      console.log(divider('─', 60));
      console.log('');
    }

    // Default — copy to clipboard
    if (!options.print) {
      try {
        clipboardy.writeSync(assembled);
        printSuccess('Prompt copied to clipboard! ✨');
      } catch {
        // Clipboard unavailable (headless env)
        console.log('');
        console.log(chalk.bold('  Assembled prompt:'));
        console.log(divider('─', 60));
        console.log(assembled);
        console.log(divider('─', 60));
        printInfo('(clipboard unavailable in this environment)');
      }
    }

    // Stats
    console.log('');
    const lines = assembled.split('\n').length;
    const words = assembled.split(/\s+/).filter(Boolean).length;
    console.log(chalk.dim(`  ${words} words · ${lines} lines · skill: ${result.skill.title}`));
    console.log('');

  } catch (err) {
    runSpinner.stop();
    printError(err.message);
    process.exit(1);
  }
}

module.exports = { listSkills, showSkill, runSkill };
