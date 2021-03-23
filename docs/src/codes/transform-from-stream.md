# 读取文件流, 修改内容/保存到新文件(nodejs)

```js
const fs = require("fs");
const path = require("path");

/**
 * @description 读取文件流, 修改内容/保存到新文件
 * @param {object} readConfig 可读流配置
 * @param {object} writeConfig 可写流配置
 * @param {function?} transformFn 转换函数
 * @returns {Promise<string>}
 */
function transformFromStream({
  readConfig = { path: undefined, encoding: "utf8" },
  writeConfig = { path: undefined, encoding: "utf8" },
  transformFn = () => {},
} = {}) {
  return new Promise((resolve, reject) => {
    try {
      const readStream = fs.createReadStream(readConfig.path, {
        encoding: readConfig.encoding,
      });
      let dataContent = "";

      readStream.on("data", (chunck) => {
        dataContent += chunck;
      });

      readStream.on("end", () => {
        if (typeof transformFn === "function") {
          dataContent = transformFn(dataContent);
        }

        if (writeConfig.path) {
          const writeStream = fs.createWriteStream(writeConfig.path, {
            encoding: writeConfig.encoding,
          });
          writeStream.write(dataContent);
        }

        resolve(dataContent);
        readStream.close();
      });

      readStream.on("error", (err) => {
        readStream.close();
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}
```

## 使用

```js
transformFromStream({
  readConfig: { path: "./input.txt" },
  writeConfig: { path: "./output.txt" },
  transformFn(str = "") {
    return str.replace(/\s+,/g, "");
  },
});
```
