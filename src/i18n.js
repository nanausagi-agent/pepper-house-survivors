// Lightweight i18n — dictionary lookup with fallback
let dict = {};
let loaded = false;

export function setDictionary(data) {
  dict = data || {};
  loaded = true;
}

export function t(key, params) {
  let str = dict[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}

export function isLoaded() {
  return loaded;
}
