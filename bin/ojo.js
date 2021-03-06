function addHandler (element, eventType, handler) {
  if (element.addEventListener) {
    // 所有现代浏览器都可以使用的方法，IE9，firefox，chrome
    element.addEventListener(eventType, handler, false);
  } else if (element.attachEvent) {
    // 主要是为了兼容 IE8，IE8 是最后一个使用专用事件系统的主流浏览器。	element.attachEvent("on"+type,handler)
    element.attachEvent('on' + eventType, handler);
  } else {
    element['on' + eventType] = handler;
  }
}

function getEvent (event) {
  return event || window.event;
  /*在 IE 中使用 DOM0 级方法添加事件时， event 对象将会作为 window
  对象的一个属性存在。若是使用 attachEvent() 方法添加事件，便会有一个 event 对象作为参数被传入事件处理程序函数中。如果是通过 HMTL 特性指定事件处理程序，那么还可以通过一个 event 的变量来访问 event 对象。*/
}

function getTarget (event) {
  return event.target || event.srcElement;
  // target 现代浏览器
  // srcElement IE8 以下
}

function preventDefault (event) {
  if (event.preventDefault) {
    event.preventDefault();
    // 阻止现代浏览器默认事件
  } else {
    event.returnValue = false;
    // 阻止 IE8 默认事件
  }
}

function stopPropagation (event) {
  // IE8 不支持事件捕获，因此在夸浏览器的情况下，该方法只能用来阻止事件冒泡。
  if (event.stopPropagation) {
    event.stopPropagation();
    // 阻止现代浏览器事件传播
  } else {
    event.cancelBubble = true;
    // 阻止 IE8 事件传播
  }
}

function getWheelDelta () {
  // 总是返回 120 的倍数，为正表示鼠标滚轮向上滚动
  // 获取鼠标滑轮增量
  if (event.wheelDelta) {
    // 主流浏览中 mousewhell 中的 wheelDelta
    /*当鼠标滚轮向前滑动时，wheelDelta 是120的倍数；当滚轮向后滑动时，wheelDelta 是 -120 的倍数。*/
    return event.wheelDelta;
    // return (client.engine.opera && client.engine.opera < 9.5 ? -event.wheelDelta : event.wheelDelta);
  } else {
    /* FireFox 支持的是一个 DOMMouseScroll 的类似事件，而有关鼠标滚轮有关的信息则保存在 detail 属性中，当向前滑动鼠标滚轮时，该属性的值是 -3 的倍数，当向后滑动鼠标滚轮时，该属性值是 3 的倍数。*/
    return -event.detail * 40;
  }
}

function getPageCoordinates (event) {
  // 获取鼠标在页面中的位置
  var pageX = event.pageX;
  var pageY = event.pageY;
  // IE8 不支持事件对象上的页面坐标，所以需要通过 client 偏移量 和 scroll 偏移量来计算
  if (pageX === undefined) {
    pageX = event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
  }

  if (pageY === undefined) {
    pageY = event.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
  }
  return {
    'pageX': pageX,
    'pageY': pageY
  };
}

function removeHandler (element, eventType, handler) {
  if (element.removeEventListener) {
    element.removeEventListener(eventType, handler, false);
  } else if (element.detachEvent) {
    element.detachEvent('on' + eventType, handler);
  } else {
    element['on' + eventType] = null;
  }
}

