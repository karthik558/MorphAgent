// Profile facts for the popup, network rules, and page spoof. Opt-in: nothing here runs until a profile is matched.

export const BUNDLED_VERSIONS = {
  crios: '158.0.8127.35',
  chrome: '158.0.8127.35',
  fxios: '144.0',
  firefox: '144.0',
  edgios: '146.0.3250.70',
  edga: '146.0.3250.70',
  edg: '146.0.3250.70',
  safari: '27.2'
};

function major(version) {
  const value = Number(String(version || '').split('.')[0]);
  return Number.isFinite(value) ? value : 0;
}

function bumpToken(ua, token, version) {
  const pattern = new RegExp(`${token}/(\\d+(?:\\.\\d+)*)`, 'i');
  const found = ua.match(pattern);
  if (!found || major(found[1]) >= major(version)) return ua;
  return ua.replace(pattern, `${token}/${version}`);
}

export function refreshUserAgent(ua) {
  let next = String(ua || '');
  if (!next) return next;
  next = bumpToken(next, 'CriOS', BUNDLED_VERSIONS.crios);
  next = bumpToken(next, 'Chrome', BUNDLED_VERSIONS.chrome);
  next = bumpToken(next, 'FxiOS', BUNDLED_VERSIONS.fxios);
  next = bumpToken(next, 'Firefox', BUNDLED_VERSIONS.firefox);
  next = bumpToken(next, 'EdgiOS', BUNDLED_VERSIONS.edgios);
  next = bumpToken(next, 'EdgA', BUNDLED_VERSIONS.edga);
  next = bumpToken(next, 'Edg', BUNDLED_VERSIONS.edg);
  if (/Safari/i.test(next) && !/Chrome|Chromium|CriOS|Edg/i.test(next)) {
    const found = next.match(/Version\/(\d+(?:\.\d+)*)/);
    if (found && major(found[1]) < major(BUNDLED_VERSIONS.safari)) {
      next = next.replace(/Version\/\d+(?:\.\d+)*/, `Version/${BUNDLED_VERSIONS.safari}`);
    }
  }
  return next;
}

export function badgeFor(ua, category) {
  const value = String(ua || '');
  if (/iPhone|iPad|iPod/i.test(value)) return 'iOS';
  if (/Android/i.test(value)) return 'And';
  if (category === 'gaming' || /PlayStation|Xbox|Nintendo/i.test(value)) return 'Game';
  if (category === 'tablet' || /Tablet/i.test(value)) return 'Tab';
  if (/Macintosh|Mac OS X/i.test(value)) return 'Mac';
  if (/Linux|X11|CrOS/i.test(value)) return 'Lin';
  if (/Windows/i.test(value)) return 'Win';
  return 'UA';
}

export function screenFor(ua, category) {
  const value = String(ua || '');
  if (value.includes('Surface Duo')) return { width: 540, height: 720, colorDepth: 24, pixelDepth: 24, devicePixelRatio: 2.5 };
  const tablet = /iPad|Tablet/i.test(value) || category === 'tablet';
  const mobile = /iPhone|Mobile|Android/i.test(value) && !tablet;
  if (mobile) return { width: 393, height: 852, colorDepth: 30, pixelDepth: 30, devicePixelRatio: 3 };
  if (tablet) return { width: 1024, height: 1366, colorDepth: 24, pixelDepth: 24, devicePixelRatio: 2 };
  return { width: 1920, height: 1080, colorDepth: 24, pixelDepth: 24, devicePixelRatio: 1 };
}

export function webglFor(ua) {
  const value = String(ua || '');
  if (/iPhone|iPad|Macintosh|Mac OS X/i.test(value)) return { vendor: 'Apple Inc.', renderer: 'Apple M5 GPU' };
  if (/Android/i.test(value)) return { vendor: 'Qualcomm', renderer: 'Adreno (TM) 830' };
  return { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 5090 Direct3D11 vs_5_0 ps_5_0, D3D11)' };
}

export function webgpuFor(ua) {
  const gl = webglFor(ua);
  if (/Apple/i.test(gl.vendor)) return { vendor: 'apple', architecture: 'metal', device: '', description: gl.renderer };
  if (/Qualcomm/i.test(gl.vendor)) return { vendor: 'qualcomm', architecture: 'adreno', device: '', description: gl.renderer };
  return { vendor: 'nvidia', architecture: 'lovelace', device: '', description: gl.renderer };
}

