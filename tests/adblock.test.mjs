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

const scriptBlocked = (url, options = {}) => rules(1000, options).some(rule => rule.action.type === 'block' && rule.condition.resourceTypes.includes('script') && rule.condition.regexFilter && new RegExp(rule.condition.regexFilter, 'i').test(url));
test('reported ad hosts and mining domain are included, without blocking cloud parents', () => {
  for (const host of ['ads.reddit.com','ads-dev.pinterest.com','advertising.twitter.com','ads.facebook.com','affiliationjs.s3.amazonaws.com','ads.google.com','crypto-loot.org']) assert.ok(blocked({},host),host);
  assert.ok(!blocked({},'s3.amazonaws.com'));
  assert.ok(!blocked({filtersState:state('miners',false)},'crypto-loot.org'));
});
test('ad scripts compile to bounded MV3 script rules controlled by the ads switches', () => {
  for (const url of ['https://example.com/ads.js','https://example.com/js/widget/ads.js?v=1','https://example.com/js/pagead.js','https://example.com/ads/index.js','https://example.com/ad/add.js?x=1']) {
    assert.ok(scriptBlocked(url),url);
    for (const options of [{adBlockEnabled:false},{adBlockNetworkEnabled:false},{filtersState:state('ads',false)}]) assert.ok(!scriptBlocked(url,options));
  }
  for (const url of ['https://example.com/index.js','https://example.com/add.js','https://example.com/downloads.js','https://example.com/ads.json','https://example.com/app.js?file=/ads.js','https://example.com/ads.js/helper.js']) assert.ok(!scriptBlocked(url),url);
});
test('shared media and social hosts require the explicit compatibility-breaking filter', () => {
  for (const host of ['redirector.googlevideo.com','graph.facebook.com','graph.instagram.com','i.instagram.com','ssl.p.jwpcdn.com']) {
    assert.ok(!blocked({},host));
    assert.ok(blocked({filtersState:state('shared-services',true)},host),host);
    assert.ok(!blocked({adBlockEnabled:false,filtersState:state('shared-services',true)},host));
  }
});

test('filter catalog exposes each switch exactly once with a boolean default', () => {
  const switches = defaults.flatMap(category => category.subfilters);
  assert.equal(new Set(switches.map(sub => sub.id)).size, switches.length);
  assert.ok(switches.every(sub => typeof sub.enabled === 'boolean' && !sub.subfilters));
});
