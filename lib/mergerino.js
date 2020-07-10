;(function(root, factory) {
  if(typeof define === 'function' && define.amd) { define([], factory) }
  else if(typeof module === 'object' && module.exports) { module.exports = factory() }
  else { root.mergerino = factory() }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict'
  var exports = {}
  var assign = Object.assign || (function (a, b) { return (b && Object.keys(b).forEach(function (k) { return (a[k] = b[k]); }), a); })
  
  var run = function (isArr, copy, patch) {
    var type = typeof patch
    if (patch && type === 'object') {
      if (Array.isArray(patch)) { for (var i = 0, list = patch; i < list.length; i += 1) {
          var p = list[i];

          copy = run(isArr, copy, p)
        } }
      else {
        for (var i$1 = 0, list$1 = Object.keys(patch); i$1 < list$1.length; i$1 += 1) {
          var k = list$1[i$1];

          var val = patch[k]
          if (typeof val === 'function') { copy[k] = val(copy[k], merge) }
          else if (val === undefined) { isArr && !isNaN(k) ? copy.splice(k, 1) : delete copy[k] }
          else if (val === null || typeof val !== 'object' || Array.isArray(val)) { copy[k] = val }
          else if (typeof copy[k] === 'object') { copy[k] = val === copy[k] ? val : merge(copy[k], val) }
          else { copy[k] = run(false, {}, val) }
        }
      }
    } else if (type === 'function') { copy = patch(copy, merge) }
    return copy
  }
  
  var merge = function (source) {
    var patches = [], len = arguments.length - 1;
    while ( len-- > 0 ) patches[ len ] = arguments[ len + 1 ];

    var isArr = Array.isArray(source)
    return run(isArr, isArr ? source.slice() : assign({}, source), patches)
  }
  
  exports = assign(merge, exports)
  
  return exports
})