function catIn (target, parent) {
  const path = [];
  let parentNode = target;

  while (parentNode && parentNode !== document.body) {
    path.push(parentNode);
    parentNode = parentNode.parentNode;
  }

  return path.indexOf(parent) !== -1;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// 第一次很重要
// 一段时间内，无论触发多少次 func，只执行第一次的
function throttle (func, waitMsec) {
  let lastTime = 0; // 上一次执行的时间

  return function (...agrs) {
    const context = this;

    const currentTime = +new Date();

     // 其实该 if 判断可以没有，但是为了更严谨一些
    if (!lastTime) {
      lastTime = currentTime;
      func.apply(context, agrs);
    }

    const spaceOfTime = currentTime - lastTime; // msec

    if (spaceOfTime > waitMsec) {
      lastTime = currentTime;
      func.apply(context, agrs);
    }
  };
}
function _debounce (func, wait) {
  let delayTimer = null;

  return function (...agrs) {
    const context = this;

    delayTimer && clearTimeout(delayTimer);

    delayTimer = setTimeout(() => {
      clearTimeout(delayTimer);
      delayTimer = null;
      func.apply(context, args);
    }, wait);
  };
}
function enhancedThrottle(func, wait) {
  const lastTime = null;
  let delayTimer = null;

  return function (...args) {
    const context = this;
    const currentTime = +new Date();

    const spaceOfTime = currentTime - lastTime;

    if (spaceOfTime < wait) {
      clearTimeout(delayTimer);
      delayTimer = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    } else {
      func.apply(context, args);
    }
  };
}

function debounce (func, wait, immediate) {
  let timeout, args, context, timestamp, result;

  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp;

    // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function (...args) {
    context = this;
    timestamp = +new Date();
    const callNow = immediate && !timeout;
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}
var energy = {
  throttle,
  debounce,
};

const inBrowser = typeof window !== 'undefined';
const UA = inBrowser && window.navigator.userAgent.toLowerCase();
const isIE = UA && /msie|trident/.test(UA);
const isIE9 = UA && UA.indexOf('msie 9.0') > 0;
const isEdge = UA && UA.indexOf('edge/') > 0;
const isAndroid = (UA && UA.indexOf('android') > 0);
const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

var env = {
  inBrowser,
  UA,
  isIE,
  isIE9,
  isEdge,
  isAndroid,
  isIOS,
  isChrome
};

const hasOwn = function _hasOwn (obj, key) {
  return isObject(obj) && Object.prototype.hasOwnProperty.call(obj, key);
};

const isNumber = function _isNumber(value) {
  return !isNaN(parseFloat(value));
};

const isString = function _isString (value) {
  return typeof value === 'string' || value instanceof String;
};

const isNativeStringType = function _isNativeStringType (type) {
  return type === 'string' || type === 'url' || type === 'hex' || type === 'email' || type === 'pattern';
};

const isEmptyArray = function _isEmptyArray (value) {
  return Array.isArray(value) && !value.length;
};

const isEmpty = function _isEmpty (value, type) {
  if (value === undefined || value === null) {
    return true;
  }

  if (isEmptyArray(value)) {
    return true;
  }

  if (isNativeStringType(type) && typeof value === 'string' && !value) {
    return true;
  }

  if (isEmptyObject(value)) {
    return true;
  }

  return false;
};

const isObject = function _isObject (value) {
  return value && typeof value === 'object' && value.constructor === Object;
};

const isEmptyObject = function _isEmptyObject (obj) {
  return Object.keys(obj).length === 0;
};

// 判断数据类型
const _typeof = function (obj) {
  const class2type = {};
  'Boolean String Number Array Function Object Null Date RegExp Error'.split(' ').forEach((e, i) => {
    class2type[`[object ${e}]`] = e.toLowerCase();
  });
  return typeof obj === 'object' || typeof obj === 'function'
    ? class2type[class2type.toString.call(obj)]
    : typeof obj;
};

var type = {
  hasOwn,
  isNumber,
  isString,
  isNativeStringType,
  _typeof,
  isEmptyArray,
  isEmptyObject,
  isEmpty
};

function formatToNumebr (x) {
  if (!x) return null;

  if (typeof x === 'number') return x;

  const parts = x.toString().split('.');
  const integer = parts[0].replace(/,/g, '');
  const value = integer.concat('.', parts[1]);
  const number = parseFloat(value);
  return number;
}
function prettyNumberToMoney ({
  prefix = '¥',
  number = null,
  decimals = 2,
  decimal = '.',
  separator = ',',
  suffix = '',
} = {}) {
  let num = formatToNumebr(number);
  num = num.toFixed(decimals);
  num += '';

  const x = num.split('.');
  let x1 = x[0];
  const x2 = x.length > 1 ? decimal + x[1] : '';

  const rgx = /(\d+)(\d{3})/;

  if (separator && !isNumber(separator)) {
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + separator + '$2');
    }
  }

  return prefix + x1 + x2 + suffix;
}

function formartFileSize (byteSize) {
  const fileSizeUnit = ['B', 'K', 'M', 'G'];

  if (isNaN(byteSize)) {
    throw new Error('size must be a number', 'formartFileSize');
  }

  let estimateSize = Number(byteSize);
  let i = 0;
  let unit = '';

  if (!estimateSize) return '0B';

  while (i < 4) {
    if (Math.pow(1024, i) <= estimateSize && estimateSize < Math.pow(1024, i + 1)) {
      estimateSize = parseFloat(estimateSize / Math.pow(1024, i)).toFixed(1);
      unit = fileSizeUnit[i];
      break;
    }
    i += 1;
  }

  return `${estimateSize}${unit}`;
}
var format = {
  prettyNumberToMoney,
  formatToNumebr,
  formartFileSize,
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
function flattenDeep(arr1) {
  return arr1.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
}

function sum() {
  const flatArgumentsArr = flattenDeep(Array.from(arguments));
  return flatArgumentsArr.reduce((x, y) => +(+x + +y).toFixed(2));
}

function multiply() {
  const flatArgumentsArr = flattenDeep(Array.from(arguments));
  return flatArgumentsArr.reduce((x, y) => +(+x * +y).toFixed(2));
}

var operator = {
  sum,
  multiply
};

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'successful' : 'unsuccessful';
    console.warn('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function () {
    console.warn('Async: Copying to clipboard was successful!');
  }, function (err) {
    console.error('Async: Could not copy text: ', err);
  });
}

