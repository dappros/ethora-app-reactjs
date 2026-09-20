// Runtime configuration hook. Loaded by index.html before the app bundle.
//
// In source-mode installs this file is served as-is: every value comes from
// the VITE_* env the bundle was built with, and this object stays empty.
//
// In image-mode installs the container entrypoint overwrites this file with
// the VITE_* values from its environment, so one prebuilt bundle serves any
// domain. Keys mirror src/config/env.ts; an empty string never overrides a
// build-time value.
window.__ETHORA_CONFIG__ = window.__ETHORA_CONFIG__ || {};
