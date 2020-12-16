# mobx-hooks

> 参考链接
>
> - [React Context](https://mobx-react.js.org/recipes-context)

这里写一个简单的例子

安装依赖

```
yarn add mobx mobx-react
```

首先是项目的结构,以基本的 react 项目为基础,只展示 src 下的结构内容

```
src
|-index.tsx
|-store
  |-index.ts
  |-modules
    |-counter.ts
|-utils
  |-mobx-store.ts
```

1. src/store/modules/counter.ts

```jsx
import { observable, action, runInAction } from "mobx";
import { StoreModule } from '@/utils/mobx-store'

class Counter extends StoreModule {
  @observable public count = 0;

  @action
  public add = () => {
    this.count++;
  };

  @action
  public sub = async () => {
    // 异步操作
    await waiting(2);
    runInAction(() => {
      this.count--;
    });
  };
}

async function waiting(second = 1) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000 * second);
  });
}

export default new Counter();
```

2. src/store/index.ts

```jsx
import { createContext, useContext } from "react";
import { configure } from "mobx";

import counter from "./modules/counter";

configure({ enforceActions: "observed" });

const storesContext = createContext({
  counter,
});

export const useStores = () => useContext(storesContext);
```

3. src/index.ts

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { observer } from "mobx-react";
import { useStores } from "@/stroe";

const App = observer(() => {
  const { counter } = useStores();
  return (
    <>
      <p>count: {counter.count}</p>
      <button onClick={counter.add}>add</button>
      <button onClick={counter.sub}>sub</button>
    </>
  );
});

ReactDOM.render(<App />, document.getElementById("root"));
```

4.  src/utils/mobx-store.ts

```ts
import { action, isComputedProp, isObservableProp, set } from "mobx";

class StoreModule {
  /**
   * @desc 用于更新store中的值
   * @desc 该方法为'action',所以可以放在异步函数中执行,而不需要使用'runInAction'
   * @desc 由于接受的是对象,可以一次(同步)更新多个值(类型React.Component.setState)
   *
   * @param {object} nextState 需要更新的值
   */
  public $set(nextState: object) {
    action((state: object) => {
      for (const [key, value] of Object.entries(state)) {
        if (isObservableProp(this, key) && !isComputedProp(this, key)) {
          set(this, key, value);
        } else {
          console.error(
            new Error(
              `mobx action "$set": 当前 store 实例中不存在 "${key}",
              或者 "${key}" 不是一个可观察属性(observable)`
            )
          );
        }
      }
    })(nextState);
  }
}

export { StoreModule };
```
