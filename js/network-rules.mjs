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
  const condition = { excludedRequestDomains: [...new Set(excluded)] };
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
