# localStorage 管理

> 由于在项目中,使用到`localStorage`.但是存在以下问题:

1. 兼容性
2. key 管理混乱
3. 存储的值是明文,存在安全隐患

## 方案

[store](https://www.npmjs.com/package/store)用来处理兼容性, [crypto-js](https://www.npmjs.com/package/crypto-js)用来加密. 并封装一个工具方法用来系统管理`localStorage`.

## 加/解密

```ts
// crypto-aes.ts
import CryptoJS from "crypto-js";

const DEFAULT_KEY = "your-key";
const DEFAULT_IV = "your-iv";

export interface IOptions {
  key?: string;
  iv?: string;
}

interface IEncrypt {
  (
    value: string | number | boolean | object | any[],
    options?: IOptions
  ): string;
}

export const encrypt: IEncrypt = (value, options) => {
  const { key = DEFAULT_KEY, iv = DEFAULT_IV } = options || {};

  try {
    // 如果是字符串类型,需要先用引号包裹
    const str =
      typeof value === "string" ? `"${value}"` : JSON.stringify(value);
    const ciphertext = CryptoJS.AES.encrypt(str, key, { iv });
    const encrypted = ciphertext.toString();
    return encrypted;
  } catch (err) {
    console.error("aes 加密失败", err);
    // 失败默认返回空字符串,保证解密时不会报错
    return "";
  }
};

interface IDecrypt {
  (str: string, options?: IOptions): any;
}

export const decrypt: IDecrypt = (str, options) => {
  const { key = DEFAULT_KEY, iv = DEFAULT_IV } = options || {};

  try {
    const bytes = CryptoJS.AES.decrypt(str, key, { iv });
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    // 如果解密的结果是空字符串,则无法使用JSON.parse,直接返回即可
    const decrypted = plaintext === "" ? "" : JSON.parse(plaintext);

    return decrypted;
  } catch (err) {
    console.error("aes 解密失败");
    return null;
  }
};
```

## storage 工具

```ts
// storage.ts
import store from "store";
import { encrypt, decrypt, IOptions } from "./crypto-aes";

// 业务定义的key
export type storageKeys = "msg" | "another-key";

const storage = {
  set: (key: storageKeys, value: any, options?: IOptions) => {
    const encryptedValue = encrypt(value, options);
    store.set(key, encryptedValue);
  },

  get: (key: storageKeys, options?: IOptions) => {
    const encryptedValue = store.get(key);
    return decrypt(encryptedValue, options);
  },

  remove: (key: storageKeys) => {
    store.remove(key);
  },

  clear: () => {
    store.clearAll();
  },
};

export default storage;
```

## 使用

```ts
// index.js
import storage from "./storage";

// ts会提示set方法中的可选参数
const encodeData = storage.set("msg", "hello");
const decodeData = storage.get("msg");
```
