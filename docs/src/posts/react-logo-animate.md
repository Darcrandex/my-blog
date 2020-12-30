# react logo 出场动画

## 先看效果

> 可以点击右下角的 `Rerun` 按钮重新播放动画.

<iframe height="500" style="width: 100%;" scrolling="no" title="react logo animation" src="https://codepen.io/darcrand/embed/OJROQwX?height=265&theme-id=dark&default-tab=css,result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/darcrand/pen/OJROQwX'>react logo animation</a> by darcrand
  (<a href='https://codepen.io/darcrand'>@darcrand</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

## 制作过程

### DOM 的部分

构成的元素有 一个圆点, 三个圆环

```html
<div class="container">
  <div class="box">
    <span class="point"></span>
    <span class="ring-1"></span>
    <span class="ring-2"></span>
    <span class="ring-3"></span>
  </div>
</div>
```

### css 的部分

由于元素之间会叠在一起, 所以使用`定位`的方式去居中, 而没有使用`flex`布局.

```css
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #282c34;
  overflow: hidden;
}

.box {
  position: relative;
  width: 400px;
  height: 400px;
  animation: box-animate 10s linear infinite;
}

.point {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 15%;
  height: 15%;
  border-radius: 50%;
  background-color: #61dafb;
  transform: translate(-50%, -50%) scale(0);
  animation: point-animate 0.75s ease 1s forwards;
}

[class^="ring-"] {
  position: absolute;
  top: 50%;
  left: 50%;

  border-radius: 50%;
  border: 4px solid transparent;
}
```

### 绘制椭圆

可以先绘制一个圆形,然后通过`transform: rotateY(70deg)`旋转这个圆, 相当于看到了圆的侧视图, 这样看起来就会是一个椭圆.

```css
.ring {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  border: 1px solid #000;
  transform: rotateY(70deg);
}
```

然后每个椭圆的环会把圆平分成 6 份, 所以使用`rotateZ()`来分别旋转椭圆, 角度则是`index * (360/6) + 30`, `30`度为基础偏移角度. 最后加上平移, 让圆环居中于屏幕.

```css
.ring-1 {
  transform: translate(-50%, -50%) rotateZ(30deg) rotateY(70deg);
}
.ring-2 {
  transform: translate(-50%, -50%) rotateZ(90deg) rotateY(70deg);
}
.ring-3 {
  transform: translate(-50%, -50%) rotateZ(150deg) rotateY(70deg);
}
```

### 动画的部分

中间的圆点先放大,然后恢复到 100%,让它看起来'Q 弹'.

```css
@keyframes point-animate {
  0% {
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}
```

然后,每个圆环先是逐渐放大,然后变成椭圆,并旋转相对于的角度.

```css
@keyframes r1 {
  0% {
    width: 0;
    height: 0;
    opacity: 0;
    transform: translate(-50%, -50%);
    border-color: transparent;
  }

  40%,
  60% {
    width: 100%;
    height: 100%;
    opacity: 1;
    border-color: #61dafb;
    transform: translate(-50%, -50%);
  }

  100% {
    width: 100%;
    height: 100%;
    opacity: 1;
    border-color: #61dafb;
    transform: translate(-50%, -50%) rotateZ(30deg) rotateY(70deg);
  }
}
```

最后是最外层的容器, 让它一直旋转就好了.

```css
@keyframes box-animate {
  0% {
    transform: rotateZ(0);
  }
  100% {
    transform: rotateZ(1turn);
  }
}
```
