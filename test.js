// simulate the stringification
const evt = { detail: JSON.stringify({ geoSpoofEnabled: true }) };
console.log(JSON.parse(evt.detail));
