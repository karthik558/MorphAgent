import {siteDomain} from './network-rules.mjs';
export const localKeys = ('selectedUA uaSpoofEnabled maxTouchPoints touchSpoofEnabled jsBlockEnabled jsProtectEnabled geoSpoofEnabled geoPresetValue geoCoords geoTimezone geoLocale activeCategory uiState theme ghostModeEnabled ghostInterval proxyConfig hardwareHarmonizeEnabled customHardwareCores customDeviceMemory autoHarmonizeTzEnabled adBlockEnabled dnsProvider dnsCustomEndpoint adBlockCosmeticEnabled adBlockAntiAdblockEnabled filtersState adBlockNetworkEnabled adBlockWhitelist trackersBlockEnabled removeTrackingParamsEnabled hideSearchQueriesEnabled sendDntGpcEnabled webrtcPreventLeakEnabled removeXClientDataEnabled identityBundle forkedProfiles customCosmeticRules setups siteIdentities shieldMode seenRelease').split(' ');
export const syncKeys = ['websiteRules','blockList','whiteList','listMode','customLocations','siteGroups'];
const object = v => v && typeof v === 'object' && !Array.isArray(v);
function coordinates(v) {
  return object(v) && Number.isFinite(v.lat) && Math.abs(v.lat) <= 90 && Number.isFinite(v.lng) && Math.abs(v.lng) <= 180;
}
export function validateConfiguration(input) {
  if (!object(input)) throw Error('Settings must be an object.');
  const data = {globalSettings:{}};
  for (const key of Object.keys(input)) if (![...syncKeys,'globalSettings','version','exportedAt'].includes(key)) throw Error(`Unknown settings field: ${key}`);
  for (const key of syncKeys) if (key in input) data[key] = structuredClone(input[key]);
  if (data.listMode && !['blacklist','whitelist'].includes(data.listMode)) throw Error('Invalid access control mode.');
  if (data.siteGroups) {
    if (!Array.isArray(data.siteGroups) || data.siteGroups.length > 30) throw Error('Invalid site groups.');
    for (const group of data.siteGroups) {
      if (!object(group) || typeof group.name !== 'string' || group.name.length > 40 || !Array.isArray(group.websites) || !group.websites.length || group.websites.length > 40) throw Error('Invalid site group.');
      if (group.websites.some(site => !siteDomain(site) || site === '*')) throw Error('Site groups need real domains.');
      if (group.userAgent && (typeof group.userAgent !== 'string' || group.userAgent.length > 2048)) throw Error('Invalid site group user agent.');
    }
  }
  for (const key of ['websiteRules','blockList','whiteList','customLocations']) {
    if (!(key in data)) continue;
    if (!Array.isArray(data[key]) || data[key].length > 500) throw Error(`Invalid ${key} list (maximum 500).`);
    for (const item of data[key]) {
      if (!object(item)) throw Error(`Invalid ${key} entry.`);
      if (!Number.isSafeInteger(item.id)) throw Error(`Invalid ${key} entry ID.`);
      if (key === 'customLocations' && (!coordinates(item) || typeof item.name !== 'string')) throw Error('Invalid custom location.');
      if (key !== 'customLocations' && !siteDomain(item.website)) throw Error('Rules require a valid domain or URL.');
      if (item.geoCoords != null && !coordinates(item.geoCoords)) throw Error('Invalid rule coordinates.');
      for (const [name,value] of Object.entries(item)) {
        if ((name.endsWith('Enabled') || ['jsBlocked','jsProtected'].includes(name)) && typeof value !== 'boolean') throw Error(`Invalid rule switch: ${name}`);
        if (name === 'userAgent' && (typeof value !== 'string' || /[\r\n]/.test(value))) throw Error('Invalid rule user agent.');
        if (name === 'touchPoints' && (!Number.isInteger(value) || value < 0 || value > 20)) throw Error('Invalid rule touch points.');
      }
    }
  }
  if ('globalSettings' in input && !object(input.globalSettings)) throw Error('Invalid global settings.');
  for (const [key,value] of Object.entries(input.globalSettings || {})) {
    // Older exports contain counters; these are not configuration.
    if (key === 'adBlockStats') continue;
    if (!localKeys.includes(key)) throw Error(`Unknown global setting: ${key}`);
    if (['geoPresetValue','geoTimezone','geoLocale','activeCategory','theme','dnsProvider','dnsCustomEndpoint'].includes(key) && typeof value !== 'string') throw Error(`Invalid ${key}.`);
    if (key.endsWith('Enabled') && typeof value !== 'boolean') throw Error(`${key} must be a boolean.`);
    if (key === 'geoCoords' && value !== null && !coordinates(value)) throw Error('Latitude must be −90…90 and longitude −180…180.');
    if (['maxTouchPoints','ghostInterval'].includes(key) && (!Number.isFinite(Number(value)) || Number(value) < (key === 'maxTouchPoints' ? 0 : 1) || Number(value) > (key === 'maxTouchPoints' ? 20 : 1440))) throw Error(`Invalid ${key}.`);
    if (['customHardwareCores','customDeviceMemory'].includes(key) && value !== 'auto' && value !== null && (!Number.isFinite(Number(value)) || Number(value) < 1 || Number(value) > 256)) throw Error(`Invalid ${key}.`);
    if (key === 'shieldMode' && !['balanced','strict'].includes(value)) throw Error('Invalid shield mode.');
    if (key === 'seenRelease' && (typeof value !== 'string' || value.length > 20)) throw Error('Invalid release marker.');
    if (key === 'setups' && (!Array.isArray(value) || value.length > 20 || value.some(item => !object(item) || typeof item.name !== 'string' || item.name.length > 40))) throw Error('Invalid setups.');
    if (key === 'siteIdentities' && (!object(value) || Object.keys(value).length > 200)) throw Error('Invalid saved identities.');
    if (key === 'selectedUA' && (typeof value !== 'string' || value.length > 2048 || /[\r\n]/.test(value))) throw Error('Invalid user agent.');
    if (key === 'geoTimezone' && value && value !== 'auto') { try {new Intl.DateTimeFormat('en', {timeZone:value});} catch {throw Error('Invalid timezone.');} }
    if (key === 'adBlockWhitelist' && (!Array.isArray(value) || value.some(v => !siteDomain(v)))) throw Error('Invalid filter exceptions.');
    if (key === 'filtersState' && value !== null && (!Array.isArray(value) || value.some(cat => !object(cat) || !Array.isArray(cat.subfilters) || cat.subfilters.some(sub => !object(sub) || typeof sub.id !== 'string' || typeof sub.enabled !== 'boolean')))) throw Error('Invalid filter settings.');
    if (key === 'identityBundle' && value !== null && !object(value)) throw Error('Invalid identity profile.');
    if (key === 'identityBundle' && object(value)) {
      if (value.acceptLanguage && (typeof value.acceptLanguage !== 'string' || !/^[A-Za-z0-9*;=., -]{2,80}$/.test(value.acceptLanguage))) throw Error('Invalid Accept-Language value.');
      if (value.ua && (typeof value.ua !== 'string' || value.ua.length > 2048)) throw Error('Invalid identity user agent.');
      if (value.screen && (!object(value.screen) || !Number.isFinite(Number(value.screen.width)) || !Number.isFinite(Number(value.screen.height)))) throw Error('Invalid identity screen.');
    }
    if (key === 'forkedProfiles' && (!Array.isArray(value) || value.length > 30 || value.some(item => !object(item) || typeof item.name !== 'string' || typeof item.ua !== 'string' || item.ua.length > 2048))) throw Error('Invalid forked profiles.');
    if (key === 'customCosmeticRules' && (!Array.isArray(value) || value.length > 100 || value.some(item => !object(item) || !siteDomain(item.domain) || typeof item.selector !== 'string' || item.selector.length > 200 || /[{}<>\\\n]|url\s*\(|expression\s*\(/i.test(item.selector)))) throw Error('Invalid element rules.');
    if (key === 'proxyConfig') {
      if (!object(value) || typeof value.enabled !== 'boolean' || !['direct','system','manual','fixed_servers','pac','pac_script'].includes(value.mode)) throw Error('Invalid proxy configuration.');
      if ('bypassList' in value && typeof value.bypassList !== 'string') throw Error('Invalid proxy bypass list.');
      if (value.enabled && ['manual','fixed_servers'].includes(value.mode) && (!['http','https','socks4','socks5'].includes(value.protocol) || typeof value.host !== 'string' || !value.host || /[\s/]/.test(value.host) || !Number.isInteger(Number(value.port)) || Number(value.port) < 1 || Number(value.port) > 65535)) throw Error('Invalid proxy address.');
      if (value.enabled && ['pac','pac_script'].includes(value.mode) && !/^https?:\/\//.test(value.pacUrl || '')) throw Error('Invalid PAC URL.');
    }
    data.globalSettings[key] = structuredClone(value);
  }
  return data;
}
export async function snapshot(api) {
  return {...await api.storage.sync.get(syncKeys), globalSettings:await api.storage.local.get(localKeys),version:'1.3'};
}
export function diffConfiguration(before, after) {
  const flatten = value => ({...Object.fromEntries(Object.entries(value).filter(([k]) => syncKeys.includes(k))),...value.globalSettings});
  const a = flatten(before), b = flatten(after);
  return Object.keys(b).filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k])).map(key => ({key,before:a[key] ?? '(default)',after:b[key]}));
}
export async function applyConfiguration(api, input) {
  const data = validateConfiguration(input), before = await snapshot(api);
  await api.storage.local.set({configurationRollback:before});
  const {globalSettings,...sync} = data;
  try { await api.storage.sync.set(sync); await api.storage.local.set(globalSettings); }
  catch (error) { await restoreConfiguration(api, before); throw error; }
}
export async function restoreConfiguration(api, data) {
  const {globalSettings,...sync} = validateConfiguration(data);
  await api.storage.sync.remove(syncKeys.filter(k => !(k in sync)));
  await api.storage.local.remove(localKeys.filter(k => !(k in globalSettings)));
  await api.storage.sync.set(sync); await api.storage.local.set(globalSettings);
}
export function activeExceptions(entries = [], now = Date.now()) {
  return entries.filter(e => siteDomain(e.domain) && ['all','scripts','fingerprint','filters'].includes(e.scope) && (e.expiresAt === null || e.expiresAt > now));
}
export function exceptionDomains(entries, scope) { return activeExceptions(entries).filter(e => e.scope === 'all' || e.scope === scope).map(e => e.domain); }
