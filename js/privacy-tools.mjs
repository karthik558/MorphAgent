import {buildUARules, buildScriptRules, siteDomain} from './network-rules.mjs';
import {snapshot, validateConfiguration, diffConfiguration, applyConfiguration, restoreConfiguration, activeExceptions, exceptionDomains} from './configuration.mjs';
const api = globalThis.browser || chrome;
const $ = id => document.getElementById(id);
const output = $('tools-result');
function report(value) {output.textContent = typeof value === 'string' ? value : JSON.stringify(value,null,2);}
function action(id, fn) {$(id).addEventListener('click', async () => {$(id).disabled=true; try {await fn();} catch(e) {report(e.message);} finally {$(id).disabled=false;}});}
function domain() {const d = siteDomain($('tools-url').value); if (!d) throw Error('Enter a valid website URL or domain.'); return d;}
function matches(host, d) {return host === d || host.endsWith('.'+d);}
function matchesRule(host, r) {const c=r.condition; return (!c.requestDomains || c.requestDomains.some(d=>matches(host,d))) && !(c.excludedRequestDomains || []).some(d=>matches(host,d));}
let pending;
export async function previewImport(input) {
  const data = validateConfiguration(input);
  pending = data;
  report({message:'Review changes, then choose Apply preview. A rollback backup is saved automatically. Existing tabs need reloading.', changes:diffConfiguration(await snapshot(api), data)});
  $('tools-apply').disabled = false;
  document.querySelector('[data-target="section-tools"]').click();
}
window.morphPreviewImport = previewImport;
action('tools-test', async () => {
  const host = domain(), state = await snapshot(api), local = state.globalSettings;
  const {temporaryExceptions=[]} = await api.storage.local.get('temporaryExceptions');
  const base = {...state,ua:local.selectedUA,exclusions:exceptionDomains(temporaryExceptions,'fingerprint')};
  const headers = buildUARules({...base, enabled:local.uaSpoofEnabled !== false}).filter(r=>matchesRule(host,r)).sort((a,b)=>b.priority-a.priority);
  const scripts = buildScriptRules({...base,enabled:!!local.jsBlockEnabled,exclusions:exceptionDomains(temporaryExceptions,'scripts')}).filter(r=>matchesRule(host,r));
  const matching = (state.websiteRules || []).filter(r=>matches(host,siteDomain(r.website) || '!'));
  const filtersPaused = [...(local.adBlockWhitelist || []),...exceptionDomains(temporaryExceptions,'filters')].some(d=>matches(host,d));
  report({domain:host,userAgent:headers[0]?.action.requestHeaders[0].value || 'Native browser user agent',scriptsBlocked:scripts.length>0,matchingSiteRules:matching,conflict:matching.length>1 ? 'Multiple rules match. First matching rule owns page settings; network exclusions may override it.' : null, filters:{paused:filtersPaused,network:local.adBlockEnabled!==false && local.adBlockNetworkEnabled!==false && !filtersPaused,trackers:local.trackersBlockEnabled!==false,groups:local.filtersState || 'Bundled defaults'},note:'Preview uses the network rule builders. Filter matches also depend on requested resource domains; reload tabs after changes.'});
});
action('tools-health', async () => {
  const check = async fn => {try {return await fn();} catch(e) {return {unavailable:e.message};}};
  report({requestedWebsiteAccess:$('tools-url').value ? await check(()=>api.permissions.contains({origins:[`https://${domain()}/*`]})) : 'Enter a domain to check access',websiteAccess:await check(()=>api.permissions.getAll()),networkRuleCount:await check(async()=>(await api.declarativeNetRequest.getDynamicRules()).length),proxy:await check(()=>api.proxy.settings.get({incognito:false})),webRTC:await check(()=>api.privacy.network.webRTCIPHandlingPolicy.get({})),ghostAlarm:await check(()=>api.alarms.get('ghostModeRotate')),exceptions:await check(async()=>activeExceptions((await api.storage.local.get('temporaryExceptions')).temporaryExceptions)),reload:'Reload existing tabs after profile, script, location, exception, or preset changes.',limitations:'JavaScript injection is asynchronous. Worker fingerprints, IP geolocation and browser engine differences cannot be hidden reliably by a page extension. DNS selection is a reference only.'});
});
async function refreshExceptions() {
  const {temporaryExceptions=[]} = await api.storage.local.get('temporaryExceptions');
  $('tools-exceptions').textContent = activeExceptions(temporaryExceptions).map(e=>`${e.domain}: ${e.scope} — ${e.expiresAt === null ? 'until browser restart' : new Date(e.expiresAt).toLocaleString()}`).join('\n') || 'No temporary exceptions.';
}
async function pause(scope, minutes) {
  const host = domain(), {temporaryExceptions=[]} = await api.storage.local.get('temporaryExceptions');
  const entry={domain:host,scope,expiresAt:minutes ? Date.now()+minutes*60000 : null};
  await api.storage.local.set({temporaryExceptions:[...activeExceptions(temporaryExceptions).filter(e=>e.domain!==host || e.scope!==scope),entry]});
  const result=await api.runtime.sendMessage({type:'reload-dnr-rules'}); if (!result.success) throw Error(result.error);
  await refreshExceptions();
  report(`Paused ${scope} for ${host}. Reload the website to test. Browser-wide proxy and WebRTC policy remain active.`);
}
action('tools-pause', ()=>pause($('tools-scope').value,Number($('tools-duration').value)));
action('tools-resume', async()=>{
  const host=domain(),{temporaryExceptions=[]}=await api.storage.local.get('temporaryExceptions');
  await api.storage.local.set({temporaryExceptions:temporaryExceptions.filter(e=>e.domain!==host)});
  await api.runtime.sendMessage({type:'reload-dnr-rules'}); await refreshExceptions(); report('Exceptions removed. Reload the website.');
});
async function refreshPresets() {
  const {configurationPresets=[]}=await api.storage.local.get('configurationPresets');
  $('tools-presets').replaceChildren(...configurationPresets.map((p,i)=>new Option(p.name,String(i))));
}
action('tools-save', async()=>{
  const name=$('tools-name').value.trim(); if (!name || name.length>80) throw Error('Enter a preset name (1–80 characters).');
  const {configurationPresets=[]}=await api.storage.local.get('configurationPresets');
  if (configurationPresets.some(p=>p.name===name)) throw Error('That name exists; choose another or delete the old preset.');
  if (configurationPresets.length>=30) throw Error('Maximum 30 presets.');
  await api.storage.local.set({configurationPresets:[...configurationPresets,{name,data:await snapshot(api)}]});
  await refreshPresets(); report('Preset saved locally.');
});
async function selectedPreset() {
  const {configurationPresets=[]}=await api.storage.local.get('configurationPresets');
  const p=configurationPresets[$('tools-presets').value]; if (!p) throw Error('Select a saved preset.'); return p;
}
action('tools-preview', async()=>previewImport((await selectedPreset()).data));
action('tools-export', async()=>{
  const p=await selectedPreset(), url=URL.createObjectURL(new Blob([JSON.stringify(p.data,null,2)],{type:'application/json'}));
  const a=document.createElement('a'); a.href=url;a.download='morphagent-preset.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
action('tools-delete', async()=>{
  const p=await selectedPreset(), {configurationPresets=[]}=await api.storage.local.get('configurationPresets');
  await api.storage.local.set({configurationPresets:configurationPresets.filter(v=>v.name!==p.name)});await refreshPresets();report('Preset deleted.');
});
action('tools-apply', async()=>{
  if (!pending) throw Error('Preview a preset or import first.');
  await applyConfiguration(api,pending); pending=null;
  const result=await api.runtime.sendMessage({type:'reload-dnr-rules'});
  report(result.success ? 'Applied. Backup saved. Reload website tabs and this settings page before further editing.' : `Saved, but network synchronization failed: ${result.error}. Use Undo last apply.`);
});
action('tools-undo', async()=>{
  const {configurationRollback}=await api.storage.local.get('configurationRollback');
  if (!configurationRollback) throw Error('No rollback backup.');
  await restoreConfiguration(api,configurationRollback);await api.runtime.sendMessage({type:'reload-dnr-rules'});
  report('Restored previous configuration. Reload website tabs and this settings page.');
});
// A user-selected existing tab is inspected; never navigate arbitrary URLs or request GPS silently.
action('tools-tabs-refresh', async()=>{
  const tabs=await api.tabs.query({});
  $('tools-tabs').replaceChildren(...tabs.filter(t=>/^https?:/.test(t.url || '')).map(t=>new Option(`${t.title || t.url} — ${new URL(t.url).hostname}`,String(t.id))));
});
action('tools-inspect', async()=>{
  const tabId=Number($('tools-tabs').value); if (!tabId) throw Error('Refresh tabs and select a website.');
  const results=await api.scripting.executeScript({target:{tabId},world:'MAIN',func:()=>({ua:navigator.userAgent,platform:navigator.platform,touch:navigator.maxTouchPoints,hints:navigator.userAgentData?.toJSON(),screen:{width:screen.width,height:screen.height},timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,language:navigator.language,cores:navigator.hardwareConcurrency,secureContext:isSecureContext,gpc:navigator.globalPrivacyControl})});
  const actual=results[0].result, warnings=[];
  if (/iPhone|iPad|Android/.test(actual.ua) && !actual.touch) warnings.push('Mobile identity reports no touch points.');
  if (!/Chrome\/|Chromium\//.test(actual.ua) && actual.hints) warnings.push('Non-Chromium identity exposes Chromium client hints.');
  if (actual.hints && actual.hints.mobile !== /Mobile/.test(actual.ua)) warnings.push('Client hint mobile flag disagrees with the user agent.');
  if (actual.hints && /Windows/.test(actual.ua) && actual.hints.platform !== 'Windows') warnings.push('Client hint platform disagrees with the user agent.');
  const state = await snapshot(api);
  const tab = await api.tabs.get(tabId);
  const site = (state.websiteRules || []).find(r=>matches(new URL(tab.url).hostname,siteDomain(r.website) || '!'));
  const expectedTimezone = state.globalSettings.geoTimezone;
  if ((site ? site.geoSpoofEnabled : state.globalSettings.geoSpoofEnabled) && state.globalSettings.autoHarmonizeTzEnabled !== false && expectedTimezone && expectedTimezone !== 'auto' && expectedTimezone !== actual.timezone) warnings.push(`Timezone differs from configured ${expectedTimezone}; check exceptions or reload the tab.`);
  if (/iPhone/.test(actual.ua) && actual.platform!=='iPhone') warnings.push('iPhone user agent disagrees with navigator.platform.');
  if (/Windows/.test(actual.ua) && actual.platform!=='Win32') warnings.push('Windows user agent disagrees with navigator.platform.');
  if (/Mobile/.test(actual.ua) && actual.screen.width>1024) warnings.push('Mobile identity has a desktop-sized screen.');
  if (!actual.secureContext) warnings.push('Geolocation requires a secure context.');
  report({actual,warnings,note:'This checks observable page values, not anonymity. Compare timezone and location with your selected site rule; network/IP location is independent.'});
});
let troubleshooting;
action('tools-troubleshoot', async()=>{
  const host=domain(), {temporaryExceptions=[]}=await api.storage.local.get('temporaryExceptions');
  if (activeExceptions(temporaryExceptions).some(e=>matches(host,e.domain))) throw Error('Resume site and remove parent-domain exceptions before troubleshooting.');
  troubleshooting={domain:host,step:0};
  await pause('scripts',10); report('Step 1/3: JavaScript blocking paused for 10 minutes. Reload and test the site, then choose Fixed or Still broken.');
});
async function removeTrial() {
  if (!troubleshooting) throw Error('Start troubleshooting first.');
  if (domain()!==troubleshooting.domain) throw Error('Keep the original domain while troubleshooting.');
  const scopes=['scripts','filters','fingerprint'], {temporaryExceptions=[]}=await api.storage.local.get('temporaryExceptions');
  await api.storage.local.set({temporaryExceptions:temporaryExceptions.filter(e=>!(e.domain===troubleshooting.domain && e.scope===scopes[troubleshooting.step]))});
}
action('tools-next', async()=>{
  await removeTrial(); troubleshooting.step++;
  if (troubleshooting.step>=3) {troubleshooting=null;await api.runtime.sendMessage({type:'reload-dnr-rules'});await refreshExceptions();report('No single protection isolated the issue. Check proxy settings and the health panel. Trial exceptions removed; reload.');return;}
  await pause(['scripts','filters','fingerprint'][troubleshooting.step],10);
  report(`Step ${troubleshooting.step+1}/3: Reload and test with only ${['scripts','filters','fingerprint'][troubleshooting.step]} paused. Choose Fixed or Still broken.`);
});
action('tools-fixed', async()=>{
  if (!troubleshooting || domain()!==troubleshooting.domain) throw Error('Start troubleshooting for this domain first.');
  await pause(['scripts','filters','fingerprint'][troubleshooting.step],60);
  troubleshooting=null;report('Saved the identified exception for one hour. Other protections remain enabled. Use Resume site to remove it early.');
});
refreshPresets().catch(e=>report(e.message));refreshExceptions().catch(e=>report(e.message));
