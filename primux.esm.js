/**
 * ─────────────────────────────────────────────────────────────
 *  Primux — JavaScript Extensions
 * ─────────────────────────────────────────────────────────────
 *
 * File: primux.esm.js
 *
 * Description:
 *  A collection of reusable and well-tested utility functions
 *  that extend JavaScript’s standard capabilities by providing
 *  commonly needed operations not available natively.
 *
 * @package    primux
 * @author     Jishith M P
 * @copyright  © 2026 Jishith
 * @license    MIT
 *
 * @repository https://github.com/yourname/primux
 *
 * Created:       04-02-2026
 * Last Modified: 16-02-2026
 *
 * ─────────────────────────────────────────────────────────────
 */

// __________________________________
// * Primux – Internal Helpers
// __________________________________


function createType(typeName, message, validator) {
  let value = undefined;
  
  function validate(v) {
    if (!validator(v)) {
      throw new TypeError(message);
    }
  }
  
  return function(initialValue) {
    if (arguments.length > 0) {
      validate(initialValue);
      value = initialValue;
    }
    
    return {
      get() {
        return value;
      },
      
      set(newValue) {
        validate(newValue);
        value = newValue;
      },
      
      clear() {
        value = undefined;
      },
      
      type() {
        return typeName;
      }
    };
  };
}

function resolveStorage(type, fn) {
  if (type === "local") return localStorage;
  if (type === "session") return sessionStorage;
  throw new Error(`Primux/${fn}: type must be "local" or "session". Default is "local".`);
}

function typeOf(v) {
  if (v === null) return "null";
  if (Number.isNaN(v)) return "NaN";
  if (Array.isArray(v)) return "array";
  if (typeof window !== 'undefined' && typeof Element !== 'undefined') {
    if (v instanceof Element) return "dom";
  }
  
  if (v instanceof RegExp) return "RegExp";
  return typeof v;
}
function guard(fn, values, schema) {
  const params = Object.keys(schema).join(", ");
  
  for (const key in schema) {
    const rule = schema[key];
    const value = values[key];
    
    const optional = rule.endsWith("?");
    const expected = optional ? rule.slice(0, -1) : rule;
    
    if (value === undefined) {
      if (optional) continue;
      throw new TypeError(
        `Primux/${fn}(${params}): parameter "${key}" is required`
      );
    }
    
    if (expected === "any") continue;
    
    const actual = typeOf(value);
    const allowed = expected.split("|");
    
    if (!allowed.includes(actual)) {
      throw new TypeError(
        `Primux/${fn}(${params}): parameter "${key}" expected ${expected}, received ${actual}`
      );
    }
  }
}

function ensureDOM(fnName) {
  if (typeof document === "undefined") {
    throw new Error(`Primux/${fnName}(): DOM is not available in this environment!`);
  }
}

function stableHash(value) {
  if (value === null) return "null";
  if (typeof value !== "object") return typeof value + ":" + String(value);
  
  if (Array.isArray(value)) {
    return "array:[" + value.map(stableHash).join(",") + "]";
  }
  
  const keys = Object.keys(value).sort();
  const entries = keys.map(k => `${k}:${stableHash(value[k])}`);
  return "object:{" + entries.join(",") + "}";
}

function decimalPlaces(num) {
  const match = String(num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
  if (!match) return 0;
  
  const decimals = match[1] ? match[1].length : 0;
  const exponent = match[2] ? parseInt(match[2], 10) : 0;
  
  return Math.max(0, decimals - exponent);
}

function normalizeToArray(input, fnName) {
  if (input == null) throw new TypeError(`Primux/${fnName}: expected input, got ${input}`);
  
  if (input instanceof HTMLElement) return [input];
  
  if (NodeList.prototype.isPrototypeOf(input) || HTMLCollection.prototype.isPrototypeOf(input)) {
    if (input.length === 0) throw new RangeError(`Primux/${fnName}: element collection must not be empty`);
    return Array.from(input);
  }
  
  if (Array.isArray(input)) {
    if (input.length === 0) throw new RangeError(`Primux/${fnName}: array must not be empty`);
    const arr = input.flat(Infinity);
    return arr;
  }
  
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed === "") throw new RangeError(`Primux/${fnName}: string must not be empty`);
    return [trimmed];
  }
  
  throw new TypeError(
    `Primux/${fnName}: expected HTMLElement, NodeList, HTMLCollection, array, or string`
  );
}

function checkChar(c, fn) {
  if (typeof c !== "string" || c.length !== 1) {
    throw new TypeError(
      `Primux/${fn}(str, char): expected a single-character string`
    );
  }
}

function getDuration(duration) {
  return typeof duration === "number" ? duration : 300;
}

/**
 * Deep equality (internal use only)
 */
function deepEqual(a, b) {
  return stableHash(a) === stableHash(b);
}

function guardNegativeNumber(length, fn) {
  if (length < 0) {
    throw new RangeError(`Primux/${fn}: value must not be negative`);
  }
}

/**
 * Primux
 * A comprehensive JavaScript utility library by Jishith M P
 */


