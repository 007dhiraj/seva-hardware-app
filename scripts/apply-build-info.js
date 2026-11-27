const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.join('www', 'index.html');
if (!fs.existsSync(htmlPath)) throw new Error('Generated app HTML is missing: ' + htmlPath);

const runNumber = String(process.env.GITHUB_RUN_NUMBER || 'local').replace(/[^a-zA-Z0-9._-]/g, '');
const commit = String(process.env.GITHUB_SHA || 'local').replace(/[^a-fA-F0-9]/g, '').slice(0, 7) || 'local';
const rawBuildTime = process.env.FREE_BILL_BUILD_TIME || new Date().toISOString();
const buildTime = new Date(rawBuildTime);
if (Number.isNaN(buildTime.getTime())) throw new Error('Invalid FREE_BILL_BUILD_TIME');

const displayTime = buildTime.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
const label = 'CI run #' + runNumber + ' · commit ' + commit + ' · built ' + displayTime;
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);
const markup = '<div class="panel"><h3>Build information</h3><p class="muted" id="buildInfo">' +
  escapeHtml(label) +
  '</p><p class="muted">Compare this build ID with the latest successful GitHub Actions run before reporting an outdated APK.</p></div>';

let html = fs.readFileSync(htmlPath, 'utf8');
const existing = /<div class="panel"><h3>Build information<\/h3>[\s\S]*?<\/div>/;
if (existing.test(html)) {
  html = html.replace(existing, markup);
} else {
  const anchor = '<div class="panel"><h3>Privacy</h3>';
  if (!html.includes(anchor)) throw new Error('Settings privacy panel anchor not found; refusing to insert build information in the wrong page.');
  html = html.replace(anchor, markup + '\n ' + anchor);
}
if ((html.match(/id="buildInfo"/g) || []).length !== 1 || !html.includes(escapeHtml(label))) {
  throw new Error('Build information stamp was not inserted exactly once.');
}
fs.writeFileSync(htmlPath, html);
console.log('Stamped Free Bill build identity: ' + label);
