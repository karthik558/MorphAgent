// CHROME_PATH=/path/to/chrome node tests/custom-locations-browser.cjs
const assert = require('node:assert/strict');
const path = require('node:path');
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless:true,...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH}:{}),enableExtensions:[path.resolve(__dirname,'..')]});
  try {
    const worker=await browser.waitForTarget(t=>t.type()==='service_worker');
    const origin='chrome-extension://'+new URL(worker.url()).hostname;
    const settings=await browser.newPage();
    await settings.goto(origin+'/advanced-settings.html');
    const locations=[{id:1,name:'Home test',lat:0,lng:12.34},{id:2,name:'Work test',lat:45.67,lng:0}];
    await settings.evaluate(async customLocations=>{
      await chrome.storage.sync.set({customLocations});
      await chrome.storage.local.set({geoPresetValue:'0,12.34',geoCoords:{lat:0,lng:12.34},geoSpoofEnabled:true});
    },locations);
    await settings.waitForFunction(()=>document.querySelectorAll('#geoCoordsPreset .custom-loc-option').length===2);
    const popup=await browser.newPage();
    await popup.goto(origin+'/popup.html');
    await popup.waitForFunction(()=>[...document.querySelector('#geo-preset').options].some(o=>o.textContent.includes('Home test')),{timeout:5000});
    await popup.waitForFunction(()=>document.getElementById('geo-preset').value==='0,12.34');
    await popup.$eval('#geo-preset-trigger',e=>e.click());
    assert.equal(await popup.$$eval('#geo-preset-menu [role=option]',els=>els.filter(e=>/Home test|Work test/.test(e.textContent)).length),2);
    await popup.$$eval('#geo-preset-menu [role=option]',els=>els.find(e=>e.textContent.includes('Work test')).click());
    assert.equal(await popup.$eval('#geo-preset',e=>e.value),'45.67,0');
    assert.deepEqual(await popup.evaluate(()=>[document.getElementById('geo-lat').value,document.getElementById('geo-lng').value]),['45.67','0']);
    await settings.$eval('#geoCoordsPreset',e=>e.value='45.67,0');
    locations.push({id:3,name:'New test',lat:-12,lng:34});
    await settings.evaluate(customLocations=>chrome.storage.sync.set({customLocations}),locations);
    await popup.waitForFunction(()=>[...document.querySelector('#geo-preset').options].some(o=>o.textContent.includes('New test')));
    assert.equal(await popup.$eval('#geo-preset',e=>e.value),'45.67,0');
    assert.equal(await settings.$eval('#geoCoordsPreset',e=>e.value),'45.67,0');
    await settings.evaluate(customLocations=>chrome.storage.sync.set({customLocations}),locations.slice(1));
    await popup.waitForFunction(()=>![...document.querySelector('#geo-preset').options].some(o=>o.textContent.includes('Home test')));
    assert.equal(await popup.$$eval('#geo-preset .custom-loc-option',els=>els.length),2);
    await popup.reload();
    await popup.waitForFunction(()=>document.querySelectorAll('#geo-preset .custom-loc-option').length===2);
    console.log('PASS: saved locations appear in both dropdowns, styled menu selection sets coordinates, live add/delete preserves selection without duplicates, reload restores options');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
