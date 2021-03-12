# 常用的工具函数

## 周期循环

```ts
function backCycle(num: number, cycle: number): number {
  let index = num % cycle;
  if (index < 0) {
    index += cycle;
  }
  return index;
}
```

`num` 表示要计算的数值,`cycle` 表示周期长度.
例如:时钟从 0 点开始,经过 15 小时后,即 `backCycle(15,12)`,指针会指向刻度的"3".
例如:现在是 0 点,计算 28 小时之前,即 `backCycle(-28,12)`,是"8"点.

## 数值越界

```ts
/**
 * @name boundary
 * @desc 数值边界
 * @param {Number} num 需要处理的数值
 * @param {Number} min 最小边界值
 * @param {Number} max 最大边界值
 */
function boundary(num, min = -Infinity, max = Infinity) {
  return Math.max(min, Math.min(max, num));
}
```

## search 参数转化

```ts
/**
 * @desc 获取url中的search参数,并转化为对象
 * @return {Object} search
 */
function getSearchObject(): object {
  let result = {};
  const url = window.location.href;
  const hasSearch = url.split("?").length > 1;
  if (hasSearch) {
    const searchStr = url.split("?")[1];
    const searchKeyValueArr = searchStr.split("&");
    for (let i = 0; i < searchKeyValueArr.length; i++) {
      const [key, value] = searchKeyValueArr[i].split("=");
      result[key] = decodeURIComponent(value);
    }
  }

  return result;
}

/**
 * @desc 将对象转化为search字符串
 * @param {String} window.location.search
 */
function objectToSearch(obj: object): string {
  let searchStr = "";
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = encodeURIComponent(obj[key]);
      searchStr += `${key}=${value}&`;
    }
  }

  return searchStr ? "?" + searchStr.slice(0, -1) : "";
}
```

## 小数点保留

```ts
interface INumberFixed {
  (
    num: number,
    options?: { count?: number; type?: "round" | "floor" | "ceil" }
  ): number;
}

const numberFixed: INumberFixed = (num = 0, { count = 2, type = "round" }) => {
  const power = Math.pow(10, count);
  return Math[type](num * power) / power;
};
```

使用

```ts
numberFixed(12, { count: 2, type: "round" });
```

## 颜色转化 hsl to rgb

```js
/**
 * @desc hsla 转为 rgba
 * @param {Number} h 色相 [0-360]
 * @param {Number} s 饱和度 [0-1]
 * @param {Number} l 亮度 [0-1] 0.5时为正常
 * @param {Number} a 透明度 [0-1]
 */
function hsla2rgba(h = 0, s = 1, l = 0.5, a = 1) {
  let r, g, b;
  let deg = h % 360;
  // 将色相转化为[0-1]的数值
  deg = deg < 0 ? 360 + deg : deg;
  const num = Math.floor((1000 * deg) / 360) / 1000;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, num + 1 / 3);
    g = hue2rgb(p, q, num);
    b = hue2rgb(p, q, num - 1 / 3);
  }

  return `rgba(${Math.floor(r * 255)},${Math.floor(g * 255)},${Math.floor(
    b * 255
  )},${a})`;
}
```

## 随机字符串

```ts
function randomStr(len = 16) {
  const l = Math.max(1, Math.min(100, len));
  let str = "_";

  while (str.length < l) {
    str += Math.random()
      .toString(36)
      .slice(2);
  }

  return str.slice(0, l);
}
```

## 函数节流

```js
/**
 * @desc 将高频触发的事件,降低频率
 * @param {Function} fn 回调函数
 * @param {Number} timeout 函数执行的周期时间
 */
function throttle(fn, timeout = 1000) {
  if (!fn) {
    return;
  }
  let startTime = new Date();
  return (event) => {
    const now = new Date();
    if (now - startTime > timeout) {
      fn.call(fn, event);
      startTime = now;
    }
  };
}
```

## 函数防抖

```js
/**
 * @desc 高频触发的事件,当该事件停止触发再执行回调
 * @param {Function} fn 回调函数
 * @param {Number} delay 防抖周期
 */
function debounce(fn, delay = 500) {
  if (!fn) {
    return;
  }
  let timer = null;
  return (event) => {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      fn.call(fn, event);
    }, delay);
  };
}
```

## aes 加解密

安装插件

```
npm install crypto-js --save
```

```js
/**
 * @desc aes 加/解密工具
 * @author darcrand
 * @version 2019-09-17
 */
import CryptoJS from "crypto-js";

const DEFAULT_KEY = "your-key";
const DEFAULT_IV = "your-iv";

/**
 * @desc aes加密
 * @param {any} value 需要加密的数据
 * @return {String} 加密的字符串
 */
function encrypt(value = "", { key = DEFAULT_KEY, iv = DEFAULT_IV } = {}) {
  if (!value) {
    console.error("aes encrypt error: param:'value' is required");
    return "";
  }

  try {
    const str = JSON.stringify(value);
    const ciphertext = CryptoJS.AES.encrypt(str, key, { iv });
    const encrypted = ciphertext.toString();
    return encrypted;
  } catch (err) {
    console.error("aes encrypt error: fail");
    return "";
  }
}

/**
 * @desc aes解密
 * @param {String} str 被加密的内容
 * @return {any} 解密的明文
 */
function decrypt(str = "", { key = DEFAULT_KEY, iv = DEFAULT_IV } = {}) {
  if (!str) {
    console.error("aes decrypt error: param:'str' is required");
    return "";
  }

  try {
    var bytes = CryptoJS.AES.decrypt(str, key, { iv });
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    const decrypted = JSON.parse(plaintext);
    return decrypted;
  } catch (err) {
    console.error("aes encrypt error: fail");
    return "";
  }
}

export { encrypt, decrypt };
```

