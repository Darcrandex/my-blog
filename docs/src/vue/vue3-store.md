# vue3 使用 provide/inject 代替 vuex

感觉 vuex 使用起来跟 redux 一样烦, vuex3 中 provide/inject 的写法可能会比较好, 尝试使用替换状态管理方案

> 参考文章
>
> - [Vue3 Composition-Api + TypeScript + 新型状态管理模式探索](https://juejin.im/post/6844904131610542087)
> - [Vue 3 带来的 Vuex 的替代方案](https://zhuanlan.zhihu.com/p/114783130)

## 使用脚手架创建项目

```sh
vue create my-app
```

## 构建 store

新建`src/store/modules/counter.js`. 一个简单的计数器状态管理

```js
import { provide, inject, ref, reactive, readonly } from "vue";

const COUNTER = Symbol();

const delay = (ms = 1000) =>
  new Promise((r) => {
    const t = setTimeout(() => {
      clearTimeout(t);
      r();
    }, ms);
  });

export function useCounterProvider() {
  const count = ref(10);
  const state = reactive({ count: 0 });

  const add = () => {
    count.value++;
    state.count++;
  };

  const sub = async () => {
    await delay();
    count.value--;
    state.count--;
  };

  provide(COUNTER, readonly({ state, count, add, sub }));
}

export function useCounter() {
  return inject(COUNTER);
}
```

新建`src/store/index.js`. 模块汇总文件

```js
import { useCounterProvider, useCounter } from "./modules/counter";

function useStore() {
  useCounterProvider();
}

export { useStore, useCounter };
```

## 挂载 store

`src/App.vue`

```js
import { useStore } from "./store/index";

export default {
  name: "App",
  components: {
    HelloWorld,
  },

  setup() {
    useStore();
  },
};
```

## 在子组件中注入

```vue
<template>
  <p>count {{ counter.count }}</p>
  <p>count {{ counter.state.count }}</p>

  <button @click="counter.add">add</button>
  <button @click="counter.sub">sub</button>
</template>
```

```js
import { useCounter } from "@/store/index";

export default {
  name: "HelloWorld",
  setup() {
    // 不能使用扩展符展开
    const counter = useCounter();

    return { counter };
  },
};
```
