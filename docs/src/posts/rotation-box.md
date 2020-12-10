# 可旋转容器(3D)

```js
/**
 * @name RotationMatrix
 * @desc 元素旋转组建
 * @desc 参考文档：旋转矩阵 https://www.cnblogs.com/hewei2012/p/4190282.html
 */

class RotationMatrix {
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

  create(wrapperId, contentId, windowObj) {
    this.wrapper = windowObj.document.getElementById(wrapperId);
    this.content = windowObj.document.getElementById(contentId);

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
    this.matrix = this.rotate3d(this.matrix, dxdeg, dydeg);
    const style = toCss(this.matrix);
    this.content.style.cssText = style;
  }

  rotate3d(baseMatrix, xDeg = 0, yDeg = 0, zDeg = 0) {
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
}

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

function numFixed(n = 0) {
  const numStr = n.toFixed(4);
  return Number(numStr);
}

function DegToRadian(deg = 0) {
  return numFixed((deg / 180) * Math.PI);
}

function toCss(arrMatrix) {
  return `transform: matrix3d(${arrMatrix.join(",")});`;
}
```
