# 滚动到指定元素

> 基于 `JQuery`

```js
import $ from "jquery";

/**
 * @desc 滚动到指定元素
 * @param {string} targetElementId 目标元素的id
 * @param {string?} containerId 容器id, 不传默认使用body
 * @param {number?} offset 滚动位置偏移
 */
function scrollToElement({ targetElementId, containerId, offset = 0 } = {}) {
  const elContainer = containerId ? $(`#${containerId}`) : $("body,html");
  const elTarget = $(`#${targetElementId}`);

  if (!elContainer.length || !elTarget.length) {
    console.error('"scrollToElement": not find element');
    return;
  }

  const containerY = elContainer.offset().top;
  const targetY = elTarget.offset().top;
  const currScrollTop = elContainer.scrollTop();
  const targetScrollTop = targetY - containerY + currScrollTop - offset;

  elContainer.animate({ scrollTop: targetScrollTop });
}
```
