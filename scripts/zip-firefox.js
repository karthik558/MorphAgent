const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Ensure manifest.json is identical to manifest.firefox.json
if (fs.existsSync('manifest.firefox.json')) {
  fs.copyFileSync('manifest.firefox.json', 'manifest.json');
}

console.log('Zipping Firefox extension...');

try {
  // We use the zip command available on macOS/Linux
  // -r: recursive
  // -FS: sync the zip with the directory
  // -x: exclude files matching patterns
  const cmd = `zip -r morph-agent-firefox.zip . -x "*.git*" "*node_modules*" "*.zip" "manifest.chrome.json" "manifest.firefox.json" "scripts/*" "package.json" "package-lock.json" "*.DS_Store" "tint_icon.py" "compress.py" "src/*"`;
  execSync(cmd, { stdio: 'inherit' });
  console.log('✓ Successfully created morph-agent-firefox.zip');
} catch (e) {
  console.error('Failed to zip:', e.message);
  process.exit(1);
}
