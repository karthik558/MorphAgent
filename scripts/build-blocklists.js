// Builds offline Declarative Net Request rules from public ad and tracker lists.
// The extension ships the JSON, so blocking works with no network connection.
const fs = require('node:fs');
const path = require('node:path');

const SOURCES = {
  ads: [
    'https://raw.githubusercontent.com/easylist/easylist/master/easylist/easylist.txt',
    'https://easylist.to/easylist/easylist.txt'
  ],
  trackers: [
    'https://raw.githubusercontent.com/easylist/easylist/master/easyprivacy/easyprivacy.txt',
    'https://easylist.to/easylist/easyprivacy.txt',
    'https://pgl.yoyo.org/adservers/serverlist.php?hostformat=hosts&showintro=0&mimetype=plaintext'
  ],
  miners: [
    'https://raw.githubusercontent.com/hoshsadiq/adblock-nocoin-list/master/nocoin.txt'
  ]
};

const LIMITS = { ads: 18000, trackers: 9000, miners: 2000 };
const NEVER = new Set([
  'google.com', 'gstatic.com', 'googleapis.com', 'youtube.com', 'ytimg.com', 'googlevideo.com',
  'googleusercontent.com', 'facebook.com', 'fbcdn.net', 'instagram.com', 'apple.com', 'icloud.com',
  'microsoft.com', 'live.com', 'office.com', 'office365.com', 'windows.net', 'microsoftonline.com',
  'amazon.com', 'amazonaws.com', 'cloudfront.net', 'github.com', 'githubusercontent.com',
  'cloudflare.com', 'wikipedia.org', 'wikimedia.org', 'reddit.com', 'twitter.com', 'x.com',
  'twimg.com', 'linkedin.com', 'yahoo.com', 'bing.com', 'mozilla.org', 'mozilla.com'
]);
const RESOURCE_TYPES = ['sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'media', 'websocket', 'other'];

function hostFrom(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('!') || trimmed.startsWith('#') || trimmed.startsWith('@@')) return null;
  const hosts = trimmed.match(/^0\.0\.0\.0\s+(\S+)$/) || trimmed.match(/^127\.0\.0\.1\s+(\S+)$/);
  if (hosts) return hosts[1].toLowerCase();
  if (trimmed.includes('#') || trimmed.includes('~') || trimmed.includes('domain=') || /(?:csp|popup|document|redirect|removeparam|elemhide)/.test(trimmed)) return null;
  const match = trimmed.match(/^\|\|([a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+)\^(?:\$[a-z0-9,~-]+)?$/i);
  return match ? match[1].toLowerCase() : null;
}

function usable(host) {
  if (!host || host.length > 253 || NEVER.has(host) || NEVER.has(host.replace(/^www\./, ''))) return false;
  if (!/^[a-z0-9.-]+$/.test(host) || !host.includes('.') || host.startsWith('.') || host.endsWith('.')) return false;
  return host.split('.').every(label => label && label.length < 64 && !label.startsWith('-') && !label.endsWith('-'));
}

async function fetchFirst(urls) {
  let lastError = null;
  for (const url of urls) {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function rulesFor(domains) {
  return domains.map((domain, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: 'block' },
    condition: { urlFilter: `||${domain}^`, resourceTypes: RESOURCE_TYPES }
  }));
}

async function main() {
  const seen = new Set();
  const lists = {};
  for (const name of ['miners', 'trackers', 'ads']) {
    const text = await fetchFirst(SOURCES[name]);
    const domains = [];
    for (const line of text.split(/\r?\n/)) {
      const host = hostFrom(line);
      if (!usable(host) || seen.has(host)) continue;
      seen.add(host);
      domains.push(host);
      if (domains.length >= LIMITS[name]) break;
    }
    lists[name] = domains;
  }
  const root = path.resolve(__dirname, '..', 'rules');
  fs.mkdirSync(root, { recursive: true });
  const counts = {};
  for (const [name, domains] of Object.entries(lists)) {
    const rules = rulesFor(domains);
    counts[name] = rules.length;
    fs.writeFileSync(path.join(root, `${name}.json`), JSON.stringify(rules));
  }
  counts.total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  counts.generatedAt = new Date().toISOString().slice(0, 10);
  counts.sources = ['EasyList', 'EasyPrivacy', 'Peter Lowe', 'NoCoin'];
  fs.writeFileSync(path.join(root, 'counts.json'), JSON.stringify(counts, null, 2));
  console.log(`Wrote ${counts.total} static block rules`, counts);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
