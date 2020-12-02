# 为指定的元素绑定滚动到底部的监听

> 2020-04-23
> 基于 jquery3.x(jq 大法好)

判断的信息有 3 个:

1. contentHeight 内容真正的高度
2. viewHeight 可视高度
3. scrollTop 滚动高度,或者被卷入的高度

它们之间的关系是: `contentHeight` = `viewHeight` + `scrollTop`

使用 jquery 获取相应的值

1. contentHeight

```js
const $el = $("#box");
const contentHeight = $el.get(0).scrollHeight;
```

但是也有特殊的情况,如果监听的不是元素,而是`window`或`body`,就需要特殊处理

```js
// 非文档元素

const contentHeight =
  window.document.body.scrollHeight ||
  window.document.documentElement.scrollHeight;
```

2. viewHeight

```js
const $el = $("#box");
const viewHeight = $el.height();
```

3. scrollTop

```js
const $el = $("#box");
const scrollTop = $el.scrollTop();
```

最后通过 `viewHeight + scrollTop === contentHeight` 判断是否到达底部.

完整代码.这里添加了到达底部触发值`offset`,还添加了防抖处理.

```js
function bindReachBottom(
  callback = () => {},
  { getElement = () => window, offset = 50, delay = 200 } = {}
) {
  const el = getElement();
  let timer = null;

  // 绑定函数
  function handleBottom() {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      const viewHeight = $(el).height();
      const contentHeight =
        $(el)[0].scrollHeight ||
        window.document.body.scrollHeight ||
        window.document.documentElement.scrollHeight;
      const scrollTop = $(el).scrollTop();

      if (viewHeight + scrollTop >= contentHeight - offset) {
        callback && callback({ viewHeight, contentHeight, scrollTop });
      }
    }, delay);
  }

  $(el).on("scroll", handleBottom);

  // 最后返回一个解绑函数
  function cancelHandle() {
    $(el).off("scroll", handleBottom);
  }

  return cancelHandle;
}
```

使用

```html
<ul id="list-container">
  <li></li>
</ul>
```

```js
// 绑定事件
const unbind = bindReachBottom(
  () => {
    console.log("bottom");
  },
  {
    getElement: () => document.getElementById("list-container"),
    offset: 100,
    delay: 1000,
  }
);

// 主动解绑事件
$("#unbind").on("click", unbind);
```
