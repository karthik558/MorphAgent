import test from 'node:test';
import assert from 'node:assert/strict';
import {validateConfiguration, diffConfiguration, activeExceptions, exceptionDomains, applyConfiguration, restoreConfiguration} from '../js/configuration.mjs';
import {buildUARules,buildScriptRules,uaHeaders} from '../js/network-rules.mjs';
test('imports reject invalid switches, coordinates, rule IDs and proxy settings',()=>{
  for (const globalSettings of [{uaSpoofEnabled:'false'},{geoCoords:{lat:91,lng:0}},{selectedUA:'x\r\nHeader: x'},{maxTouchPoints:-1},{proxyConfig:{enabled:true,mode:'manual',host:'localhost',port:0,protocol:'http'}},{geoTimezone:'Bogus/Zone'},{unknown:true}]) assert.throws(()=>validateConfiguration({globalSettings}));
  assert.throws(()=>validateConfiguration({websiteRules:[{id:'<bad>',website:'example.com'}]}));
  assert.throws(()=>validateConfiguration({customLocations:[{id:1,name:'invalid',lat:Infinity,lng:0}]}));
  assert.deepEqual(validateConfiguration({globalSettings:{geoCoords:{lat:0,lng:0},maxTouchPoints:0}}).globalSettings.geoCoords,{lat:0,lng:0});
});
test('preview lists actual changed keys without changing input',()=>{
  const before={globalSettings:{selectedUA:'old',touchSpoofEnabled:false}};
  assert.deepEqual(diffConfiguration(before,{globalSettings:{selectedUA:'new',touchSpoofEnabled:false}}).map(c=>c.key),['selectedUA']);
  assert.equal(before.globalSettings.selectedUA,'old');
});
test('exceptions expire, retain session entries, and separate scopes',()=>{
  const entries=[{domain:'example.com',scope:'all',expiresAt:null},{domain:'old.test',scope:'all',expiresAt:1},{domain:'scripts.test',scope:'scripts',expiresAt:Date.now()+60000}];
  assert.equal(activeExceptions(entries).length,2);
  assert.deepEqual(exceptionDomains(entries,'fingerprint'),['example.com']);
  assert.deepEqual(exceptionDomains(entries,'scripts'),['example.com','scripts.test']);
  assert.ok(buildUARules({enabled:true,ua:'Chrome/145',exclusions:['example.com']})[0].condition.excludedRequestDomains.includes('example.com'));
  assert.ok(buildScriptRules({enabled:true,exclusions:['example.com']})[0].condition.excludedRequestDomains.includes('example.com'));
});
test('first matching site rule controls network identity, including disabled rules',()=>{
  const rules=buildUARules({enabled:true,ua:'Global',websiteRules:[{website:'specific.example.com',userAgent:'First'},{website:'example.com',uaSpoofEnabled:false}]});
  assert.ok(!rules[1].condition.excludedRequestDomains.includes('example.com'));
  const reverse=buildUARules({enabled:true,ua:'Global',websiteRules:[{website:'example.com',uaSpoofEnabled:false},{website:'specific.example.com',userAgent:'Second'}]});
  assert.ok(reverse[1].condition.excludedRequestDomains.includes('example.com'));
});
test('high entropy request headers cannot leak native hardware while spoofing',()=>{
  const headers=uaHeaders('Chrome/145.0.0.0');
  for (const name of ['Sec-CH-UA-Arch','Sec-CH-UA-Model','Sec-CH-UA-Platform-Version']) assert.equal(headers.find(h=>h.header===name).operation,'remove');
});
test('apply saves a rollback and restore removes previously absent settings',async()=>{
  const state={local:{selectedUA:'old',threatLogs:['keep']},sync:{listMode:'blacklist'}};
  const area=name=>({get:async keys=>Object.fromEntries(keys.filter(k=>k in state[name]).map(k=>[k,structuredClone(state[name][k])])),set:async data=>Object.assign(state[name],structuredClone(data)),remove:async keys=>keys.forEach(k=>delete state[name][k])});
  const api={storage:{local:area('local'),sync:area('sync')}};
  await applyConfiguration(api,{globalSettings:{selectedUA:'new',touchSpoofEnabled:true}});
  assert.equal(state.local.selectedUA,'new');
  await restoreConfiguration(api,state.local.configurationRollback);
  assert.equal(state.local.selectedUA,'old');assert.ok(!('touchSpoofEnabled' in state.local));assert.deepEqual(state.local.threatLogs,['keep']);
});

test('import accepts the bundled filter category format and rejects malformed toggles',()=>{
  const filtersState=[{id:'privacy',subfilters:[{id:'trackers',enabled:false}]}];
  assert.deepEqual(validateConfiguration({globalSettings:{filtersState}}).globalSettings.filtersState,filtersState);
  assert.throws(()=>validateConfiguration({globalSettings:{filtersState:[{subfilters:[{id:'trackers',enabled:'false'}]}]}}));
});

test('parent site rules intersect an allowed subdomain and inherit missing user agents',()=>{
  const base={enabled:true,ua:'Global',listMode:'whitelist',whiteList:[{website:'app.example.com'}],websiteRules:[{website:'example.com',jsBlocked:true}]};
  const ua=buildUARules(base);
  assert.deepEqual(ua[1].condition.requestDomains,['app.example.com']);
  assert.equal(ua[1].action.requestHeaders[0].value,'Global');
  assert.deepEqual(buildScriptRules(base)[1].condition.requestDomains,['app.example.com']);
});
