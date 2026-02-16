# Primux

**Primux** is a lightweight, modern, and well-structured JavaScript utility library that extends JavaScript’s standard capabilities.  
It provides reusable helper functions for **functions, arrays, objects, strings, numbers, DOM, browser APIs, and more** — all in one clean package.

Primux works in **both Browser and Node.js environments**, with proper ESM and CommonJS support.

---

## Features

- Modern **ESM** and **CommonJS** support
- Works in **Browser** and **Node.js**
- Modular utility collection (use only what you need)
- Safe environment checks (DOM APIs won’t crash Node)
- Canvas, DOM, and Web API helpers included
- Zero dependencies
- Well-tested and predictable behavior

---

## Installation

```bash
# Using npm
npm install primux
```

## Usage

### Node.js

**CommonJS:**

```js
const _p = require("primux");

console.log(_p.uppercaseWords("hello world")); // "Hello World"
```

**ESM:**

```js
import _p from "primux";
import { uppercaseWords } from "primux";
console.log(uppercaseWords("hello world")); // "Hello World"
```

```html
<!-- Browser Usage (CDN) -->

<!-- Minified version -->
<script src="https://cdn.jsdelivr.net/gh/JishithMP-Dev/primux@v1.0.0/primux.min.js"></script>

<!-- Full version -->
<script src="https://cdn.jsdelivr.net/gh/JishithMP-Dev/primux@v1.0.0/primux.js"></script>

<!-- ESM versions -->
<script type="module" src="https://cdn.jsdelivr.net/gh/JishithMP-Dev/primux@v1.0.0/primux.esm.js"></script>
<script type="module" src="https://cdn.jsdelivr.net/gh/JishithMP-Dev/primux@v1.0.0/primux.esm.min.js"></script>

<!-- Usage in Browser with global _p -->
<script>
  // _p is available globally if using non-ESM script
  console.log(_p.uppercaseWords("hello world")); // "Hello World"
</script>

<!-- Usage in Browser with ESM imports -->
<script type="module">
  // Default import
  import _p from "https://cdn.jsdelivr.net/gh/JishithMP-Dev/primux@v1.0.0/primux.esm.min.js";
  console.log(_p.uppercaseWords("hello world")); // "Hello World"

  // Named import
  import { uppercaseWords } from "https://cdn.jsdelivr.net/gh/JishithMP-Dev/primux@v1.0.0/primux.esm.min.js";
  console.log(uppercaseWords("hello world")); // "Hello World"
</script>
```

## Documentation

You can read the full Primux documentation and see all available utilities at:  
[https://primux-dev.web.app](https://primux-dev.web.app)

You can also download the local files (primux.js, primux.min.js, primux.esm.js, primux.esm.min.js) directly from the website for offline use.

---

## Conclusion

Primux is a lightweight and comprehensive JavaScript utility library designed to make your development faster and more efficient.  
It works seamlessly in **Node.js** and **Browser environments**, provides **ESM and CommonJS support**, and includes a wide range of helpers for **arrays, strings, objects, numbers, DOM, and Web APIs**.  

With zero dependencies and predictable behavior, Primux is ready to be integrated into any project — whether for small scripts or large applications.
