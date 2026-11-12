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
  return headers;
}

export function buildUARules({ enabled, ua, websiteRules = [], blockList = [], whiteList = [], listMode }) {
  if (!enabled || !ua) return [];
  const domains = list => [...new Set(list.map(item => siteDomain(item.website)).filter(Boolean))];
  const excluded = ['proxyium.com', ...(listMode === 'blacklist' ? domains(blockList) : [])];
  const allowed = listMode === 'whitelist' ? domains(whiteList) : null;
  if (allowed && !allowed.length) return [];
  const siteRules = websiteRules.map(rule => ({ ...rule, domain: siteDomain(rule.website) })).filter(rule => rule.domain);
  excluded.push(...siteRules.filter(rule => rule.uaSpoofEnabled === false).map(rule => rule.domain));
  const condition = {
    excludedRequestDomains: [...new Set(excluded)],
    // DNR excludes main_frame when resourceTypes is omitted.
    resourceTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'other']
  };
  if (allowed) condition.requestDomains = allowed;
  const rules = [{ id: 1, priority: 1, action: { type: 'modifyHeaders', requestHeaders: uaHeaders(ua) }, condition }];
  siteRules.forEach((rule, index) => {
    if (!rule.userAgent || rule.uaSpoofEnabled === false) return;
    if (allowed && !allowed.some(domain => rule.domain === domain || rule.domain.endsWith('.' + domain))) return;
    rules.push({ id: 100000 + index, priority: 10000 - index,
      action: { type: 'modifyHeaders', requestHeaders: uaHeaders(rule.userAgent) },
      condition: { ...condition, requestDomains: [rule.domain] } });
  });
  return rules;
}

// Response CSP must arrive before parsing; a content-script meta tag is too late.
export function buildScriptRules({ enabled, websiteRules = [], blockList = [], whiteList = [], listMode }) {
  const domains = list => [...new Set(list.map(item => siteDomain(item.website)).filter(Boolean))];
  const allowed = listMode === 'whitelist' ? domains(whiteList) : null;
  if (allowed && !allowed.length) return [];
  const excluded = ['proxyium.com', ...(listMode === 'blacklist' ? domains(blockList) : [])];
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
    if (!rule.jsBlocked || (allowed && !allowed.some(domain => rule.domain === domain || rule.domain.endsWith('.' + domain)))) return;
    // The first matching site rule owns the page, as in content.js.
    const earlier = sites.slice(0, index).map(site => site.domain);
    rules.push(makeRule(200001 + index, {requestDomains: [rule.domain], excludedRequestDomains: [...new Set([...excluded, ...earlier])]}));
  });
  return rules;
}
