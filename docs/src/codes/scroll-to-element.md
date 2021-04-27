# 滚动到指定元素

> 基于 `JQuery`

```js
import $ from "jquery";

/**
 * @desc 滚动到指定元素
 * @param {string} targetElementId 目标元素的id
 * @param {string?} containerId 容器id, 不传默认使用body
 * @param {number?} offset 滚动位置偏移(滚动后,距离窗口顶部的距离)
 */
function scrollToElement({ targetElementId, containerId, offset = 0 } = {}) {
  try {
    const $scrollContainer = containerId
      ? $(`#${containerId}`)
      : $("html,body");

    // 滚动容器节点
    const elContainer = containerId
      ? document.getElementById(containerId)
      : document.getElementsByTagName("body")[0];

    // 目标节点
    const elTarget = document.getElementById(targetElementId);
    // 滚动容器相当于可视区的 y 坐标
    const parentY = elContainer.getBoundingClientRect().top;
    // 当前卷入高度
    const currScrollTop = elContainer.scrollTop;
    // 目标节点相当于可视区的 y 坐标
    const targetY = elTarget.getBoundingClientRect().top;
    // 父节点要滚动到的位置
    const targetScrollTop = targetY - parentY + currScrollTop - offset;

    $scrollContainer.animate({ scrollTop: targetScrollTop });
  } catch (err) {
    console.error("滚动失败", err);
  }
}
```