function hardwareFor(ua) {
  const value = String(ua || '');
  if (/iPhone|iPad/i.test(value)) return { cores: 6, memory: 8 };
  if (/Android/i.test(value)) return { cores: 8, memory: 8 };
  if (/PlayStation|Xbox/i.test(value)) return { cores: 8, memory: 16 };
  if (/Macintosh|Mac OS X/i.test(value)) return { cores: 8, memory: 16 };
  return { cores: 8, memory: 16 };
}

export function buildBundle(ua, category = 'desktop') {
  const value = String(ua || '').trim();
  if (!value) return null;
  const screen = screenFor(value, category);
  const hardware = hardwareFor(value);
  const tablet = category === 'tablet' || /iPad|Tablet/i.test(value);
  const mobile = tablet || (/iPhone|Android|Mobile/i.test(value));
  const languages = ['en-US', 'en'];
  return {
    ua: value,
    category: category || 'desktop',
    screen,
    webgl: webglFor(value),
    webgpu: webgpuFor(value),
    cores: hardware.cores,
    memory: hardware.memory,
    touchPoints: mobile ? 5 : 0,
    languages,
    acceptLanguage: 'en-US,en;q=0.9',
    voices: [{ name: 'Samantha', lang: 'en-US', default: true }, { name: 'Alex', lang: 'en-US', default: false }],
    keyboard: [['KeyA', 'a'], ['KeyB', 'b'], ['Space', ' '], ['Enter', '\n']],
    peripherals: mobile ? 'none' : 'native',
    coverWorkers: true,
    badge: badgeFor(value, category)
  };
}

export function contradictions(ua, settings = {}) {
  const notes = [];
  const value = String(ua || '');
  const phone = /iPhone|Android/i.test(value) && !/iPad|Tablet/i.test(value);
  const desktop = /Windows|Macintosh|Mac OS X|Linux|X11/i.test(value) && !phone;
  const screen = settings.screen;
  if (phone && screen && screen.width >= 1200) notes.push('Phone user agent with a desktop-sized screen.');
  if (desktop && settings.touchEnabled && Number(settings.touchPoints) > 0) notes.push('Desktop user agent with touch points turned on.');
  if (phone && settings.touchEnabled === false) notes.push('Phone user agent is not reporting touch.');
  if (settings.languages && settings.languages[0] && settings.timezone && /Tokyo|Japan/.test(settings.timezone) && !String(settings.languages[0]).startsWith('ja')) {
    notes.push('Japan location with a non-Japanese language.');
  }
  if (!settings.matched) notes.push('Match profile to apply screen, GPU, language, and worker values.');
  return notes;
}

export function workerPrelude(bundle) {
  const payload = JSON.stringify({
    ua: bundle && bundle.ua || '',
    cores: bundle && bundle.cores || 0,
    memory: bundle && bundle.memory || 0,
    languages: bundle && bundle.languages || []
  });
  return `try{const s=${payload};const proto=self.WorkerNavigator&&WorkerNavigator.prototype;if(proto){if(s.ua){Object.defineProperty(proto,'userAgent',{get:function(){return s.ua;},configurable:true});Object.defineProperty(proto,'appVersion',{get:function(){return String(s.ua).replace(/^Mozilla\\//,'');},configurable:true});}if(s.languages&&s.languages.length){Object.defineProperty(proto,'language',{get:function(){return s.languages[0];},configurable:true});Object.defineProperty(proto,'languages',{get:function(){return s.languages.slice();},configurable:true});}if(s.cores)Object.defineProperty(proto,'hardwareConcurrency',{get:function(){return s.cores;},configurable:true});if(s.memory)Object.defineProperty(proto,'deviceMemory',{get:function(){return s.memory;},configurable:true});}}catch(e){}\n`;
}

export function cosmeticRule(domain, selector) {
  let host = String(domain || '').trim().toLowerCase().replace(/^\*\./, '');
  try { if (host.includes('://')) host = new URL(host).hostname; } catch { return null; }
  host = host.replace(/\/.*$/, '');
  if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(host)) return null;
  const sel = String(selector || '').trim();
  if (sel.length < 2 || sel.length > 200 || /[{}<>\\\n]|url\s*\(|expression\s*\(|@import/i.test(sel)) return null;
  return { domain: host, selector: sel };
}

const api = { BUNDLED_VERSIONS, refreshUserAgent, badgeFor, screenFor, webglFor, webgpuFor, buildBundle, contradictions, workerPrelude, cosmeticRule };
globalThis.MorphIdentity = api;
