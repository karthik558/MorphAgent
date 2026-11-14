import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBundle, refreshUserAgent, badgeFor, contradictions, workerPrelude, cosmeticRule, screenFor } from '../js/identity.mjs';
import { buildUARules, uaHeaders } from '../js/network-rules.mjs';

test('version refresh only raises older bundled browser tokens', () => {
  assert.equal(refreshUserAgent('Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36'), 'Mozilla/5.0 Chrome/158.0.8127.35 Safari/537.36');
  assert.equal(refreshUserAgent('Mozilla/5.0 Chrome/158.0.8127.35 Safari/537.36'), 'Mozilla/5.0 Chrome/158.0.8127.35 Safari/537.36');
  assert.match(refreshUserAgent('Version/17.0 Mobile Safari/604.1'), /Version\/27\.2/);
});

test('a matched phone profile is one coherent bundle', () => {
  const bundle = buildBundle('Mozilla/5.0 (iPhone; CPU iPhone OS 27_2_1 like Mac OS X) AppleWebKit/605.1.15 Version/27.2 Mobile/15E148 Safari/604.1', 'mobile');
  assert.equal(bundle.touchPoints, 5);
  assert.equal(bundle.screen.width, 393);
  assert.equal(bundle.webgl.vendor, 'Apple Inc.');
  assert.equal(bundle.webgpu.vendor, 'apple');
  assert.equal(bundle.peripherals, 'none');
  assert.equal(bundle.cores, 6);
  assert.equal(badgeFor(bundle.ua, 'mobile'), 'iOS');
  assert.equal(screenFor(bundle.ua, 'desktop').width, 393);
});

test('desktop profiles keep native peripherals and no touch', () => {
  const bundle = buildBundle('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/158.0.8127.35 Safari/537.36', 'desktop');
  assert.equal(bundle.touchPoints, 0);
  assert.equal(bundle.peripherals, 'native');
  assert.equal(bundle.screen.width, 1920);
  assert.ok(contradictions(bundle.ua, { matched: false, touchEnabled: true, touchPoints: 5 }).some(note => note.includes('touch')));
});

test('worker prelude carries the matched user agent and does not execute page script', () => {
  const source = workerPrelude(buildBundle('Mozilla/5.0 Chrome/158.0.0.0', 'desktop'));
  assert.match(source, /Chrome\/158/);
  assert.doesNotMatch(source, /importScripts/);
});

test('accept-language is added only when a matched profile asks for it', () => {
  const plain = buildUARules({ enabled: true, ua: 'Chrome/130.0', listMode: 'blacklist' });
  assert.equal(plain[0].action.requestHeaders.length, uaHeaders('Chrome/130.0').length);
  const matched = buildUARules({ enabled: true, ua: 'Chrome/130.0', listMode: 'blacklist', acceptLanguage: 'en-US,en;q=0.9' });
  assert.equal(matched[0].action.requestHeaders.at(-1).header, 'Accept-Language');
  assert.equal(matched[0].action.requestHeaders.at(-1).value, 'en-US,en;q=0.9');
});

test('cosmetic rules stay limited to a hostname and a safe selector', () => {
  assert.equal(cosmeticRule('https://Shop.Example/path', '#ad-slot').domain, 'shop.example');
  assert.equal(cosmeticRule('example.com', 'div{background:url(javascript:alert(1))}'), null);
  assert.equal(cosmeticRule('bad host', '#ad'), null);
});