var other = {
  copyTextToClipboard,
};

function resetObjectToEmpty(targetObj) {
  if (typeof targetObj === 'undefined') return;

  const calss2Value = {
    'string': '',
    'number': null,
    'array': [],
    'object': {},
    'null': null
  };

  Object.keys(targetObj).forEach(key => {
    if (_typeof(targetObj[key]) === 'object' && !isEmptyObject(targetObj[key])) {
      resetObjectToEmpty(targetObj[key]);
    } else {
      targetObj[key] = calss2Value[_typeof(targetObj[key])];
    }
  });
}

const getPropByPath = function _getPropByPath(obj, path, strict) {
  let tempObj = obj;
  path = path.replace(/\[(\w+)\]/g, '.$1');
  path = path.replace(/^\./, '');

  const keyArr = path.split('.');
  let i = 0;
  for (let len = keyArr.length; i < len - 1; ++i) {
    if (!tempObj && !strict) break;
    const key = keyArr[i];
    if (key in tempObj) {
      tempObj = tempObj[key];
    } else {
      if (strict) {
        throw new Error('please transfer a valid prop path to form item!');
      }
      break;
    }
  }
  return {
    o: tempObj,
    k: keyArr[i],
    v: tempObj ? tempObj[keyArr[i]] : null
  };
};

const extractValue = function _extractValue(obj, path, strict) {
  return getPropByPath(obj, path, strict).v;
};

const deepCloneObj = function _deepCloneObj(source) {
  // 使用 for in
  if (!source) {
    return [];
  }

  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'shallowClone');
  }

  const targetObj = source.constructor === Array ? [] : {};
  for (const keys in source) {
    if (source.hasOwnProperty(keys)) {
      if (source[keys] && typeof source[keys] === 'object') {
        targetObj[keys] = source[keys].constructor === Array ? [] : {};
        targetObj[keys] = _deepCloneObj(source[keys]);
      } else {
        targetObj[keys] = source[keys];
      }
    }
  }
  return targetObj;
};

// function _deepCloneObj(obj) {
//   // 使用 Reflect
//   const isType = (obj) => (type) => Object.prototype.toString.call(obj) === `[object ${type}]`;
//
//   const isObject = (obj) => isType(obj)('Object');
//   const isArray = (array) => isType(array)('Array');
//
//   if (!isObject(obj)) {
//     throw new Error(`${obj} is not Object`);
//   }
//
//   let newObj = isArray(obj) ? [...obj] : {...obj};
//   Reflect.ownKeys(newObj).forEach(key => {
//     newObj[key] = isObject(obj[key]) ? _deepCloneObj(obj[key]) : obj[key];
//   });
//
//   return newObj;
// };

const unique = function (items, key) {
  const tmpArr = [];
  const tmpSet = new Set();

  items.forEach(item => {
    if (!tmpSet.has(item[key])) {
      tmpSet.add(item[key]);
      tmpArr.push(item);
    }
  });

  return tmpArr;
};

var shortcut = {
  resetObjectToEmpty,
  getPropByPath,
  extractValue,
  deepCloneObj,
  unique
};

// http://es6.ruanyifeng.com/?search=decorator&x=0&y=0#docs/decorator
// 类的继承实现 Mixin，此种方法不会污染 prototype，并且也不会覆盖父类的同名方法，因为可以调用 super
// 同时没有使用 Object.assign，自然不会触发 get 和 set 了
// const mixin = (superClass) => class extends superClass {}

/**
 * 基于 es6 extends 的动态混合继承，从右往左继承
 * @param [classItems] class Boy, class Men, class Person, class Organism
 * @returns {Class} mixins(Boy, Men, Person, Organism) => class Boy extends Men extends Person extends Organism
 */
const mixins = (...classItems) => classItems
    .reverse()
    .reduce((superClass, rightClass) => class superClass extends rightClass{}, {});

var index = {
  energy,
  env,
  format,
  operator,
  other,
  shortcut,
  type,
  mixins: mixins,
};

export default index;
export { UA, _debounce, _typeof, addHandler, catIn, copyTextToClipboard, debounce, deepCloneObj, enhancedThrottle, extractValue, formartFileSize, formatToNumebr, getEvent, getPageCoordinates, getPropByPath, getTarget, getWheelDelta, hasOwn, inBrowser, isAndroid, isChrome, isEdge, isEmpty, isEmptyArray, isEmptyObject, isIE, isIE9, isIOS, isNativeStringType, isNumber, isString, loadScript, multiply, prettyNumberToMoney, preventDefault, removeHandler, resetObjectToEmpty, stopPropagation, sum, throttle, unique };