// ___________________________________
// * Primux - String utlity functions
// ___________________________________ 

  function uppercaseWords(str) {
    guard("uppercaseWords", { str }, { str: "string" });
    return str ? str.trim().split(/\s+/).map(w => w[0].toUpperCase() + w.slice(1))
      .join(" ") : "";
  }
  
  function lowercaseWords(str) {
    guard("lowercaseWords", { str }, { str: "string" });
    return str ? str.trim().split(/\s+/).map(w => w[0].toLowerCase() + w.slice(1))
      .join(" ") : "";
  }
  
  function truncate(str, length, ellipsis = "...") {
    guard("truncate", { str, length, ellipsis }, { str: "string", length: "number", ellipsis: "string?" });
    if (!str || !length) return "";
    guardNegativeNumber(length, "truncate(str, length, ellipsis?)");
    if (str.length <= length) return str;
    return str.slice(0, length) + ellipsis;
  }
  
  function uppercaseChar(char) {
    guard("uppercaseChar", { char }, { char: "string" });
    if (!char) return "";
    checkChar(char, "uppercaseChar(char)");
    return char.toUpperCase();
  }
  
  function lowercaseFirstChar(str) {
    guard("lowercaseFirstChar", { str }, { str: "string" });
    if (!str) return "";
    const chars = Array.from(str);
    chars[0] = chars[0].toLowerCase();
    return chars.join("");
  }
  
  function uppercaseFirstChar(str) {
    guard("uppercaseFirstChar", { str }, { str: "string" });
    if (!str) return "";
    const chars = Array.from(str);
    chars[0] = chars[0].toUpperCase();
    return chars.join("");
  }
  
  function lowercaseChar(char) {
    guard("lowercaseChar", { char }, { char: "string" });
    if (!char) return "";
    checkChar(char, "lowercaseChar(char)");
    return char.toLowerCase();
  }
  
  function slugify(str) {
    guard("slugify", { str }, { str: "string" });
    
    if (!str) return "";
    
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  
  function stripHtml(html) {
    guard("stripHtml", { html }, { html: "string" });
    
    if (typeof document !== "undefined") {
      const div = createElement("div", { html: html })
      div.querySelectorAll("script, style").forEach(el => el.remove());
      return div.textContent || "";
    }
    
    return html ? html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, "") :
      "";
  }
  
  function escapeHtml(html) {
    guard("escapeHtml", { html }, { html: "string" });
    return html ? html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;") : "";
  }
  
  function countOccurrences(str, s) {
    guard("countOccurrences", { str, s }, { str: "string", s: "string" });
    
    if (!s || !str) return 0;
    
    let count = 0;
    let pos = 0;
    
    while ((pos = str.indexOf(s, pos)) !== -1) {
      count++;
      pos += s.length;
    }
    
    return count;
  }
  
  
  function reverseString(str) {
    guard("reverseString", { str }, { str: "string" });
    
    return str ? Array.from(str).reverse().join("") : "";
  }
  
  function padCenter(str, length, pad = " ") {
    guard("padCenter", { str, length, pad }, { str: "string", length: "number", pad: "string?" });
    
    guardNegativeNumber(length, "padCenter(str, length, pad?)");
    
    if (!pad) {
      throw new TypeError("Primux/padCenter: pad must be non-empty");
    }
    
    const strLen = str.length;
    if (strLen >= length) return str;
    
    const totalPad = length - strLen;
    const left = Math.floor(totalPad / 2);
    const right = totalPad - left;
    
    const makePad = (n) =>
      pad.repeat(Math.ceil(n / pad.length)).slice(0, n);
    
    return makePad(left) + str + makePad(right);
  }
  
  function removeAccent(str) {
    guard("removeAccent", { str }, { str: "string" });
    
    return str ? str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") : "";
  }
  
  function isPalindrome(str) {
    guard("isPalindrome", { str }, { str: "string" });
    
    const cleaned = str ? str
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]/gu, "") : "";
    
    return cleaned === Array.from(cleaned).reverse().join("");
  }
  
  // ___________________________________
  // * Primux - Array utlity functions
  // ___________________________________
  
  function first(array) {
    guard("first", { array }, { array: "array" });
    return array.length === 0 ? undefined : array[0];
  }
  
  function last(array) {
    guard("last", { array }, { array: "array" });
    return array.length === 0 ? undefined : array[array.length - 1];
  }
  
  function atSafe(array, index) {
    guard("atSafe", { array, index }, { array: "array", index: "number" });
    
    const len = array.length;
    const i = index < 0 ? len + index : index;
    
    if (i < 0 || i >= len) {
      return { value: undefined, exists: false };
    }
    
    return { value: array[i], exists: true }
  }
  
  function sum(array) {
    guard("sum", { array }, { array: "array" });
    let total = 0;
    
    for (let i = 0; i < array.length; i++) {
      const v = array[i];
      
      if (typeof v === "number" && Number.isFinite(v)) {
        total += v;
      }
    }
    
    return total;
  }
  
  function average(array) {
    guard("average", { array }, { array: "array" });
    let total = 0;
    let count = 0;
    
    for (let i = 0; i < array.length; i++) {
      const v = array[i];
      
      if (typeof v === "number" && Number.isFinite(v)) {
        total += v;
        count++
      }
    }
    
    return count === 0 ? undefined : total / count;
  }
  
  function min(array) {
    guard("min", { array }, { array: "array" });
    let min;
    
    for (let i = 0; i < array.length; i++) {
      const v = array[i];
      
      if (typeof v === "number" && Number.isFinite(v)) {
        if (min === undefined || v < min) {
          min = v;
        }
      }
    }
    
    return min;
  }
  
  function max(array) {
    guard("max", { array }, { array: "array" });
    let max;
    
    for (let i = 0; i < array.length; i++) {
      const v = array[i];
      
      if (typeof v === "number" && Number.isFinite(v)) {
        if (max === undefined || v > max) {
          max = v;
        }
      }
    }
    
    return max;
  }
  
  function range(array) {
    guard("range", { array }, { array: "array" });
    let max;
    let min;
    
    for (let i = 0; i < array.length; i++) {
      const v = array[i];
      
      if (typeof v === "number" && Number.isFinite(v)) {
        if (max === undefined || v > max) {
          max = v;
        }
        
        if (min === undefined || v < min) {
          min = v;
        }
      }
    }
    
    return max === undefined || min === undefined ? undefined : max - min;
  }
  
  function median(array) {
    guard("median", { array }, { array: "array" });
    const nums = array.filter(v => typeof v === "number" && Number.isFinite(v));
    
    if (nums.length === 0) return undefined;
    
    nums.sort((a, b) => a - b);
    
    const mid = Math.floor(nums.length / 2);
    
    if (nums.length % 2 === 0) {
      return (nums[mid - 1] + nums[mid]) / 2;
    } else {
      return nums[mid];
    }
  }
  
  function unique(array) {
    guard("unique", { array }, { array: "array" });
    
    const seen = new Map();
    const result = [];
    
    for (const v of array) {
      const key = stableHash(v);
      if (!seen.has(key)) {
        seen.set(key, true);
        result.push(v);
      }
    }
    
    return result;
  }
  
  function duplicates(array) {
    guard("duplicates", { array }, { array: "array" });
    
    const count = new Map();
    const originals = new Map();
    const result = [];
    
    for (const v of array) {
      const key = stableHash(v);
      
      if (!count.has(key)) {
        originals.set(key, v);
        count.set(key, 1);
      } else {
        count.set(key, count.get(key) + 1);
      }
    }
    
    for (const [key, c] of count.entries()) {
      if (c > 1) {
        result.push(originals.get(key));
      }
    }
    
    return result;
  }
  
  function count(array, value) {
    guard("count", { array, value }, { array: "array", value: "any?" });
    
    if (value !== undefined) {
      const key = stableHash(value);
      let total = 0;
      
      for (const v of array) {
        if (stableHash(v) === key) total++;
      }
      
      return total;
    }
    
    const result = new Map();
    
    for (const v of array) {
      const key = stableHash(v);
      result.set(key, (result.get(key) || 0) + 1);
    }
    
    return result;
  }
  
  function containsAll(array, other) {
    guard("containsAll", { array, other }, { array: "array", other: "array" });
    
    const map = new Map();
    
    for (const v of array) {
      map.set(stableHash(v), true);
    }
    
    for (const v of other) {
      if (!map.has(stableHash(v))) {
        return false;
      }
    }
    
    return true;
  }
  
  
  function intersection(array, other, options = {}) {
    guard("intersection", { array, other, options }, { array: "array", other: "array", options: "object?" });
    
    const { unique = false } = options;
    
    const map = new Map();
    const result = [];
    const seen = new Set();
    
    for (const v of other) {
      map.set(stableHash(v), true);
    }
    
    for (const v of array) {
      const h = stableHash(v);
      
      if (map.has(h)) {
        if (unique) {
          if (!seen.has(h)) {
            result.push(v);
            seen.add(h);
          }
        } else {
          result.push(v);
        }
      }
    }
    
    return result;
  }
  
  function union(array, other) {
    guard("union", { array, other }, { array: "array", other: "array" });
    
    const result = [];
    const seen = new Map();
    
    for (const v of [...array, ...other]) {
      const key = stableHash(v);
      
      if (!seen.has(key)) {
        seen.set(key, true);
        result.push(v);
      }
    }
    
    return result;
  }
  
  function remove(array, value) {
    guard("remove", { array }, { array: "array" });
    if (arguments.length < 2) {
      throw new TypeError("Primux/remove(array, value): parameter \"value\" is required");
    }
    return array.filter(v => !deepEqual(v, value));
  }
  
  function swap(array, fIndex, sIndex) {
    guard("swap", { array, fIndex, sIndex }, { array: "array", fIndex: "number", sIndex: "number" });
    if (fIndex < 0 || fIndex >= array.length || sIndex < 0 || sIndex >= array.length) {
      throw new RangeError("swap(array, i, j): index out of bounds");
    }
    const newArr = [...array];
    const temp = newArr[fIndex];
    newArr[fIndex] = newArr[sIndex];
    newArr[sIndex] = temp;
    
    return newArr;
  }
  
  function clear(array) {
    guard("clear", { array }, { array: "array" });
    array.splice(0, array.length);
  }
  
  function chunk(array, size) {
    guard("chunk", { array, size }, { array: "array", size: "number" });
    const result = [];
    if (size <= 0) {
      throw new RangeError("Primux/chunk: size must be greater than 0");
    }
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    
    return result;
  }
  
  function zip(...arrays) {
    
    arrays.forEach(a => guard("zip", { a }, { a: "array" }));
    
    const result = [];
    const minLength = Math.min(...arrays.map(a => a.length));
    
    for (let i = 0; i < minLength; i++) {
      result.push(arrays.map(a => a[i]));
    }
    
    return result;
  }
  
  function flattenDeep(array) {
    guard("flattenDeep", { array }, { array: "array" });
    
    const result = [];
    const stack = [...array];
    
    while (stack.length) {
      const value = stack.pop();
      if (Array.isArray(value)) {
        stack.push(...value);
      } else {
        result.push(value);
      }
    }
    
    return result.reverse();
  }
  
  function flattenTo(array, depth = 1) {
    guard("flattenTo", { array, depth }, { array: "array", depth: "number?" });
    if (depth < 0) depth = 0;
    const result = [];
    
    const deep = (arr, currentDepth) => {
      arr.forEach(item => {
        if (Array.isArray(item) && currentDepth < depth) {
          deep(item, currentDepth + 1);
        } else {
          result.push(item);
        }
      });
    };
    
    deep(array, 0);
    return result;
  }
  
  function sortAsc(array, comparator) {
    guard("sortAsc", { array, comparator }, { array: "array", comparator: "function?" });
    
    if (typeof comparator === "function") return [...array].sort(comparator);
    
    return [...array].sort((a, b) => {
      const toNumber = v => (typeof v === "boolean" ? (v ? 1 : 0) : v);
      
      if (typeof a === "number" && typeof b === "number") return a - b;
      if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
      
      return toNumber(a) - toNumber(b);
    });
  }
  
  function sortDesc(array, comparator) {
    guard("sortDesc", { array, comparator }, { array: "array", comparator: "function?" });
    
    if (typeof comparator === "function") {
      return [...array].sort((a, b) => comparator(b, a));
    }
    
    return [...array].sort((a, b) => {
      const toNumber = v => (typeof v === "boolean" ? (v ? 1 : 0) : v);
      
      if (typeof a === "number" && typeof b === "number") return b - a;
      if (typeof a === "string" && typeof b === "string") return b.localeCompare(a);
      
      return toNumber(b) - toNumber(a);
    });
  }
  
  function shuffle(array) {
    guard("shuffle", { array }, { array: "array" });
    
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  
  function sample(array, count = 1) {
    guard("sample", { array, count }, { array: "array", count: "number?" });
    
    if (array.length === 0) return undefined;
    if (count > array.length) {
      throw new RangeError("Primux/sample: count exceeds array length");
    }
    
    const shuffled = shuffle(array);
    return shuffled.slice(0, count);
  }
  
  function compact(array) {
    guard("compact", { array }, { array: "array" });
    return array.filter(v => Boolean(v));
  }
  
  // _________________________________
  // * Primux - general utility functions
  // _________________________________
  
  function isEmpty(collection) {
    guard("isEmpty", { collection }, { collection: "array|object" });
    
    return Array.isArray(collection) ?
      collection.length === 0 :
      Object.keys(collection).length === 0;
  }
  
  function isNotEmpty(collection) {
    return !isEmpty(collection);
  }
  
  function deepClone(value, seen = new WeakMap()) {
    if (value === null || typeof value !== "object") return value;
    if (seen.has(value)) return seen.get(value);
    
    if (value instanceof Date) return new Date(value);
    if (value instanceof RegExp) return new RegExp(value.source, value.flags);
    
    if (value instanceof Map) {
      const result = new Map();
      seen.set(value, result);
      value.forEach((v, k) => {
        result.set(deepClone(k, seen), deepClone(v, seen));
      });
      return result;
    }
    
    if (value instanceof Set) {
      const result = new Set();
      seen.set(value, result);
      value.forEach(v => result.add(deepClone(v, seen)));
      return result;
    }
    
    if (Array.isArray(value)) {
      const result = [];
      seen.set(value, result);
      value.forEach((v, i) => result[i] = deepClone(v, seen));
      return result;
    }
    
    const result = Object.create(Object.getPrototypeOf(value));
    seen.set(value, result);
    
    for (const key of Reflect.ownKeys(value)) {
      const desc = Object.getOwnPropertyDescriptor(value, key);
      
      if ("value" in desc) {
        desc.value = deepClone(desc.value, seen);
      }
      
      Object.defineProperty(result, key, desc);
    }
    
    return result;
  }
  
  function random(p1, p2, precision = 0) {
    
    // ARRAY MODE
    if (Array.isArray(p1)) {
      guard("random", { p1 }, { p1: "array" });
      
      if (p1.length === 0) return undefined;
      
      const index = Math.floor(Math.random() * p1.length);
      return p1[index];
    }
    
    // NUMBER MODE
    guard("random", { p1, p2, precision }, {
      p1: "number",
      p2: "number",
      precision: "number?"
    });
    
    let min = p1;
    let max = p2;
    
    if (min > max)[min, max] = [max, min];
    
    if (precision > 0) {
      const rand = Math.random() * (max - min) + min;
      return Number(rand.toFixed(precision));
    }
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // __________________________________
  // * Primux - Object utlity functions
  // __________________________________
  
  /* ---------- Basics ---------- */
  
  function keysArray(obj) {
    guard("keysArray", { obj }, { obj: "object" });
    return Reflect.ownKeys(obj);
  }
  
  function valuesArray(obj) {
    guard("valuesArray", { obj }, { obj: "object" });
    return Reflect.ownKeys(obj).map(k => obj[k]);
  }
  
  function entriesArray(obj) {
    guard("entriesArray", { obj }, { obj: "object" });
    return Reflect.ownKeys(obj).map(k => [k, obj[k]]);
  }
  
  function keysLength(obj) {
    guard("keysLength", { obj }, { obj: "object" });
    return Reflect.ownKeys(obj).length;
  }
  
  function has(obj, key) {
    guard("has", { obj, key }, { obj: "object", key: "string|symbol" });
    return Object.prototype.hasOwnProperty.call(obj, key);
  }
  
  /* ---------- Deep Merge ---------- */
  function deepMerge(target, source, seen = new WeakMap()) {
    guard("deepMerge", { target, source }, { target: "object?", source: "object" });
    
    if (source === null || typeof source !== "object") {
      return source;
    }
    
    if (target === null || typeof target !== "object") {
      return deepClone(source);
    }
    
    // Get inner map for this target
    let innerMap = seen.get(target);
    if (innerMap && innerMap.has(source)) {
      return innerMap.get(source);
    }
    
    const result = Array.isArray(source) ? [] :
      Object.create(Object.getPrototypeOf(source));
    
    // Register pair BEFORE recursion
    if (!innerMap) {
      innerMap = new WeakMap();
      seen.set(target, innerMap);
    }
    innerMap.set(source, result);
    
    // Copy target first
    for (const key of Reflect.ownKeys(target)) {
      result[key] = target[key];
    }
    
    // Merge source
    for (const key of Reflect.ownKeys(source)) {
      const sVal = source[key];
      const tVal = result[key];
      
      if (
        sVal &&
        typeof sVal === "object"
      ) {
        result[key] = deepMerge(tVal, sVal, seen);
      } else {
        result[key] = sVal;
      }
    }
    
    return result;
  }
  
  function mergeAll(...objects) {
    guard("mergeAll", { objects }, { objects: "array" });
    
    if (!objects.length) return {};
    
    const seen = new WeakMap();
    let result = {};
    
    for (const obj of objects) {
      result = deepMerge(result, obj, seen);
    }
    
    return result;
  }
  
  /* ---------- Pick / Omit ---------- */
  
  function pick(obj, keysArr) {
    guard("pick", { obj, keysArr }, { obj: "object", keysArr: "array" });
    
    const result = {};
    for (const key of keysArr) {
      if (typeof key !== "string" && typeof key !== "symbol")
        throw new TypeError("pick(): keys must be string or symbol");
      
      if (has(obj, key)) result[key] = obj[key];
    }
    
    return result;
  }
  
  function omit(obj, keysArr) {
    guard("omit", { obj, keysArr }, { obj: "object", keysArr: "array" });
    
    const result = deepClone(obj);
    
    for (const key of keysArr) {
      if (typeof key !== "string" && typeof key !== "symbol")
        throw new TypeError("omit(): keys must be string or symbol");
      
      delete result[key];
    }
    
    return result;
  }
  
  /* ---------- Mapping ---------- */
  
  function mapValues(obj, callback) {
    guard("mapValues", { obj, callback }, { obj: "object", callback: "function" });
    
    const result = {};
    for (const key of Reflect.ownKeys(obj)) {
      result[key] = callback(obj[key], key, obj);
    }
    return result;
  }
  
  function mapKeys(obj, callback) {
    guard("mapKeys", { obj, callback }, { obj: "object", callback: "function" });
    
    const result = {};
    for (const key of Reflect.ownKeys(obj)) {
      const newKey = callback(key, obj[key], obj);
      if (typeof newKey !== "string" && typeof newKey !== "symbol")
        throw new TypeError("mapKeys(): callback must return string or symbol");
      
      result[newKey] = obj[key];
    }
    return result;
  }
  
  function mapEntries(obj, callback) {
    guard("mapEntries", { obj, callback }, { obj: "object", callback: "function" });
    
    const result = {};
    for (const key of Reflect.ownKeys(obj)) {
      const [newKey, newValue] = callback(key, obj[key], obj);
      if (typeof newKey !== "string" && typeof newKey !== "symbol")
        throw new TypeError("mapEntries(): newKey must be string or symbol");
      
      result[newKey] = newValue;
    }
    return result;
  }
  
  function filterObj(obj, callback) {
    guard("filterObj", { obj, callback }, { obj: "object", callback: "function" });
    
    const result = {};
    for (const key of Reflect.ownKeys(obj)) {
      if (callback(obj[key], key, obj)) {
        result[key] = obj[key];
      }
    }
    return result;
  }
  
  /* ---------- Freeze ---------- */
  
  function deepFreeze(obj, seen = new WeakSet()) {
    if (obj === null || typeof obj !== "object" || seen.has(obj)) return obj;
    
    seen.add(obj);
    Object.freeze(obj);
    
    for (const key of Reflect.ownKeys(obj)) {
      deepFreeze(obj[key], seen);
    }
    
    return obj;
  }
  
  /* ---------- KeyBy / Invert ---------- */
  
  function keyBy(arr, cb) {
    guard("keyBy", { arr, cb }, { arr: "array", cb: "function" });
    
    const result = {};
    for (const item of arr) {
      const key = cb(item);
      if (typeof key !== "string" && typeof key !== "symbol" && typeof key !== "number")
        throw new TypeError("keyBy(): key must be string or symbol or number");
      
      result[key] = item;
    }
    return result;
  }
  
  function invert(obj) {
    guard("invert", { obj }, { obj: "object" });
    
    const result = {};
    for (const key of Reflect.ownKeys(obj)) {
      const value = obj[key];
      const newKey = typeof value === "symbol" ? value : String(value);
      result[newKey] = key;
    }
    return result;
  }
  
  
  
  
  // __________________________________
  // * Primux -  function utility functions
  // __________________________________
  
  /* ---------- Basic ---------- */
  
  function once(fn) {
    guard("once", { fn }, { fn: "function" });
    
    let called = false;
    let result;
    
    return function(...args) {
      if (!called) {
        called = true;
        result = fn.apply(this, args);
      }
      return result;
    };
  }
  
  function noop() {}
  
  function identity(value) {
    return value;
  }
  
  /* ---------- Control ---------- */
  
  function debounce(fn, delay, options = {}) {
    guard("debounce", { fn, delay, options }, {
      fn: "function",
      delay: "number",
      options: "object?"
    });
    
    let timerId;
    let lastCall = 0;
    const { leading = false, trailing = true } = options;
    
    return function(...args) {
      const context = this;
      const now = Date.now();
      
      if (leading && now - lastCall > delay) {
        fn.apply(context, args);
        lastCall = now;
      }
      
      clearTimeout(timerId);
      
      if (trailing) {
        timerId = setTimeout(() => {
          if (!leading || now - lastCall >= delay) {
            fn.apply(context, args);
            lastCall = Date.now();
          }
        }, delay);
      }
    };
  }
  
  function throttle(fn, delay) {
    guard("throttle", { fn, delay }, {
      fn: "function",
      delay: "number"
    });
    
    let lastTime = 0;
    
    return function(...args) {
      const now = Date.now();
      
      if (now - lastTime >= delay) {
        lastTime = now;
        fn.apply(this, args);
      }
    };
  }
  
  /* ---------- Memoization ---------- */
  
  function memoize(fn, resolver) {
    guard("memoize", { fn, resolver }, {
      fn: "function",
      resolver: "function?"
    });
    
    const cache = new Map();
    
    return function(...args) {
      const key = resolver ?
        resolver(...args) :
        JSON.stringify(args);
      
      if (cache.has(key)) return cache.get(key);
      
      const result = fn.apply(this, args);
      cache.set(key, result);
      return result;
    };
  }
  
  /* ---------- Retry ---------- */
  
  function retry(fn, times) {
    guard("retry", { fn, times }, {
      fn: "function",
      times: "number"
    });
    if (times < 0) throw new RangeError("Primux/retry(fn, times): times should be a non-negative number");
    let attempts = 0;
    
    while (attempts < times) {
      try {
        return fn();
      } catch (err) {
        attempts++;
        if (attempts >= times) throw err;
      }
    }
  }
  
  async function retryAsync(fn, times) {
    guard("retryAsync", { fn, times }, {
      fn: "function",
      times: "number"
    });
    if (times < 0) throw new RangeError("Primux/retryAsync(fn, times): times should be a non-negative number");
    let attempts = 0;
    
    while (attempts < times) {
      try {
        return await fn();
      } catch (err) {
        attempts++;
        if (attempts >= times) throw err;
      }
    }
  }
  
  /* ---------- Timing ---------- */
  
  function time(fn, label) {
    guard("time", { fn, label }, {
      fn: "function",
      label: "string?"
    });
    
    const start = performance.now();
    fn();
    const end = performance.now();
    
    const duration = (end - start) + "ms";
    return label ? `${label} : ${duration}` : duration;
  }
  
  function sleep(ms) {
    guard("sleep", { ms }, { ms: "number" });
    
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  function timeout(fn, ms) {
    guard("timeout", { fn, ms }, {
      fn: "function",
      ms: "number"
    });
    
    return (...args) =>
      Promise.race([
        Promise.resolve(fn(...args)),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms)
        )
      ]);
  }
  
  /* ---------- Composition ---------- */
  
  function pipe(...fns) {
    if (fns.length === 0)
      throw new Error("pipe(): parameter should not be empty");
    
    fns.forEach(fn =>
      guard("pipe", { fn }, { fn: "function" })
    );
    
    return (...args) =>
      fns.reduce((acc, fn) =>
        Array.isArray(acc) ? fn(...acc) : fn(acc),
        args
      );
  }
  
  function compose(...fns) {
    if (fns.length === 0)
      throw new Error("compose(): parameter should not be empty");
    
    fns.forEach(fn =>
      guard("compose", { fn }, { fn: "function" })
    );
    
    const reversed = [...fns].reverse();
    
    return (...args) =>
      reversed.reduce((acc, fn) =>
        Array.isArray(acc) ? fn(...acc) : fn(acc),
        args
      );
  }
  
  /* ---------- Execution Control ---------- */
  
  function before(fn, times) {
    guard("before", { fn, times }, {
      fn: "function",
      times: "number"
    });
    
    let count = 0;
    let lastResult;
    
    return function(...args) {
      if (count < times) {
        lastResult = fn.apply(this, args);
        count++;
      }
      return lastResult;
    };
  }
  
  function after(fn, times) {
    guard("after", { fn, times }, {
      fn: "function",
      times: "number"
    });
    
    let count = 0;
    
    return function(...args) {
      count++;
      if (count >= times) {
        return fn.apply(this, args);
      }
    };
  }
  
  /* ---------- Flow Control ---------- */
  
  async function series(fns, initialValue) {
    guard("series", { fns, initialValue }, { fns: "array", initialValue: "any?" });
    
    let result = initialValue;
    
    for (const fn of fns) {
      guard("series", { fn }, { fn: "function" });
      result = await fn(result);
    }
    
    return result;
  }
  
  async function parallel(fns) {
    guard("parallel", { fns }, { fns: "array" });
    
    return Promise.all(
      fns.map(fn => {
        guard("parallel", { fn }, { fn: "function" });
        return fn();
      })
    );
  }
  
  /* ---------- Safe Execution ---------- */
  
  function tryCatch(fn, fallback) {
    guard("tryCatch", { fn, fallback }, { fn: "function", fallback: "function?" });
    
    return function(...args) {
      try {
        const result = fn(...args);
        
        if (result instanceof Promise) {
          return result
            .then((res) => res)
            .catch((err) => err);
        }
        return result;
      } catch (err) {
        return err;
      } finally {
        if (typeof fallback === "function") fallback();
      }
    };
  }
  
  function lazy(fn) {
    guard("lazy", { fn }, { fn: "function" });
    
    return function(...args) {
      return fn(...args);
    };
  }
  
  const tap = (fn = console.log) => value => {
    guard("tap", { fn }, { fn: "function" });
    if (typeof fn === "function") fn(value);
    return value;
  };
  
  const asyncTap = (fn = console.log) => async value => {
    guard("asyncTap", { fn }, { fn: "function" });
    
    if (typeof fn === "function") await fn(value);
    return value;
  };
  
  async function retryUntil(fn, condition, { maxAttempts = 5, delay = 500 } = {}) {
    guard("retryUntil", { fn, condition }, {
      fn: "function",
      condition: "function"
    });
    if (!Number.isFinite(maxAttempts) || maxAttempts < 0)
      throw new RangeError(
        "Primux/retryUntil(fn, condition, options): maxAttempts should be a finite non-negative number"
      );
    
    if (!Number.isFinite(delay) || delay < 0)
      throw new RangeError(
        "Primux/retryUntil(fn, condition, options): delay should be a finite non-negative number"
      );
    
    let attempt = 0;
    let result;
    
    while (attempt < maxAttempts) {
      attempt++;
      result = await fn();
      
      if (condition(result)) return result;
      
      if (delay)
        await new Promise(res => setTimeout(res, delay));
    }
    
    throw new Error(
      `retryUntil: condition not met after ${maxAttempts} attempts`
    );
  }
  
  // __________________________________
  // * Primux - Number utility functions
  // __________________________________
  
  function safeDivide(a, b, defaultValue = 0) {
    guard("safeDivide", { a, b, defaultValue }, { a: "number", b: "number", defaultValue: "number?" });
    if (b === 0) return defaultValue;
    const result = a / b;
    return isNaN(result) ? defaultValue : result;
  }
  
  function safeAdd(a, b) {
    guard("safeAdd", { a, b }, { a: "number", b: "number" });
    const dp = Math.max(decimalPlaces(a), decimalPlaces(b));
    const factor = 10 ** dp;
    return (Math.round(a * factor) + Math.round(b * factor)) / factor;
  }
  
  function safeJSONParse(str, fallback = null) {
    
    if (typeof str !== "string" || !str.trim()) {
      return fallback;
    }
    
    try {
      const parsed = JSON.parse(str);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }
  
  function safeSub(a, b) {
    guard("safeSub", { a, b }, { a: "number", b: "number" });
    const dp = Math.max(decimalPlaces(a), decimalPlaces(b));
    const factor = 10 ** dp;
    return (Math.round(a * factor) - Math.round(b * factor)) / factor;
  }
  
  function safeMultiply(a, b) {
    guard("safeMultiply", { a, b }, { a: "number", b: "number" });
    const dp = decimalPlaces(a) + decimalPlaces(b);
    return Math.round(a * b * 10 ** dp) / (10 ** dp);
  }
  
  function clamp(value, min, max) {
    guard("clamp", { value, min, max }, {
      value: "number",
      min: "number",
      max: "number"
    });
    
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }
  
  function round(value, decimals = 0) {
    guard("round", { value, decimals }, {
      value: "number",
      decimals: "number?"
    });
    
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
  
  function between(value, min, max, inclusive = true) {
    guard("between", { value, min, max, inclusive }, {
      value: "number",
      min: "number",
      max: "number",
      inclusive: "boolean?"
    });
    
    if (min > max)[min, max] = [max, min];
    
    return inclusive ?
      value >= min && value <= max :
      value > min && value < max;
  }
  
  function toFixedNumber(value, decimal) {
    guard("toFixedNumber", { value, decimal }, {
      value: "number",
      decimal: "number"
    });
    
    if (!Number.isInteger(decimal) || decimal < 0)
      throw new Error("toFixedNumber(): decimal must be non-negative integer");
    
    return Number(value.toFixed(decimal));
  }
  
  function percent(value, total, precision = 0) {
    guard("percent", { value, total, precision }, {
      value: "number",
      total: "number",
      precision: "number?"
    });
    
    if (!Number.isInteger(precision) || precision < 0)
      throw new Error("percent(): precision must be non-negative integer");
    
    if (total === 0) return 0;
    
    return Number(((value / total) * 100).toFixed(precision));
  }
  
  function almostEqual(a, b, epsilon = 1e-10) {
    guard("almostEqual", { a, b, epsilon }, {
      a: "number",
      b: "number",
      epsilon: "number?"
    });
    
    if (epsilon < 0)
      throw new Error("almostEqual(): epsilon must be non-negative");
    
    return Math.abs(a - b) < epsilon;
  }
  
  function isEven(...values) {
    if (values.length === 0)
      throw new Error("isEven(): at least one parameter required");
    
    values.forEach(v =>
      guard("isEven", { v }, { v: "number" })
    );
    
    return values.every(v => v % 2 === 0);
  }
  
  function isOdd(...values) {
    if (values.length === 0)
      throw new Error("isOdd(): at least one parameter required");
    
    values.forEach(v =>
      guard("isOdd", { v }, { v: "number" })
    );
    
    return values.every(v => v % 2 !== 0);
  }
  
  function factorial(n) {
    guard("factorial", { n }, { n: "number" });
    
    if (!Number.isInteger(n) || n < 0)
      throw new Error("factorial(): parameter must be non-negative integer");
    
    if (n <= 1) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    
    return result;
  }
  
  function isPrime(n) {
    guard("isPrime", { n }, { n: "number" });
    
    if (!Number.isInteger(n) || n < 2) return false;
    
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    
    return true;
  }
  
  function gcd(a, b) {
    guard("gcd", { a, b }, {
      a: "number",
      b: "number"
    });
    
    a = Math.abs(a);
    b = Math.abs(b);
    
    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    
    return a;
  }
  
  function lcm(a, b) {
    guard("lcm", { a, b }, {
      a: "number",
      b: "number"
    });
    
    if (a === 0 || b === 0) return 0;
    
    return Math.abs(a * b) / gcd(a, b);
  }
  
  function degreesToRadians(deg) {
    guard("degreesToRadians", { deg }, { deg: "number" });
    
    return deg * (Math.PI / 180);
  }
  
  function radiansToDegrees(rad) {
    guard("radiansToDegrees", { rad }, { rad: "number" });
    
    return rad * (180 / Math.PI);
  }
  
  function toOrdinal(n) {
    guard("toOrdinal", { n }, { n: "number" });
    
    const suffixes = ["th", "st", "nd", "rd"];
    const abs = Math.abs(n);
    const v = abs % 100;
    
    const suffix =
      suffixes[(v - 20) % 10] ||
      suffixes[v] ||
      suffixes[0];
    
    return n + suffix;
  }
  
  function randomIntArray(min, max, length, precision = 0) {
    guard("randomIntArray", { min, max, length, precision }, {
      min: "number",
      max: "number",
      length: "number",
      precision: "number?"
    });
    
    if (!Number.isInteger(length) || length < 0)
      throw new Error("randomIntArray(): length must be non-negative integer");
    if (!Number.isInteger(precision) || precision < 0)
      throw new TypeError("randomIntArray(): precision must be non-negative integer");
    
    if (min > max)[min, max] = [max, min];
    
    const array = [];
    
    for (let i = 0; i < length; i++) {
      const rand = Math.random() * (max - min) + min;
      array.push(
        precision > 0 ?
        Number(rand.toFixed(precision)) :
        Math.floor(rand)
      );
    }
    
    return array;
  }
  
  function isPositive(n) {
    guard("isPositive", { n }, { n: "number" });
    return n > 0;
  }
  
  function isNegative(n) {
    guard("isNegative", { n }, { n: "number" });
    return n < 0;
  }
  
  function randomUniqueIntArray(min, max, length, precision = 0) {
    guard("randomUniqueArray", { min, max, length, precision }, {
      min: "number",
      max: "number",
      length: "number",
      precision: "number?"
    });
    
    if (!Number.isInteger(length) || length < 0)
      throw new TypeError("length must be a non-negative integer");
    
    if (!Number.isInteger(precision) || precision < 0)
      throw new Error("randomUniqueArray(): precision must be non-negative integer");
    
    if (min > max)[min, max] = [max, min];
    
    const factor = 10 ** precision;
    
    const scaledMin = Math.ceil(min * factor);
    const scaledMax = Math.floor(max * factor);
    
    const rangeSize = scaledMax - scaledMin + 1;
    
    if (length > rangeSize)
      throw new Error("randomUniqueArray(): length exceeds unique range");
    
    const range = [];
    for (let i = scaledMin; i <= scaledMax; i++) {
      range.push(i);
    }
    
    const result = [];
    
    while (result.length < length) {
      const idx = Math.floor(Math.random() * range.length);
      const value = range.splice(idx, 1)[0];
      result.push(Number((value / factor).toFixed(precision)));
    }
    
    return result;
  }
  
  // _________________________________
  // * Primux - Boolean Utilities
  // _________________________________
  
  function isTrue(value) {
    guard("isTrue", { value }, { value: "any" });
    return !!value;
  }
  
  function isFalse(value) {
    guard("isFalse", { value }, { value: "any" });
    return !value;
  }
  
  function allTrue(...values) {
    if (values.length === 0) {
      throw new Error("Primux/allTrue: at least one parameter required");
    }
    return values.every(v => !!v);
  }
  
  function allFalse(...values) {
    if (values.length === 0) {
      throw new Error("Primux/allFalse: at least one parameter required");
    }
    return values.every(v => !v);
  }
  
  function anyTrue(...values) {
    if (values.length === 0) {
      throw new Error("Primux/anyTrue: at least one parameter required");
    }
    return values.some(v => !!v);
  }
  
  function anyFalse(...values) {
    if (values.length === 0) {
      throw new Error("Primux/anyFalse: at least one parameter required");
    }
    return values.some(v => !v);
  }
  
  function xor(a, b) {
    guard("xor", { a, b }, { a: "any", b: "any" });
    return !!a !== !!b;
  }
  
  function and(...values) {
    if (values.length === 0) {
      throw new Error("Primux/and: at least one parameter required");
    }
    return values.every(v => !!v);
  }
  
  function or(...values) {
    if (values.length === 0) {
      throw new Error("Primux/or: at least one parameter required");
    }
    return values.some(v => !!v);
  }
  
  function not(value) {
    guard("not", { value }, { value: "any" });
    return !value;
  }
  
  function coerce(value) {
    guard("coerce", { value }, { value: "any" });
    return !!value;
  }
  
  function ifTruthy(value, callback) {
    guard("ifTruthy", { value, callback }, {
      value: "any",
      callback: "function"
    });
    
    if (!!value) return callback(value);
  }
  
  function ifFalsy(value, callback) {
    guard("ifFalsy", { value, callback }, {
      value: "any",
      callback: "function"
    });
    
    if (!value) return callback(value);
  }
  
  
  // _________________________________
  // * Primux - Null / Undefined / NaN Utilities
  // _________________________________
  
  function isNaN(value) {
    guard("isNaN", { value }, { value: "any" });
    return typeof value === "number" && Number.isNaN(value);
  }
  
  function defaultIfNaN(value, defaultValue = undefined) {
    guard("defaultIfNaN", { value, defaultValue }, { value: "any", defaultValue: "any" });
    return isNaN(value) ? defaultValue : value;
  }
  
  function isNull(value) {
    guard("isNull", { value }, { value: "any" });
    return value === null;
  }
  
  function isUndefined(value) {
    if (arguments.length < 1) {
      throw new TypeError("Primux/isUndefined(value): parameter \"value\" is required")
    }
    return value === undefined;
  }
  
  function isNil(value) {
    if (arguments.length < 1) {
      throw new TypeError('Primux/isNil(value): parameter "value" is required');
    }
    return value === null || value === undefined;
  }
  
  function defaultIfNull(value, defaultValue) {
    guard("defaultIfNull", { value, defaultValue }, {
      value: "any",
      defaultValue: "any"
    });
    
    return value === null ? defaultValue : value;
  }
  
  function defaultIfNil(value, defaultValue) {
    if (arguments.length < 2) {
      throw new TypeError("Primux/defaultIfNil(value, defaultValue): parameter \"value\" and \"defaultValue\" is required");
    }
    
    return value === null || value === undefined ? defaultValue : value;
  }
  
  function defaultIfUndefined(value, defaultValue) {
    if (arguments.length < 2) {
      throw new TypeError("Primux/defaultIfUndefined(value, defaultValue): parameter \"value\" and \"defaultValue\" is required");
    }
    
    return value === undefined ? defaultValue : value;
  }
  
  function coalesce(...values) {
    if (values.length === 0) {
      throw new Error("Primux/coalesce: at least one parameter required");
    }
    
    return values.find(v => v != null);
  }
  
  // _________________________________
  // * Primux - Type / Collection Utilities
  // _________________________________
  
  function isObject(value) {
    guard("isObject", { value }, { value: "any" });
    
    if (value === null || typeof value !== "object") return false;
    return Object.getPrototypeOf(value) === Object.prototype;
  }
  
  function isArray(value) {
    guard("isArray", { value }, { value: "any" });
    
    return Array.isArray(value);
  }
  
  function isCollection(value) {
    guard("isCollection", { value }, { value: "any" });
    
    if (value === null) return false;
    
    if (Array.isArray(value)) return true;
    
    if (
      value instanceof Map ||
      value instanceof Set ||
      value instanceof WeakMap ||
      value instanceof WeakSet
    ) return true;
    
    if (Object.getPrototypeOf(value) === Object.prototype) return true;
    
    return false;
  }
  
  function checkType(value, expectedType) {
    if (typeof expectedType !== "string") {
      throw new TypeError("Primux/checkType(): expectedType must be a string");
    }
    
    switch (expectedType) {
      case "number":
        return typeof value === "number" && !Number.isNaN(value);
        
      case "int":
        return Number.isInteger(value);
        
      case "string":
        return typeof value === "string";
        
      case "boolean":
      case "bool":
        return typeof value === "boolean";
        
      case "float":
        return (
          typeof value === "number" &&
          !Number.isNaN(value) &&
          !Number.isInteger(value)
        );
        
      case "array":
        return Array.isArray(value);
        
      case "object":
        return value !== null && typeof value === "object" && !Array.isArray(value);
        
      case "null":
        return value === null;
        
      case "undefined":
        return value === undefined;
        
      case "symbol":
        return typeof value === "symbol";
        
      case "element":
        return value instanceof Element;
        
      default:
        throw new Error(`checkType(): unknown type "${expectedType}"`);
    }
  }
  
  function int() {
    return createType(
      "number",
      "int(): only accepts integer numbers",
      v => Number.isSafeInteger(v)
    )(...arguments);
  }
  
  function float() {
    return createType(
      "float",
      "float(): only accepts floating point numbers",
      v => typeof v === "number" && !Number.isNaN(v)
    )(...arguments);
  }
  
  function string() {
    return createType(
      "string",
      "string(): only accepts string",
      v => typeof v === "string"
    )(...arguments);
  }
  
  function bool() {
    return createType(
      "boolean",
      "bool(): only accepts boolean",
      v => typeof v === "boolean"
    )(...arguments);
  }
  
  function array() {
    return createType(
      "array",
      "array(): only accepts arrays",
      v => Array.isArray(v)
    )(...arguments);
  }
  
  function object() {
    return createType(
      "object",
      "object(): only accepts plain objects",
      v =>
      v !== null &&
      typeof v === "object" &&
      Object.getPrototypeOf(v) === Object.prototype
    )(...arguments);
  }
  
  function sym() {
    return createType(
      "symbol",
      "sym(): only accepts symbol",
      v => typeof v === "symbol"
    )(...arguments);
  }
  
  // __________________________________
  // * Primux - regex utlities 
  // __________________________________
  
  function isEmail(str) {
    guard("isEmail", { str }, { str: "string" });
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }
  
  function isURL(str) {
    guard("isURL", { str }, { str: "string" });
    return /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w\-.?=&]*)*\/?$/.test(str);
  }
  
  function isPhone(str) {
    guard("isPhone", { str }, { str: "string" });
    return /^\+?[\d\s\-()]{7,15}$/.test(str);
  }
  
  function isHexColor(str) {
    guard("isHexColor", { str }, { str: "string" });
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str);
  }
  
  function isAlpha(str) {
    guard("isAlpha", { str }, { str: "string" });
    return /^[A-Za-z]+$/.test(str);
  }
  
  function isAlphaNumeric(str) {
    guard("isAlphaNumeric", { str }, { str: "string" });
    return /^[A-Za-z0-9]+$/.test(str);
  }
  
  function isNumeric(str) {
    guard("isNumeric", { str }, { str: "string" });
    return /^\d+$/.test(str);
  }
  
  function matchAll(str, pattern) {
    guard("matchAll", { str, pattern }, { str: "string", pattern: "RegExp" });
    return [...str.matchAll(pattern)].map(m => m[0]);
  }
  
  function replaceAll(str, pattern, replacement) {
    guard("replaceAll", { str, pattern, replacement }, { str: "string", pattern: "RegExp|string", replacement: "string" });
    const regex = pattern instanceof RegExp ? new RegExp(pattern.source, "g") : new RegExp(pattern, "g");
    return str.replace(regex, replacement);
  }
  
  function testPattern(str, pattern) {
    guard("testPattern", { str, pattern }, { str: "string", pattern: "RegExp" });
    return pattern.test(str);
  }
  
  // __________________________________
  // * Primux - DOM utility functions 
  // __________________________________
  
  function $id(s) {
    ensureDOM("$id");
    guard("$id", { s }, { s: "string" });
    return document.getElementById(s);
  }
  
  function $qs(s) {
    ensureDOM("$qs");
    guard("$qs", { s }, { s: "string" });
    return document.querySelector(s);
  }
  
  function $qsa(s) {
    ensureDOM("$qsa");
    guard("$qsa", { s }, { s: "string" });
    return document.querySelectorAll(s);
  }
  
  function $class(s) {
    ensureDOM("$class");
    guard("$class", { s }, { s: "string" });
    return document.getElementsByClassName(s) || null;
  }
  
  function $tag(s) {
    ensureDOM("$tag");
    guard("$tag", { s }, { s: "string" });
    return document.getElementsByTagName(s) || null;
  }
  
  function $name(s) {
    ensureDOM("$name");
    guard("$name", { s }, { s: "string" });
    return document.getElementsByName(s) || null;
  }
  
  function siblings(el) {
    ensureDOM("siblings");
    guard("siblings", { el }, { el: "dom" });
    if (!el.parentNode) return [];
    return Array.from(el.parentNode.children).filter(child => child !== el);
  }
  
  function setHTML(el, html) {
    ensureDOM("setHTML");
    guard("setHTML", { el, html }, { el: "dom", html: "string" });
    el.innerHTML = html;
  }
  
  function createElement(tagName, options = {}) {
    guard("createElement", { tagName, options }, { tagName: "string", options: "object?" });
    
    const el = document.createElement(tagName);
    
    if (options.class) {
      if (Array.isArray(options.class)) el.classList.add(...options.class);
      else if (typeof options.class === "string") el.classList.add(options.class);
      else throw new TypeError("createElement: 'class' must be string or array of strings");
    }
    
    if (options.attrs) {
      if (!isObject(options.attrs)) throw new TypeError("createElement: 'attrs' must be an object");
      Object.entries(options.attrs).forEach(([key, value]) => el.setAttribute(key, value));
    }
    
    if (options.text) el.textContent = String(options.text);
    if (options.html) el.innerHTML = String(options.html);
    
    if (options.children) {
      const children = Array.isArray(options.children) ? options.children : [options.children];
      children.forEach(child => {
        guard("createElement/children", { child }, { child: "dom" });
        el.appendChild(child);
      });
    }
    
    return el;
  }
  
  function empty(el) {
    ensureDOM("empty");
    guard("empty", { el }, { el: "dom" });
    el.innerHTML = "";
  }
  
  function wrap(target, wrapper) {
    ensureDOM("wrap");
    guard("wrap", { target, wrapper }, { target: "dom", wrapper: "dom" });
    
    if (target.parentNode) {
      target.parentNode.insertBefore(wrapper, target);
    }
    
    wrapper.appendChild(target);
    return wrapper;
  }
  
  function unwrap(wrapper) {
    ensureDOM("unwrap");
    guard("unwrap", { wrapper }, { wrapper: "dom" });
    
    const parent = wrapper.parentNode;
    if (!parent) return;
    
    const children = Array.from(wrapper.childNodes);
    children.forEach(child => parent.insertBefore(child, wrapper));
    
    wrapper.remove();
  }
  
  function addClass(el, ...classes) {
    ensureDOM("addClass");
    
    const elements = el instanceof HTMLElement ? [el] :
      el instanceof NodeList || Array.isArray(el) ?
      Array.from(el) : [];
    
    if (elements.length === 0) throw new TypeError("Primux/addClass: el should be HTMLElement, NodeList or array of HTMLElements");
    
    const allClasses = classes.flat(Infinity);
    
    allClasses.forEach(c => guard("addClass", { c }, { c: "string" }));
    
    elements.forEach(element => element.classList.add(...allClasses));
    
    return el;
  }
  
  function removeClass(el, ...classes) {
    ensureDOM("removeClass");
    
    const elements = el instanceof HTMLElement ? [el] :
      el instanceof NodeList || Array.isArray(el) ?
      Array.from(el) : [];
    
    if (elements.length === 0) throw new TypeError("Primux/removeClass: el should be HTMLElement, NodeList or array of HTMLElements");
    
    const allClasses = classes.flat(Infinity);
    
    allClasses.forEach(c => {
      if (typeof c !== "string") throw new TypeError("Primux/removeClass: class must be string");
    });
    
    elements.forEach(element => element.classList.remove(...allClasses));
    
    return el;
  }
  
  function hasClass(el, ...classes) {
    ensureDOM("hasClass");
    
    const allClasses = classes.flat(Infinity);
    
    if (!allClasses.every(c => typeof c === "string")) {
      throw new TypeError("Primux/hasClass: all classes must be strings");
    }
    
    return allClasses.every(c => el.classList.contains(c));
  }
  
  function data(el, key, value) {
    ensureDOM("data");
    guard("data", { el, key }, { el: "dom", key: "string", key: "any" });
    
    const attrName = `data-${key.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}`;
    
    if (value === undefined) return el.getAttribute(attrName);
    if (value === null) return el.removeAttribute(attrName);
    
    el.setAttribute(attrName, value);
  }
  
  function on(elements, events, handler, option = {}) {
    ensureDOM("on");
    guard("on", { handler, option }, { handler: "function", option: "object?" });
    
    const { once = false } = option;
    guard("on", { once }, { once: "boolean" });
    
    const elArr = normalizeToArray(elements, "on(elements, events, handler, options?)");
    const eventArr = normalizeToArray(events, "on(elements, events, handler, options?)");
    
    for (const el of elArr) {
      guard("on", { el }, { el: "dom" });
      
      for (const event of eventArr) {
        guard("on", { event }, { event: "string" });
        el.addEventListener(event, handler, { once });
      }
    }
  }
  
  function off(elements, events, handler) {
    ensureDOM("off");
    guard("off", { handler }, { handler: "function" });
    
    const elArr = normalizeToArray(elements, "off(elements, events, handler)");
    const eventArr = normalizeToArray(events, "off(elements, events, handler)");
    
    for (const el of elArr) {
      guard("off", { el }, { el: "dom" });
      
      for (const event of eventArr) {
        guard("off", { event }, { event: "string" });
        el.removeEventListener(event, handler);
      }
    }
  }
  
  function delegate(root, event, selector, handler) {
    ensureDOM("delegate");
    guard("delegate", { root, event, selector, handler }, { root: "dom", event: "string", selector: "string", handler: "function" });
    
    root.addEventListener(event, e => {
      const target = e.target.closest(selector);
      if (target && root.contains(target)) handler.call(target, e);
    });
  }
  
  function trigger(elements, events, options = {}) {
    ensureDOM("trigger");
    
    if (options === null || typeof options !== "object") {
      throw new TypeError("trigger(): options must be an object");
    }
    
    const elArr = normalizeToArray(elements, "trigger(elements, events, options?)");
    const eventArr = normalizeToArray(events, "trigger(elements, events, options?)");
    
    for (const el of elArr) {
      guard("trigger", { el }, { el: "dom" });
      
      for (const eventName of eventArr) {
        guard("trigger", { eventName }, { eventName: "string" });
        
        const { detail = null, bubbles = true, cancelable = true } = options;
        el.dispatchEvent(new CustomEvent(eventName, { detail, bubbles, cancelable }));
      }
    }
  }
  
  function triggerPairs(pairs) {
    for (const [el, event] of pairs) trigger(el, event);
  }
  
  function css(elements, prop, value) {
    ensureDOM("css");
    
    const elArr = normalizeToArray(elements, "css(elements, prop, value)");
    
    for (const el of elArr) {
      guard("css", { el }, { el: "dom" });
      
      if (typeof prop === "string" && value === undefined) {
        return getComputedStyle(el).getPropertyValue(prop);
      }
      
      if (typeof prop === "string") {
        el.style[prop] = value;
        continue;
      }
      
      if (isObject(prop)) {
        for (const key in prop) el.style[key] = prop[key];
        continue;
      }
      
      throw new TypeError("css(): invalid parameter");
    }
  }
  
  function getStyle(el, property) {
    ensureDOM("getStyle");
    guard("getStyle", { el, property }, { el: "dom", property: "string" });
    
    return getComputedStyle(el).getPropertyValue(property);
  }
  
  function hide(...elements) {
    ensureDOM("hide");
    
    const elArr = normalizeToArray(elements.flat(), "hide(elements)");
    for (const el of elArr) {
      guard("hide", { el }, { el: "dom" });
      
      if (el.style.display !== "none") {
        el.dataset._display = getComputedStyle(el).getPropertyValue("display");
      }
      
      el.style.display = "none";
    }
  }
  
  function show(...elements) {
    ensureDOM("show");
    
    const elArr = normalizeToArray(elements.flat(), "show(elements)");
    for (const el of elArr) {
      guard("show", { el }, { el: "dom" });
      
      el.style.display = el.dataset._display ?? "";
      delete el.dataset._display;
    }
  }
  
  function toggleDisplay(...elements) {
    ensureDOM("toggleDisplay");
    
    const elArr = normalizeToArray(elements.flat(), "toggleDisplay(elements)");
    for (const el of elArr) {
      guard("toggleDisplay", { el }, { el: "dom" });
      
      const isHidden = getComputedStyle(el).getPropertyValue("display") === "none";
      
      if (isHidden) {
        el.style.display = el.dataset._display ?? "";
        delete el.dataset._display;
      } else {
        el.dataset._display = getComputedStyle(el).getPropertyValue("display");
        el.style.display = "none";
      }
    }
  }
  
  function addAnimation(...elements) {
    ensureDOM("addAnimation");
    
    const className = elements.pop();
    guard("addAnimation", { className }, { className: "string" });
    
    const elArr = normalizeToArray(elements.flat(), "addAnimation (elements)");
    for (const el of elArr) {
      guard("addAnimation", { el }, { el: "dom" });
      el.classList.add(className);
    }
  }
  
  function removeAnimation(...elements) {
    ensureDOM("removeAnimation");
    
    const className = elements.pop();
    guard("removeAnimation", { className }, { className: "string" });
    
    const elArr = normalizeToArray(elements.flat(), "removeAnimation(elements)");
    for (const el of elArr) {
      guard("removeAnimation", { el }, { el: "dom" });
      el.classList.remove(className);
    }
  }
  
  function offset(el) {
    ensureDOM("offset");
    guard("offset", { el }, { el: "dom" });
    
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX
    };
  }
  
  function position(el) {
    ensureDOM("position");
    guard("position", { el }, { el: "dom" });
    
    return { top: el.offsetTop, left: el.offsetLeft };
  }
  
  function width(el) {
    ensureDOM("width");
    guard("width", { el }, { el: "dom" });
    return parseFloat(getComputedStyle(el).width);
  }
  
  function height(el) {
    ensureDOM("height");
    guard("height", { el }, { el: "dom" });
    return parseFloat(getComputedStyle(el).height);
  }
  
  function innerWidth(el) {
    ensureDOM("innerWidth");
    guard("innerWidth", { el }, { el: "dom" });
    return el.clientWidth;
  }
  
  function innerHeight(el) {
    ensureDOM("innerHeight");
    guard("innerHeight", { el }, { el: "dom" });
    return el.clientHeight;
  }
  
  function outerWidth(el, includeMargin = false) {
    ensureDOM("outerWidth");
    guard("outerWidth", { el }, { el: "dom" });
    
    let w = el.offsetWidth;
    if (includeMargin) {
      const s = getComputedStyle(el);
      w += parseFloat(s.marginLeft) + parseFloat(s.marginRight);
    }
    return w;
  }
  
  function outerHeight(el, includeMargin = false) {
    ensureDOM("outerHeight");
    guard("outerHeight", { el }, { el: "dom" });
    
    let h = el.offsetHeight;
    if (includeMargin) {
      const s = getComputedStyle(el);
      h += parseFloat(s.marginTop) + parseFloat(s.marginBottom);
    }
    return h;
  }
  
  function scrollTop(el = window) {
    ensureDOM("scrollTop");
    if (el !== window) guard("scrollTop", { el }, { el: "dom" });
    
    return el === window ? window.scrollY : el.scrollTop;
  }
  
  function scrollLeft(el = window) {
    ensureDOM("scrollLeft");
    if (el !== window) guard("scrollLeft", { el }, { el: "dom" });
    
    return el === window ? window.scrollX : el.scrollLeft;
  }
  
  function rect(el) {
    ensureDOM("rect");
    guard("rect", { el }, { el: "dom" });
    
    const r = el.getBoundingClientRect();
    return {
      top: r.top,
      left: r.left,
      right: r.right,
      bottom: r.bottom,
      width: r.width,
      height: r.height,
    };
  }
  
  function isInViewport(el, options = {}) {
    guard("isInViewport", { el, options }, { el: "dom", options: "object?" });
    
    const { partial = true, offset = 0 } = options;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const EPS = 0.5;
    
    const top = r.top + offset;
    const left = r.left + offset;
    const right = r.right - offset;
    const bottom = r.bottom - offset;
    
    if (partial) {
      return bottom > -EPS && right > -EPS && top < vh + EPS && left < vw + EPS;
    }
    return top >= -EPS && left >= -EPS && bottom <= vh + EPS && right <= vw + EPS;
  }
  
  function val(el) {
    ensureDOM("val");
    guard("val", { el }, { el: "dom" });
    
    if (!("value" in el)) return null;
    return el.value;
  }
  
  function setVal(elements, value) {
    ensureDOM("setVal");
    
    const elArr = normalizeToArray(elements, "setVal(elements, value)");
    for (const el of elArr) {
      guard("setVal", { el }, { el: "dom" });
      
      if (!("value" in el)) throw new Error("setVal(): element does not support value");
      el.value = value == null ? "" : String(value);
    }
  }
  
  function isVisible(el, checkOpacity = false) {
    ensureDOM("isVisible");
    guard("isVisible", { el, checkOpacity }, { el: "dom", checkOpacity: "boolean?" });
    
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    if (checkOpacity && parseFloat(style.opacity) === 0) return false;
    
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  
  function isHidden(el, checkOpacity = false) {
    ensureDOM("isHidden");
    guard("isHidden", { el, checkOpacity }, { el: "dom", checkOpacity: "boolean?" });
    
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return true;
    if (checkOpacity && parseFloat(style.opacity) === 0) return true;
    
    const r = el.getBoundingClientRect();
    return r.width === 0 || r.height === 0;
  }
  
  function fadeIn(el, duration = 300) {
    ensureDOM("fadeIn");
    guard("fadeIn", { el, duration }, { el: "dom", duration: "number?" });
    
    duration = getDuration(duration);
    el.style.opacity = 0;
    el.style.display = "";
    if (getComputedStyle(el).display === "none") el.style.display = "block";
    
    let start = null;
    
    function animate(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      el.style.opacity = progress;
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
  
  function fadeOut(el, duration = 300) {
    ensureDOM("fadeOut");
    guard("fadeOut", { el, duration }, { el: "dom", duration: "number?" });
    
    duration = getDuration(duration);
    const initial = parseFloat(getComputedStyle(el).opacity) || 1;
    let start = null;
    
    function animate(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      el.style.opacity = initial * (1 - progress);
      if (progress < 1) requestAnimationFrame(animate);
      else {
        el.style.display = "none";
        el.style.opacity = "";
      }
    }
    requestAnimationFrame(animate);
  }
  
  function slideDown(el, duration = 300) {
    ensureDOM("slideDown");
    guard("slideDown", { el, duration }, { el: "dom", duration: "number?" });
    
    duration = getDuration(duration);
    el.style.display = "";
    if (getComputedStyle(el).display === "none") el.style.display = "block";
    
    const height = el.scrollHeight;
    el.style.overflow = "hidden";
    el.style.height = "0px";
    
    let start = null;
    
    function animate(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      el.style.height = height * progress + "px";
      if (progress < 1) requestAnimationFrame(animate);
      else {
        el.style.height = "";
        el.style.overflow = "";
      }
    }
    requestAnimationFrame(animate);
  }
  
  function slideUp(el, duration = 300) {
    ensureDOM("slideUp");
    guard("slideUp", { el, duration }, { el: "dom", duration: "number?" });
    
    duration = getDuration(duration);
    const height = el.scrollHeight;
    
    el.style.height = height + "px";
    el.style.overflow = "hidden";
    
    let start = null;
    
    function animate(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      el.style.height = height * (1 - progress) + "px";
      if (progress < 1) requestAnimationFrame(animate);
      else {
        el.style.display = "none";
        el.style.height = "";
        el.style.overflow = "";
      }
    }
    requestAnimationFrame(animate);
  }
  
  async function copyToClipboard(text) {
    guard("copyToClipboard", { text }, { text: "string" });
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      
      return success;
    } catch {
      return false;
    }
  }
  
  function scrollTo(target, options = {}) {
   ensureDOM("scrollTo");
    const { behavior = "smooth", offset = 0, container = window } = options;
    if (!(container === window || container instanceof Element)) {
      throw new TypeError("scrollTo(): container must be window or DOM element");
    }
    let top = 0;
    
    if (typeof target === "number") {
      top = target + offset;
    } else if (target instanceof Element) {
      guard("scrollTo", { target }, { target: "dom" });
      
      const rect = target.getBoundingClientRect();
      if (container === window) {
        top = rect.top + window.pageYOffset + offset;
      } else if (container instanceof Element) {
        top = rect.top - container.getBoundingClientRect().top + container.scrollTop + offset;
      } else {
        throw new TypeError("scrollTo(): container must be window or DOM element");
      }
    } else {
      throw new TypeError("scrollTo(): target must be number or DOM element");
    }
    
    if (container === window) {
      window.scrollTo({ top, behavior });
    } else {
      container.scrollTo({ top, behavior });
    }
  }
  
  function firstChild(el) {
    ensureDOM("firstChild");
    guard("firstChild", { el }, { el: "dom" });
    return el.firstElementChild;
  }
  
  function lastChild(el) {
    ensureDOM("lastChild");
    guard("lastChild", { el }, { el: "dom" });
    return el.lastElementChild;
  }
  
  // _________________________________
  // * Primux - localStorage / sessionStorage utilities
  // _________________________________
  
  function setData(key, data, type = "local") {
    guard("setData", { key, data, type }, { key: "string", data: "object|string", type: "string?" });
    
    const storage = resolveStorage(type, "setData(key, data, type?)");
    const isPlainObject = isObject(data);
    
    storage.setItem(
      key,
      isPlainObject ? JSON.stringify(data) : data
    );
  }
  
  function getData(key, type = "local") {
    guard("getData", { key, type }, { key: "string", type: "string?" });
    
    const storage = resolveStorage(type, "getData(key, type?)");
    const value = storage.getItem(key);
    
    if (value === null) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  
  function removeData(key, type = "local") {
    guard("removeData", { key, type }, { key: "string", type: "string?" });
    
    const storage = resolveStorage(type, "removeData(key, type?)");
    storage.removeItem(key);
  }
  
  function clearAllData(type = "local") {
    guard("clearAllData", { type }, { type: "string?" });
    
    const storage = resolveStorage(type, "clearAllData(type?)");
    storage.clear();
  }
  
  // __________________________________
  // * Primux - Device & Media utility functions 
  // __________________________________
  
  function isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  }
  
  function isTouchPhone() {
    return isTouchDevice() && matchMedia("(pointer: coarse)").matches && matchMedia("(hover: none)").matches;
  }
  
  function isMouseDevice() {
    return matchMedia("(pointer: fine)").matches;
  }
  
  function isHybridDevice() {
    return isTouchDevice() && matchMedia("(pointer: fine)").matches;
  }
  
  function supportsHover() {
    return matchMedia("(hover: hover)").matches;
  }
  
  function supportsCoarsePointer() {
    return matchMedia("(pointer: coarse)").matches;
  }
  
  function prefersReducedMotion() {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  
  function prefersDarkMode() {
    return matchMedia("(prefers-color-scheme: dark)").matches;
  }
  
  function prefersLightMode() {
    return matchMedia("(prefers-color-scheme: light)").matches;
  }
  
  // __________________________________
  // * Primux - Loops & Iteration utility functions 
  // __________________________________
  
  function times(n, fn) {
    guard("times", { n, fn }, { n: "number", fn: "function" });
    if (n < 0) throw new TypeError("times(): n must be a positive number");
    
    for (let i = 0; i < n; i++) fn(i);
  }
  
  function loopUntil(fn, condition) {
    guard("loopUntil", { fn, condition }, { fn: "function", condition: "function" });
    
    let result;
    
    do {
      result = fn();
    } while (!condition(result));
  }
  
  // __________________________________
  // * Primux - Device / Web API Utility functions 
  // __________________________________
  
  function canShare() {
    return typeof navigator !== "undefined" && !!navigator.share;
  }
  
  function share(data) {
    guard("share", { data }, { data: "object" })
    if (!canShare()) return Promise.reject("Share API not supported");
    return navigator.share(data);
  }
  
  function canVibrate() {
    return typeof navigator !== "undefined" && "vibrate" in navigator;
  }
  
  function vibrate(pattern = 200) {
    guard("vibrate", { pattern }, { pattern: "number" });
    if (!canVibrate()) return false;
    return navigator.vibrate(pattern);
  }
  
  function canAccessBattery() {
    return typeof navigator !== "undefined" && "getBattery" in navigator;
  }
  
  async function getBatteryInfo() {
    if (!canAccessBattery()) return null;
    
    const battery = await navigator.getBattery();
    return {
      level: Math.round(battery.level * 100),
      charging: battery.charging,
      chargingTime: battery.chargingTime === Infinity ?
        null : Math.round(battery.chargingTime / 60),
      dischargingTime: battery.dischargingTime === Infinity ?
        null : Math.round(battery.dischargingTime / 60)
    };
  }
  
  function canNotify() {
    return typeof window !== "undefined" && "Notification" in window;
  }
  
  function requestNotificationPermission() {
    if (!canNotify()) return Promise.resolve("denied");
    return Notification.requestPermission();
  }
  
  async function notify(title, options = {}, swPath = null) {
    guard("notify", { title, options }, { title: "string", options: "object?" });
    
    if (!("Notification" in window)) return null;
    
    if (Notification.permission !== "granted") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return null;
    }
    
    if ("serviceWorker" in navigator) {
      if (swPath) {
        const existing = await navigator.serviceWorker.getRegistration();
        if (!existing) {
          await navigator.serviceWorker.register(swPath);
        }
      }
      
      const reg = await navigator.serviceWorker.ready;
      return reg.showNotification(title, options);
    }
    
    return new Notification(title, options);
  }
  
  function canUseBluetooth() {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }
  
  function requestBluetoothDevice(options) {
    guard("requestBluetoothDevice", { options }, { options: "object" });
    
    if (!canUseBluetooth()) {
      return Promise.reject(new Error("Bluetooth API not supported"));
    }
    
    const hasFilters = Array.isArray(options.filters);
    const hasAcceptAll = options.acceptAllDevices === true;
    
    if (!hasFilters && !hasAcceptAll) {
      return Promise.reject(
        new Error("Either 'filters' or 'acceptAllDevices: true' is required.")
      );
    }
    
    if (hasFilters && hasAcceptAll) {
      return Promise.reject(
        new Error("Cannot use both 'filters' and 'acceptAllDevices'.")
      );
    }
    
    return navigator.bluetooth.requestDevice(options);
  }
  
  function getNetworkInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return null;
    
    return {
      effectiveType: conn.effectiveType,
      downlink: conn.downlink,
      rtt: conn.rtt,
      saveData: conn.saveData
    };
  }
  
  function canUseMediaDevices() {
    return typeof navigator !== "undefined" && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  
  function canGeolocate() {
    return typeof navigator !== "undefined" && "geolocation" in navigator;
  }
  
  function queryPermission(name) {
    guard("queryPermission", { name }, { name: "string" });
    if (!navigator.permissions) return Promise.resolve(null);
    return navigator.permissions.query({ name });
  }
  
  function isProbablyOnline() {
    return navigator.onLine || performance.getEntriesByType("resource").length > 0;
  }
  
  // __________________________________
  // * Primux - Canvas Utility functions 
  // __________________________________
  
  function ensureCanvas(canvas) {
    guard("ensureCanvas", { canvas }, { canvas: "dom" });
    return canvas instanceof HTMLCanvasElement;
  }
  
  function getCtx(canvas) {
    guard("getCtx", { canvas }, { canvas: "dom" });
    if (!ensureCanvas(canvas)) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) console.warn("getCtx: 2D context not supported");
    return ctx;
  }
  
  function fixDPI(canvas, ctx) {
    guard("fixDPI", { canvas, ctx }, { canvas: "dom", ctx: "object" });
    if (!ctx) return;
    
    const dpi = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpi;
    canvas.height = canvas.clientHeight * dpi;
    ctx.scale(dpi, dpi);
  }
  
  function resizeCanvas(canvas, width, height) {
    guard("resizeCanvas", { canvas, width, height }, { canvas: "dom", width: "number?", height: "number?" });
    
    const w = width ?? canvas.clientWidth;
    const h = height ?? canvas.clientHeight;
    
    canvas.width = w;
    canvas.height = h;
    return { width: w, height: h };
  }
  
  function withCtx(ctx, fn) {
    guard("withCtx", { ctx, fn }, { ctx: "object", fn: "function" });
    ctx.save();
    let result;
    try {
      result = fn();
    } finally {
      ctx.restore();
    }
    return result;
  }
  
  function clearCanvas(ctx, width, height) {
    guard("clearCanvas", { ctx, width, height }, { ctx: "object", width: "number?", height: "number?" });
    const w = width ?? ctx.canvas.width;
    const h = height ?? ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
  }
  
  function setStyle(ctx, style = {}) {
    guard("setStyle", { ctx, style }, { ctx: "object", style: "object?" });
    const { fill, stroke, lineWidth, font, alpha } = style;
    if (fill) ctx.fillStyle = fill;
    if (stroke) ctx.strokeStyle = stroke;
    if (lineWidth) ctx.lineWidth = lineWidth;
    if (font) ctx.font = font;
    if (alpha !== undefined) ctx.globalAlpha = alpha;
  }
  
  function drawRect(ctx, { x, y, w, h, fill, stroke, lineWidth = 1 }) {
    guard("drawRect", { ctx, x, y, w, h, fill, stroke, lineWidth }, { ctx: "object", x: "number", y: "number", w: "number", h: "number", fill: "string?", stroke: "string?", lineWidth: "number?" });
    
    withCtx(ctx, () => {
      if (fill) ctx.fillRect(x, y, w, h);
      if (stroke) {
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(x, y, w, h);
      }
    });
  }
  
  function drawCircle(ctx, { x, y, r, fill, stroke, lineWidth = 1 }) {
    guard("drawCircle", { ctx, x, y, r, fill, stroke, lineWidth }, { ctx: "object", x: "number", y: "number", r: "number", fill: "string?", stroke: "string?", lineWidth: "number?" });
    
    withCtx(ctx, () => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (fill) ctx.fill();
      if (stroke) {
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    });
  }
  
  function drawLine(ctx, { x1, y1, x2, y2, stroke = "#000", width = 1 }) {
    guard("drawLine", { ctx, x1, y1, x2, y2, stroke, width }, { ctx: "object", x1: "number", y1: "number", x2: "number", y2: "number", stroke: "string?", width: "number?" });
    
    withCtx(ctx, () => {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
  }
  
  function drawPath(ctx, points, opts = {}) {
    guard("drawPath", { ctx, points, opts }, { ctx: "object", points: "array", opts: "object?" });
    if (!points.length) return;
    
    const { stroke, fill, lineWidth = 1, close = false } = opts;
    
    withCtx(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      if (close) ctx.closePath();
      
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      
      if (stroke) {
        ctx.strokeStyle = stroke === true ? "#000" : stroke;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    });
  }
  
  function drawText(ctx, { text: t, x, y, size = 16, font = "sans-serif", color = "#000", align = "left" }) {
    guard("drawText", { ctx, t, x, y, size, font, color, align }, { ctx: "object", t: "string", x: "number", y: "number" });
    
    withCtx(ctx, () => {
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.font = `${size}px ${font}`;
      ctx.fillText(t, x, y);
    });
  }
  
  function measureText(ctx, textValue) {
    guard("measureText", { ctx, textValue }, { ctx: "object", textValue: "string" });
    return ctx.measureText(textValue)?.width ?? 0;
  }
  
  function getMousePos(canvas, evt) {
    guard("getMousePos", { canvas, evt }, { canvas: "dom", evt: "object" });
    const rect = canvas.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  }
  
  function getTouchPos(canvas, touch) {
    guard("getTouchPos", { canvas, touch }, { canvas: "dom", touch: "object" });
    const rect = canvas.getBoundingClientRect();
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }
  
  function destroyCanvas(canvas) {
    guard("destroyCanvas", { canvas }, { canvas: "dom" });
    const ctx = canvas.getContext("2d");
    if (ctx) clearCanvas(ctx);
    canvas.width = 0;
    canvas.height = 0;
  }
  const _p = Object.freeze({
    // 1. Function Utilities
    once,
    noop,
    identity,
    debounce,
    throttle,
    memoize,
    retry,
    retryAsync,
    time,
    sleep,
    timeout,
    pipe,
    compose,
    before,
    after,
    series,
    parallel,
    tryCatch,
    lazy,
    tap,
    asyncTap,
    retryUntil,
    
    // 2. HTML5 Canvas Utilities
    ensureCanvas,
    getCtx,
    fixDPI,
    resizeCanvas,
    withCtx,
    setStyle,
    drawRect,
    drawCircle,
    drawLine,
    drawPath,
    drawText,
    measureText,
    getMousePos,
    getTouchPos,
    clearCanvas,
    destroyCanvas,
    
    // 3. Web API Utilities
    canShare,
    share,
    canVibrate,
    vibrate,
    canAccessBattery,
    getBatteryInfo,
    canNotify,
    requestNotificationPermission,
    notify,
    canUseBluetooth,
    requestBluetoothDevice,
    getNetworkInfo,
    canUseMediaDevices,
    canGeolocate,
    queryPermission,
    isProbablyOnline,
    safeJSONParse,
    
    // 4. Loops and Iteration
    times,
    loopUntil,
    
    // 5. Device and Media Utilities
    isTouchDevice,
    isTouchPhone,
    isMouseDevice,
    isHybridDevice,
    supportsHover,
    supportsCoarsePointer,
    prefersReducedMotion,
    prefersDarkMode,
    prefersLightMode,
    
    // 6. LocalStorage Utilities
    setData,
    getData,
    removeData,
    clearAllData,
    
    // 7. DOM Utilities
    $id,
    $qs,
    $qsa,
    $class,
    $tag,
    $name,
    siblings,
    setHTML,
    createElement,
    empty,
    wrap,
    unwrap,
    addClass,
    removeClass,
    hasClass,
    data,
    on,
    off,
    delegate,
    trigger,
    triggerPairs,
    css,
    getStyle,
    hide,
    show,
    toggleDisplay,
    addAnimation,
    removeAnimation,
    offset,
    position,
    width,
    height,
    innerWidth,
    innerHeight,
    outerWidth,
    outerHeight,
    scrollTop,
    scrollLeft,
    rect,
    isInViewport,
    val,
    setVal,
    isVisible,
    isHidden,
    fadeIn,
    fadeOut,
    slideDown,
    slideUp,
    copyToClipboard,
    scrollTo,
    firstChild,
    lastChild,
    
    // 8. Regex Utilities
    isEmail,
    isURL,
    isPhone,
    isHexColor,
    isAlpha,
    isAlphaNumeric,
    isNumeric,
    matchAll,
    replaceAll,
    testPattern,
    
    // 9. Number Utilities
    clamp,
    safeDivide,
    safeAdd,
    safeSub,
    safeMultiply,
    round,
    random,
    between,
    toFixedNumber,
    percent,
    almostEqual,
    isEven,
    isOdd,
    factorial,
    isPrime,
    gcd,
    lcm,
    degreesToRadians,
    radiansToDegrees,
    toOrdinal,
    randomIntArray,
    randomUniqueIntArray,
    isPositive,
    isNegative,
    
    // 10. Type / Collection Utilities
    isObject,
    isArray,
    isCollection,
    checkType,
    int,
    string,
    bool,
    object,
    array,
    float,
    sym,
    
    // 11. Null / Undefined / NaN Utilities
    isNaN,
    defaultIfNaN,
    isNull,
    isUndefined,
    isNil,
    defaultIfNull,
    defaultIfNil,
    defaultIfUndefined,
    coalesce,
    
    // 12. Boolean Utilities
    isTrue,
    isFalse,
    allTrue,
    allFalse,
    anyTrue,
    anyFalse,
    xor,
    and,
    or,
    not,
    coerce,
    ifTruthy,
    ifFalsy,
    
    // 13. General Utilities
    isEmpty,
    isNotEmpty,
    
    // 14. Array Utilities
    first,
    last,
    atSafe,
    sum,
    average,
    min,
    max,
    range,
    median,
    unique,
    duplicates,
    count,
    containsAll,
    intersection,
    union,
    remove,
    swap,
    clear,
    chunk,
    zip,
    flattenDeep,
    flattenTo,
    sortAsc,
    sortDesc,
    shuffle,
    sample,
    compact,
    
    // 15. Object Utilities
    keysArray,
    valuesArray,
    entriesArray,
    keysLength,
    has,
    deepClone,
    deepMerge,
    mergeAll,
    pick,
    omit,
    mapValues,
    mapKeys,
    mapEntries,
    filterObj,
    deepFreeze,
    keyBy,
    invert,
    
    // 16. String Utilities
    uppercaseWords,
    lowercaseWords,
    truncate,
    uppercaseChar,
    lowercaseChar,
    uppercaseFirstChar,
    lowercaseFirstChar,
    slugify,
    stripHtml,
    escapeHtml,
    countOccurrences,
    reverseString,
    padCenter,
    removeAccent,
    isPalindrome
  });
  
  export {
    // 1. Function Utilities
    once,
    noop,
    identity,
    debounce,
    throttle,
    memoize,
    retry,
    retryAsync,
    time,
    sleep,
    timeout,
    pipe,
    compose,
    before,
    after,
    series,
    parallel,
    tryCatch,
    lazy,
    tap,
    asyncTap,
    retryUntil,
    
    // 2. HTML5 Canvas Utilities
    ensureCanvas,
    getCtx,
    fixDPI,
    resizeCanvas,
    withCtx,
    setStyle,
    drawRect,
    drawCircle,
    drawLine,
    drawPath,
    drawText,
    measureText,
    getMousePos,
    getTouchPos,
    clearCanvas,
    destroyCanvas,
    
    // 3. Web API Utilities
    canShare,
    share,
    canVibrate,
    vibrate,
    canAccessBattery,
    getBatteryInfo,
    canNotify,
    requestNotificationPermission,
    notify,
    canUseBluetooth,
    requestBluetoothDevice,
    getNetworkInfo,
    canUseMediaDevices,
    canGeolocate,
    queryPermission,
    isProbablyOnline,
    safeJSONParse,
    
    // 4. Loops and Iteration
    times,
    loopUntil,
    
    // 5. Device and Media Utilities
    isTouchDevice,
    isTouchPhone,
    isMouseDevice,
    isHybridDevice,
    supportsHover,
    supportsCoarsePointer,
    prefersReducedMotion,
    prefersDarkMode,
    prefersLightMode,
    
    // 6. LocalStorage Utilities
    setData,
    getData,
    removeData,
    clearAllData,
    
    // 7. DOM Utilities
    $id,
    $qs,
    $qsa,
    $class,
    $tag,
    $name,
    siblings,
    setHTML,
    createElement,
    empty,
    wrap,
    unwrap,
    addClass,
    removeClass,
    hasClass,
    data,
    on,
    off,
    delegate,
    trigger,
    triggerPairs,
    css,
    getStyle,
    hide,
    show,
    toggleDisplay,
    addAnimation,
    removeAnimation,
    offset,
    position,
    width,
    height,
    innerWidth,
    innerHeight,
    outerWidth,
    outerHeight,
    scrollTop,
    scrollLeft,
    rect,
    isInViewport,
    val,
    setVal,
    isVisible,
    isHidden,
    fadeIn,
    fadeOut,
    slideDown,
    slideUp,
    copyToClipboard,
    scrollTo,
    firstChild,
    lastChild,
    
    // 8. Regex Utilities
    isEmail,
    isURL,
    isPhone,
    isHexColor,
    isAlpha,
    isAlphaNumeric,
    isNumeric,
    matchAll,
    replaceAll,
    testPattern,
    
    // 9. Number Utilities
    clamp,
    safeDivide,
    safeAdd,
    safeSub,
    safeMultiply,
    round,
    random,
    between,
    toFixedNumber,
    percent,
    almostEqual,
    isEven,
    isOdd,
    factorial,
    isPrime,
    gcd,
    lcm,
    degreesToRadians,
    radiansToDegrees,
    toOrdinal,
    randomIntArray,
    randomUniqueIntArray,
    isPositive,
    isNegative,
    
    // 10. Type / Collection Utilities
    isObject,
    isArray,
    isCollection,
    checkType,
    int,
    string,
    bool,
    object,
    array,
    float,
    sym,
    
    // 11. Null / Undefined / NaN Utilities
    isNaN,
    defaultIfNaN,
    isNull,
    isUndefined,
    isNil,
    defaultIfNull,
    defaultIfNil,
    defaultIfUndefined,
    coalesce,
    
    // 12. Boolean Utilities
    isTrue,
    isFalse,
    allTrue,
    allFalse,
    anyTrue,
    anyFalse,
    xor,
    and,
    or,
    not,
    coerce,
    ifTruthy,
    ifFalsy,
    
    // 13. General Utilities
    isEmpty,
    isNotEmpty,
    
    // 14. Array Utilities
    first,
    last,
    atSafe,
    sum,
    average,
    min,
    max,
    range,
    median,
    unique,
    duplicates,
    count,
    containsAll,
    intersection,
    union,
    remove,
    swap,
    clear,
    chunk,
    zip,
    flattenDeep,
    flattenTo,
    sortAsc,
    sortDesc,
    shuffle,
    sample,
    compact,
    
    // 15. Object Utilities
    keysArray,
    valuesArray,
    entriesArray,
    keysLength,
    has,
    deepClone,
    deepMerge,
    mergeAll,
    pick,
    omit,
    mapValues,
    mapKeys,
    mapEntries,
    filterObj,
    deepFreeze,
    keyBy,
    invert,
    
    // 16. String Utilities
    uppercaseWords,
    lowercaseWords,
    truncate,
    uppercaseChar,
    lowercaseChar,
    uppercaseFirstChar,
    lowercaseFirstChar,
    slugify,
    stripHtml,
    escapeHtml,
    countOccurrences,
    reverseString,
    padCenter,
    removeAccent,
    isPalindrome
  }


export default _p;