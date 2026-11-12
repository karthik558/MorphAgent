import test from 'node:test';
import assert from 'node:assert/strict';
import {buildScriptRules} from '../js/network-rules.mjs';
test('script blocking uses response CSP for documents including inline scripts',()=>{
  const [rule]=buildScriptRules({enabled:true});
  assert.deepEqual(rule.condition.resourceTypes,['main_frame','sub_frame']);
  assert.equal(rule.action.responseHeaders[0].operation,'append');
  assert.match(rule.action.responseHeaders[0].value,/script-src 'none'/);
});
test('disabled blocking, empty whitelist and per-site exceptions are honored',()=>{
  assert.deepEqual(buildScriptRules({enabled:false}),[]);
  assert.deepEqual(buildScriptRules({enabled:true,listMode:'whitelist',whiteList:[]}),[]);
  const rules=buildScriptRules({enabled:true,blockList:[{website:'bank.example'}],listMode:'blacklist',websiteRules:[{website:'work.example',jsBlocked:false}]});
  assert.ok(rules[0].condition.excludedRequestDomains.includes('work.example'));
  assert.ok(rules[0].condition.excludedRequestDomains.includes('bank.example'));
});
test('site-only script blocking is independent of user-agent spoofing',()=>{
  const rules=buildScriptRules({enabled:false,websiteRules:[{website:'https://ads.example/path',jsBlocked:true,uaSpoofEnabled:false}]});
  assert.deepEqual(rules[0].condition.requestDomains,['ads.example']);
});