## 数组去重

```js
/**
 * @description 数组去重
 * @param {Array<any>} arr
 * @param {String} key 用于对象数组时,过滤的key
 * @returns {Array<any>}
 */
export function unduplicate(arr = [], key = null) {
  const result = [];
  const obj = {};

  if (key) {
    for (const item of arr) {
      if (!obj[item[key]]) {
        result.push(item);
        obj[item[key]] = true;
      }
    }
  } else {
    for (let i of arr) {
      if (!obj[i]) {
        result.push(i);
        obj[i] = true;
      }
    }
  }

  return result;
}
```

## 数组分割

```js
/**
 * @description 一维数组转为'col'列的二维数组
 * @param {Array} arr
 * @param {Number} col 列数,不能小于2
 * @returns {Array|null}
 */
function splitArray(arr = [], col = 5) {
  if (!Array.isArray(arr) || !arr.length || col < 2) {
    return [];
  }

  return arr.reduce((prev, curr, index) => {
    const shouldCreateArr = index % col === 0;
    if (shouldCreateArr) {
      prev.push([curr]);
      return prev;
    } else {
      const lastArr = prev[prev.length - 1];
      lastArr.push(curr);
      return prev;
    }
  }, []);
}
```

## 数组深度查询

```js
/**
 * @desc 对象数组深度查询
 * @param {Array} arr 原始数组,子孙数组结构需相同
 * @param {Function} fnFilter 用于判断是否匹配成功的函数,接受当前遍历的元素,返回布尔值
 * @param {String} childrenKey 指向子数组的key
 *
 * @returns {Object|undefined} target 匹配到的元素,该元素保留在原始数组的路径
 */
function findDeep(
  arr = [],
  fnFilter = (item, index) => {},
  childrenKey = "children"
) {
  const stack = [];

  // 把所有节点推入栈,铺平数组
  const putInStack = (_arr = []) => {
    if (!Array.isArray(_arr)) {
      return;
    }
    for (let i = 0; i < _arr.length; i++) {
      stack.push(_arr[i]);
      putInStack(_arr[i][childrenKey]);
    }
  };

  putInStack(arr);
  return stack.find(fnFilter);
}
```

另外一种深度优先算法

```js
function findDeep2(
  arr = [],
  fnFilter = (item, index) => {},
  childrenKey = "children"
) {
  let matchItem = null;
  let currIndex = 0;
  const stack = [];

  const putInStack = (_arr = []) => {
    if (!Array.isArray(_arr)) {
      return;
    }
    for (let i = 0; i < _arr.length; i++) {
      const item = _arr[i];
      stack.push(item);

      const isFinded = search();
      if (isFinded) {
        break;
      } else {
        putInStack(item[childrenKey]);
      }
    }
  };

  const search = () => {
    for (; currIndex < stack.length; currIndex++) {
      matchItem = fnFilter(stack[currIndex]) ? stack[currIndex] : null;
      if (matchItem) {
        return true;
      }
    }
    return false;
  };

  putInStack(arr);
  return matchItem;
}
```

## 数值缩写

```ts
/**
 * @description 数值缩写
 * @param number 数值
 * @param count 保留小数点位数(大于等于0)
 */
function numberAbbreviation(number = 0, count = 0): string {
  const suffixes = ["", "K", "M", "G", "T", "P", "E", "Z", "Y"];
  const step = 1000;
  const power = Math.pow(10, count < 0 ? 0 : count);
  let num = number;
  let index = 0;

  while (num > step) {
    index++;
    num /= step;
  }

  num = Math.floor(power * num) / power;
  const suffix = suffixes[index];

  return num + suffix;
}
```

使用

```js
const s = numberAbbreviation(123456789, 1); //123.4M
```

## 从 url 中保存和获取对象类型参数

```js
const URLQuery = {
  toSearch(obj = {}, searchKey = "query") {
    if (typeof obj !== "object") {
      return "";
    }

    const str = JSON.stringify(obj);
    const encodeStr = window.btoa(unescape(encodeURIComponent(str)));
    return `?${searchKey}=${encodeStr}`;
  },

  toObject(searchKey = "query") {
    const url = window.location.href;
    const hasSearch = url.split("?").length > 1;

    if (!hasSearch) {
      return {};
    }

    const searchStr = url.split("?")[1];
    const searchKeyValueArr = searchStr.split("&");
    let encodeQueryStr = "";

    for (let i = 0; i < searchKeyValueArr.length; i++) {
      const [key, value] = searchKeyValueArr[i].split("=");
      if (key === searchKey) {
        encodeQueryStr = value;
        break;
      }
    }

    const str = decodeURIComponent(escape(window.atob(encodeQueryStr)));
    try {
      return JSON.parse(str);
    } catch (err) {
      console.error(err);
      return {};
    }
  },
};
```

使用:

在 url 上添加 search 字符串

```js
const params = { a: 1, b: "", c: [] };
const search = URLQuery.toSearch(params);

window.location.href += search;
```

从 url 上获取 search 转化的对象参数

```js
const objectFromSearch = URLQuery.toObject();
```

## 限制数值大小

```js
/**
 * @description 限制数值大小
 * @param {number} num 目标数值
 * @param {number?} min 最小值
 * @param {number?} max 最大值
 * @returns
 */
function limit(num = 0, { min = -Infinity, max = Infinity } = {}) {
  return Math.min(max, Math.max(min, num));
}
```
