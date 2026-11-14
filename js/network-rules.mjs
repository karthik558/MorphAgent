// Pure rule builder shared by the MV3 background engine and regression tests.
export function siteDomain(value) {
  let input = String(value || '').trim().toLowerCase().replace(/^\*:\/\//, 'https://');
  try {
    if (input.includes('://')) input = new URL(input).hostname;
  } catch { return null; }
  input = input.replace(/^\*\./, '').replace(/\/$/, '');
  return /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(input) ? input : null;
}

export function uaHeaders(ua) {
  const headers = [{ header: 'User-Agent', operation: 'set', value: ua }];
  const chromium = ua.match(/(?:Chrome|Chromium)\/([\d]+)/);
  const platform = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : 'Linux';
  const hints = chromium ? {
    'Sec-CH-UA': `"Chromium";v="${chromium[1]}", "${ua.includes('Edg/') ? 'Microsoft Edge' : 'Google Chrome'}";v="${chromium[1]}"`,
    'Sec-CH-UA-Mobile': /Mobile/.test(ua) ? '?1' : '?0',
    'Sec-CH-UA-Platform': `"${platform}"`
  } : null;
  for (const name of ['Sec-CH-UA', 'Sec-CH-UA-Mobile', 'Sec-CH-UA-Platform']) {
    headers.push(hints ? { header: name, operation: 'set', value: hints[name] } : { header: name, operation: 'remove' });
  }
  for (const name of ['Sec-CH-UA-Arch','Sec-CH-UA-Bitness','Sec-CH-UA-Model','Sec-CH-UA-Platform-Version','Sec-CH-UA-Full-Version','Sec-CH-UA-Full-Version-List','Sec-CH-UA-WoW64','Sec-CH-UA-Form-Factors']) headers.push({header:name, operation:'remove'});
  return headers;
}

// Intersect a site rule with allowlisted subtrees without broadening website access.
function allowedDomains(domain, allowed) {
  if (!allowed) return [domain];
  return [...new Set(allowed.flatMap(item => domain === item || domain.endsWith('.'+item) ? [domain] : item.endsWith('.'+domain) ? [item] : []))];
}

function withAcceptLanguage(ua, acceptLanguage) {
  const headers = uaHeaders(ua);
  if (typeof acceptLanguage === 'string' && /^[A-Za-z0-9*;=., -]{2,80}$/.test(acceptLanguage)) {
    headers.push({ header: 'Accept-Language', operation: 'set', value: acceptLanguage });
  }
  return headers;
}

export function buildUARules({ enabled, ua, websiteRules = [], blockList = [], whiteList = [], listMode, exclusions = [], acceptLanguage = '' }) {
  if (!enabled || !ua) return [];
  const domains = list => [...new Set(list.map(item => siteDomain(item.website)).filter(Boolean))];
  const excluded = ['proxyium.com', ...exclusions, ...(listMode === 'blacklist' ? domains(blockList) : [])];
  const allowed = listMode === 'whitelist' ? domains(whiteList) : null;
  if (allowed && !allowed.length) return [];
  const siteRules = websiteRules.map(rule => ({ ...rule, domain: siteDomain(rule.website) })).filter(rule => rule.domain);
  const baseExcluded = [...excluded];
  excluded.push(...siteRules.filter(rule => rule.uaSpoofEnabled === false).map(rule => rule.domain));
  const condition = {
    excludedRequestDomains: [...new Set(excluded)],
    // DNR excludes main_frame when resourceTypes is omitted.
    resourceTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'other']
  };
  if (allowed) condition.requestDomains = allowed;
  const rules = [{ id: 1, priority: 1, action: { type: 'modifyHeaders', requestHeaders: withAcceptLanguage(ua, acceptLanguage) }, condition }];
  siteRules.forEach((rule, index) => {
    if (rule.uaSpoofEnabled === false) return;
    const requestDomains = allowedDomains(rule.domain, allowed);
    if (!requestDomains.length) return;
    rules.push({ id: 100000 + index, priority: 10000 - index,
      action: { type: 'modifyHeaders', requestHeaders: withAcceptLanguage(rule.userAgent || ua, acceptLanguage) },
      condition: { ...condition, excludedRequestDomains:[...baseExcluded, ...siteRules.slice(0,index).map(site=>site.domain)], requestDomains } });
  });
  return rules;
}

// Response CSP must arrive before parsing; a content-script meta tag is too late.
export function buildScriptRules({ enabled, websiteRules = [], blockList = [], whiteList = [], listMode, exclusions = [] }) {
  const domains = list => [...new Set(list.map(item => siteDomain(item.website)).filter(Boolean))];
  const allowed = listMode === 'whitelist' ? domains(whiteList) : null;
  if (allowed && !allowed.length) return [];
  const excluded = ['proxyium.com', ...exclusions, ...(listMode === 'blacklist' ? domains(blockList) : [])];
  const sites = websiteRules.map(rule => ({...rule, domain: siteDomain(rule.website)})).filter(rule => rule.domain);
  const rules = [];
  const makeRule = (id, condition) => ({id, priority: 1, action: {type: 'modifyHeaders', responseHeaders: [
    {header: 'Content-Security-Policy', operation: 'append', value: "script-src 'none'; script-src-elem 'none'; script-src-attr 'none'; worker-src 'none'"}
  ]}, condition: {...condition, resourceTypes: ['main_frame', 'sub_frame']}});
  if (enabled) rules.push(makeRule(200000, {
    ...(allowed ? {requestDomains: allowed} : {}),
    excludedRequestDomains: [...new Set([...excluded, ...sites.filter(rule => !rule.jsBlocked).map(rule => rule.domain)])]
  }));
  sites.forEach((rule, index) => {
    const requestDomains = allowedDomains(rule.domain, allowed);
    if (!rule.jsBlocked || !requestDomains.length) return;
    // The first matching site rule owns the page, as in content.js.
    const earlier = sites.slice(0, index).map(site => site.domain);
    rules.push(makeRule(200001 + index, {requestDomains, excludedRequestDomains: [...new Set([...excluded, ...earlier])]}));
  });
  return rules;
}

const ALLOW_TYPES = ['sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'media', 'websocket', 'other'];

// Lets a paused site load third-party requests that the static block lists would stop.
export function buildSiteAllowRules(domains = []) {
  return [...new Set(domains.filter(domain => typeof domain === 'string' && domain.includes('.')))].slice(0, 100).map((domain, index) => ({
    id: 300000 + index,
    priority: 100,
    action: { type: 'allow' },
    condition: { initiatorDomains: [domain], resourceTypes: ALLOW_TYPES }
  }));
}
