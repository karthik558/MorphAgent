        // Apply theme from storage
        const browser = window.browser || window.chrome;
        if (browser && browser.storage) {
            browser.storage.local.get(['theme']).then((data) => {
                if (data.theme === 'light') {
                    document.body.classList.remove('dark-mode');
                } else if (!data.theme && !window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.body.classList.remove('dark-mode');
                }
            });
        }
        
        document.getElementById('themeToggle').addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            if (browser && browser.storage) {
                browser.storage.local.set({ theme: isDark ? 'dark' : 'light' });
            }
        });

        // 1. Hardware
        const hwStr = `Hardware Concurrency: ${navigator.hardwareConcurrency} cores\nDevice Memory: ${navigator.deviceMemory} GB`;
        document.getElementById('hw').innerHTML = `<pre>${hwStr}</pre>`;

        // 2. Timezone
        const offset = new Date().getTimezoneOffset();
        let tzStr = `Timezone Offset: ${offset} minutes\n`;
        if (window.Intl) {
            tzStr += `Intl Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
        }
        document.getElementById('tz').innerHTML = `<pre>${tzStr}</pre>`;

        // 3. WebGL
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            document.getElementById('webgl').innerHTML = `<pre>Vendor: ${vendor}\nRenderer: ${renderer}</pre>`;
        } catch (e) {
            document.getElementById('webgl').innerText = "WebGL Error or Blocked";
        }

        // 4. Canvas Hash
        function getCanvasHash() {
            const canvas = document.createElement('canvas');
            // Adding willReadFrequently to suppress Chrome warnings during readback operations
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125,1,62,20);
            ctx.fillStyle = "#069";
            ctx.fillText("MorphAgent", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText("MorphAgent", 4, 17);
            const data = canvas.toDataURL();
            let hash = 0;
            for (let i = 0; i < data.length; i++) {
                hash = ((hash << 5) - hash) + data.charCodeAt(i);
                hash |= 0; 
            }
            return hash;
        }
        document.getElementById('canvas').innerHTML = `<pre>Canvas Hash: ${getCanvasHash()}</pre>`;

        // 5. Screen Metrics
        const screenStr = `Screen: ${screen.width}x${screen.height}\nColor Depth: ${screen.colorDepth}-bit\nWindow: ${window.innerWidth}x${window.innerHeight}`;
        document.getElementById('screen-info').innerHTML = `<pre>${screenStr}</pre>`;

        // 6. Media Devices
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then(devices => {
                let out = '';
                devices.forEach(d => { out += `${d.kind}: ${d.label} (ID: ${d.deviceId})\n`; });
                document.getElementById('media-out').innerText = out;
            }).catch(e => {
                document.getElementById('media-out').innerText = `Error: ${e.message}`;
            });
        }

        // 7. DRM / EME
        async function checkDRM() {
            // Adding robustness level to suppress Chrome deprecation/unexpected behavior warnings
            const config = [{ 
                initDataTypes: ['cenc'], 
                videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"', robustness: 'SW_SECURE_CRYPTO' }] 
            }];
            let out = '';
            
            try {
                await navigator.requestMediaKeySystemAccess('com.widevine.alpha', config);
                out += '✅ Widevine Supported\n';
            } catch (e) { out += '❌ Widevine Blocked/Unsupported\n'; }
            
            try {
                await navigator.requestMediaKeySystemAccess('com.microsoft.playready', config);
                out += '✅ PlayReady Supported\n';
            } catch (e) { out += '❌ PlayReady Blocked/Unsupported\n'; }
            
            try {
                await navigator.requestMediaKeySystemAccess('com.apple.fps.1_0', config);
                out += '✅ FairPlay Supported\n';
            } catch (e) { out += '❌ FairPlay Blocked/Unsupported\n'; }
            
            document.getElementById('drm-out').innerText = out;
        }
        checkDRM();

        // 8. Battery API
        if (navigator.getBattery) {
            navigator.getBattery().then(b => {
                let debugState = 'MorphAgent Settings: ' + JSON.stringify(window.__MORPH_AGENT_SETTINGS__ || 'Not Loaded');
                debugState += '\nSync Load Success (sessionStorage): ' + (window.__MORPH_SYNC_LOADED ? 'YES' : 'NO');
                debugState += '\nBattery Spoof Error: ' + (window.__MORPH_BATTERY_ERROR || 'None');
                if (b && typeof b.level !== 'undefined') {
                    document.getElementById('battery-out').innerText = `Level: ${b.level * 100}%\nCharging: ${b.charging}\n\n[Debug] ${debugState}`;
                } else {
                    document.getElementById('battery-out').innerText = `Raw Battery Data: ${JSON.stringify(b)}\n(If empty, browser blocked it)\n\n[Debug] ${debugState}`;
                }
            }).catch(err => {
                document.getElementById('battery-out').innerText = `Error: ${err.message}`;
            });
        } else {
            document.getElementById('battery-out').innerText = `Battery API Not Supported`;
        }

        // 9. Network API
        if (navigator.connection) {
            const c = navigator.connection;
            document.getElementById('network-out').innerText = `Effective Type: ${c.effectiveType}\nDownlink: ${c.downlink} Mbps\nRTT: ${c.rtt} ms`;
        } else {
            document.getElementById('network-out').innerText = `Network Information API Not Supported`;
        }

        // 10. ClientRects
        const testEl = document.createElement('div');
        testEl.style.width = '100px';
        testEl.style.height = '100px';
        testEl.style.position = 'absolute';
        document.body.appendChild(testEl);
        const rect = testEl.getBoundingClientRect();
        document.getElementById('dom-out').innerText = `Width: ${rect.width}\nHeight: ${rect.height}`;
        testEl.remove();

        // 11. Font Hash
        const fontTest = document.createElement('span');
        fontTest.innerText = "mmmmmmmmmmllllliii";
        fontTest.style.fontSize = "72px";
        fontTest.style.position = "absolute";
        fontTest.style.visibility = "hidden";
        document.body.appendChild(fontTest);
        document.getElementById('font-out').innerText = `OffsetWidth: ${fontTest.offsetWidth}\nOffsetHeight: ${fontTest.offsetHeight}`;
        fontTest.remove();

        async function readProfileDiff() {
            const output = document.getElementById('profile-diff');
            const api = window.browser || window.chrome;
            if (!api || !api.storage || !api.scripting || !api.tabs) {
                output.textContent = 'Open this lab from the extension to compare a website with the matched profile.';
                return;
            }
            const stored = await api.storage.local.get(['selectedUA', 'identityBundle']);
            const bundle = stored.identityBundle;
            const intended = bundle ? [
                `User agent: ${bundle.ua || stored.selectedUA || ''}`,
                `Screen: ${bundle.screen ? bundle.screen.width + '×' + bundle.screen.height : '(not matched)'}`,
                `Cores / memory: ${bundle.cores || '-'} / ${bundle.memory || '-'}`,
                `Language: ${(bundle.languages && bundle.languages[0]) || '(location spoof owns language)'}`,
                `GPU: ${bundle.webgl ? bundle.webgl.renderer : '-'}`,
                `WebGPU: ${bundle.webgpu ? bundle.webgpu.vendor : '-'}`,
                `Workers: ${bundle.coverWorkers ? 'same-origin classic workers' : 'off'}`
            ] : [`User agent: ${stored.selectedUA || '(none)'}`, 'Match a profile in the popup to store the expected screen, GPU, and language.'];
            let visible = 'Open a website, then run this check. This lab page is part of the extension, so it shows the browser’s own values.';
            try {
                const [tab] = await api.tabs.query({ active: true, currentWindow: true });
                if (tab && tab.id && /^https?:/i.test(tab.url || '')) {
                    const [probe] = await api.scripting.executeScript({
                        target: { tabId: tab.id },
                        world: 'MAIN',
                        func: () => new Promise(resolve => {
                            const page = {
                                ua: navigator.userAgent,
                                language: navigator.language,
                                cores: navigator.hardwareConcurrency,
                                memory: navigator.deviceMemory,
                                screen: screen.width + '×' + screen.height,
                                usb: typeof navigator.usb,
                                gpu: !!(navigator.gpu)
                            };
                            let worker = null;
                            try {
                                const blob = new Blob(['postMessage({ua:navigator.userAgent,cores:navigator.hardwareConcurrency,language:navigator.language})'], { type: 'text/javascript' });
                                const job = new Worker(URL.createObjectURL(blob));
                                const timer = setTimeout(() => { job.terminate(); resolve({ page, worker }); }, 700);
                                job.onmessage = event => { clearTimeout(timer); worker = event.data; job.terminate(); resolve({ page, worker }); };
                                job.onerror = () => { clearTimeout(timer); resolve({ page, worker: null }); };
                            } catch (error) {
                                resolve({ page, worker: null });
                            }
                        })
                    });
                    const value = probe && probe.result;
                    if (value) {
                        visible = [
                            `Page user agent: ${value.page.ua}`,
                            `Page language: ${value.page.language}`,
                            `Page screen: ${value.page.screen}`,
                            `Page cores / memory: ${value.page.cores} / ${value.page.memory}`,
                            `Page WebGPU present: ${value.page.gpu}`,
                            `Page USB: ${value.page.usb}`,
                            `Blob worker user agent: ${value.worker ? value.worker.ua : 'unavailable'}`,
                            'Blob and cross-origin workers keep the browser worker. Same-origin classic workers use the matched profile.'
                        ].join('\n');
                    }
                }
            } catch (error) {
                visible = `Could not read the active tab (${error.message}).`;
            }
            output.textContent = `Intended\n${intended.join('\n')}\n\nVisible on the active website\n${visible}`;
        }
        document.getElementById('profile-diff-run').addEventListener('click', readProfileDiff);
        readProfileDiff();
    
