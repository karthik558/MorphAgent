const origToString = Function.prototype.toString;
Function.prototype.toString = function() {
  if (this.name === 'getCurrentPosition') return `function getCurrentPosition() { [native code] }`;
  return origToString.call(this);
};
function getCurrentPosition() {}
console.log(getCurrentPosition.toString());
