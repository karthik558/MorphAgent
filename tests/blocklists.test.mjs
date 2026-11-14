import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('bundled static lists add thousands of network blocks without navigation rules', () => {
  const counts = JSON.parse(fs.readFileSync('rules/counts.json', 'utf8'));
  assert.ok(counts.total >= 20000);
  assert.equal(counts.ads + counts.trackers + counts.miners, counts.total);
  const manifest = JSON.parse(fs.readFileSync('manifest.chrome.json', 'utf8'));
  const ids = manifest.declarative_net_request.rule_resources.map(item => item.id);
  assert.deepEqual(ids, ['morph-ads', 'morph-trackers', 'morph-miners']);
  for (const name of ['ads', 'trackers', 'miners']) {
    const rules = JSON.parse(fs.readFileSync(`rules/${name}.json`, 'utf8'));
    assert.equal(rules.length, counts[name]);
    assert.equal(new Set(rules.map(rule => rule.id)).size, rules.length);
    assert.equal(rules[0].action.type, 'block');
    assert.ok(rules.every(rule => rule.condition.urlFilter.startsWith('||') && !rule.condition.resourceTypes.includes('main_frame')));
  }
});
