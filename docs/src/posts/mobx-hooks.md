# mobx-react@7.x hooks

> 参考文章
>
> [React integration](https://mobx.js.org/react-integration.html)
>
> [Using MobX with React Hooks and TypeScript](https://blog.mselee.com/posts/2019/06/08/using-mobx-with-react-hooks-typescript/)

## 前言

`mobx-react@7.x`相较于`mobx-react@6.x`有很大改变, api 也有所不同. 因此写法有改变. 另外本例子是基于`react@17.0.1`+`react hooks`+`mobx@6.x` + `mobx-react@7.x`+ `typescript`创建的.

## 如何定义子模块

> 因为使用`mobx`, 大多都是用来做全局状态管理的. 因此会拆分多个子模块.

`mobx-react@7.x`提供了[makeAutoObservable](https://mobx.js.org/observable-state.html#makeautoobservable)方法, 用来将普通对象转化为可观察对象.
官方文档的例子中是在`constructor`中进行转化的.

```js {6}
// /src/store/timer.ts

class Timer {
  secondsPassed = 0;
  constructor() {
    makeAutoObservable(this);
  }
  increaseTimer() {
    this.secondsPassed += 1;
  }
}
```

但是经过测试, 只需要最终引用的实例对象被转化即可

```js {8}
class Timer {
  secondsPassed = 0;
  increaseTimer() {
    this.secondsPassed += 1;
  }
}

const timer = makeAutoObservable(new Timer());
```

另外, 例子中的子模块类的`属性`和`方法`并没有使用`装饰器`, 也可以正常运行. 但是会存在引用方法时, `this`指向错误的问题.

```jsx
<button onClick={timer.increaseTimer}>increaseTimer</button>

// 报错: 'this.secondsPassed' is not defind
```

所以延续旧的装饰器写法

```jsx {2,5}
class Timer {
  @observable
  secondsPassed = 0;

  @action
  increaseTimer = () => {
    this.secondsPassed += 1;
  };
}

const timer = makeAutoObservable(new Timer());
```

## 定义 stroe 总模块

`mobx-react@7.x`中, 推荐使用`React Context`来存储状态. [Using external state in observer components](https://mobx.js.org/react-integration.html#using-external-state-in-observer-components)

先来看总览的代码

```tsx
// /src/store/index.tsx

import { FC, createContext, useContext } from "react";

import timer from "./timer";

const createStore = () => ({ timer });

const storeValue = createStore();

type TStore = ReturnType<typeof createStore>;

const StoreContext = createContext<TStore | null>(null);

export const StoreProvider: FC = ({ children }) => (
  <StoreContext.Provider value={storeValue}>{children}</StoreContext.Provider>
);

export const useStores = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("no store");
  }
  return store!;
};
```

先讲讲`createContext`和`useContext`. [use context](https://zh-hans.reactjs.org/docs/context.html#when-to-use-context)中提到, 创建出来的`context`类似一个容器, 用来缓存数据,`Provider`为提供数据的容器组件,其中的`value`属性则用来配置数据. 而`useContext`则会往上找到指定的`context`中保存的数据.

> 逐一分析

### 创建`context`

Version 1

```tsx
const store = { timer }; // 其中'timer'是上文定义的子模块
const StoreContext = createContext(null);

<StoreContext.Provider value={store} />;
```

这样写是没有问题的. 但是会出现一点小问题. 当逻辑组件引用`store`的时候, 1.会提示`store`可能是`null`(即初始值), 2.不能明确`store`中包含的内容.

```tsx {5}
function App() {
  const store = useContext(StoreContext);

  // 'store' 可能为空, 由于没有定义类型接口, 'timer' 是不明确的
  const secondsPassed = store?.timer?.secondsPassed;

  return "";
}
```

Version 2 先给 stroe 定义子模块的类型

```ts {3}
const createStore = () => ({ timer });
const storeValue = createStore();
type TStore = ReturnType<typeof createStore>;
const StoreContext = createContext<TStore | null>(null);
```

其中`ReturnType<typeof createStore>`是根据[这篇文章](https://blog.mselee.com/posts/2019/06/08/using-mobx-with-react-hooks-typescript/#preparing-an-example-app)
来使用的, 具体的原理还不是很明白, 先这样写.
`createContext`接收泛型参数`TStore`后就能在引用时获得提示. 然后在导出`useStores`时, 使用`!`明确`store`一定存在.

```ts {6}
export const useStores = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("no store");
  }
  return store!;
};
```

### 创建关联 `context` 的 `Provider`

```tsx
export const StoreProvider: FC = ({ children }) => (
  <StoreContext.Provider value={storeValue}>{children}</StoreContext.Provider>
);
```

该组件注入`storeValue`, 然后组件内的所有子组件`children`都可以获取到`context`的数据.

### 提供获取 `store` 的自定义 `hooks`

```ts
export const useStores = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("no store");
  }
  return store!;
};
```

其中`store`就是上文创建的`storeValue`

## 在根组件中使用 `Provider`

一般在`/src/index.tsx`中

```tsx
import { StoreProvider } from "@/store";

ReactDOM.render(
  <StoreProvider>
    <App />
  </StoreProvider>,
  document.getElementById("root")
);
```

## 在子孙组件中引用

```tsx {17}
// /src/pages/MyComponent.tsx

import { observer } from "mobx-react";
import { useStores } from "@/store";

function MyComponent() {
  const { timer } = useStores();

  return (
    <>
      <p>Seconds passed: {timer.secondsPassed}</p>
      <button onClick={timer.increaseTimer}>increaseTimer</button>
    </>
  );
}

export default observer(MyComponent);
```

最后不要忘了用`observer`来将组件转为`观察者`.
