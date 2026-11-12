import test from 'node:test';
import assert from 'node:assert/strict';
import engine from '../js/adblock-rules.js';
const { DEFAULT_FILTER_CATEGORIES: defaults, generateDNRAdBlockRules: rules, cosmeticSelectors, filterEnabled } = engine;
const state = (id, enabled) => defaults.map(cat => ({ ...cat, subfilters: cat.subfilters.map(sub => ({ ...sub, enabled: sub.id === id ? enabled : sub.enabled })) }));
const blocked = (options, domain) => rules(1000, options).some(rule => rule.action.type === 'block' && rule.condition.urlFilter === `||${domain}^`);

test('each advertised bundled filter controls actual rules or selectors', () => {
  for (const category of defaults) for (const sub of category.subfilters) {
    const enabled = { filtersState: state(sub.id, true) };
    const disabled = { filtersState: state(sub.id, false) };
    const enabledCount = rules(1000, enabled).length + cosmeticSelectors(enabled).length;
    const disabledCount = rules(1000, disabled).length + cosmeticSelectors(disabled).length;
    assert.equal(enabledCount - disabledCount, sub.rulesCount, sub.id);
  }
});
test('ads and trackers have independent switches under the shield master', () => {
  assert.ok(blocked({trackersBlockEnabled: false}, 'doubleclick.net'));
  assert.ok(!blocked({trackersBlockEnabled: false}, 'google-analytics.com'));
  assert.ok(!blocked({filtersState: state('ads', false)}, 'doubleclick.net'));
  assert.ok(blocked({filtersState: state('ads', false)}, 'google-analytics.com'));
  assert.ok(rules(1000, {adBlockEnabled: false}).every(rule => rule.action.type !== 'block'));
  assert.ok(rules(1000, {adBlockEnabled: false}).some(rule => rule.id === 52));
});
test('cosmetic filters obey master, category and optional widget settings', () => {
  assert.deepEqual(cosmeticSelectors({adBlockEnabled: false}), []);
  assert.deepEqual(cosmeticSelectors({adBlockCosmeticEnabled: false}), []);
  assert.ok(!cosmeticSelectors().includes('.cookie-banner'));
  assert.ok(cosmeticSelectors({filtersState: state('annoyances', true)}).includes('.cookie-banner'));
  assert.ok(cosmeticSelectors({}, 'www.google.com').includes('#tads'));
  assert.ok(!cosmeticSelectors({}, 'www.google.com.evil.test').includes('#tads'));
  assert.ok(!cosmeticSelectors({filtersState: state('ads', false)}, 'www.google.com').includes('#tads'));
});
test('network rules have unique IDs and preserve shared video and social APIs', () => {
  const all = rules();
  assert.equal(new Set(all.map(rule => rule.id)).size, all.length);
  for (const domain of ['redirector.googlevideo.com', 'graph.facebook.com', 'i.instagram.com', 'ssl.p.jwpcdn.com']) assert.ok(!blocked({}, domain));
  assert.ok(!all.some(rule => rule.condition.urlFilter === '*/banners/*'));
});
test('legacy reference catalogs and malformed saved state use bundled defaults', () => {
  assert.equal(filterEnabled([{id:'adblocking',subfilters:[{id:'adguard_base',enabled:false}]}], 'ads'), true);
  assert.equal(filterEnabled([null, {subfilters:null}], 'social'), false);
});

test('network switch leaves cosmetic filtering and privacy headers available', () => {
  const options = {adBlockNetworkEnabled: false};
  assert.ok(rules(1000, options).every(rule => rule.action.type !== 'block'));
  assert.ok(rules(1000, options).some(rule => rule.id === 52));
  assert.ok(cosmeticSelectors(options).includes('.ad-banner'));
});
