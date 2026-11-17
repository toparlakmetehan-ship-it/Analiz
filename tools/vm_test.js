const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

// Extract script content or test with jsdom / vm
const vm = require('vm');

// Mock DOM
const domContext = {
  console: console,
  document: {
    getElementById: () => null,
    querySelectorAll: () => []
  },
  window: {},
  fetch: () => Promise.resolve({ ok: true, json: () => ({}) }),
  Set: Set,
  Map: Map,
  Math: Math,
  parseInt: parseInt,
  parseFloat: parseFloat,
  isNaN: isNaN,
  Object: Object,
  Array: Array,
  Number: Number,
  String: String
};

// Find the large <script> tag in index.html
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  const code = scriptMatch[1];
  try {
    vm.createContext(domContext);
    // Execute helper functions
    vm.runInContext(code, domContext);
    console.log('Script loaded successfully!');
  } catch(e) {
    console.log('VM load warning:', e.message);
  }
}
