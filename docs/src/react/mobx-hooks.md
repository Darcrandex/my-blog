# mobx-hooks

> 2020-4-22
> 参考链接[React Context](https://mobx-react.js.org/recipes-context)

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
```

1. src/store/modules/counter.ts

```jsx
import { observable, action, runInAction } from "mobx";

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
