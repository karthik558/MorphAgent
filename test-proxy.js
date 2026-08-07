const orig = function myNativeFn() {};
const proxy = new Proxy(orig, {
  apply(target, thisArg, args) {
    return Reflect.apply(target, thisArg, args);
  }
});
console.log(proxy.toString());
