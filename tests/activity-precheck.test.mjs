import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkMarkers, repositoryMetrics, validateProfile } from '../scripts/activity-precheck.mjs';

const fixtures = JSON.parse(readFileSync(new URL('./fixtures/activity.json', import.meta.url), 'utf8'));
const script = fileURLToPath(new URL('../scripts/activity-precheck.mjs', import.meta.url));

function sandbox(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'activity-precheck-'));
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function cli(dir, command, file, { dryRun = true, input } = {}) {
  return spawnSync(process.execPath, [script, command, file, ...(dryRun ? ['--dry-run'] : [])], {
    cwd: dir,
    env: { ...process.env, GITHUB_OUTPUT: join(dir, 'output'), PATH: '' },
    input,
    encoding: 'utf8',
  });
}

for (const fixture of fixtures.markers) {
  test(`markers: ${fixture.name}`, () => sandbox((dir) => {
    const readme = join(dir, 'README.md');
    const output = join(dir, 'output');
    writeFileSync(readme, fixture.text);
    writeFileSync(output, 'existing=unchanged\n');
    const result = cli(dir, 'markers', readme, { dryRun: false });
    assert.equal(result.status, fixture.error ? 1 : 0, result.stderr);
    assert.equal(readFileSync(readme, 'utf8'), fixture.text);
    assert.equal(readFileSync(output, 'utf8'), fixture.error ? 'existing=unchanged\n' : `existing=unchanged\nrender=${fixture.render}\n`);
    if (fixture.error) assert.match(result.stderr, /Invalid activity markers/);
    else assert.equal(checkMarkers(fixture.text).render, fixture.render);
  }));
}

test('curated README reproduces recorded missing-marker failure, now intentionally skips', () => {
  const readme = readFileSync(new URL('../README.md', import.meta.url));
  assert.equal(createHash('sha256').update(readme).digest('hex'), '98dcb4c00785516116792bcf132f21fd155c3e2c37738bb52abf0680349033b1');
  // The recorded updater requires this exact marker and previously exited here.
  assert.equal(readme.includes('<!--START_SECTION:activity-->'), false);
  assert.equal(readme.includes('<!--END_SECTION:activity-->'), false);
  assert.equal(checkMarkers(readme.toString()).render, false);
});

for (const fixture of fixtures.markers) {
  test(`dry-run never writes: ${fixture.name}`, () => sandbox((dir) => {
    const file = join(dir, 'README.md');
    writeFileSync(file, fixture.text);
    const result = cli(dir, 'markers', file);
    assert.equal(result.status, fixture.error ? 1 : 0);
    assert.deepEqual(readdirSync(dir), ['README.md']);
    assert.equal(readFileSync(file, 'utf8'), fixture.text);
  }));
}

test('valid profile and repository metrics retain non-zero values', () => {
  assert.deepEqual(validateProfile(fixtures.profile), fixtures.profile);
  assert.deepEqual(repositoryMetrics(fixtures.repos), { count: 3, totalSize: 20, totalStars: 7, totalForks: 4, languages: 2 });
});

test('legitimate zero metrics and empty repository list remain valid', () => {
  assert.deepEqual(validateProfile({ public_repos: 0, followers: 0, following: 0 }), { public_repos: 0, followers: 0, following: 0 });
  assert.deepEqual(repositoryMetrics([]), { count: 0, totalSize: 0, totalStars: 0, totalForks: 0, languages: 0 });
});

for (const [command, cases] of [['profile', fixtures.invalidProfile], ['repos', fixtures.invalidRepos]]) {
  for (const fixture of cases) {
    test(`${command} rejects ${fixture.name} without writes or zero substitution`, () => sandbox((dir) => {
      const result = cli(dir, command, '-', { input: fixture.text });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /Activity precheck failed:/);
      assert.equal(result.stdout, '');
      assert.deepEqual(readdirSync(dir), []);
    }));
  }
}

test('optional-feed skip does not prevent offline statistics processing', () => sandbox((dir) => {
  writeFileSync(join(dir, 'README.md'), fixtures.markers[0].text);
  const marker = cli(dir, 'markers', 'README.md');
  assert.equal(marker.status, 0);
  assert.match(marker.stdout, /Intentional skip/);
  const profile = cli(dir, 'profile', '-', { input: JSON.stringify(fixtures.profile) });
  const repos = cli(dir, 'repos', '-', { input: JSON.stringify(fixtures.repos) });
  assert.equal(profile.status, 0, profile.stderr);
  assert.equal(repos.status, 0, repos.stderr);
  assert.deepEqual(JSON.parse(profile.stdout), fixtures.profile);
  assert.equal(JSON.parse(repos.stdout).totalStars, 7);
  assert.deepEqual(readdirSync(dir), ['README.md']);
}));

test('invalid invocation fails closed', () => sandbox((dir) => {
  const result = cli(dir, 'push', '-');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage:/);
  assert.deepEqual(readdirSync(dir), []);
}));
