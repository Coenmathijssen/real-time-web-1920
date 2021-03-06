// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/base64-js/index.js":[function(require,module,exports) {
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],"../node_modules/ieee754/index.js":[function(require,module,exports) {
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],"../node_modules/isarray/index.js":[function(require,module,exports) {
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],"../node_modules/buffer/index.js":[function(require,module,exports) {

var global = arguments[3];
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

},{"base64-js":"../node_modules/base64-js/index.js","ieee754":"../node_modules/ieee754/index.js","isarray":"../node_modules/isarray/index.js","buffer":"../node_modules/buffer/index.js"}],"socket/socket.io.js":[function(require,module,exports) {
var define;
var Buffer = require("buffer").Buffer;
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*!
 * Socket.IO v2.3.0
 * (c) 2014-2019 Guillermo Rauch
 * Released under the MIT License.
 */
!function (t, e) {
  "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) ? exports.io = e() : t.io = e();
}(this, function () {
  return function (t) {
    function e(r) {
      if (n[r]) return n[r].exports;
      var o = n[r] = {
        exports: {},
        id: r,
        loaded: !1
      };
      return t[r].call(o.exports, o, o.exports, e), o.loaded = !0, o.exports;
    }

    var n = {};
    return e.m = t, e.c = n, e.p = "", e(0);
  }([function (t, e, n) {
    function r(t, e) {
      "object" == _typeof(t) && (e = t, t = void 0), e = e || {};
      var n,
          r = o(t),
          i = r.source,
          u = r.id,
          p = r.path,
          h = c[u] && p in c[u].nsps,
          f = e.forceNew || e["force new connection"] || !1 === e.multiplex || h;
      return f ? (a("ignoring socket cache for %s", i), n = s(i, e)) : (c[u] || (a("new io instance for %s", i), c[u] = s(i, e)), n = c[u]), r.query && !e.query && (e.query = r.query), n.socket(r.path, e);
    }

    var o = n(1),
        i = n(7),
        s = n(15),
        a = n(3)("socket.io-client");
    t.exports = e = r;
    var c = e.managers = {};
    e.protocol = i.protocol, e.connect = r, e.Manager = n(15), e.Socket = n(39);
  }, function (t, e, n) {
    function r(t, e) {
      var n = t;
      e = e || "undefined" != typeof location && location, null == t && (t = e.protocol + "//" + e.host), "string" == typeof t && ("/" === t.charAt(0) && (t = "/" === t.charAt(1) ? e.protocol + t : e.host + t), /^(https?|wss?):\/\//.test(t) || (i("protocol-less url %s", t), t = "undefined" != typeof e ? e.protocol + "//" + t : "https://" + t), i("parse %s", t), n = o(t)), n.port || (/^(http|ws)$/.test(n.protocol) ? n.port = "80" : /^(http|ws)s$/.test(n.protocol) && (n.port = "443")), n.path = n.path || "/";
      var r = n.host.indexOf(":") !== -1,
          s = r ? "[" + n.host + "]" : n.host;
      return n.id = n.protocol + "://" + s + ":" + n.port, n.href = n.protocol + "://" + s + (e && e.port === n.port ? "" : ":" + n.port), n;
    }

    var o = n(2),
        i = n(3)("socket.io-client:url");
    t.exports = r;
  }, function (t, e) {
    var n = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
        r = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];

    t.exports = function (t) {
      var e = t,
          o = t.indexOf("["),
          i = t.indexOf("]");
      o != -1 && i != -1 && (t = t.substring(0, o) + t.substring(o, i).replace(/:/g, ";") + t.substring(i, t.length));

      for (var s = n.exec(t || ""), a = {}, c = 14; c--;) {
        a[r[c]] = s[c] || "";
      }

      return o != -1 && i != -1 && (a.source = e, a.host = a.host.substring(1, a.host.length - 1).replace(/;/g, ":"), a.authority = a.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), a.ipv6uri = !0), a;
    };
  }, function (t, e, n) {
    (function (r) {
      "use strict";

      function o() {
        return !("undefined" == typeof window || !window.process || "renderer" !== window.process.type && !window.process.__nwjs) || ("undefined" == typeof navigator || !navigator.userAgent || !navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) && ("undefined" != typeof document && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || "undefined" != typeof window && window.console && (window.console.firebug || window.console.exception && window.console.table) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
      }

      function i(e) {
        if (e[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + e[0] + (this.useColors ? "%c " : " ") + "+" + t.exports.humanize(this.diff), this.useColors) {
          var n = "color: " + this.color;
          e.splice(1, 0, n, "color: inherit");
          var r = 0,
              o = 0;
          e[0].replace(/%[a-zA-Z%]/g, function (t) {
            "%%" !== t && (r++, "%c" === t && (o = r));
          }), e.splice(o, 0, n);
        }
      }

      function s() {
        var t;
        return "object" === ("undefined" == typeof console ? "undefined" : p(console)) && console.log && (t = console).log.apply(t, arguments);
      }

      function a(t) {
        try {
          t ? e.storage.setItem("debug", t) : e.storage.removeItem("debug");
        } catch (n) {}
      }

      function c() {
        var t = void 0;

        try {
          t = e.storage.getItem("debug");
        } catch (n) {}

        return !t && "undefined" != typeof r && "env" in r && (t = r.env.DEBUG), t;
      }

      function u() {
        try {
          return localStorage;
        } catch (t) {}
      }

      var p = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (t) {
        return _typeof(t);
      } : function (t) {
        return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : _typeof(t);
      };
      e.log = s, e.formatArgs = i, e.save = a, e.load = c, e.useColors = o, e.storage = u(), e.colors = ["#0000CC", "#0000FF", "#0033CC", "#0033FF", "#0066CC", "#0066FF", "#0099CC", "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99", "#00CCCC", "#00CCFF", "#3300CC", "#3300FF", "#3333CC", "#3333FF", "#3366CC", "#3366FF", "#3399CC", "#3399FF", "#33CC00", "#33CC33", "#33CC66", "#33CC99", "#33CCCC", "#33CCFF", "#6600CC", "#6600FF", "#6633CC", "#6633FF", "#66CC00", "#66CC33", "#9900CC", "#9900FF", "#9933CC", "#9933FF", "#99CC00", "#99CC33", "#CC0000", "#CC0033", "#CC0066", "#CC0099", "#CC00CC", "#CC00FF", "#CC3300", "#CC3333", "#CC3366", "#CC3399", "#CC33CC", "#CC33FF", "#CC6600", "#CC6633", "#CC9900", "#CC9933", "#CCCC00", "#CCCC33", "#FF0000", "#FF0033", "#FF0066", "#FF0099", "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC", "#FF33FF", "#FF6600", "#FF6633", "#FF9900", "#FF9933", "#FFCC00", "#FFCC33"], t.exports = n(5)(e);
      var h = t.exports.formatters;

      h.j = function (t) {
        try {
          return JSON.stringify(t);
        } catch (e) {
          return "[UnexpectedJSONParseError]: " + e.message;
        }
      };
    }).call(e, n(4));
  }, function (t, e) {
    function n() {
      throw new Error("setTimeout has not been defined");
    }

    function r() {
      throw new Error("clearTimeout has not been defined");
    }

    function o(t) {
      if (p === setTimeout) return setTimeout(t, 0);
      if ((p === n || !p) && setTimeout) return p = setTimeout, setTimeout(t, 0);

      try {
        return p(t, 0);
      } catch (e) {
        try {
          return p.call(null, t, 0);
        } catch (e) {
          return p.call(this, t, 0);
        }
      }
    }

    function i(t) {
      if (h === clearTimeout) return clearTimeout(t);
      if ((h === r || !h) && clearTimeout) return h = clearTimeout, clearTimeout(t);

      try {
        return h(t);
      } catch (e) {
        try {
          return h.call(null, t);
        } catch (e) {
          return h.call(this, t);
        }
      }
    }

    function s() {
      y && l && (y = !1, l.length ? d = l.concat(d) : m = -1, d.length && a());
    }

    function a() {
      if (!y) {
        var t = o(s);
        y = !0;

        for (var e = d.length; e;) {
          for (l = d, d = []; ++m < e;) {
            l && l[m].run();
          }

          m = -1, e = d.length;
        }

        l = null, y = !1, i(t);
      }
    }

    function c(t, e) {
      this.fun = t, this.array = e;
    }

    function u() {}

    var p,
        h,
        f = t.exports = {};
    !function () {
      try {
        p = "function" == typeof setTimeout ? setTimeout : n;
      } catch (t) {
        p = n;
      }

      try {
        h = "function" == typeof clearTimeout ? clearTimeout : r;
      } catch (t) {
        h = r;
      }
    }();
    var l,
        d = [],
        y = !1,
        m = -1;
    f.nextTick = function (t) {
      var e = new Array(arguments.length - 1);
      if (arguments.length > 1) for (var n = 1; n < arguments.length; n++) {
        e[n - 1] = arguments[n];
      }
      d.push(new c(t, e)), 1 !== d.length || y || o(a);
    }, c.prototype.run = function () {
      this.fun.apply(null, this.array);
    }, f.title = "browser", f.browser = !0, f.env = {}, f.argv = [], f.version = "", f.versions = {}, f.on = u, f.addListener = u, f.once = u, f.off = u, f.removeListener = u, f.removeAllListeners = u, f.emit = u, f.prependListener = u, f.prependOnceListener = u, f.listeners = function (t) {
      return [];
    }, f.binding = function (t) {
      throw new Error("process.binding is not supported");
    }, f.cwd = function () {
      return "/";
    }, f.chdir = function (t) {
      throw new Error("process.chdir is not supported");
    }, f.umask = function () {
      return 0;
    };
  }, function (t, e, n) {
    "use strict";

    function r(t) {
      if (Array.isArray(t)) {
        for (var e = 0, n = Array(t.length); e < t.length; e++) {
          n[e] = t[e];
        }

        return n;
      }

      return Array.from(t);
    }

    function o(t) {
      function e(t) {
        for (var e = 0, n = 0; n < t.length; n++) {
          e = (e << 5) - e + t.charCodeAt(n), e |= 0;
        }

        return o.colors[Math.abs(e) % o.colors.length];
      }

      function o(t) {
        function n() {
          for (var t = arguments.length, e = Array(t), i = 0; i < t; i++) {
            e[i] = arguments[i];
          }

          if (n.enabled) {
            var s = n,
                a = Number(new Date()),
                c = a - (r || a);
            s.diff = c, s.prev = r, s.curr = a, r = a, e[0] = o.coerce(e[0]), "string" != typeof e[0] && e.unshift("%O");
            var u = 0;
            e[0] = e[0].replace(/%([a-zA-Z%])/g, function (t, n) {
              if ("%%" === t) return t;
              u++;
              var r = o.formatters[n];

              if ("function" == typeof r) {
                var i = e[u];
                t = r.call(s, i), e.splice(u, 1), u--;
              }

              return t;
            }), o.formatArgs.call(s, e);
            var p = s.log || o.log;
            p.apply(s, e);
          }
        }

        var r = void 0;
        return n.namespace = t, n.enabled = o.enabled(t), n.useColors = o.useColors(), n.color = e(t), n.destroy = i, n.extend = s, "function" == typeof o.init && o.init(n), o.instances.push(n), n;
      }

      function i() {
        var t = o.instances.indexOf(this);
        return t !== -1 && (o.instances.splice(t, 1), !0);
      }

      function s(t, e) {
        var n = o(this.namespace + ("undefined" == typeof e ? ":" : e) + t);
        return n.log = this.log, n;
      }

      function a(t) {
        o.save(t), o.names = [], o.skips = [];
        var e = void 0,
            n = ("string" == typeof t ? t : "").split(/[\s,]+/),
            r = n.length;

        for (e = 0; e < r; e++) {
          n[e] && (t = n[e].replace(/\*/g, ".*?"), "-" === t[0] ? o.skips.push(new RegExp("^" + t.substr(1) + "$")) : o.names.push(new RegExp("^" + t + "$")));
        }

        for (e = 0; e < o.instances.length; e++) {
          var i = o.instances[e];
          i.enabled = o.enabled(i.namespace);
        }
      }

      function c() {
        var t = [].concat(r(o.names.map(p)), r(o.skips.map(p).map(function (t) {
          return "-" + t;
        }))).join(",");
        return o.enable(""), t;
      }

      function u(t) {
        if ("*" === t[t.length - 1]) return !0;
        var e = void 0,
            n = void 0;

        for (e = 0, n = o.skips.length; e < n; e++) {
          if (o.skips[e].test(t)) return !1;
        }

        for (e = 0, n = o.names.length; e < n; e++) {
          if (o.names[e].test(t)) return !0;
        }

        return !1;
      }

      function p(t) {
        return t.toString().substring(2, t.toString().length - 2).replace(/\.\*\?$/, "*");
      }

      function h(t) {
        return t instanceof Error ? t.stack || t.message : t;
      }

      return o.debug = o, o["default"] = o, o.coerce = h, o.disable = c, o.enable = a, o.enabled = u, o.humanize = n(6), Object.keys(t).forEach(function (e) {
        o[e] = t[e];
      }), o.instances = [], o.names = [], o.skips = [], o.formatters = {}, o.selectColor = e, o.enable(o.load()), o;
    }

    t.exports = o;
  }, function (t, e) {
    function n(t) {
      if (t = String(t), !(t.length > 100)) {
        var e = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(t);

        if (e) {
          var n = parseFloat(e[1]),
              r = (e[2] || "ms").toLowerCase();

          switch (r) {
            case "years":
            case "year":
            case "yrs":
            case "yr":
            case "y":
              return n * h;

            case "weeks":
            case "week":
            case "w":
              return n * p;

            case "days":
            case "day":
            case "d":
              return n * u;

            case "hours":
            case "hour":
            case "hrs":
            case "hr":
            case "h":
              return n * c;

            case "minutes":
            case "minute":
            case "mins":
            case "min":
            case "m":
              return n * a;

            case "seconds":
            case "second":
            case "secs":
            case "sec":
            case "s":
              return n * s;

            case "milliseconds":
            case "millisecond":
            case "msecs":
            case "msec":
            case "ms":
              return n;

            default:
              return;
          }
        }
      }
    }

    function r(t) {
      var e = Math.abs(t);
      return e >= u ? Math.round(t / u) + "d" : e >= c ? Math.round(t / c) + "h" : e >= a ? Math.round(t / a) + "m" : e >= s ? Math.round(t / s) + "s" : t + "ms";
    }

    function o(t) {
      var e = Math.abs(t);
      return e >= u ? i(t, e, u, "day") : e >= c ? i(t, e, c, "hour") : e >= a ? i(t, e, a, "minute") : e >= s ? i(t, e, s, "second") : t + " ms";
    }

    function i(t, e, n, r) {
      var o = e >= 1.5 * n;
      return Math.round(t / n) + " " + r + (o ? "s" : "");
    }

    var s = 1e3,
        a = 60 * s,
        c = 60 * a,
        u = 24 * c,
        p = 7 * u,
        h = 365.25 * u;

    t.exports = function (t, e) {
      e = e || {};

      var i = _typeof(t);

      if ("string" === i && t.length > 0) return n(t);
      if ("number" === i && isFinite(t)) return e["long"] ? o(t) : r(t);
      throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(t));
    };
  }, function (t, e, n) {
    function r() {}

    function o(t) {
      var n = "" + t.type;

      if (e.BINARY_EVENT !== t.type && e.BINARY_ACK !== t.type || (n += t.attachments + "-"), t.nsp && "/" !== t.nsp && (n += t.nsp + ","), null != t.id && (n += t.id), null != t.data) {
        var r = i(t.data);
        if (r === !1) return g;
        n += r;
      }

      return f("encoded %j as %s", t, n), n;
    }

    function i(t) {
      try {
        return JSON.stringify(t);
      } catch (e) {
        return !1;
      }
    }

    function s(t, e) {
      function n(t) {
        var n = d.deconstructPacket(t),
            r = o(n.packet),
            i = n.buffers;
        i.unshift(r), e(i);
      }

      d.removeBlobs(t, n);
    }

    function a() {
      this.reconstructor = null;
    }

    function c(t) {
      var n = 0,
          r = {
        type: Number(t.charAt(0))
      };
      if (null == e.types[r.type]) return h("unknown packet type " + r.type);

      if (e.BINARY_EVENT === r.type || e.BINARY_ACK === r.type) {
        for (var o = ""; "-" !== t.charAt(++n) && (o += t.charAt(n), n != t.length);) {
          ;
        }

        if (o != Number(o) || "-" !== t.charAt(n)) throw new Error("Illegal attachments");
        r.attachments = Number(o);
      }

      if ("/" === t.charAt(n + 1)) for (r.nsp = ""; ++n;) {
        var i = t.charAt(n);
        if ("," === i) break;
        if (r.nsp += i, n === t.length) break;
      } else r.nsp = "/";
      var s = t.charAt(n + 1);

      if ("" !== s && Number(s) == s) {
        for (r.id = ""; ++n;) {
          var i = t.charAt(n);

          if (null == i || Number(i) != i) {
            --n;
            break;
          }

          if (r.id += t.charAt(n), n === t.length) break;
        }

        r.id = Number(r.id);
      }

      if (t.charAt(++n)) {
        var a = u(t.substr(n)),
            c = a !== !1 && (r.type === e.ERROR || y(a));
        if (!c) return h("invalid payload");
        r.data = a;
      }

      return f("decoded %s as %j", t, r), r;
    }

    function u(t) {
      try {
        return JSON.parse(t);
      } catch (e) {
        return !1;
      }
    }

    function p(t) {
      this.reconPack = t, this.buffers = [];
    }

    function h(t) {
      return {
        type: e.ERROR,
        data: "parser error: " + t
      };
    }

    var f = n(8)("socket.io-parser"),
        l = n(11),
        d = n(12),
        y = n(13),
        m = n(14);
    e.protocol = 4, e.types = ["CONNECT", "DISCONNECT", "EVENT", "ACK", "ERROR", "BINARY_EVENT", "BINARY_ACK"], e.CONNECT = 0, e.DISCONNECT = 1, e.EVENT = 2, e.ACK = 3, e.ERROR = 4, e.BINARY_EVENT = 5, e.BINARY_ACK = 6, e.Encoder = r, e.Decoder = a;
    var g = e.ERROR + '"encode error"';
    r.prototype.encode = function (t, n) {
      if (f("encoding packet %j", t), e.BINARY_EVENT === t.type || e.BINARY_ACK === t.type) s(t, n);else {
        var r = o(t);
        n([r]);
      }
    }, l(a.prototype), a.prototype.add = function (t) {
      var n;
      if ("string" == typeof t) n = c(t), e.BINARY_EVENT === n.type || e.BINARY_ACK === n.type ? (this.reconstructor = new p(n), 0 === this.reconstructor.reconPack.attachments && this.emit("decoded", n)) : this.emit("decoded", n);else {
        if (!m(t) && !t.base64) throw new Error("Unknown type: " + t);
        if (!this.reconstructor) throw new Error("got binary data when not reconstructing a packet");
        n = this.reconstructor.takeBinaryData(t), n && (this.reconstructor = null, this.emit("decoded", n));
      }
    }, a.prototype.destroy = function () {
      this.reconstructor && this.reconstructor.finishedReconstruction();
    }, p.prototype.takeBinaryData = function (t) {
      if (this.buffers.push(t), this.buffers.length === this.reconPack.attachments) {
        var e = d.reconstructPacket(this.reconPack, this.buffers);
        return this.finishedReconstruction(), e;
      }

      return null;
    }, p.prototype.finishedReconstruction = function () {
      this.reconPack = null, this.buffers = [];
    };
  }, function (t, e, n) {
    (function (r) {
      "use strict";

      function o() {
        return !("undefined" == typeof window || !window.process || "renderer" !== window.process.type) || ("undefined" == typeof navigator || !navigator.userAgent || !navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) && ("undefined" != typeof document && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || "undefined" != typeof window && window.console && (window.console.firebug || window.console.exception && window.console.table) || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || "undefined" != typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
      }

      function i(t) {
        var n = this.useColors;

        if (t[0] = (n ? "%c" : "") + this.namespace + (n ? " %c" : " ") + t[0] + (n ? "%c " : " ") + "+" + e.humanize(this.diff), n) {
          var r = "color: " + this.color;
          t.splice(1, 0, r, "color: inherit");
          var o = 0,
              i = 0;
          t[0].replace(/%[a-zA-Z%]/g, function (t) {
            "%%" !== t && (o++, "%c" === t && (i = o));
          }), t.splice(i, 0, r);
        }
      }

      function s() {
        return "object" === ("undefined" == typeof console ? "undefined" : p(console)) && console.log && Function.prototype.apply.call(console.log, console, arguments);
      }

      function a(t) {
        try {
          null == t ? e.storage.removeItem("debug") : e.storage.debug = t;
        } catch (n) {}
      }

      function c() {
        var t;

        try {
          t = e.storage.debug;
        } catch (n) {}

        return !t && "undefined" != typeof r && "env" in r && (t = r.env.DEBUG), t;
      }

      function u() {
        try {
          return window.localStorage;
        } catch (t) {}
      }

      var p = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (t) {
        return _typeof(t);
      } : function (t) {
        return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : _typeof(t);
      };
      e = t.exports = n(9), e.log = s, e.formatArgs = i, e.save = a, e.load = c, e.useColors = o, e.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : u(), e.colors = ["#0000CC", "#0000FF", "#0033CC", "#0033FF", "#0066CC", "#0066FF", "#0099CC", "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99", "#00CCCC", "#00CCFF", "#3300CC", "#3300FF", "#3333CC", "#3333FF", "#3366CC", "#3366FF", "#3399CC", "#3399FF", "#33CC00", "#33CC33", "#33CC66", "#33CC99", "#33CCCC", "#33CCFF", "#6600CC", "#6600FF", "#6633CC", "#6633FF", "#66CC00", "#66CC33", "#9900CC", "#9900FF", "#9933CC", "#9933FF", "#99CC00", "#99CC33", "#CC0000", "#CC0033", "#CC0066", "#CC0099", "#CC00CC", "#CC00FF", "#CC3300", "#CC3333", "#CC3366", "#CC3399", "#CC33CC", "#CC33FF", "#CC6600", "#CC6633", "#CC9900", "#CC9933", "#CCCC00", "#CCCC33", "#FF0000", "#FF0033", "#FF0066", "#FF0099", "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC", "#FF33FF", "#FF6600", "#FF6633", "#FF9900", "#FF9933", "#FFCC00", "#FFCC33"], e.formatters.j = function (t) {
        try {
          return JSON.stringify(t);
        } catch (e) {
          return "[UnexpectedJSONParseError]: " + e.message;
        }
      }, e.enable(c());
    }).call(e, n(4));
  }, function (t, e, n) {
    "use strict";

    function r(t) {
      var n,
          r = 0;

      for (n in t) {
        r = (r << 5) - r + t.charCodeAt(n), r |= 0;
      }

      return e.colors[Math.abs(r) % e.colors.length];
    }

    function o(t) {
      function n() {
        if (n.enabled) {
          var t = n,
              r = +new Date(),
              i = r - (o || r);
          t.diff = i, t.prev = o, t.curr = r, o = r;

          for (var s = new Array(arguments.length), a = 0; a < s.length; a++) {
            s[a] = arguments[a];
          }

          s[0] = e.coerce(s[0]), "string" != typeof s[0] && s.unshift("%O");
          var c = 0;
          s[0] = s[0].replace(/%([a-zA-Z%])/g, function (n, r) {
            if ("%%" === n) return n;
            c++;
            var o = e.formatters[r];

            if ("function" == typeof o) {
              var i = s[c];
              n = o.call(t, i), s.splice(c, 1), c--;
            }

            return n;
          }), e.formatArgs.call(t, s);
          var u = n.log || e.log || console.log.bind(console);
          u.apply(t, s);
        }
      }

      var o;
      return n.namespace = t, n.enabled = e.enabled(t), n.useColors = e.useColors(), n.color = r(t), n.destroy = i, "function" == typeof e.init && e.init(n), e.instances.push(n), n;
    }

    function i() {
      var t = e.instances.indexOf(this);
      return t !== -1 && (e.instances.splice(t, 1), !0);
    }

    function s(t) {
      e.save(t), e.names = [], e.skips = [];
      var n,
          r = ("string" == typeof t ? t : "").split(/[\s,]+/),
          o = r.length;

      for (n = 0; n < o; n++) {
        r[n] && (t = r[n].replace(/\*/g, ".*?"), "-" === t[0] ? e.skips.push(new RegExp("^" + t.substr(1) + "$")) : e.names.push(new RegExp("^" + t + "$")));
      }

      for (n = 0; n < e.instances.length; n++) {
        var i = e.instances[n];
        i.enabled = e.enabled(i.namespace);
      }
    }

    function a() {
      e.enable("");
    }

    function c(t) {
      if ("*" === t[t.length - 1]) return !0;
      var n, r;

      for (n = 0, r = e.skips.length; n < r; n++) {
        if (e.skips[n].test(t)) return !1;
      }

      for (n = 0, r = e.names.length; n < r; n++) {
        if (e.names[n].test(t)) return !0;
      }

      return !1;
    }

    function u(t) {
      return t instanceof Error ? t.stack || t.message : t;
    }

    e = t.exports = o.debug = o["default"] = o, e.coerce = u, e.disable = a, e.enable = s, e.enabled = c, e.humanize = n(10), e.instances = [], e.names = [], e.skips = [], e.formatters = {};
  }, function (t, e) {
    function n(t) {
      if (t = String(t), !(t.length > 100)) {
        var e = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(t);

        if (e) {
          var n = parseFloat(e[1]),
              r = (e[2] || "ms").toLowerCase();

          switch (r) {
            case "years":
            case "year":
            case "yrs":
            case "yr":
            case "y":
              return n * p;

            case "days":
            case "day":
            case "d":
              return n * u;

            case "hours":
            case "hour":
            case "hrs":
            case "hr":
            case "h":
              return n * c;

            case "minutes":
            case "minute":
            case "mins":
            case "min":
            case "m":
              return n * a;

            case "seconds":
            case "second":
            case "secs":
            case "sec":
            case "s":
              return n * s;

            case "milliseconds":
            case "millisecond":
            case "msecs":
            case "msec":
            case "ms":
              return n;

            default:
              return;
          }
        }
      }
    }

    function r(t) {
      return t >= u ? Math.round(t / u) + "d" : t >= c ? Math.round(t / c) + "h" : t >= a ? Math.round(t / a) + "m" : t >= s ? Math.round(t / s) + "s" : t + "ms";
    }

    function o(t) {
      return i(t, u, "day") || i(t, c, "hour") || i(t, a, "minute") || i(t, s, "second") || t + " ms";
    }

    function i(t, e, n) {
      if (!(t < e)) return t < 1.5 * e ? Math.floor(t / e) + " " + n : Math.ceil(t / e) + " " + n + "s";
    }

    var s = 1e3,
        a = 60 * s,
        c = 60 * a,
        u = 24 * c,
        p = 365.25 * u;

    t.exports = function (t, e) {
      e = e || {};

      var i = _typeof(t);

      if ("string" === i && t.length > 0) return n(t);
      if ("number" === i && isNaN(t) === !1) return e["long"] ? o(t) : r(t);
      throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(t));
    };
  }, function (t, e, n) {
    function r(t) {
      if (t) return o(t);
    }

    function o(t) {
      for (var e in r.prototype) {
        t[e] = r.prototype[e];
      }

      return t;
    }

    t.exports = r, r.prototype.on = r.prototype.addEventListener = function (t, e) {
      return this._callbacks = this._callbacks || {}, (this._callbacks["$" + t] = this._callbacks["$" + t] || []).push(e), this;
    }, r.prototype.once = function (t, e) {
      function n() {
        this.off(t, n), e.apply(this, arguments);
      }

      return n.fn = e, this.on(t, n), this;
    }, r.prototype.off = r.prototype.removeListener = r.prototype.removeAllListeners = r.prototype.removeEventListener = function (t, e) {
      if (this._callbacks = this._callbacks || {}, 0 == arguments.length) return this._callbacks = {}, this;
      var n = this._callbacks["$" + t];
      if (!n) return this;
      if (1 == arguments.length) return delete this._callbacks["$" + t], this;

      for (var r, o = 0; o < n.length; o++) {
        if (r = n[o], r === e || r.fn === e) {
          n.splice(o, 1);
          break;
        }
      }

      return this;
    }, r.prototype.emit = function (t) {
      this._callbacks = this._callbacks || {};
      var e = [].slice.call(arguments, 1),
          n = this._callbacks["$" + t];

      if (n) {
        n = n.slice(0);

        for (var r = 0, o = n.length; r < o; ++r) {
          n[r].apply(this, e);
        }
      }

      return this;
    }, r.prototype.listeners = function (t) {
      return this._callbacks = this._callbacks || {}, this._callbacks["$" + t] || [];
    }, r.prototype.hasListeners = function (t) {
      return !!this.listeners(t).length;
    };
  }, function (t, e, n) {
    function r(t, e) {
      if (!t) return t;

      if (s(t)) {
        var n = {
          _placeholder: !0,
          num: e.length
        };
        return e.push(t), n;
      }

      if (i(t)) {
        for (var o = new Array(t.length), a = 0; a < t.length; a++) {
          o[a] = r(t[a], e);
        }

        return o;
      }

      if ("object" == _typeof(t) && !(t instanceof Date)) {
        var o = {};

        for (var c in t) {
          o[c] = r(t[c], e);
        }

        return o;
      }

      return t;
    }

    function o(t, e) {
      if (!t) return t;
      if (t && t._placeholder) return e[t.num];
      if (i(t)) for (var n = 0; n < t.length; n++) {
        t[n] = o(t[n], e);
      } else if ("object" == _typeof(t)) for (var r in t) {
        t[r] = o(t[r], e);
      }
      return t;
    }

    var i = n(13),
        s = n(14),
        a = Object.prototype.toString,
        c = "function" == typeof Blob || "undefined" != typeof Blob && "[object BlobConstructor]" === a.call(Blob),
        u = "function" == typeof File || "undefined" != typeof File && "[object FileConstructor]" === a.call(File);
    e.deconstructPacket = function (t) {
      var e = [],
          n = t.data,
          o = t;
      return o.data = r(n, e), o.attachments = e.length, {
        packet: o,
        buffers: e
      };
    }, e.reconstructPacket = function (t, e) {
      return t.data = o(t.data, e), t.attachments = void 0, t;
    }, e.removeBlobs = function (t, e) {
      function n(t, a, p) {
        if (!t) return t;

        if (c && t instanceof Blob || u && t instanceof File) {
          r++;
          var h = new FileReader();
          h.onload = function () {
            p ? p[a] = this.result : o = this.result, --r || e(o);
          }, h.readAsArrayBuffer(t);
        } else if (i(t)) for (var f = 0; f < t.length; f++) {
          n(t[f], f, t);
        } else if ("object" == _typeof(t) && !s(t)) for (var l in t) {
          n(t[l], l, t);
        }
      }

      var r = 0,
          o = t;
      n(o), r || e(o);
    };
  }, function (t, e) {
    var n = {}.toString;

    t.exports = Array.isArray || function (t) {
      return "[object Array]" == n.call(t);
    };
  }, function (t, e) {
    function n(t) {
      return r && Buffer.isBuffer(t) || o && (t instanceof ArrayBuffer || i(t));
    }

    t.exports = n;

    var r = "function" == typeof Buffer && "function" == typeof Buffer.isBuffer,
        o = "function" == typeof ArrayBuffer,
        i = function i(t) {
      return "function" == typeof ArrayBuffer.isView ? ArrayBuffer.isView(t) : t.buffer instanceof ArrayBuffer;
    };
  }, function (t, e, n) {
    function r(t, e) {
      if (!(this instanceof r)) return new r(t, e);
      t && "object" == _typeof(t) && (e = t, t = void 0), e = e || {}, e.path = e.path || "/socket.io", this.nsps = {}, this.subs = [], this.opts = e, this.reconnection(e.reconnection !== !1), this.reconnectionAttempts(e.reconnectionAttempts || 1 / 0), this.reconnectionDelay(e.reconnectionDelay || 1e3), this.reconnectionDelayMax(e.reconnectionDelayMax || 5e3), this.randomizationFactor(e.randomizationFactor || .5), this.backoff = new f({
        min: this.reconnectionDelay(),
        max: this.reconnectionDelayMax(),
        jitter: this.randomizationFactor()
      }), this.timeout(null == e.timeout ? 2e4 : e.timeout), this.readyState = "closed", this.uri = t, this.connecting = [], this.lastPing = null, this.encoding = !1, this.packetBuffer = [];
      var n = e.parser || a;
      this.encoder = new n.Encoder(), this.decoder = new n.Decoder(), this.autoConnect = e.autoConnect !== !1, this.autoConnect && this.open();
    }

    var o = n(16),
        i = n(39),
        s = n(11),
        a = n(7),
        c = n(41),
        u = n(42),
        p = n(3)("socket.io-client:manager"),
        h = n(38),
        f = n(43),
        l = Object.prototype.hasOwnProperty;
    t.exports = r, r.prototype.emitAll = function () {
      this.emit.apply(this, arguments);

      for (var t in this.nsps) {
        l.call(this.nsps, t) && this.nsps[t].emit.apply(this.nsps[t], arguments);
      }
    }, r.prototype.updateSocketIds = function () {
      for (var t in this.nsps) {
        l.call(this.nsps, t) && (this.nsps[t].id = this.generateId(t));
      }
    }, r.prototype.generateId = function (t) {
      return ("/" === t ? "" : t + "#") + this.engine.id;
    }, s(r.prototype), r.prototype.reconnection = function (t) {
      return arguments.length ? (this._reconnection = !!t, this) : this._reconnection;
    }, r.prototype.reconnectionAttempts = function (t) {
      return arguments.length ? (this._reconnectionAttempts = t, this) : this._reconnectionAttempts;
    }, r.prototype.reconnectionDelay = function (t) {
      return arguments.length ? (this._reconnectionDelay = t, this.backoff && this.backoff.setMin(t), this) : this._reconnectionDelay;
    }, r.prototype.randomizationFactor = function (t) {
      return arguments.length ? (this._randomizationFactor = t, this.backoff && this.backoff.setJitter(t), this) : this._randomizationFactor;
    }, r.prototype.reconnectionDelayMax = function (t) {
      return arguments.length ? (this._reconnectionDelayMax = t, this.backoff && this.backoff.setMax(t), this) : this._reconnectionDelayMax;
    }, r.prototype.timeout = function (t) {
      return arguments.length ? (this._timeout = t, this) : this._timeout;
    }, r.prototype.maybeReconnectOnOpen = function () {
      !this.reconnecting && this._reconnection && 0 === this.backoff.attempts && this.reconnect();
    }, r.prototype.open = r.prototype.connect = function (t, e) {
      if (p("readyState %s", this.readyState), ~this.readyState.indexOf("open")) return this;
      p("opening %s", this.uri), this.engine = o(this.uri, this.opts);
      var n = this.engine,
          r = this;
      this.readyState = "opening", this.skipReconnect = !1;
      var i = c(n, "open", function () {
        r.onopen(), t && t();
      }),
          s = c(n, "error", function (e) {
        if (p("connect_error"), r.cleanup(), r.readyState = "closed", r.emitAll("connect_error", e), t) {
          var n = new Error("Connection error");
          n.data = e, t(n);
        } else r.maybeReconnectOnOpen();
      });

      if (!1 !== this._timeout) {
        var a = this._timeout;
        p("connect attempt will timeout after %d", a);
        var u = setTimeout(function () {
          p("connect attempt timed out after %d", a), i.destroy(), n.close(), n.emit("error", "timeout"), r.emitAll("connect_timeout", a);
        }, a);
        this.subs.push({
          destroy: function destroy() {
            clearTimeout(u);
          }
        });
      }

      return this.subs.push(i), this.subs.push(s), this;
    }, r.prototype.onopen = function () {
      p("open"), this.cleanup(), this.readyState = "open", this.emit("open");
      var t = this.engine;
      this.subs.push(c(t, "data", u(this, "ondata"))), this.subs.push(c(t, "ping", u(this, "onping"))), this.subs.push(c(t, "pong", u(this, "onpong"))), this.subs.push(c(t, "error", u(this, "onerror"))), this.subs.push(c(t, "close", u(this, "onclose"))), this.subs.push(c(this.decoder, "decoded", u(this, "ondecoded")));
    }, r.prototype.onping = function () {
      this.lastPing = new Date(), this.emitAll("ping");
    }, r.prototype.onpong = function () {
      this.emitAll("pong", new Date() - this.lastPing);
    }, r.prototype.ondata = function (t) {
      this.decoder.add(t);
    }, r.prototype.ondecoded = function (t) {
      this.emit("packet", t);
    }, r.prototype.onerror = function (t) {
      p("error", t), this.emitAll("error", t);
    }, r.prototype.socket = function (t, e) {
      function n() {
        ~h(o.connecting, r) || o.connecting.push(r);
      }

      var r = this.nsps[t];

      if (!r) {
        r = new i(this, t, e), this.nsps[t] = r;
        var o = this;
        r.on("connecting", n), r.on("connect", function () {
          r.id = o.generateId(t);
        }), this.autoConnect && n();
      }

      return r;
    }, r.prototype.destroy = function (t) {
      var e = h(this.connecting, t);
      ~e && this.connecting.splice(e, 1), this.connecting.length || this.close();
    }, r.prototype.packet = function (t) {
      p("writing packet %j", t);
      var e = this;
      t.query && 0 === t.type && (t.nsp += "?" + t.query), e.encoding ? e.packetBuffer.push(t) : (e.encoding = !0, this.encoder.encode(t, function (n) {
        for (var r = 0; r < n.length; r++) {
          e.engine.write(n[r], t.options);
        }

        e.encoding = !1, e.processPacketQueue();
      }));
    }, r.prototype.processPacketQueue = function () {
      if (this.packetBuffer.length > 0 && !this.encoding) {
        var t = this.packetBuffer.shift();
        this.packet(t);
      }
    }, r.prototype.cleanup = function () {
      p("cleanup");

      for (var t = this.subs.length, e = 0; e < t; e++) {
        var n = this.subs.shift();
        n.destroy();
      }

      this.packetBuffer = [], this.encoding = !1, this.lastPing = null, this.decoder.destroy();
    }, r.prototype.close = r.prototype.disconnect = function () {
      p("disconnect"), this.skipReconnect = !0, this.reconnecting = !1, "opening" === this.readyState && this.cleanup(), this.backoff.reset(), this.readyState = "closed", this.engine && this.engine.close();
    }, r.prototype.onclose = function (t) {
      p("onclose"), this.cleanup(), this.backoff.reset(), this.readyState = "closed", this.emit("close", t), this._reconnection && !this.skipReconnect && this.reconnect();
    }, r.prototype.reconnect = function () {
      if (this.reconnecting || this.skipReconnect) return this;
      var t = this;
      if (this.backoff.attempts >= this._reconnectionAttempts) p("reconnect failed"), this.backoff.reset(), this.emitAll("reconnect_failed"), this.reconnecting = !1;else {
        var e = this.backoff.duration();
        p("will wait %dms before reconnect attempt", e), this.reconnecting = !0;
        var n = setTimeout(function () {
          t.skipReconnect || (p("attempting reconnect"), t.emitAll("reconnect_attempt", t.backoff.attempts), t.emitAll("reconnecting", t.backoff.attempts), t.skipReconnect || t.open(function (e) {
            e ? (p("reconnect attempt error"), t.reconnecting = !1, t.reconnect(), t.emitAll("reconnect_error", e.data)) : (p("reconnect success"), t.onreconnect());
          }));
        }, e);
        this.subs.push({
          destroy: function destroy() {
            clearTimeout(n);
          }
        });
      }
    }, r.prototype.onreconnect = function () {
      var t = this.backoff.attempts;
      this.reconnecting = !1, this.backoff.reset(), this.updateSocketIds(), this.emitAll("reconnect", t);
    };
  }, function (t, e, n) {
    t.exports = n(17), t.exports.parser = n(24);
  }, function (t, e, n) {
    function r(t, e) {
      return this instanceof r ? (e = e || {}, t && "object" == _typeof(t) && (e = t, t = null), t ? (t = p(t), e.hostname = t.host, e.secure = "https" === t.protocol || "wss" === t.protocol, e.port = t.port, t.query && (e.query = t.query)) : e.host && (e.hostname = p(e.host).host), this.secure = null != e.secure ? e.secure : "undefined" != typeof location && "https:" === location.protocol, e.hostname && !e.port && (e.port = this.secure ? "443" : "80"), this.agent = e.agent || !1, this.hostname = e.hostname || ("undefined" != typeof location ? location.hostname : "localhost"), this.port = e.port || ("undefined" != typeof location && location.port ? location.port : this.secure ? 443 : 80), this.query = e.query || {}, "string" == typeof this.query && (this.query = h.decode(this.query)), this.upgrade = !1 !== e.upgrade, this.path = (e.path || "/engine.io").replace(/\/$/, "") + "/", this.forceJSONP = !!e.forceJSONP, this.jsonp = !1 !== e.jsonp, this.forceBase64 = !!e.forceBase64, this.enablesXDR = !!e.enablesXDR, this.withCredentials = !1 !== e.withCredentials, this.timestampParam = e.timestampParam || "t", this.timestampRequests = e.timestampRequests, this.transports = e.transports || ["polling", "websocket"], this.transportOptions = e.transportOptions || {}, this.readyState = "", this.writeBuffer = [], this.prevBufferLen = 0, this.policyPort = e.policyPort || 843, this.rememberUpgrade = e.rememberUpgrade || !1, this.binaryType = null, this.onlyBinaryUpgrades = e.onlyBinaryUpgrades, this.perMessageDeflate = !1 !== e.perMessageDeflate && (e.perMessageDeflate || {}), !0 === this.perMessageDeflate && (this.perMessageDeflate = {}), this.perMessageDeflate && null == this.perMessageDeflate.threshold && (this.perMessageDeflate.threshold = 1024), this.pfx = e.pfx || null, this.key = e.key || null, this.passphrase = e.passphrase || null, this.cert = e.cert || null, this.ca = e.ca || null, this.ciphers = e.ciphers || null, this.rejectUnauthorized = void 0 === e.rejectUnauthorized || e.rejectUnauthorized, this.forceNode = !!e.forceNode, this.isReactNative = "undefined" != typeof navigator && "string" == typeof navigator.product && "reactnative" === navigator.product.toLowerCase(), ("undefined" == typeof self || this.isReactNative) && (e.extraHeaders && Object.keys(e.extraHeaders).length > 0 && (this.extraHeaders = e.extraHeaders), e.localAddress && (this.localAddress = e.localAddress)), this.id = null, this.upgrades = null, this.pingInterval = null, this.pingTimeout = null, this.pingIntervalTimer = null, this.pingTimeoutTimer = null, void this.open()) : new r(t, e);
    }

    function o(t) {
      var e = {};

      for (var n in t) {
        t.hasOwnProperty(n) && (e[n] = t[n]);
      }

      return e;
    }

    var i = n(18),
        s = n(11),
        a = n(3)("engine.io-client:socket"),
        c = n(38),
        u = n(24),
        p = n(2),
        h = n(32);
    t.exports = r, r.priorWebsocketSuccess = !1, s(r.prototype), r.protocol = u.protocol, r.Socket = r, r.Transport = n(23), r.transports = n(18), r.parser = n(24), r.prototype.createTransport = function (t) {
      a('creating transport "%s"', t);
      var e = o(this.query);
      e.EIO = u.protocol, e.transport = t;
      var n = this.transportOptions[t] || {};
      this.id && (e.sid = this.id);
      var r = new i[t]({
        query: e,
        socket: this,
        agent: n.agent || this.agent,
        hostname: n.hostname || this.hostname,
        port: n.port || this.port,
        secure: n.secure || this.secure,
        path: n.path || this.path,
        forceJSONP: n.forceJSONP || this.forceJSONP,
        jsonp: n.jsonp || this.jsonp,
        forceBase64: n.forceBase64 || this.forceBase64,
        enablesXDR: n.enablesXDR || this.enablesXDR,
        withCredentials: n.withCredentials || this.withCredentials,
        timestampRequests: n.timestampRequests || this.timestampRequests,
        timestampParam: n.timestampParam || this.timestampParam,
        policyPort: n.policyPort || this.policyPort,
        pfx: n.pfx || this.pfx,
        key: n.key || this.key,
        passphrase: n.passphrase || this.passphrase,
        cert: n.cert || this.cert,
        ca: n.ca || this.ca,
        ciphers: n.ciphers || this.ciphers,
        rejectUnauthorized: n.rejectUnauthorized || this.rejectUnauthorized,
        perMessageDeflate: n.perMessageDeflate || this.perMessageDeflate,
        extraHeaders: n.extraHeaders || this.extraHeaders,
        forceNode: n.forceNode || this.forceNode,
        localAddress: n.localAddress || this.localAddress,
        requestTimeout: n.requestTimeout || this.requestTimeout,
        protocols: n.protocols || void 0,
        isReactNative: this.isReactNative
      });
      return r;
    }, r.prototype.open = function () {
      var t;
      if (this.rememberUpgrade && r.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1) t = "websocket";else {
        if (0 === this.transports.length) {
          var e = this;
          return void setTimeout(function () {
            e.emit("error", "No transports available");
          }, 0);
        }

        t = this.transports[0];
      }
      this.readyState = "opening";

      try {
        t = this.createTransport(t);
      } catch (n) {
        return this.transports.shift(), void this.open();
      }

      t.open(), this.setTransport(t);
    }, r.prototype.setTransport = function (t) {
      a("setting transport %s", t.name);
      var e = this;
      this.transport && (a("clearing existing transport %s", this.transport.name), this.transport.removeAllListeners()), this.transport = t, t.on("drain", function () {
        e.onDrain();
      }).on("packet", function (t) {
        e.onPacket(t);
      }).on("error", function (t) {
        e.onError(t);
      }).on("close", function () {
        e.onClose("transport close");
      });
    }, r.prototype.probe = function (t) {
      function e() {
        if (f.onlyBinaryUpgrades) {
          var e = !this.supportsBinary && f.transport.supportsBinary;
          h = h || e;
        }

        h || (a('probe transport "%s" opened', t), p.send([{
          type: "ping",
          data: "probe"
        }]), p.once("packet", function (e) {
          if (!h) if ("pong" === e.type && "probe" === e.data) {
            if (a('probe transport "%s" pong', t), f.upgrading = !0, f.emit("upgrading", p), !p) return;
            r.priorWebsocketSuccess = "websocket" === p.name, a('pausing current transport "%s"', f.transport.name), f.transport.pause(function () {
              h || "closed" !== f.readyState && (a("changing transport and sending upgrade packet"), u(), f.setTransport(p), p.send([{
                type: "upgrade"
              }]), f.emit("upgrade", p), p = null, f.upgrading = !1, f.flush());
            });
          } else {
            a('probe transport "%s" failed', t);
            var n = new Error("probe error");
            n.transport = p.name, f.emit("upgradeError", n);
          }
        }));
      }

      function n() {
        h || (h = !0, u(), p.close(), p = null);
      }

      function o(e) {
        var r = new Error("probe error: " + e);
        r.transport = p.name, n(), a('probe transport "%s" failed because of error: %s', t, e), f.emit("upgradeError", r);
      }

      function i() {
        o("transport closed");
      }

      function s() {
        o("socket closed");
      }

      function c(t) {
        p && t.name !== p.name && (a('"%s" works - aborting "%s"', t.name, p.name), n());
      }

      function u() {
        p.removeListener("open", e), p.removeListener("error", o), p.removeListener("close", i), f.removeListener("close", s), f.removeListener("upgrading", c);
      }

      a('probing transport "%s"', t);
      var p = this.createTransport(t, {
        probe: 1
      }),
          h = !1,
          f = this;
      r.priorWebsocketSuccess = !1, p.once("open", e), p.once("error", o), p.once("close", i), this.once("close", s), this.once("upgrading", c), p.open();
    }, r.prototype.onOpen = function () {
      if (a("socket open"), this.readyState = "open", r.priorWebsocketSuccess = "websocket" === this.transport.name, this.emit("open"), this.flush(), "open" === this.readyState && this.upgrade && this.transport.pause) {
        a("starting upgrade probes");

        for (var t = 0, e = this.upgrades.length; t < e; t++) {
          this.probe(this.upgrades[t]);
        }
      }
    }, r.prototype.onPacket = function (t) {
      if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) switch (a('socket receive: type "%s", data "%s"', t.type, t.data), this.emit("packet", t), this.emit("heartbeat"), t.type) {
        case "open":
          this.onHandshake(JSON.parse(t.data));
          break;

        case "pong":
          this.setPing(), this.emit("pong");
          break;

        case "error":
          var e = new Error("server error");
          e.code = t.data, this.onError(e);
          break;

        case "message":
          this.emit("data", t.data), this.emit("message", t.data);
      } else a('packet received with socket readyState "%s"', this.readyState);
    }, r.prototype.onHandshake = function (t) {
      this.emit("handshake", t), this.id = t.sid, this.transport.query.sid = t.sid, this.upgrades = this.filterUpgrades(t.upgrades), this.pingInterval = t.pingInterval, this.pingTimeout = t.pingTimeout, this.onOpen(), "closed" !== this.readyState && (this.setPing(), this.removeListener("heartbeat", this.onHeartbeat), this.on("heartbeat", this.onHeartbeat));
    }, r.prototype.onHeartbeat = function (t) {
      clearTimeout(this.pingTimeoutTimer);
      var e = this;
      e.pingTimeoutTimer = setTimeout(function () {
        "closed" !== e.readyState && e.onClose("ping timeout");
      }, t || e.pingInterval + e.pingTimeout);
    }, r.prototype.setPing = function () {
      var t = this;
      clearTimeout(t.pingIntervalTimer), t.pingIntervalTimer = setTimeout(function () {
        a("writing ping packet - expecting pong within %sms", t.pingTimeout), t.ping(), t.onHeartbeat(t.pingTimeout);
      }, t.pingInterval);
    }, r.prototype.ping = function () {
      var t = this;
      this.sendPacket("ping", function () {
        t.emit("ping");
      });
    }, r.prototype.onDrain = function () {
      this.writeBuffer.splice(0, this.prevBufferLen), this.prevBufferLen = 0, 0 === this.writeBuffer.length ? this.emit("drain") : this.flush();
    }, r.prototype.flush = function () {
      "closed" !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length && (a("flushing %d packets in socket", this.writeBuffer.length), this.transport.send(this.writeBuffer), this.prevBufferLen = this.writeBuffer.length, this.emit("flush"));
    }, r.prototype.write = r.prototype.send = function (t, e, n) {
      return this.sendPacket("message", t, e, n), this;
    }, r.prototype.sendPacket = function (t, e, n, r) {
      if ("function" == typeof e && (r = e, e = void 0), "function" == typeof n && (r = n, n = null), "closing" !== this.readyState && "closed" !== this.readyState) {
        n = n || {}, n.compress = !1 !== n.compress;
        var o = {
          type: t,
          data: e,
          options: n
        };
        this.emit("packetCreate", o), this.writeBuffer.push(o), r && this.once("flush", r), this.flush();
      }
    }, r.prototype.close = function () {
      function t() {
        r.onClose("forced close"), a("socket closing - telling transport to close"), r.transport.close();
      }

      function e() {
        r.removeListener("upgrade", e), r.removeListener("upgradeError", e), t();
      }

      function n() {
        r.once("upgrade", e), r.once("upgradeError", e);
      }

      if ("opening" === this.readyState || "open" === this.readyState) {
        this.readyState = "closing";
        var r = this;
        this.writeBuffer.length ? this.once("drain", function () {
          this.upgrading ? n() : t();
        }) : this.upgrading ? n() : t();
      }

      return this;
    }, r.prototype.onError = function (t) {
      a("socket error %j", t), r.priorWebsocketSuccess = !1, this.emit("error", t), this.onClose("transport error", t);
    }, r.prototype.onClose = function (t, e) {
      if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
        a('socket close with reason: "%s"', t);
        var n = this;
        clearTimeout(this.pingIntervalTimer), clearTimeout(this.pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), this.readyState = "closed", this.id = null, this.emit("close", t, e), n.writeBuffer = [], n.prevBufferLen = 0;
      }
    }, r.prototype.filterUpgrades = function (t) {
      for (var e = [], n = 0, r = t.length; n < r; n++) {
        ~c(this.transports, t[n]) && e.push(t[n]);
      }

      return e;
    };
  }, function (t, e, n) {
    function r(t) {
      var e,
          n = !1,
          r = !1,
          a = !1 !== t.jsonp;

      if ("undefined" != typeof location) {
        var c = "https:" === location.protocol,
            u = location.port;
        u || (u = c ? 443 : 80), n = t.hostname !== location.hostname || u !== t.port, r = t.secure !== c;
      }

      if (t.xdomain = n, t.xscheme = r, e = new o(t), "open" in e && !t.forceJSONP) return new i(t);
      if (!a) throw new Error("JSONP disabled");
      return new s(t);
    }

    var o = n(19),
        i = n(21),
        s = n(35),
        a = n(36);
    e.polling = r, e.websocket = a;
  }, function (t, e, n) {
    var r = n(20);

    t.exports = function (t) {
      var e = t.xdomain,
          n = t.xscheme,
          o = t.enablesXDR;

      try {
        if ("undefined" != typeof XMLHttpRequest && (!e || r)) return new XMLHttpRequest();
      } catch (i) {}

      try {
        if ("undefined" != typeof XDomainRequest && !n && o) return new XDomainRequest();
      } catch (i) {}

      if (!e) try {
        return new self[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
      } catch (i) {}
    };
  }, function (t, e) {
    try {
      t.exports = "undefined" != typeof XMLHttpRequest && "withCredentials" in new XMLHttpRequest();
    } catch (n) {
      t.exports = !1;
    }
  }, function (t, e, n) {
    function r() {}

    function o(t) {
      if (c.call(this, t), this.requestTimeout = t.requestTimeout, this.extraHeaders = t.extraHeaders, "undefined" != typeof location) {
        var e = "https:" === location.protocol,
            n = location.port;
        n || (n = e ? 443 : 80), this.xd = "undefined" != typeof location && t.hostname !== location.hostname || n !== t.port, this.xs = t.secure !== e;
      }
    }

    function i(t) {
      this.method = t.method || "GET", this.uri = t.uri, this.xd = !!t.xd, this.xs = !!t.xs, this.async = !1 !== t.async, this.data = void 0 !== t.data ? t.data : null, this.agent = t.agent, this.isBinary = t.isBinary, this.supportsBinary = t.supportsBinary, this.enablesXDR = t.enablesXDR, this.withCredentials = t.withCredentials, this.requestTimeout = t.requestTimeout, this.pfx = t.pfx, this.key = t.key, this.passphrase = t.passphrase, this.cert = t.cert, this.ca = t.ca, this.ciphers = t.ciphers, this.rejectUnauthorized = t.rejectUnauthorized, this.extraHeaders = t.extraHeaders, this.create();
    }

    function s() {
      for (var t in i.requests) {
        i.requests.hasOwnProperty(t) && i.requests[t].abort();
      }
    }

    var a = n(19),
        c = n(22),
        u = n(11),
        p = n(33),
        h = n(3)("engine.io-client:polling-xhr");
    if (t.exports = o, t.exports.Request = i, p(o, c), o.prototype.supportsBinary = !0, o.prototype.request = function (t) {
      return t = t || {}, t.uri = this.uri(), t.xd = this.xd, t.xs = this.xs, t.agent = this.agent || !1, t.supportsBinary = this.supportsBinary, t.enablesXDR = this.enablesXDR, t.withCredentials = this.withCredentials, t.pfx = this.pfx, t.key = this.key, t.passphrase = this.passphrase, t.cert = this.cert, t.ca = this.ca, t.ciphers = this.ciphers, t.rejectUnauthorized = this.rejectUnauthorized, t.requestTimeout = this.requestTimeout, t.extraHeaders = this.extraHeaders, new i(t);
    }, o.prototype.doWrite = function (t, e) {
      var n = "string" != typeof t && void 0 !== t,
          r = this.request({
        method: "POST",
        data: t,
        isBinary: n
      }),
          o = this;
      r.on("success", e), r.on("error", function (t) {
        o.onError("xhr post error", t);
      }), this.sendXhr = r;
    }, o.prototype.doPoll = function () {
      h("xhr poll");
      var t = this.request(),
          e = this;
      t.on("data", function (t) {
        e.onData(t);
      }), t.on("error", function (t) {
        e.onError("xhr poll error", t);
      }), this.pollXhr = t;
    }, u(i.prototype), i.prototype.create = function () {
      var t = {
        agent: this.agent,
        xdomain: this.xd,
        xscheme: this.xs,
        enablesXDR: this.enablesXDR
      };
      t.pfx = this.pfx, t.key = this.key, t.passphrase = this.passphrase, t.cert = this.cert, t.ca = this.ca, t.ciphers = this.ciphers, t.rejectUnauthorized = this.rejectUnauthorized;
      var e = this.xhr = new a(t),
          n = this;

      try {
        h("xhr open %s: %s", this.method, this.uri), e.open(this.method, this.uri, this.async);

        try {
          if (this.extraHeaders) {
            e.setDisableHeaderCheck && e.setDisableHeaderCheck(!0);

            for (var r in this.extraHeaders) {
              this.extraHeaders.hasOwnProperty(r) && e.setRequestHeader(r, this.extraHeaders[r]);
            }
          }
        } catch (o) {}

        if ("POST" === this.method) try {
          this.isBinary ? e.setRequestHeader("Content-type", "application/octet-stream") : e.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
        } catch (o) {}

        try {
          e.setRequestHeader("Accept", "*/*");
        } catch (o) {}

        "withCredentials" in e && (e.withCredentials = this.withCredentials), this.requestTimeout && (e.timeout = this.requestTimeout), this.hasXDR() ? (e.onload = function () {
          n.onLoad();
        }, e.onerror = function () {
          n.onError(e.responseText);
        }) : e.onreadystatechange = function () {
          if (2 === e.readyState) try {
            var t = e.getResponseHeader("Content-Type");
            (n.supportsBinary && "application/octet-stream" === t || "application/octet-stream; charset=UTF-8" === t) && (e.responseType = "arraybuffer");
          } catch (r) {}
          4 === e.readyState && (200 === e.status || 1223 === e.status ? n.onLoad() : setTimeout(function () {
            n.onError("number" == typeof e.status ? e.status : 0);
          }, 0));
        }, h("xhr data %s", this.data), e.send(this.data);
      } catch (o) {
        return void setTimeout(function () {
          n.onError(o);
        }, 0);
      }

      "undefined" != typeof document && (this.index = i.requestsCount++, i.requests[this.index] = this);
    }, i.prototype.onSuccess = function () {
      this.emit("success"), this.cleanup();
    }, i.prototype.onData = function (t) {
      this.emit("data", t), this.onSuccess();
    }, i.prototype.onError = function (t) {
      this.emit("error", t), this.cleanup(!0);
    }, i.prototype.cleanup = function (t) {
      if ("undefined" != typeof this.xhr && null !== this.xhr) {
        if (this.hasXDR() ? this.xhr.onload = this.xhr.onerror = r : this.xhr.onreadystatechange = r, t) try {
          this.xhr.abort();
        } catch (e) {}
        "undefined" != typeof document && delete i.requests[this.index], this.xhr = null;
      }
    }, i.prototype.onLoad = function () {
      var t;

      try {
        var e;

        try {
          e = this.xhr.getResponseHeader("Content-Type");
        } catch (n) {}

        t = "application/octet-stream" === e || "application/octet-stream; charset=UTF-8" === e ? this.xhr.response || this.xhr.responseText : this.xhr.responseText;
      } catch (n) {
        this.onError(n);
      }

      null != t && this.onData(t);
    }, i.prototype.hasXDR = function () {
      return "undefined" != typeof XDomainRequest && !this.xs && this.enablesXDR;
    }, i.prototype.abort = function () {
      this.cleanup();
    }, i.requestsCount = 0, i.requests = {}, "undefined" != typeof document) if ("function" == typeof attachEvent) attachEvent("onunload", s);else if ("function" == typeof addEventListener) {
      var f = "onpagehide" in self ? "pagehide" : "unload";
      addEventListener(f, s, !1);
    }
  }, function (t, e, n) {
    function r(t) {
      var e = t && t.forceBase64;
      p && !e || (this.supportsBinary = !1), o.call(this, t);
    }

    var o = n(23),
        i = n(32),
        s = n(24),
        a = n(33),
        c = n(34),
        u = n(3)("engine.io-client:polling");
    t.exports = r;

    var p = function () {
      var t = n(19),
          e = new t({
        xdomain: !1
      });
      return null != e.responseType;
    }();

    a(r, o), r.prototype.name = "polling", r.prototype.doOpen = function () {
      this.poll();
    }, r.prototype.pause = function (t) {
      function e() {
        u("paused"), n.readyState = "paused", t();
      }

      var n = this;

      if (this.readyState = "pausing", this.polling || !this.writable) {
        var r = 0;
        this.polling && (u("we are currently polling - waiting to pause"), r++, this.once("pollComplete", function () {
          u("pre-pause polling complete"), --r || e();
        })), this.writable || (u("we are currently writing - waiting to pause"), r++, this.once("drain", function () {
          u("pre-pause writing complete"), --r || e();
        }));
      } else e();
    }, r.prototype.poll = function () {
      u("polling"), this.polling = !0, this.doPoll(), this.emit("poll");
    }, r.prototype.onData = function (t) {
      var e = this;
      u("polling got data %s", t);

      var n = function n(t, _n, r) {
        return "opening" === e.readyState && e.onOpen(), "close" === t.type ? (e.onClose(), !1) : void e.onPacket(t);
      };

      s.decodePayload(t, this.socket.binaryType, n), "closed" !== this.readyState && (this.polling = !1, this.emit("pollComplete"), "open" === this.readyState ? this.poll() : u('ignoring poll - transport state "%s"', this.readyState));
    }, r.prototype.doClose = function () {
      function t() {
        u("writing close packet"), e.write([{
          type: "close"
        }]);
      }

      var e = this;
      "open" === this.readyState ? (u("transport open - closing"), t()) : (u("transport not open - deferring close"), this.once("open", t));
    }, r.prototype.write = function (t) {
      var e = this;
      this.writable = !1;

      var n = function n() {
        e.writable = !0, e.emit("drain");
      };

      s.encodePayload(t, this.supportsBinary, function (t) {
        e.doWrite(t, n);
      });
    }, r.prototype.uri = function () {
      var t = this.query || {},
          e = this.secure ? "https" : "http",
          n = "";
      !1 !== this.timestampRequests && (t[this.timestampParam] = c()), this.supportsBinary || t.sid || (t.b64 = 1), t = i.encode(t), this.port && ("https" === e && 443 !== Number(this.port) || "http" === e && 80 !== Number(this.port)) && (n = ":" + this.port), t.length && (t = "?" + t);
      var r = this.hostname.indexOf(":") !== -1;
      return e + "://" + (r ? "[" + this.hostname + "]" : this.hostname) + n + this.path + t;
    };
  }, function (t, e, n) {
    function r(t) {
      this.path = t.path, this.hostname = t.hostname, this.port = t.port, this.secure = t.secure, this.query = t.query, this.timestampParam = t.timestampParam, this.timestampRequests = t.timestampRequests, this.readyState = "", this.agent = t.agent || !1, this.socket = t.socket, this.enablesXDR = t.enablesXDR, this.withCredentials = t.withCredentials, this.pfx = t.pfx, this.key = t.key, this.passphrase = t.passphrase, this.cert = t.cert, this.ca = t.ca, this.ciphers = t.ciphers, this.rejectUnauthorized = t.rejectUnauthorized, this.forceNode = t.forceNode, this.isReactNative = t.isReactNative, this.extraHeaders = t.extraHeaders, this.localAddress = t.localAddress;
    }

    var o = n(24),
        i = n(11);
    t.exports = r, i(r.prototype), r.prototype.onError = function (t, e) {
      var n = new Error(t);
      return n.type = "TransportError", n.description = e, this.emit("error", n), this;
    }, r.prototype.open = function () {
      return "closed" !== this.readyState && "" !== this.readyState || (this.readyState = "opening", this.doOpen()), this;
    }, r.prototype.close = function () {
      return "opening" !== this.readyState && "open" !== this.readyState || (this.doClose(), this.onClose()), this;
    }, r.prototype.send = function (t) {
      if ("open" !== this.readyState) throw new Error("Transport not open");
      this.write(t);
    }, r.prototype.onOpen = function () {
      this.readyState = "open", this.writable = !0, this.emit("open");
    }, r.prototype.onData = function (t) {
      var e = o.decodePacket(t, this.socket.binaryType);
      this.onPacket(e);
    }, r.prototype.onPacket = function (t) {
      this.emit("packet", t);
    }, r.prototype.onClose = function () {
      this.readyState = "closed", this.emit("close");
    };
  }, function (t, e, n) {
    function r(t, n) {
      var r = "b" + e.packets[t.type] + t.data.data;
      return n(r);
    }

    function o(t, n, r) {
      if (!n) return e.encodeBase64Packet(t, r);
      var o = t.data,
          i = new Uint8Array(o),
          s = new Uint8Array(1 + o.byteLength);
      s[0] = v[t.type];

      for (var a = 0; a < i.length; a++) {
        s[a + 1] = i[a];
      }

      return r(s.buffer);
    }

    function i(t, n, r) {
      if (!n) return e.encodeBase64Packet(t, r);
      var o = new FileReader();
      return o.onload = function () {
        e.encodePacket({
          type: t.type,
          data: o.result
        }, n, !0, r);
      }, o.readAsArrayBuffer(t.data);
    }

    function s(t, n, r) {
      if (!n) return e.encodeBase64Packet(t, r);
      if (g) return i(t, n, r);
      var o = new Uint8Array(1);
      o[0] = v[t.type];
      var s = new w([o.buffer, t.data]);
      return r(s);
    }

    function a(t) {
      try {
        t = d.decode(t, {
          strict: !1
        });
      } catch (e) {
        return !1;
      }

      return t;
    }

    function c(t, e, n) {
      for (var r = new Array(t.length), o = l(t.length, n), i = function i(t, n, o) {
        e(n, function (e, n) {
          r[t] = n, o(e, r);
        });
      }, s = 0; s < t.length; s++) {
        i(s, t[s], o);
      }
    }

    var u,
        p = n(25),
        h = n(26),
        f = n(27),
        l = n(28),
        d = n(29);
    "undefined" != typeof ArrayBuffer && (u = n(30));
    var y = "undefined" != typeof navigator && /Android/i.test(navigator.userAgent),
        m = "undefined" != typeof navigator && /PhantomJS/i.test(navigator.userAgent),
        g = y || m;
    e.protocol = 3;
    var v = e.packets = {
      open: 0,
      close: 1,
      ping: 2,
      pong: 3,
      message: 4,
      upgrade: 5,
      noop: 6
    },
        b = p(v),
        C = {
      type: "error",
      data: "parser error"
    },
        w = n(31);
    e.encodePacket = function (t, e, n, i) {
      "function" == typeof e && (i = e, e = !1), "function" == typeof n && (i = n, n = null);
      var a = void 0 === t.data ? void 0 : t.data.buffer || t.data;
      if ("undefined" != typeof ArrayBuffer && a instanceof ArrayBuffer) return o(t, e, i);
      if ("undefined" != typeof w && a instanceof w) return s(t, e, i);
      if (a && a.base64) return r(t, i);
      var c = v[t.type];
      return void 0 !== t.data && (c += n ? d.encode(String(t.data), {
        strict: !1
      }) : String(t.data)), i("" + c);
    }, e.encodeBase64Packet = function (t, n) {
      var r = "b" + e.packets[t.type];

      if ("undefined" != typeof w && t.data instanceof w) {
        var o = new FileReader();
        return o.onload = function () {
          var t = o.result.split(",")[1];
          n(r + t);
        }, o.readAsDataURL(t.data);
      }

      var i;

      try {
        i = String.fromCharCode.apply(null, new Uint8Array(t.data));
      } catch (s) {
        for (var a = new Uint8Array(t.data), c = new Array(a.length), u = 0; u < a.length; u++) {
          c[u] = a[u];
        }

        i = String.fromCharCode.apply(null, c);
      }

      return r += btoa(i), n(r);
    }, e.decodePacket = function (t, n, r) {
      if (void 0 === t) return C;

      if ("string" == typeof t) {
        if ("b" === t.charAt(0)) return e.decodeBase64Packet(t.substr(1), n);
        if (r && (t = a(t), t === !1)) return C;
        var o = t.charAt(0);
        return Number(o) == o && b[o] ? t.length > 1 ? {
          type: b[o],
          data: t.substring(1)
        } : {
          type: b[o]
        } : C;
      }

      var i = new Uint8Array(t),
          o = i[0],
          s = f(t, 1);
      return w && "blob" === n && (s = new w([s])), {
        type: b[o],
        data: s
      };
    }, e.decodeBase64Packet = function (t, e) {
      var n = b[t.charAt(0)];
      if (!u) return {
        type: n,
        data: {
          base64: !0,
          data: t.substr(1)
        }
      };
      var r = u.decode(t.substr(1));
      return "blob" === e && w && (r = new w([r])), {
        type: n,
        data: r
      };
    }, e.encodePayload = function (t, n, r) {
      function o(t) {
        return t.length + ":" + t;
      }

      function i(t, r) {
        e.encodePacket(t, !!s && n, !1, function (t) {
          r(null, o(t));
        });
      }

      "function" == typeof n && (r = n, n = null);
      var s = h(t);
      return n && s ? w && !g ? e.encodePayloadAsBlob(t, r) : e.encodePayloadAsArrayBuffer(t, r) : t.length ? void c(t, i, function (t, e) {
        return r(e.join(""));
      }) : r("0:");
    }, e.decodePayload = function (t, n, r) {
      if ("string" != typeof t) return e.decodePayloadAsBinary(t, n, r);
      "function" == typeof n && (r = n, n = null);
      var o;
      if ("" === t) return r(C, 0, 1);

      for (var i, s, a = "", c = 0, u = t.length; c < u; c++) {
        var p = t.charAt(c);

        if (":" === p) {
          if ("" === a || a != (i = Number(a))) return r(C, 0, 1);
          if (s = t.substr(c + 1, i), a != s.length) return r(C, 0, 1);

          if (s.length) {
            if (o = e.decodePacket(s, n, !1), C.type === o.type && C.data === o.data) return r(C, 0, 1);
            var h = r(o, c + i, u);
            if (!1 === h) return;
          }

          c += i, a = "";
        } else a += p;
      }

      return "" !== a ? r(C, 0, 1) : void 0;
    }, e.encodePayloadAsArrayBuffer = function (t, n) {
      function r(t, n) {
        e.encodePacket(t, !0, !0, function (t) {
          return n(null, t);
        });
      }

      return t.length ? void c(t, r, function (t, e) {
        var r = e.reduce(function (t, e) {
          var n;
          return n = "string" == typeof e ? e.length : e.byteLength, t + n.toString().length + n + 2;
        }, 0),
            o = new Uint8Array(r),
            i = 0;
        return e.forEach(function (t) {
          var e = "string" == typeof t,
              n = t;

          if (e) {
            for (var r = new Uint8Array(t.length), s = 0; s < t.length; s++) {
              r[s] = t.charCodeAt(s);
            }

            n = r.buffer;
          }

          e ? o[i++] = 0 : o[i++] = 1;

          for (var a = n.byteLength.toString(), s = 0; s < a.length; s++) {
            o[i++] = parseInt(a[s]);
          }

          o[i++] = 255;

          for (var r = new Uint8Array(n), s = 0; s < r.length; s++) {
            o[i++] = r[s];
          }
        }), n(o.buffer);
      }) : n(new ArrayBuffer(0));
    }, e.encodePayloadAsBlob = function (t, n) {
      function r(t, n) {
        e.encodePacket(t, !0, !0, function (t) {
          var e = new Uint8Array(1);

          if (e[0] = 1, "string" == typeof t) {
            for (var r = new Uint8Array(t.length), o = 0; o < t.length; o++) {
              r[o] = t.charCodeAt(o);
            }

            t = r.buffer, e[0] = 0;
          }

          for (var i = t instanceof ArrayBuffer ? t.byteLength : t.size, s = i.toString(), a = new Uint8Array(s.length + 1), o = 0; o < s.length; o++) {
            a[o] = parseInt(s[o]);
          }

          if (a[s.length] = 255, w) {
            var c = new w([e.buffer, a.buffer, t]);
            n(null, c);
          }
        });
      }

      c(t, r, function (t, e) {
        return n(new w(e));
      });
    }, e.decodePayloadAsBinary = function (t, n, r) {
      "function" == typeof n && (r = n, n = null);

      for (var o = t, i = []; o.byteLength > 0;) {
        for (var s = new Uint8Array(o), a = 0 === s[0], c = "", u = 1; 255 !== s[u]; u++) {
          if (c.length > 310) return r(C, 0, 1);
          c += s[u];
        }

        o = f(o, 2 + c.length), c = parseInt(c);
        var p = f(o, 0, c);
        if (a) try {
          p = String.fromCharCode.apply(null, new Uint8Array(p));
        } catch (h) {
          var l = new Uint8Array(p);
          p = "";

          for (var u = 0; u < l.length; u++) {
            p += String.fromCharCode(l[u]);
          }
        }
        i.push(p), o = f(o, c);
      }

      var d = i.length;
      i.forEach(function (t, o) {
        r(e.decodePacket(t, n, !0), o, d);
      });
    };
  }, function (t, e) {
    t.exports = Object.keys || function (t) {
      var e = [],
          n = Object.prototype.hasOwnProperty;

      for (var r in t) {
        n.call(t, r) && e.push(r);
      }

      return e;
    };
  }, function (t, e, n) {
    function r(t) {
      if (!t || "object" != _typeof(t)) return !1;

      if (o(t)) {
        for (var e = 0, n = t.length; e < n; e++) {
          if (r(t[e])) return !0;
        }

        return !1;
      }

      if ("function" == typeof Buffer && Buffer.isBuffer && Buffer.isBuffer(t) || "function" == typeof ArrayBuffer && t instanceof ArrayBuffer || s && t instanceof Blob || a && t instanceof File) return !0;
      if (t.toJSON && "function" == typeof t.toJSON && 1 === arguments.length) return r(t.toJSON(), !0);

      for (var i in t) {
        if (Object.prototype.hasOwnProperty.call(t, i) && r(t[i])) return !0;
      }

      return !1;
    }

    var o = n(13),
        i = Object.prototype.toString,
        s = "function" == typeof Blob || "undefined" != typeof Blob && "[object BlobConstructor]" === i.call(Blob),
        a = "function" == typeof File || "undefined" != typeof File && "[object FileConstructor]" === i.call(File);
    t.exports = r;
  }, function (t, e) {
    t.exports = function (t, e, n) {
      var r = t.byteLength;
      if (e = e || 0, n = n || r, t.slice) return t.slice(e, n);
      if (e < 0 && (e += r), n < 0 && (n += r), n > r && (n = r), e >= r || e >= n || 0 === r) return new ArrayBuffer(0);

      for (var o = new Uint8Array(t), i = new Uint8Array(n - e), s = e, a = 0; s < n; s++, a++) {
        i[a] = o[s];
      }

      return i.buffer;
    };
  }, function (t, e) {
    function n(t, e, n) {
      function o(t, r) {
        if (o.count <= 0) throw new Error("after called too many times");
        --o.count, t ? (i = !0, e(t), e = n) : 0 !== o.count || i || e(null, r);
      }

      var i = !1;
      return n = n || r, o.count = t, 0 === t ? e() : o;
    }

    function r() {}

    t.exports = n;
  }, function (t, e) {
    function n(t) {
      for (var e, n, r = [], o = 0, i = t.length; o < i;) {
        e = t.charCodeAt(o++), e >= 55296 && e <= 56319 && o < i ? (n = t.charCodeAt(o++), 56320 == (64512 & n) ? r.push(((1023 & e) << 10) + (1023 & n) + 65536) : (r.push(e), o--)) : r.push(e);
      }

      return r;
    }

    function r(t) {
      for (var e, n = t.length, r = -1, o = ""; ++r < n;) {
        e = t[r], e > 65535 && (e -= 65536, o += d(e >>> 10 & 1023 | 55296), e = 56320 | 1023 & e), o += d(e);
      }

      return o;
    }

    function o(t, e) {
      if (t >= 55296 && t <= 57343) {
        if (e) throw Error("Lone surrogate U+" + t.toString(16).toUpperCase() + " is not a scalar value");
        return !1;
      }

      return !0;
    }

    function i(t, e) {
      return d(t >> e & 63 | 128);
    }

    function s(t, e) {
      if (0 == (4294967168 & t)) return d(t);
      var n = "";
      return 0 == (4294965248 & t) ? n = d(t >> 6 & 31 | 192) : 0 == (4294901760 & t) ? (o(t, e) || (t = 65533), n = d(t >> 12 & 15 | 224), n += i(t, 6)) : 0 == (4292870144 & t) && (n = d(t >> 18 & 7 | 240), n += i(t, 12), n += i(t, 6)), n += d(63 & t | 128);
    }

    function a(t, e) {
      e = e || {};

      for (var r, o = !1 !== e.strict, i = n(t), a = i.length, c = -1, u = ""; ++c < a;) {
        r = i[c], u += s(r, o);
      }

      return u;
    }

    function c() {
      if (l >= f) throw Error("Invalid byte index");
      var t = 255 & h[l];
      if (l++, 128 == (192 & t)) return 63 & t;
      throw Error("Invalid continuation byte");
    }

    function u(t) {
      var e, n, r, i, s;
      if (l > f) throw Error("Invalid byte index");
      if (l == f) return !1;
      if (e = 255 & h[l], l++, 0 == (128 & e)) return e;

      if (192 == (224 & e)) {
        if (n = c(), s = (31 & e) << 6 | n, s >= 128) return s;
        throw Error("Invalid continuation byte");
      }

      if (224 == (240 & e)) {
        if (n = c(), r = c(), s = (15 & e) << 12 | n << 6 | r, s >= 2048) return o(s, t) ? s : 65533;
        throw Error("Invalid continuation byte");
      }

      if (240 == (248 & e) && (n = c(), r = c(), i = c(), s = (7 & e) << 18 | n << 12 | r << 6 | i, s >= 65536 && s <= 1114111)) return s;
      throw Error("Invalid UTF-8 detected");
    }

    function p(t, e) {
      e = e || {};
      var o = !1 !== e.strict;
      h = n(t), f = h.length, l = 0;

      for (var i, s = []; (i = u(o)) !== !1;) {
        s.push(i);
      }

      return r(s);
    }
    /*! https://mths.be/utf8js v2.1.2 by @mathias */


    var h,
        f,
        l,
        d = String.fromCharCode;
    t.exports = {
      version: "2.1.2",
      encode: a,
      decode: p
    };
  }, function (t, e) {
    !function () {
      "use strict";

      for (var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", n = new Uint8Array(256), r = 0; r < t.length; r++) {
        n[t.charCodeAt(r)] = r;
      }

      e.encode = function (e) {
        var n,
            r = new Uint8Array(e),
            o = r.length,
            i = "";

        for (n = 0; n < o; n += 3) {
          i += t[r[n] >> 2], i += t[(3 & r[n]) << 4 | r[n + 1] >> 4], i += t[(15 & r[n + 1]) << 2 | r[n + 2] >> 6], i += t[63 & r[n + 2]];
        }

        return o % 3 === 2 ? i = i.substring(0, i.length - 1) + "=" : o % 3 === 1 && (i = i.substring(0, i.length - 2) + "=="), i;
      }, e.decode = function (t) {
        var e,
            r,
            o,
            i,
            s,
            a = .75 * t.length,
            c = t.length,
            u = 0;
        "=" === t[t.length - 1] && (a--, "=" === t[t.length - 2] && a--);
        var p = new ArrayBuffer(a),
            h = new Uint8Array(p);

        for (e = 0; e < c; e += 4) {
          r = n[t.charCodeAt(e)], o = n[t.charCodeAt(e + 1)], i = n[t.charCodeAt(e + 2)], s = n[t.charCodeAt(e + 3)], h[u++] = r << 2 | o >> 4, h[u++] = (15 & o) << 4 | i >> 2, h[u++] = (3 & i) << 6 | 63 & s;
        }

        return p;
      };
    }();
  }, function (t, e) {
    function n(t) {
      return t.map(function (t) {
        if (t.buffer instanceof ArrayBuffer) {
          var e = t.buffer;

          if (t.byteLength !== e.byteLength) {
            var n = new Uint8Array(t.byteLength);
            n.set(new Uint8Array(e, t.byteOffset, t.byteLength)), e = n.buffer;
          }

          return e;
        }

        return t;
      });
    }

    function r(t, e) {
      e = e || {};
      var r = new i();
      return n(t).forEach(function (t) {
        r.append(t);
      }), e.type ? r.getBlob(e.type) : r.getBlob();
    }

    function o(t, e) {
      return new Blob(n(t), e || {});
    }

    var i = "undefined" != typeof i ? i : "undefined" != typeof WebKitBlobBuilder ? WebKitBlobBuilder : "undefined" != typeof MSBlobBuilder ? MSBlobBuilder : "undefined" != typeof MozBlobBuilder && MozBlobBuilder,
        s = function () {
      try {
        var t = new Blob(["hi"]);
        return 2 === t.size;
      } catch (e) {
        return !1;
      }
    }(),
        a = s && function () {
      try {
        var t = new Blob([new Uint8Array([1, 2])]);
        return 2 === t.size;
      } catch (e) {
        return !1;
      }
    }(),
        c = i && i.prototype.append && i.prototype.getBlob;

    "undefined" != typeof Blob && (r.prototype = Blob.prototype, o.prototype = Blob.prototype), t.exports = function () {
      return s ? a ? Blob : o : c ? r : void 0;
    }();
  }, function (t, e) {
    e.encode = function (t) {
      var e = "";

      for (var n in t) {
        t.hasOwnProperty(n) && (e.length && (e += "&"), e += encodeURIComponent(n) + "=" + encodeURIComponent(t[n]));
      }

      return e;
    }, e.decode = function (t) {
      for (var e = {}, n = t.split("&"), r = 0, o = n.length; r < o; r++) {
        var i = n[r].split("=");
        e[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
      }

      return e;
    };
  }, function (t, e) {
    t.exports = function (t, e) {
      var n = function n() {};

      n.prototype = e.prototype, t.prototype = new n(), t.prototype.constructor = t;
    };
  }, function (t, e) {
    "use strict";

    function n(t) {
      var e = "";

      do {
        e = s[t % a] + e, t = Math.floor(t / a);
      } while (t > 0);

      return e;
    }

    function r(t) {
      var e = 0;

      for (p = 0; p < t.length; p++) {
        e = e * a + c[t.charAt(p)];
      }

      return e;
    }

    function o() {
      var t = n(+new Date());
      return t !== i ? (u = 0, i = t) : t + "." + n(u++);
    }

    for (var i, s = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split(""), a = 64, c = {}, u = 0, p = 0; p < a; p++) {
      c[s[p]] = p;
    }

    o.encode = n, o.decode = r, t.exports = o;
  }, function (t, e, n) {
    (function (e) {
      function r() {}

      function o() {
        return "undefined" != typeof self ? self : "undefined" != typeof window ? window : "undefined" != typeof e ? e : {};
      }

      function i(t) {
        if (s.call(this, t), this.query = this.query || {}, !c) {
          var e = o();
          c = e.___eio = e.___eio || [];
        }

        this.index = c.length;
        var n = this;
        c.push(function (t) {
          n.onData(t);
        }), this.query.j = this.index, "function" == typeof addEventListener && addEventListener("beforeunload", function () {
          n.script && (n.script.onerror = r);
        }, !1);
      }

      var s = n(22),
          a = n(33);
      t.exports = i;
      var c,
          u = /\n/g,
          p = /\\n/g;
      a(i, s), i.prototype.supportsBinary = !1, i.prototype.doClose = function () {
        this.script && (this.script.parentNode.removeChild(this.script), this.script = null), this.form && (this.form.parentNode.removeChild(this.form), this.form = null, this.iframe = null), s.prototype.doClose.call(this);
      }, i.prototype.doPoll = function () {
        var t = this,
            e = document.createElement("script");
        this.script && (this.script.parentNode.removeChild(this.script), this.script = null), e.async = !0, e.src = this.uri(), e.onerror = function (e) {
          t.onError("jsonp poll error", e);
        };
        var n = document.getElementsByTagName("script")[0];
        n ? n.parentNode.insertBefore(e, n) : (document.head || document.body).appendChild(e), this.script = e;
        var r = "undefined" != typeof navigator && /gecko/i.test(navigator.userAgent);
        r && setTimeout(function () {
          var t = document.createElement("iframe");
          document.body.appendChild(t), document.body.removeChild(t);
        }, 100);
      }, i.prototype.doWrite = function (t, e) {
        function n() {
          r(), e();
        }

        function r() {
          if (o.iframe) try {
            o.form.removeChild(o.iframe);
          } catch (t) {
            o.onError("jsonp polling iframe removal error", t);
          }

          try {
            var e = '<iframe src="javascript:0" name="' + o.iframeId + '">';
            i = document.createElement(e);
          } catch (t) {
            i = document.createElement("iframe"), i.name = o.iframeId, i.src = "javascript:0";
          }

          i.id = o.iframeId, o.form.appendChild(i), o.iframe = i;
        }

        var o = this;

        if (!this.form) {
          var i,
              s = document.createElement("form"),
              a = document.createElement("textarea"),
              c = this.iframeId = "eio_iframe_" + this.index;
          s.className = "socketio", s.style.position = "absolute", s.style.top = "-1000px", s.style.left = "-1000px", s.target = c, s.method = "POST", s.setAttribute("accept-charset", "utf-8"), a.name = "d", s.appendChild(a), document.body.appendChild(s), this.form = s, this.area = a;
        }

        this.form.action = this.uri(), r(), t = t.replace(p, "\\\n"), this.area.value = t.replace(u, "\\n");

        try {
          this.form.submit();
        } catch (h) {}

        this.iframe.attachEvent ? this.iframe.onreadystatechange = function () {
          "complete" === o.iframe.readyState && n();
        } : this.iframe.onload = n;
      };
    }).call(e, function () {
      return this;
    }());
  }, function (t, e, n) {
    function r(t) {
      var e = t && t.forceBase64;
      e && (this.supportsBinary = !1), this.perMessageDeflate = t.perMessageDeflate, this.usingBrowserWebSocket = o && !t.forceNode, this.protocols = t.protocols, this.usingBrowserWebSocket || (l = i), s.call(this, t);
    }

    var o,
        i,
        s = n(23),
        a = n(24),
        c = n(32),
        u = n(33),
        p = n(34),
        h = n(3)("engine.io-client:websocket");
    if ("undefined" != typeof WebSocket ? o = WebSocket : "undefined" != typeof self && (o = self.WebSocket || self.MozWebSocket), "undefined" == typeof window) try {
      i = n(37);
    } catch (f) {}
    var l = o || i;
    t.exports = r, u(r, s), r.prototype.name = "websocket", r.prototype.supportsBinary = !0, r.prototype.doOpen = function () {
      if (this.check()) {
        var t = this.uri(),
            e = this.protocols,
            n = {
          agent: this.agent,
          perMessageDeflate: this.perMessageDeflate
        };
        n.pfx = this.pfx, n.key = this.key, n.passphrase = this.passphrase, n.cert = this.cert, n.ca = this.ca, n.ciphers = this.ciphers, n.rejectUnauthorized = this.rejectUnauthorized, this.extraHeaders && (n.headers = this.extraHeaders), this.localAddress && (n.localAddress = this.localAddress);

        try {
          this.ws = this.usingBrowserWebSocket && !this.isReactNative ? e ? new l(t, e) : new l(t) : new l(t, e, n);
        } catch (r) {
          return this.emit("error", r);
        }

        void 0 === this.ws.binaryType && (this.supportsBinary = !1), this.ws.supports && this.ws.supports.binary ? (this.supportsBinary = !0, this.ws.binaryType = "nodebuffer") : this.ws.binaryType = "arraybuffer", this.addEventListeners();
      }
    }, r.prototype.addEventListeners = function () {
      var t = this;
      this.ws.onopen = function () {
        t.onOpen();
      }, this.ws.onclose = function () {
        t.onClose();
      }, this.ws.onmessage = function (e) {
        t.onData(e.data);
      }, this.ws.onerror = function (e) {
        t.onError("websocket error", e);
      };
    }, r.prototype.write = function (t) {
      function e() {
        n.emit("flush"), setTimeout(function () {
          n.writable = !0, n.emit("drain");
        }, 0);
      }

      var n = this;
      this.writable = !1;

      for (var r = t.length, o = 0, i = r; o < i; o++) {
        !function (t) {
          a.encodePacket(t, n.supportsBinary, function (o) {
            if (!n.usingBrowserWebSocket) {
              var i = {};

              if (t.options && (i.compress = t.options.compress), n.perMessageDeflate) {
                var s = "string" == typeof o ? Buffer.byteLength(o) : o.length;
                s < n.perMessageDeflate.threshold && (i.compress = !1);
              }
            }

            try {
              n.usingBrowserWebSocket ? n.ws.send(o) : n.ws.send(o, i);
            } catch (a) {
              h("websocket closed before onclose event");
            }

            --r || e();
          });
        }(t[o]);
      }
    }, r.prototype.onClose = function () {
      s.prototype.onClose.call(this);
    }, r.prototype.doClose = function () {
      "undefined" != typeof this.ws && this.ws.close();
    }, r.prototype.uri = function () {
      var t = this.query || {},
          e = this.secure ? "wss" : "ws",
          n = "";
      this.port && ("wss" === e && 443 !== Number(this.port) || "ws" === e && 80 !== Number(this.port)) && (n = ":" + this.port), this.timestampRequests && (t[this.timestampParam] = p()), this.supportsBinary || (t.b64 = 1), t = c.encode(t), t.length && (t = "?" + t);
      var r = this.hostname.indexOf(":") !== -1;
      return e + "://" + (r ? "[" + this.hostname + "]" : this.hostname) + n + this.path + t;
    }, r.prototype.check = function () {
      return !(!l || "__initialize" in l && this.name === r.prototype.name);
    };
  }, function (t, e) {}, function (t, e) {
    var n = [].indexOf;

    t.exports = function (t, e) {
      if (n) return t.indexOf(e);

      for (var r = 0; r < t.length; ++r) {
        if (t[r] === e) return r;
      }

      return -1;
    };
  }, function (t, e, n) {
    function r(t, e, n) {
      this.io = t, this.nsp = e, this.json = this, this.ids = 0, this.acks = {}, this.receiveBuffer = [], this.sendBuffer = [], this.connected = !1, this.disconnected = !0, this.flags = {}, n && n.query && (this.query = n.query), this.io.autoConnect && this.open();
    }

    var o = n(7),
        i = n(11),
        s = n(40),
        a = n(41),
        c = n(42),
        u = n(3)("socket.io-client:socket"),
        p = n(32),
        h = n(26);
    t.exports = e = r;
    var f = {
      connect: 1,
      connect_error: 1,
      connect_timeout: 1,
      connecting: 1,
      disconnect: 1,
      error: 1,
      reconnect: 1,
      reconnect_attempt: 1,
      reconnect_failed: 1,
      reconnect_error: 1,
      reconnecting: 1,
      ping: 1,
      pong: 1
    },
        l = i.prototype.emit;
    i(r.prototype), r.prototype.subEvents = function () {
      if (!this.subs) {
        var t = this.io;
        this.subs = [a(t, "open", c(this, "onopen")), a(t, "packet", c(this, "onpacket")), a(t, "close", c(this, "onclose"))];
      }
    }, r.prototype.open = r.prototype.connect = function () {
      return this.connected ? this : (this.subEvents(), this.io.open(), "open" === this.io.readyState && this.onopen(), this.emit("connecting"), this);
    }, r.prototype.send = function () {
      var t = s(arguments);
      return t.unshift("message"), this.emit.apply(this, t), this;
    }, r.prototype.emit = function (t) {
      if (f.hasOwnProperty(t)) return l.apply(this, arguments), this;
      var e = s(arguments),
          n = {
        type: (void 0 !== this.flags.binary ? this.flags.binary : h(e)) ? o.BINARY_EVENT : o.EVENT,
        data: e
      };
      return n.options = {}, n.options.compress = !this.flags || !1 !== this.flags.compress, "function" == typeof e[e.length - 1] && (u("emitting packet with ack id %d", this.ids), this.acks[this.ids] = e.pop(), n.id = this.ids++), this.connected ? this.packet(n) : this.sendBuffer.push(n), this.flags = {}, this;
    }, r.prototype.packet = function (t) {
      t.nsp = this.nsp, this.io.packet(t);
    }, r.prototype.onopen = function () {
      if (u("transport is open - connecting"), "/" !== this.nsp) if (this.query) {
        var t = "object" == _typeof(this.query) ? p.encode(this.query) : this.query;
        u("sending connect packet with query %s", t), this.packet({
          type: o.CONNECT,
          query: t
        });
      } else this.packet({
        type: o.CONNECT
      });
    }, r.prototype.onclose = function (t) {
      u("close (%s)", t), this.connected = !1, this.disconnected = !0, delete this.id, this.emit("disconnect", t);
    }, r.prototype.onpacket = function (t) {
      var e = t.nsp === this.nsp,
          n = t.type === o.ERROR && "/" === t.nsp;
      if (e || n) switch (t.type) {
        case o.CONNECT:
          this.onconnect();
          break;

        case o.EVENT:
          this.onevent(t);
          break;

        case o.BINARY_EVENT:
          this.onevent(t);
          break;

        case o.ACK:
          this.onack(t);
          break;

        case o.BINARY_ACK:
          this.onack(t);
          break;

        case o.DISCONNECT:
          this.ondisconnect();
          break;

        case o.ERROR:
          this.emit("error", t.data);
      }
    }, r.prototype.onevent = function (t) {
      var e = t.data || [];
      u("emitting event %j", e), null != t.id && (u("attaching ack callback to event"), e.push(this.ack(t.id))), this.connected ? l.apply(this, e) : this.receiveBuffer.push(e);
    }, r.prototype.ack = function (t) {
      var e = this,
          n = !1;
      return function () {
        if (!n) {
          n = !0;
          var r = s(arguments);
          u("sending ack %j", r), e.packet({
            type: h(r) ? o.BINARY_ACK : o.ACK,
            id: t,
            data: r
          });
        }
      };
    }, r.prototype.onack = function (t) {
      var e = this.acks[t.id];
      "function" == typeof e ? (u("calling ack %s with %j", t.id, t.data), e.apply(this, t.data), delete this.acks[t.id]) : u("bad ack %s", t.id);
    }, r.prototype.onconnect = function () {
      this.connected = !0, this.disconnected = !1, this.emit("connect"), this.emitBuffered();
    }, r.prototype.emitBuffered = function () {
      var t;

      for (t = 0; t < this.receiveBuffer.length; t++) {
        l.apply(this, this.receiveBuffer[t]);
      }

      for (this.receiveBuffer = [], t = 0; t < this.sendBuffer.length; t++) {
        this.packet(this.sendBuffer[t]);
      }

      this.sendBuffer = [];
    }, r.prototype.ondisconnect = function () {
      u("server disconnect (%s)", this.nsp), this.destroy(), this.onclose("io server disconnect");
    }, r.prototype.destroy = function () {
      if (this.subs) {
        for (var t = 0; t < this.subs.length; t++) {
          this.subs[t].destroy();
        }

        this.subs = null;
      }

      this.io.destroy(this);
    }, r.prototype.close = r.prototype.disconnect = function () {
      return this.connected && (u("performing disconnect (%s)", this.nsp), this.packet({
        type: o.DISCONNECT
      })), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
    }, r.prototype.compress = function (t) {
      return this.flags.compress = t, this;
    }, r.prototype.binary = function (t) {
      return this.flags.binary = t, this;
    };
  }, function (t, e) {
    function n(t, e) {
      var n = [];
      e = e || 0;

      for (var r = e || 0; r < t.length; r++) {
        n[r - e] = t[r];
      }

      return n;
    }

    t.exports = n;
  }, function (t, e) {
    function n(t, e, n) {
      return t.on(e, n), {
        destroy: function destroy() {
          t.removeListener(e, n);
        }
      };
    }

    t.exports = n;
  }, function (t, e) {
    var n = [].slice;

    t.exports = function (t, e) {
      if ("string" == typeof e && (e = t[e]), "function" != typeof e) throw new Error("bind() requires a function");
      var r = n.call(arguments, 2);
      return function () {
        return e.apply(t, r.concat(n.call(arguments)));
      };
    };
  }, function (t, e) {
    function n(t) {
      t = t || {}, this.ms = t.min || 100, this.max = t.max || 1e4, this.factor = t.factor || 2, this.jitter = t.jitter > 0 && t.jitter <= 1 ? t.jitter : 0, this.attempts = 0;
    }

    t.exports = n, n.prototype.duration = function () {
      var t = this.ms * Math.pow(this.factor, this.attempts++);

      if (this.jitter) {
        var e = Math.random(),
            n = Math.floor(e * this.jitter * t);
        t = 0 == (1 & Math.floor(10 * e)) ? t - n : t + n;
      }

      return 0 | Math.min(t, this.max);
    }, n.prototype.reset = function () {
      this.attempts = 0;
    }, n.prototype.setMin = function (t) {
      this.ms = t;
    }, n.prototype.setMax = function (t) {
      this.max = t;
    }, n.prototype.setJitter = function (t) {
      this.jitter = t;
    };
  }]);
});
},{"buffer":"../node_modules/buffer/index.js"}],"../node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "56109" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel/src/builtins/hmr-runtime.js","socket/socket.io.js"], null)
//# sourceMappingURL=/socket.io.f68819e6.js.map