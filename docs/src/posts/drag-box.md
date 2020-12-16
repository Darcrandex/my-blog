# 拖动元素 React vs Vue

> 前言
>
> 在学习`react hooks`和`vue composition api`时，感觉两个东西有点相似，但是有很区别.刚好使用了一个简单的例子:`可拖动元素`，来分析对比一下两个工具的区别。

## 先看效果

react hooks

<iframe height="600" style="width: 100%;" scrolling="no" title="react-drag-box" src="https://codepen.io/darcrand/embed/rNMmBZx?height=265&theme-id=dark&default-tab=js,result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/darcrand/pen/rNMmBZx'>react-drag-box</a> by darcrand
  (<a href='https://codepen.io/darcrand'>@darcrand</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

vue 3

<iframe height="600" style="width: 100%;" scrolling="no" title="vue-drag-box" src="https://codepen.io/darcrand/embed/jOMmNmJ?height=265&theme-id=dark&default-tab=js,result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/darcrand/pen/jOMmNmJ'>vue-drag-box</a> by darcrand
  (<a href='https://codepen.io/darcrand'>@darcrand</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

## 分析

### react hooks

首先是`react hooks`，这里写了两个版本。第一个版本使用的是一般的`useState`和使用`useCallback`包裹的句柄函数，

```js{18,25}
const [state, setState] = useState({
  left: 0,
  top: 0,
  x: 0,
  y: 0,
  moving: false,
});
const refBox = useRef();

const onMove = useCallback(
  (event) => {
    if (!state.moving) return;

    const { clientX, clientY } = event;
    const dx = clientX - state.x;
    const dy = clientY - state.y;
    setState({
      ...state,
      left: state.left + dx,
      top: state.top + dy,
      x: state.x + dx,
      y: state.y + dy,
    });
  },
  [state]
);
```

这里，使用`setState`更新`state`的时候，不像类组件的`this.setState`方法，自动合并要更新的字段，而是需要完整指定新的`state`。同时由于新的`{ x,y,top,left }`都需要使用前一状态的`state`进行计算。因此`useCallback`的依赖项`state`必须指定，否则无法获取变化后的`state`。但是这样会导致后面的问题：

```js{14}
useEffect(() => {
  if (!refBox.current) return;

  const tempRef = refBox.current;
  tempRef.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);

  return () => {
    tempRef.removeEventListener("mousedown", onDown);
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
}, [refBox, onDown, onMove, onUp]);
```

初始化的时候，添加事件绑定，使用到的`onMove`本来应该是不变的，但是实际上`onMove`函数会一直发生改变，原因是它所依赖的`state`一直在变化。这样会导致一个性能问题，在拖动元素的时候，会不断地绑定和解绑句柄函数：

```js
useEffect(() => {
  console.log("onMove changed");
}, [onMove]);
```

下面来看第二个版本。使用的是`useRef`而不是`useState`，然后在所有的句柄函数中移除依赖项：

```js{1,15}
const state = useRef({ left: 0, top: 0, x: 0, y: 0, moving: false });

const onMove = useCallback((e) => {
  if (!state.current.moving) return;
  const { clientX, clientY } = e;
  const dx = clientX - state.current.x;
  const dy = clientY - state.current.y;

  state.current.x += dx;
  state.current.y += dy;
  state.current.left += dx;
  state.current.top += dy;

  setStyle({ left: state.current.left, top: state.current.top });
}, []);
```

这样就能保证`onMove`等句柄函数一直不发生变化，避免了性能问题。但是由于`useRef`的更新不会重新渲染组件，所有又需要使用`useState`来做数据的映射。

```js
const [style, setStyle] = useState({ left: 0, top: 0 });

// ...
setStyle({ left: state.current.left, top: state.current.top });
```

### vue composition api

对于`vue3`，数据定义其实差不多，主要是句柄函数的区别：

```js
const onMove = (event) => {
  if (!data.moving) return;
  const dx = event.clientX - data.x;
  const dy = event.clientY - data.y;
  data.left += dx;
  data.top += dy;
  data.x += dx;
  data.y += dy;
};
```

可以看到，句柄中不需要手动指定依赖项，api 中会自动收集依赖。这样看上去很像上文中 react 第二个的写法，但是`reactive`又是可以自动重新渲染组件的。另外通过`watchEffect`可以看到句柄本身不会发送变化：

```js
watchEffect(() => {
  console.log("onMove changed", onMove);
});
```

而且本身就提供类似`onMounted`，`onBeforeUnmount`这样的生命周期 api。更方便理解和开发。

## 总结

个人体检，`vue`的`composition api`结合了`react`的优点，同时又剔除它的缺点，在使用和代码理解层面上比`react`更胜一筹。
