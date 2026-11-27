const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const scriptPath = path.resolve(__dirname, '../scripts/apply-build-info.js');

test('build information is stamped in Settings and can be safely refreshed', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'free-bill-build-info-'));
  try {
    fs.mkdirSync(path.join(root, 'www'));
    const htmlPath = path.join(root, 'www', 'index.html');
    fs.writeFileSync(htmlPath, '<section id="settings"><div class="panel"><h3>Privacy</h3><p>Local data note</p></div></section>');

    const env = {
      ...process.env,
      GITHUB_RUN_NUMBER: '123',
      GITHUB_SHA: 'abcdef1234567890',
      FREE_BILL_BUILD_TIME: '2026-11-27T07:00:00.000Z'
    };
    execFileSync(process.execPath, [scriptPath], { cwd: root, env, stdio: 'pipe' });
    let html = fs.readFileSync(htmlPath, 'utf8');
    assert.match(html, /CI run #123 · commit abcdef1 · built 2026-11-27 07:00:00 UTC/);
    assert.match(html, /id="buildInfo"/);
    assert.ok(html.indexOf('Build information') < html.indexOf('<h3>Privacy</h3>'));

    execFileSync(process.execPath, [scriptPath], {
      cwd: root,
      env: { ...env, GITHUB_RUN_NUMBER: '124', GITHUB_SHA: '1234567890abcdef' },
      stdio: 'pipe'
    });
    html = fs.readFileSync(htmlPath, 'utf8');
    assert.match(html, /CI run #124 · commit 1234567 · built 2026-11-27 07:00:00 UTC/);
    assert.equal((html.match(/id="buildInfo"/g) || []).length, 1);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('build information patch refuses an unexpected HTML structure', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'free-bill-build-info-invalid-'));
  try {
    fs.mkdirSync(path.join(root, 'www'));
    fs.writeFileSync(path.join(root, 'www', 'index.html'), '<main>Unexpected page</main>');
    assert.throws(() => execFileSync(process.execPath, [scriptPath], {
      cwd: root,
      env: { ...process.env, GITHUB_RUN_NUMBER: '1', GITHUB_SHA: 'abcdef0' },
      stdio: 'pipe'
    }));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
