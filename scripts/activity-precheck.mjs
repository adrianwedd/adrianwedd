import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const START = '<!--START_SECTION:activity-->';
const END = '<!--END_SECTION:activity-->';

export function checkMarkers(readme) {
  const starts = readme.split(START).length - 1;
  const ends = readme.split(END).length - 1;
  if (starts === 0 && ends === 0) {
    return { render: false, message: 'Intentional skip: README has no activity markers; statistics processing remains enabled.' };
  }
  if (starts !== 1 || ends !== 1 || readme.indexOf(START) >= readme.indexOf(END)) {
    throw new Error('Invalid activity markers: require exactly one START_SECTION:activity followed by one END_SECTION:activity. No README write permitted.');
  }
  return { render: true, message: 'Activity marker pair validated; README activity rendering permitted.' };
}

function object(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label}: expected an object`);
  }
  if ('message' in value || 'errors' in value || 'error' in value) {
    throw new Error(`${label}: upstream error payload`);
  }
}

function count(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label}: expected a non-negative safe integer`);
  }
  return value;
}

export function validateProfile(value) {
  object(value, 'Profile');
  return Object.fromEntries(['public_repos', 'followers', 'following'].map(
    (field) => [field, count(value[field], `Profile.${field}`)],
  ));
}

export function repositoryMetrics(value) {
  if (!Array.isArray(value)) throw new Error('Repositories: expected an array, not an upstream error payload');
  const languages = new Set();
  const metrics = { count: value.length, totalSize: 0, totalStars: 0, totalForks: 0, languages: 0 };
  for (const [index, repo] of value.entries()) {
    object(repo, `Repository ${index}`);
    for (const [field, output] of [['size', 'totalSize'], ['stargazers_count', 'totalStars'], ['forks_count', 'totalForks']]) {
      metrics[output] = count(metrics[output] + count(repo[field], `Repository ${index}.${field}`), output);
    }
    if (repo.language !== null && (typeof repo.language !== 'string' || repo.language.length === 0)) {
      throw new Error(`Repository ${index}.language: expected a non-empty string or null`);
    }
    // Preserve the existing workflow's distinct-language count, including null.
    languages.add(repo.language);
  }
  metrics.languages = languages.size;
  return metrics;
}

export function main(args, env = process.env) {
  const dryRun = args.includes('--dry-run');
  const positional = args.filter((arg) => arg !== '--dry-run');
  const [command, file] = positional;
  if (positional.length !== 2 || !['markers', 'profile', 'repos'].includes(command)) {
    throw new Error('Usage: node scripts/activity-precheck.mjs markers|profile|repos FILE|- [--dry-run]');
  }
  const text = readFileSync(file === '-' ? 0 : file, 'utf8');
  if (command === 'markers') {
    const result = checkMarkers(text);
    console.log(result.message);
    if (!dryRun && env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `render=${result.render}\n`);
    return result;
  }
  const payload = JSON.parse(text);
  const result = command === 'profile' ? validateProfile(payload) : repositoryMetrics(payload);
  console.log(JSON.stringify(result));
  return result;
}

// This utility has no network, Git, commit, push, or README-write path.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`Activity precheck failed: ${error.message}`);
    process.exitCode = 1;
  }
}
