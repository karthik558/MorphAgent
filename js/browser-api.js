// Firefox's browser namespace is Promise-only; older UI code also uses callbacks.
// Adapt only asynchronous methods used by the UI, leaving events and sync APIs intact.
(() => {
  if (!globalThis.browser) { globalThis.morphApi = globalThis.chrome; return; }
  const asyncMethods = new Set(['get', 'set', 'remove', 'clear', 'query', 'create', 'update',
    'reload', 'sendMessage', 'openOptionsPage', 'getCurrent', 'getAll', 'executeScript']);
  const cache = new WeakMap();
  function adapt(object) {
    if (cache.has(object)) return cache.get(object);
    const proxy = new Proxy(object, {
      get(target, key) {
        const value = target[key];
        if (value && typeof value === 'object') return adapt(value);
        if (typeof value !== 'function') return value;
        if (!asyncMethods.has(key)) return value.bind(target);
        return (...args) => {
          const callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
          const result = Promise.resolve().then(() => value.apply(target, args));
          if (callback) result.then(callback, error => console.warn('[MorphAgent]', error));
          return result;
        };
      }
    });
    cache.set(object, proxy);
    return proxy;
  }
  globalThis.morphApi = adapt(globalThis.browser);
})();
