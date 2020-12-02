# 数组字段排序

`javascript`

---

## 代码

```js
/**
 * @desc 数组排序,可根据字段名,可升/降序
 * @param {any[]} arr 原始数组
 * @param {string[]} options 根据字段名排序
 *
 * @param {object[]} options 字段名排序,升/降序
 * @param {string} options[].key 字段名
 * @param {string} options[].order ase:升序 desc:降序
 *
 * @return {any[]}
 */
function sortBy(arr = [], options = []) {
  if (!Array.isArray(arr)) {
    return [];
  }

  const resArr = arr.slice();

  if (!Array.isArray(options) || options.length === 0) {
    return resArr.sort((a, b) =>
      JSON.stringify(a || "") < JSON.stringify(b || "") ? -1 : 1
    );
  }

  resArr.sort((a, b) => {
    let sortRes = 0;
    let compareKey = "";
    let orderValue = -1;

    options.forEach((opt) => {
      if (sortRes === 0 && typeof a === "object" && typeof b === "object") {
        if (typeof opt === "string") {
          compareKey = opt;
          orderValue = -1;
        } else if (typeof opt === "object") {
          const { key, order } = opt;
          compareKey = key;
          orderValue = order === "ase" ? -1 : 1;
        }

        sortRes =
          a[compareKey] === b[compareKey]
            ? 0
            : a[compareKey] < b[compareKey]
            ? orderValue
            : -orderValue;
      }
    });

    return sortRes;
  });

  return resArr;
}
```
