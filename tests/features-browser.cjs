// CHROME_PATH=/path/to/chrome node tests/features-browser.cjs
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const puppeteer = require('puppeteer');
const wait = async (page, predicate, ...args) => {try {return await page.waitForFunction(predicate, {polling:100, timeout:10000}, ...args);} catch(error) {console.error(await page.evaluate(()=>({tools:document.getElementById('tools-result')?.textContent,status:document.getElementById('statusMessage')?.textContent})));throw error;}};
(async () => {
  let lastHeaders;
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/fixture')) lastHeaders = req.headers;
    res.setHeader('Content-Type', 'text/html');
    res.end('<!doctype html><html><body><p id="article">Feature fixture</p><script>window.earlyScriptRan=true</script></body></html>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'morph-features-'));
  try {
    browser = await puppeteer.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {}), enableExtensions:[path.resolve(__dirname,'..')]});
    const worker = await browser.waitForTarget(t => t.type() === 'service_worker');
    const origin = 'chrome-extension://' + new URL(worker.url()).hostname;
    const settings = await browser.newPage();
    const errors = [];
    settings.on('pageerror', e => errors.push(e.message));
    await settings.goto(origin + '/advanced-settings.html');
    const set = async data => {
      await settings.evaluate(data => chrome.runtime.sendMessage({type:'set-settings', data}), data);
      const result = await settings.evaluate(() => chrome.runtime.sendMessage({type:'reload-dnr-rules'}));
      assert.equal(result.success, true, result.error);
    };
    const sync = async data => {
      await settings.evaluate(data => chrome.storage.sync.set(data), data);
      await settings.evaluate(() => chrome.runtime.sendMessage({type:'reload-dnr-rules'}));
    };
    const click = (page, selector) => page.$eval(selector, e => e.click());
    const change = (page, selector, value) => page.$eval(selector, (e, value) => {e.value=value; e.dispatchEvent(new Event('change',{bubbles:true}));}, value);
    await set({uaSpoofEnabled:false,jsProtectEnabled:false,autoHarmonizeTzEnabled:false,touchSpoofEnabled:false,hardwareHarmonizeEnabled:false,geoSpoofEnabled:false});
    const fixture = await browser.newPage();
    const url = `http://127.0.0.1:${server.address().port}/fixture`;
    await fixture.goto(url);
    const native = await fixture.evaluate(() => ({ua:navigator.userAgent,touch:navigator.maxTouchPoints,cores:navigator.hardwareConcurrency,memory:navigator.deviceMemory}));
    await set({selectedUA:'MorphVerification/1.0',uaSpoofEnabled:true,touchSpoofEnabled:true,maxTouchPoints:7});
    await fixture.reload();
    await wait(fixture, () => navigator.userAgent === 'MorphVerification/1.0' && navigator.maxTouchPoints === 7);
    assert.equal(lastHeaders['user-agent'], 'MorphVerification/1.0');
    await set({uaSpoofEnabled:false,touchSpoofEnabled:false,jsBlockEnabled:true});
    await fixture.reload();
    assert.deepEqual(await fixture.evaluate(() => [navigator.userAgent,navigator.maxTouchPoints,typeof window.earlyScriptRan]), [native.ua,native.touch,'undefined']);
    await set({jsBlockEnabled:false}); await fixture.reload();
    assert.equal(await fixture.evaluate(() => window.earlyScriptRan), true);
    await sync({websiteRules:[{id:1,website:'127.0.0.1',userAgent:'SiteVerification/1.0',uaSpoofEnabled:true,jsBlocked:true}]});
    await set({uaSpoofEnabled:true}); await fixture.reload();
    await wait(fixture, () => navigator.userAgent === 'SiteVerification/1.0');
    assert.equal(lastHeaders['user-agent'], 'SiteVerification/1.0');
    assert.equal(await fixture.evaluate(() => window.earlyScriptRan), undefined);
    await sync({blockList:[{id:2,website:'127.0.0.1'}],listMode:'blacklist'}); await fixture.reload();
    await wait(fixture, () => navigator.userAgent.includes('Chrome'));
    assert.equal(await fixture.evaluate(() => window.earlyScriptRan), true);
    await sync({websiteRules:[],blockList:[]});
    console.log('PASS: network and JS user agent, touch on/off, global/site script blocking, site exclusions');

    await set({uaSpoofEnabled:true,hardwareHarmonizeEnabled:true,customHardwareCores:'4',customDeviceMemory:'4',geoSpoofEnabled:true,geoCoords:{lat:0,lng:0}});
    await fixture.reload();
    await wait(fixture, () => navigator.hardwareConcurrency === 4 && navigator.deviceMemory === 4);
    const geo = await fixture.evaluate(() => new Promise((resolve,reject) => navigator.geolocation.getCurrentPosition(p=>resolve([p.coords.latitude,p.coords.longitude]),reject)));
    assert.deepEqual(geo,[0,0]);
    await click(settings,'#hwHarmonizeToggle');
    await wait(settings, async () => (await chrome.storage.local.get('hardwareHarmonizeEnabled')).hardwareHarmonizeEnabled === false);
    await fixture.reload();
    assert.deepEqual(await fixture.evaluate(() => [navigator.hardwareConcurrency,navigator.deviceMemory]), [native.cores,native.memory]);
    const nativeTimezone = await settings.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
    assert.equal(await fixture.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone), nativeTimezone);
    await set({autoHarmonizeTzEnabled:true,geoTimezone:'Asia/Tokyo'}); await fixture.reload();
    await wait(fixture,()=>Intl.DateTimeFormat().resolvedOptions().timeZone==='Asia/Tokyo');
    await click(settings,'#autoHarmonizeTzToggle');
    await wait(settings,async()=>(await chrome.storage.local.get('autoHarmonizeTzEnabled')).autoHarmonizeTzEnabled===false);
    await fixture.reload();
    assert.equal(await fixture.evaluate(()=>Intl.DateTimeFormat().resolvedOptions().timeZone), nativeTimezone);
    console.log('PASS: hardware control and zero-coordinate geolocation');

    for (const target of await settings.$$eval('.sidebar-link[data-target]', els=>els.map(e=>e.dataset.target))) {
      await click(settings, `.sidebar-link[data-target="${target}"]`);
      assert.notEqual(await settings.$eval('#'+target,e=>getComputedStyle(e).display),'none',target);
    }
    const popup = await browser.newPage();
    popup.on('pageerror',e=>errors.push(e.message));
    await popup.setViewport({width:400,height:600});
    await fixture.bringToFront(); await popup.goto(origin+'/popup.html');
    await wait(popup,()=>!document.getElementById('site-shield-toggle').disabled);
    await wait(popup,()=>document.getElementById('custom-ua').value==='MorphVerification/1.0');
    await click(popup,'#btn-all-tabs');
    await wait(settings,async()=>(await chrome.storage.local.get('applyScope')).applyScope==='all');
    await click(popup,'.device-card[data-category="mobile"]');
    assert.ok(await popup.$$eval('#platform-select option',els=>els.length)>1);
    await change(popup,'#custom-ua','PopupVerification/1.0');
    await wait(settings,async()=>(await chrome.storage.local.get('selectedUA')).selectedUA==='PopupVerification/1.0');
    await fixture.reload();await wait(fixture,()=>navigator.userAgent==='PopupVerification/1.0');
    // Browser-wide switches must also work with "current site" selected.
    await click(popup,'#btn-current-tab');
    await click(popup,'#rtc-protect-toggle');
    await wait(settings,async()=>(await chrome.privacy.network.webRTCIPHandlingPolicy.get({})).value==='default');
    await click(popup,'#rtc-protect-toggle');
    await wait(settings,async()=>(await chrome.privacy.network.webRTCIPHandlingPolicy.get({})).value==='disable_non_proxied_udp');
    await click(popup,'#ghost-mode-toggle');
    await wait(settings,async()=>!!await chrome.alarms.get('ghostModeRotate'));
    await change(popup,'#ghost-interval','2');
    await wait(settings,async()=>(await chrome.alarms.get('ghostModeRotate'))?.periodInMinutes===2);
    await click(popup,'#ghost-mode-toggle');
    await wait(settings,async()=>!await chrome.alarms.get('ghostModeRotate'));
    console.log('PASS: popup profiles, custom UA, WebRTC browser policy, Ghost Mode alarm controls');

    // Capture both themes and verify popup layout.
    for (const theme of ['dark','light']) {
      if (theme==='light') await click(popup,'#theme-toggle');
      await popup.$eval('.main-content',e=>{e.scrollTop=0;});
      await popup.screenshot({path:path.join(output,`popup-${theme}.png`)});
      assert.equal(await popup.$eval('.main-content',e=>e.scrollWidth<=e.clientWidth),true);
      await popup.$eval('.main-content',e=>{e.scrollTop=e.scrollHeight;});
      assert.equal(await popup.$('.quick-links'), null);
    }
    for (const href of await popup.$$eval('.shield-footer a',els=>els.map(e=>e.href))) {
      await settings.goto(href);
      const id=new URL(href).hash.slice(1);
      await wait(settings,id=>getComputedStyle(document.getElementById(id)).display!=='none',id);
    }
    // Use a controlled local HTTP proxy; no external account or traffic is required.
    await click(settings,'#presetLocalHttpBtn');
    await settings.$eval('#advProxyPort',(e,port)=>{e.value=String(port);},server.address().port);
    await click(settings,'#advBrowserProxyMasterToggle');
    await click(settings,'#advSaveProxyBtn');
    await wait(settings,async()=>(await chrome.proxy.settings.get({})).value.mode==='fixed_servers');
    const proxyPage=await browser.newPage();
    await proxyPage.goto('http://morph-proxy.invalid/fixture');
    assert.equal(await proxyPage.$eval('#article',e=>e.textContent),'Feature fixture');
    await set({webrtcPreventLeakEnabled:false});
    assert.equal(await settings.evaluate(async()=>(await chrome.privacy.network.webRTCIPHandlingPolicy.get({})).value),'disable_non_proxied_udp');
    await set({webrtcPreventLeakEnabled:true});
    await settings.$eval('#advProxyPort',e=>{e.value='0';});
    await click(settings,'#advSaveProxyBtn');
    await wait(settings,()=>document.getElementById('statusMessage').classList.contains('error'));
    assert.equal(await settings.evaluate(async()=>(await chrome.proxy.settings.get({})).value.rules.singleProxy.port),server.address().port);
    await click(settings,'#advDisableProxyBtn');
    await wait(settings,async()=>(await chrome.proxy.settings.get({})).value.mode!=='fixed_servers');
    await proxyPage.close();
    console.log('PASS: local HTTP proxy, invalid configuration rejection and disconnect');
    // Observe the actual export Blob, then import that file through the file input.
    await settings.evaluate(()=>{const original=URL.createObjectURL;URL.createObjectURL=function(blob){window.exportedSettings=blob;return original.call(this,blob);};});
    await click(settings,'#exportBtn');
    await wait(settings,()=>!!window.exportedSettings);
    const exported=await settings.evaluate(async()=>JSON.parse(await window.exportedSettings.text()));
    assert.equal(exported.globalSettings.ghostInterval,2);
    assert.equal(exported.globalSettings.webrtcPreventLeakEnabled,true);
    const filename=path.join(output,'settings.json');fs.writeFileSync(filename,JSON.stringify(exported));
    await set({ghostInterval:15});
    await (await settings.$('#importFile')).uploadFile(filename);
    await wait(settings,()=>!document.getElementById('tools-apply').disabled);
    assert.equal(await settings.evaluate(async()=>(await chrome.storage.local.get('ghostInterval')).ghostInterval),15);
    await click(settings,'#tools-apply');
    await wait(settings,async()=>(await chrome.storage.local.get('ghostInterval')).ghostInterval===2);
    await wait(settings,()=>document.getElementById('tools-result').textContent.startsWith('Applied.'));
    await sync({websiteRules:[],blockList:[],whiteList:[],listMode:'blacklist'});
    // Privacy Tools: preview/apply/rollback, exception scope and expiry, and diagnostics.
    await click(settings,'[data-target="section-tools"]');
    await settings.$eval('#tools-url',e=>e.value='127.0.0.1');
    await set({ghostModeEnabled:false,uaSpoofEnabled:true,selectedUA:'ToolsTest/1.0',jsBlockEnabled:true});
    await click(settings,'#tools-test');
    await wait(settings,()=>document.getElementById('tools-result').textContent.includes('ToolsTest/1.0'));
    await change(settings,'#tools-scope','scripts');
    await click(settings,'#tools-pause');
    await wait(settings,()=>document.getElementById('tools-result').textContent.includes('Paused scripts'));
    await fixture.reload();
    await wait(fixture,()=>navigator.userAgent==='ToolsTest/1.0');
    assert.equal(await fixture.evaluate(()=>window.earlyScriptRan),true);
    await click(settings,'#tools-resume');
    await wait(settings,()=>document.getElementById('tools-result').textContent.includes('Exceptions removed'));
    await fixture.reload();assert.equal(await fixture.evaluate(()=>typeof window.earlyScriptRan),'undefined');
    await settings.evaluate(()=>chrome.storage.local.set({temporaryExceptions:[{domain:'127.0.0.1',scope:'scripts',expiresAt:Date.now()+1200}]}));
    await wait(settings,async()=>!!(await chrome.alarms.get('exceptionExpiry')));
    await wait(settings,async()=>!(await chrome.storage.local.get('temporaryExceptions')).temporaryExceptions.length);
    await set({jsBlockEnabled:false});
    await settings.$eval('#tools-name',e=>e.value='Regression preset');
    await click(settings,'#tools-save');await wait(settings,()=>document.getElementById('tools-presets').options.length===1);
    await set({selectedUA:'Changed/2.0'});
    await click(settings,'#tools-preview');await wait(settings,()=>!document.getElementById('tools-apply').disabled);
    await click(settings,'#tools-apply');await wait(settings,async()=>(await chrome.storage.local.get('selectedUA')).selectedUA==='ToolsTest/1.0');
    await click(settings,'#tools-undo');await wait(settings,async()=>(await chrome.storage.local.get('selectedUA')).selectedUA==='Changed/2.0');
    await click(settings,'#tools-health');await wait(settings,()=>document.getElementById('tools-result').textContent.includes('networkRuleCount'));
    await click(settings,'#tools-tabs-refresh');await wait(settings,()=>document.getElementById('tools-tabs').options.length>0);
    await click(settings,'#tools-inspect');await wait(settings,()=>document.getElementById('tools-result').textContent.includes('secureContext'));
    await click(settings,'#tools-troubleshoot');await wait(settings,()=>document.getElementById('tools-result').textContent.includes('Step 1/3'));
    await click(settings,'#tools-next');await wait(settings,()=>document.getElementById('tools-result').textContent.includes('Step 2/3'));
    assert.deepEqual(await settings.evaluate(async()=>(await chrome.storage.local.get('temporaryExceptions')).temporaryExceptions.map(e=>e.scope)),['filters']);
    await click(settings,'#tools-fixed');await wait(settings,()=>document.getElementById('tools-result').textContent.includes('one hour'));
    await click(settings,'#tools-resume');await wait(settings,()=>document.getElementById('tools-result').textContent.includes('Exceptions removed'));
    console.log('PASS: rule preview, scoped exceptions and expiry, preset preview/apply/rollback, health, live diagnostics and troubleshooting');
    // Regression checks for JavaScript identity, location watches, and actual date formatting.
    await set({selectedUA:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',uaSpoofEnabled:true,touchSpoofEnabled:true,maxTouchPoints:0,geoSpoofEnabled:true,geoCoords:{lat:0,lng:0},geoTimezone:'America/New_York',autoHarmonizeTzEnabled:true,jsProtectEnabled:true});
    await fixture.reload();await wait(fixture,()=>navigator.platform==='iPhone');
    assert.equal(await fixture.evaluate(()=>navigator.maxTouchPoints),0);
    assert.equal(await fixture.evaluate(()=>typeof navigator.userAgentData),'undefined');
    assert.deepEqual(await fixture.evaluate(()=>[new Date('2026-01-01T12:00:00Z').getTimezoneOffset(),new Date('2026-07-01T12:00:00Z').getTimezoneOffset()]),[300,240]);
    assert.equal(await fixture.evaluate(()=>new Intl.DateTimeFormat('en-US',{timeZone:'UTC'}).resolvedOptions().timeZone),'UTC');
    assert.equal(await fixture.evaluate(()=>new Intl.DateTimeFormat('en-US',{hour:'2-digit',hourCycle:'h23'}).format(new Date('2026-01-01T12:00:00Z'))),'07');
    assert.equal(await fixture.evaluate(()=>new Promise(resolve=>{let calls=0;const id=navigator.geolocation.watchPosition(()=>calls++);navigator.geolocation.clearWatch(id);setTimeout(()=>resolve(calls),1100);})),0);
    assert.equal(await fixture.evaluate(async()=>typeof navigator.getBattery==='function' ? typeof (await navigator.getBattery()).level : 'number'),'number');
    // No settings arrive on this blank page: GPS must fail closed, never call native GPS.
    const delayed=await browser.newPage();
    await delayed.evaluate(()=>{window.nativeGPSCalls=0;window.Geolocation=class {getCurrentPosition(){window.nativeGPSCalls++;} watchPosition(){window.nativeGPSCalls++;return 42;} clearWatch(){}};});
    await delayed.addScriptTag({content:fs.readFileSync(path.resolve(__dirname,'../js/inject.js'),'utf8')});
    assert.equal(await delayed.evaluate(()=>new Promise(resolve=>new Geolocation().getCurrentPosition(()=>resolve('unexpected'),error=>resolve(error.code)))),2);
    assert.equal(await delayed.evaluate(()=>window.nativeGPSCalls),0);
    await delayed.close();
    console.log('PASS: Safari client hints, explicit zero touch, timezone DST/formatting, canceled GPS watch, fail-closed GPS startup and battery API');
    assert.deepEqual(errors,[]);
    console.log('PASS: all settings navigation, filter link, light/dark layout without overflow, settings export/import');
    console.log('Screenshots:',output);
  } finally {
    if (browser) {
      const child = browser.process();
      const cleanup = setTimeout(() => child?.kill('SIGKILL'), 5000);
      try { await browser.close(); } finally { clearTimeout(cleanup); }
    }
    server.closeAllConnections();
    server.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1});
