const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
module.exports = function packageExtension(target) {
  const root = path.resolve(__dirname, '..');
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'morph-agent-'));
  const output = path.join(root, `morph-agent-${target}.zip`);
  try {
    for (const entry of ['js', 'css', 'icons', 'popup.html', 'advanced-settings.html', 'LICENSE']) {
      fs.cpSync(path.join(root, entry), path.join(staging, entry), { recursive: true });
    }
    fs.copyFileSync(path.join(root, `manifest.${target}.json`), path.join(staging, 'manifest.json'));
    // Create a fresh archive so deleted assets cannot survive from earlier builds.
    const archive = path.join(staging, 'extension.zip');
    execFileSync('zip', ['-qr', archive, '.', '-x', '*.DS_Store', 'extension.zip'], { cwd: staging });
    fs.copyFileSync(archive, output);
    console.log(`Created ${output}`);
  } finally { fs.rmSync(staging, { recursive: true, force: true }); }
};
