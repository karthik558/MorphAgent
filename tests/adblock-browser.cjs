// Optional real-browser acceptance check: CHROME_PATH=/path/to/chrome node tests/adblock-browser.cjs
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const puppeteer = require('puppeteer');
const wait = (page, predicate) => page.waitForFunction(predicate, {polling: 100, timeout: 10000});
(async () => {
  const server = http.createServer((req, res) => { if (req.url.split('?')[0].endsWith('.js')) {res.setHeader('Content-Type','application/javascript');res.end('window.adScriptExecutions = (window.adScriptExecutions || 0) + 1;');return;} res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><body><div class="ad-banner">Ad</div><p id="content">Article</p><div class="cookie-banner">Consent</div>'); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), enableExtensions: [path.resolve(__dirname, '..')] });
    const worker = await browser.waitForTarget(t => t.type() === 'service_worker');
    const origin = 'chrome-extension://' + new URL(worker.url()).hostname;
    const settings = await browser.newPage();
    const errors = [];
    settings.on('console', m => { if (m.type() === 'warn' || m.type() === 'error') console.log(m.text()); });
    settings.on('pageerror', e => errors.push(e.message));
    await settings.goto(origin + '/advanced-settings.html#section-dns-adblock');
    await settings.waitForSelector('.subfilter-toggle');
    assert.equal(await settings.$$eval('.subfilter-toggle:disabled', els => els.length), 0);
    const fixture = await browser.newPage();
    await fixture.goto(`http://127.0.0.1:${server.address().port}/`);
    await wait(fixture, () => getComputedStyle(document.querySelector('.ad-banner')).display === 'none');
    assert.notEqual(await fixture.$eval('.cookie-banner', e => getComputedStyle(e).display), 'none');
    const toggleAds = () => settings.$eval('[data-sub-id="ads"]', e => e.click());
    await toggleAds();
    await wait(settings, async () => !(await chrome.declarativeNetRequest.getDynamicRules()).some(r => r.condition.urlFilter === '||doubleclick.net^'));
    await wait(fixture, () => getComputedStyle(document.querySelector('.ad-banner')).display !== 'none');
    await settings.reload();
    await settings.waitForSelector('[data-sub-id="ads"]');
    assert.equal(await settings.$eval('[data-sub-id="ads"]', e => e.checked), false);
    await toggleAds();
    await wait(fixture, () => getComputedStyle(document.querySelector('.ad-banner')).display === 'none');
    await wait(settings, async () => (await chrome.declarativeNetRequest.getDynamicRules()).some(r => r.condition.urlFilter === '||doubleclick.net^'));
    console.log('PASS: filter toggle persistence and live cosmetics');
    await settings.$eval('#advBlockTrackersToggle', e => e.click());
    await wait(settings, async () => {
      const rules = await chrome.declarativeNetRequest.getDynamicRules();
      return rules.some(r => r.condition.urlFilter === '||doubleclick.net^') && !rules.some(r => r.condition.urlFilter === '||google-analytics.com^');
    });
    console.log('PASS: tracker independence');
    await settings.$eval('[data-sub-id="annoyances"]', e => e.click());
    await wait(fixture, () => getComputedStyle(document.querySelector('.cookie-banner')).display === 'none');
    await settings.$eval('#advAdBlockMasterToggle', e => e.click());
    await wait(fixture, () => getComputedStyle(document.querySelector('.cookie-banner')).display !== 'none' && getComputedStyle(document.querySelector('.ad-banner')).display !== 'none');
    await wait(settings, async () => (await chrome.declarativeNetRequest.getDynamicRules()).every(r => r.action.type !== 'block'));
    await settings.$eval('#advAdBlockMasterToggle', e => e.click());
    await settings.$eval('#advAdBlockDnrToggle', e => e.click());
    await wait(settings, async () => (await chrome.declarativeNetRequest.getDynamicRules()).every(r => r.action.type !== 'block'));
    assert.equal(await settings.$eval('#advAdBlockMasterToggle', e => e.checked), true);
    await wait(fixture, () => getComputedStyle(document.querySelector('.ad-banner')).display === 'none');
    await settings.$eval('#advAdBlockDnrToggle', e => e.click());
    // Exercise site exceptions through the popup, with the website as the active tab.
    console.log('PASS: optional annoyances and shield master');
    const popup = await browser.newPage();
    popup.on('pageerror', e => errors.push(e.message));
    await fixture.bringToFront();
    await popup.goto(origin + '/popup.html');
    await wait(popup, () => !document.getElementById('site-shield-toggle').disabled);
    await popup.$eval('#site-shield-toggle', e => e.click());
    await wait(fixture, () => getComputedStyle(document.querySelector('.ad-banner')).display !== 'none');
    await wait(popup, () => document.getElementById('site-shield-toggle').textContent.startsWith('Resume'));
    await popup.$eval('#site-shield-toggle', e => e.click());
    await wait(fixture, () => getComputedStyle(document.querySelector('.ad-banner')).display === 'none');
    // Controlled YouTube markup checks skip gating, not live ad coverage.
    const youtube = await browser.newPage();
    await youtube.setRequestInterception(true);
    youtube.on('request', request => request.respond({status:200, contentType:'text/html', body:'<!doctype html><body><div id="movie_player" class="ad-showing"><video></video><button class="ytp-ad-skip-button">Skip</button></div>'}));
    await youtube.goto('https://www.youtube.com/watch?v=morph-fixture');
    await youtube.evaluate(() => document.querySelector('button').addEventListener('click', () => { document.body.dataset.skipped = 'true'; }));
    await wait(youtube, () => document.body.dataset.skipped === 'true');
    assert.deepEqual(await youtube.$eval('video', v => [v.muted, v.playbackRate]), [false, 1]);
    await settings.$eval('#advAdBlockAntiAdblockToggle', e => e.click());
    await youtube.evaluate(() => { delete document.body.dataset.skipped; });
    await new Promise(resolve => setTimeout(resolve, 1100));
    assert.equal(await youtube.$eval('body', e => e.dataset.skipped), undefined);
    // Exercise actual script requests: error must be DNR blocking, not DNS/CORS failure.
    const failures = new Map();
    fixture.on('requestfailed', request => failures.set(request.url(),request.failure()?.errorText));
    const loadScript = url => fixture.evaluate(url => new Promise(resolve => {
      const script=document.createElement('script');script.src=url;
      script.onload=()=>{script.remove();resolve('loaded');};script.onerror=()=>{script.remove();resolve('blocked');};document.head.append(script);
    }),url);
    const root=`http://127.0.0.1:${server.address().port}`;
    for (const path of ['/ads.js','/js/widget/ads.js?test=1','/js/pagead.js','/ads/index.js','/ad/add.js']) {
      const url=root+path;assert.equal(await loadScript(url),'blocked',path);assert.equal(failures.get(url),'net::ERR_BLOCKED_BY_CLIENT');
    }
    for (const ext of ['png','gif','swf']) {
      const url=root+'/banners/pr_advertising_ads_banner.'+ext;
      assert.equal(await fixture.evaluate(url=>fetch(url).then(()=>false,()=>true),url),true);
      assert.equal(failures.get(url),'net::ERR_BLOCKED_BY_CLIENT');
    }
    for (const path of ['/index.js','/add.js','/downloads.js']) assert.equal(await loadScript(root+path),'loaded',path);
    for (const domain of ['ads.reddit.com','sub.ads.reddit.com','ads-dev.pinterest.com','advertising.twitter.com','ads.facebook.com','affiliationjs.s3.amazonaws.com','ads.google.com','crypto-loot.org']) {
      const url=`https://${domain}/morph-filter-fixture.js`;
      assert.equal(await loadScript(url),'blocked',domain);assert.equal(failures.get(url),'net::ERR_BLOCKED_BY_CLIENT',domain);
    }
    // Strict service blocking is on by default; verify the explicit opt-out first.
    await settings.$eval('[data-sub-id="shared-services"]',e=>e.click());
    await wait(settings,async()=>!(await chrome.declarativeNetRequest.getDynamicRules()).some(r=>r.condition.urlFilter==='||graph.instagram.com^'));
    await settings.$eval('[data-sub-id="shared-services"]',e=>e.click());
    await wait(settings,async()=>(await chrome.declarativeNetRequest.getDynamicRules()).some(r=>r.condition.urlFilter==='||graph.instagram.com^'));
    for (const domain of ['redirector.googlevideo.com','graph.facebook.com','graph.instagram.com','i.instagram.com','ssl.p.jwpcdn.com']) {
      const url=`https://${domain}/morph-filter-fixture.js`;
      assert.equal(await loadScript(url),'blocked',domain);assert.equal(failures.get(url),'net::ERR_BLOCKED_BY_CLIENT',domain);
    }
    await settings.$eval('[data-sub-id="shared-services"]',e=>e.click());
    await wait(settings,async()=>!(await chrome.declarativeNetRequest.getDynamicRules()).some(r=>r.condition.urlFilter==='||graph.instagram.com^'));
    await toggleAds();
    await wait(settings,async()=>!(await chrome.declarativeNetRequest.getDynamicRules()).some(r=>r.condition.regexFilter));
    assert.equal(await loadScript(root+'/ads.js'),'loaded');
    await toggleAds();
    await wait(settings,async()=>(await chrome.declarativeNetRequest.getDynamicRules()).some(r=>r.condition.regexFilter));
    await settings.evaluate(()=>chrome.storage.local.set({adBlockWhitelist:['127.0.0.1']}));
    await settings.evaluate(()=>chrome.runtime.sendMessage({type:'reload-dnr-rules'}));
    assert.equal(await loadScript(root+'/pagead.js'),'loaded');
    await settings.evaluate(()=>chrome.storage.local.set({adBlockWhitelist:[]}));
    await settings.evaluate(()=>chrome.runtime.sendMessage({type:'reload-dnr-rules'}));
    assert.equal(await loadScript(root+'/pagead.js'),'blocked');
    console.log('PASS: real DNR domain/subdomain blocking, bounded script paths, safe app scripts, shared-service toggle and site exceptions');
    await settings.evaluate(async () => {
      const filtersState = MorphAgentAdBlock.DEFAULT_FILTER_CATEGORIES.map(c=>({...c,subfilters:c.subfilters.map(sub=>({...sub,enabled:false}))}));
      await chrome.storage.local.set({filtersState,adBlockEnabled:false,adBlockNetworkEnabled:false,trackersBlockEnabled:false,adBlockWhitelist:['keep.example']});
    });
    await settings.$eval('#maximumBlockingBtn',button=>button.click());
    await wait(settings,()=>document.getElementById('statusMessage').innerText.includes('Maximum blocking enabled'));
    const maximum = await settings.evaluate(()=>chrome.storage.local.get(['filtersState','adBlockEnabled','adBlockNetworkEnabled','trackersBlockEnabled','adBlockWhitelist']));
    assert.ok(maximum.adBlockEnabled && maximum.adBlockNetworkEnabled && maximum.trackersBlockEnabled);
    assert.ok(maximum.filtersState.every(c=>c.subfilters.every(sub=>sub.enabled)));
    assert.deepEqual(maximum.adBlockWhitelist,['keep.example']);
    const strictUrl='https://consent.cookiebot.com/morph-filter-fixture.js';
    assert.equal(await loadScript(strictUrl),'blocked');assert.equal(failures.get(strictUrl),'net::ERR_BLOCKED_BY_CLIENT');
    console.log('PASS: Maximum blocking enables every filter and preserves site exceptions');
    const response = await settings.evaluate(() => chrome.runtime.sendMessage({type:'check-filter-updates'}));
    assert.equal(response.success, true);
    assert.equal(response.rulesCount, await settings.evaluate(async () => (await chrome.declarativeNetRequest.getDynamicRules()).length));
    assert.deepEqual(errors, []);
    console.log('PASS: filter persistence, independent trackers, live cosmetic on/off, master, popup site pause/resume, real DNR counts, no page exceptions');
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
