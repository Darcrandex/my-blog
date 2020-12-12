# 可旋转容器(3D)

> 参考文章
>
> - [旋转矩阵](https://www.cnblogs.com/hewei2012/p/4190282.html)

提供一个类,可以将容器内部的内容进行 3D 旋转.

## 源码部分

```js
class RotationMatrix {
  /**
   * @prop {string} wrapperId 容器id,用于接收鼠标事件
   * @prop {string} contentId 内容容器id,这个容器会被旋转
   * @prop {window?} windowObj 用于指定window对象
   * @prop {number?} scale 用于设置旋转的速率
   */
  constructor({ wrapperId, contentId, windowObj = window, scale = 1 }) {
    this.matrix = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    this.startPos = null;
    this.scale = scale;

    this.handleMove = this.handleMove.bind(this);
    this.create(wrapperId, contentId, windowObj);
  }

  // 创建元素
  create(wrapperId, contentId, windowObj) {
    this.wrapper = windowObj.document.getElementById(wrapperId);
    this.content = windowObj.document.getElementById(contentId);

    // 包裹容器设置默认css
    this.wrapper.style.cssText = "user-select: none;cursor: grab;";

    // 绑定元素事件
    this.wrapper.addEventListener("mousedown", (e) => {
      this.startPos = { x: e.clientX, y: e.clientY };
      this.wrapper.addEventListener("mousemove", this.handleMove);
    });

    this.wrapper.addEventListener("mouseup", () => {
      this.wrapper.removeEventListener("mousemove", this.handleMove);
    });

    this.wrapper.addEventListener("mouseleave", () => {
      this.wrapper.removeEventListener("mousemove", this.handleMove);
    });
  }

  handleMove(e) {
    const pos = { x: e.clientX, y: e.clientY };
    const dxdeg = this.scale * (this.startPos.y - pos.y);
    const dydeg = this.scale * (pos.x - this.startPos.x);
    this.rotate(dxdeg, dydeg);
    this.startPos = pos;
  }

  rotate(dxdeg, dydeg) {
    this.matrix = rotate3d(this.matrix, dxdeg, dydeg);
    console.log("this.matrix", this.matrix);
    const style = toMatrixCss(this.matrix);
    this.content.style.cssText = style;
  }

  // 重置
  reset() {
    this.matrix = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    const style = toMatrixCss(this.matrix);

    this.content.style.cssText = style;
  }
}

/**
 * @desc 将两个矩阵相乘
 * @param {[number[]]} aMatrix 矩阵
 * @param {[number[]]} bMatrix 矩阵
 */
function matrixMultiply(aMatrix, bMatrix) {
  const rank = 4;
  const arrMatrix = [];
  let temp = 0;
  for (let i = 0; i < rank; i++) {
    for (let j = 0; j < rank; j++) {
      temp = 0;
      for (let k = 0; k < rank; k++) {
        temp += aMatrix[i][k] * bMatrix[k][j];
      }
      arrMatrix.push(temp);
    }
  }

  const resMatrix = [[], [], [], []];
  for (let r = 0; r < rank * rank; r++) {
    resMatrix[Math.floor(r / rank)].push(arrMatrix[r]);
  }
  return resMatrix;
}

// 保留小数点
function numFixed(n = 0) {
  const numStr = n.toFixed(4);
  return Number(numStr);
}

// 角度转弧度
function DegToRadian(deg = 0) {
  return numFixed((deg / 180) * Math.PI);
}

// 将矩阵转化为变形css
function toMatrixCss(arrMatrix = []) {
  return `transform: matrix3d(${arrMatrix.join(",")});`;
}

/**
 * @desc 基于矩阵及3d选择角度计算出新的矩阵
 * @param {[number[]]} baseMatrix 矩阵
 * @param {number} xDeg 角度(0~360)
 * @param {number} yDeg 角度(0~360)
 * @param {number} zDeg 角度(0~360)
 *
 * @returns {[number[]]} 矩阵
 */
function rotate3d(baseMatrix, xDeg = 0, yDeg = 0, zDeg = 0) {
  // 基于xyz矩阵旋转
  const xMatrix = [
    [1, 0, 0, 0],
    [
      0,
      numFixed(Math.cos(DegToRadian(xDeg))),
      numFixed(Math.sin(DegToRadian(xDeg))),
      0,
    ],
    [
      0,
      -numFixed(Math.sin(DegToRadian(xDeg))),
      numFixed(Math.cos(DegToRadian(xDeg))),
      0,
    ],
    [0, 0, 0, 1],
  ];

  const yMatrix = [
    [
      numFixed(Math.cos(DegToRadian(yDeg))),
      0,
      -numFixed(Math.sin(DegToRadian(yDeg))),
      0,
    ],
    [0, 1, 0, 0],
    [
      numFixed(Math.sin(DegToRadian(yDeg))),
      0,
      numFixed(Math.cos(DegToRadian(yDeg))),
      0,
    ],
    [0, 0, 0, 1],
  ];

  const zMatrix = [
    [
      numFixed(Math.cos(DegToRadian(zDeg))),
      numFixed(Math.sin(DegToRadian(zDeg))),
      0,
      0,
    ],
    [
      -numFixed(Math.sin(DegToRadian(zDeg))),
      numFixed(Math.cos(DegToRadian(zDeg))),
      0,
      0,
    ],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];

  let matrix = matrixMultiply(baseMatrix, xMatrix);
  matrix = matrixMultiply(matrix, yMatrix);
  matrix = matrixMultiply(matrix, zMatrix);

  return matrix;
}
```

## 在 codepen 中预览

<iframe height="265" style="width: 100%;height:500px;" scrolling="no" title="RotationMatrix" src="https://codepen.io/darcrand/embed/QWKGXpv?height=265&theme-id=light&default-tab=js,result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/darcrand/pen/QWKGXpv'>RotationMatrix</a> by darcrand
  (<a href='https://codepen.io/darcrand'>@darcrand</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>
