import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { buildUARules, uaHeaders, siteDomain } from '../js/network-rules.mjs';
const base = { enabled: true, ua: 'Chrome/130.0', listMode: 'blacklist' };
test('both browser manifests use MV3 and browser-specific module backgrounds', () => {
  for (const target of ['chrome', 'firefox']) {
    const m = JSON.parse(fs.readFileSync(`manifest.${target}.json`));
    assert.equal(m.manifest_version, 3);
    assert.equal(m.background.type, 'module');
    assert.ok(m.action);
    assert.ok(!m.permissions.includes('webRequestBlocking'));
    assert.ok(m.permissions.includes('privacy'));
    assert.ok(m.content_scripts.every(s => s.js.every(file => fs.existsSync(file))));
    assert.ok(target === 'chrome' ? m.background.service_worker : m.background.scripts);
  }
});
test('disabled spoofing and empty allowlist produce no header rules', () => {
  assert.deepEqual(buildUARules({ ...base, enabled: false }), []);
  assert.deepEqual(buildUARules({ ...base, listMode: 'whitelist' }), []);
});
test('per-site user agents override global headers; exclusions remain respected', () => {
  const rules = buildUARules({ ...base, blockList: [{ website: 'private.example' }], websiteRules: [
    { website: 'work.example', userAgent: 'Firefox/130.0' },
    { website: 'native.example', uaSpoofEnabled: false }
  ] });
  assert.ok(rules[1].priority > rules[0].priority);
  assert.deepEqual(rules[1].condition.requestDomains, ['work.example']);
  assert.ok(rules.every(r => r.condition.excludedRequestDomains.includes('native.example')));
  assert.ok(rules.every(r => r.condition.excludedRequestDomains.includes('private.example')));
});
test('Safari and Firefox do not send fabricated Chromium client hints', () => {
  assert.ok(uaHeaders('Firefox/130.0').slice(1).every(h => h.operation === 'remove'));
  assert.ok(uaHeaders('Chrome/130.0').slice(1).every(h => h.operation === 'set'));
});
test('domain parsing keeps hostname boundaries and rejects malformed patterns', () => {
  assert.equal(siteDomain('https://Example.com/path'), 'example.com');
  assert.equal(siteDomain('*.example.com'), 'example.com');
  assert.equal(siteDomain('example.com|evil'), null);
});
test('UI Firefox adapter supports both Promise and callback callers', async () => {
  const context = vm.createContext({ browser: { storage: { local: { get: async () => ({ saved: true }) } } }, console });
  vm.runInContext(fs.readFileSync('js/browser-api.js', 'utf8'), context);
  assert.equal((await context.morphApi.storage.local.get('saved')).saved, true);
  const value = await new Promise(resolve => context.morphApi.storage.local.get('saved', resolve));
  assert.equal(value.saved, true);
});
test('extension pages contain no CSP-blocked inline scripts or event handlers', () => {
  for (const page of ['popup.html', 'advanced-settings.html', 'js/advanced-settings.js']) {
    const source = fs.readFileSync(page, 'utf8');
    assert.ok(!/\son\w+\s*=/i.test(source));
    assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(source));
  }
});
