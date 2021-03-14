# vue-status 2.0

> 在 `vue3.x` 使用全局状态管理
>
> 参考文章:
>
> - [vue 插件](https://v3.cn.vuejs.org/guide/plugins.html)
> - [provide/inject](https://v3.cn.vuejs.org/api/options-composition.html#provide-inject)

## 1. 使用`vite`创建 vue 项目

```sh
yarn create @vitejs/app my-vue-app --template vue
cd my-vue-app
```

## 2. 创建子模块

```ts
// /src/store/modules/counter.ts

import { reactive } from "vue";

function counterStore() {
  const state = reactive({ count: 0 });
  const add = () => {
    state.count++;
  };
  return { state, add };
}

// 采用单例模式
export default counterStore();
```

## 3. store 主模块

```ts
// /src/store/index.ts

import { App, InjectionKey, readonly, inject } from "vue";
import counter from "./modules/counter";

const createStore = () => ({ counter });

// 定义store的泛型
type TStore = ReturnType<typeof createStore>;

const key: InjectionKey<TStore> = Symbol();

const store = createStore();

export function useStore() {
  const store = inject<TStore>(key);
  if (!store) {
    throw new Error("store is undefined");
  }

  return store;
}

// 使用vue插件模式引入
const storePlugin = {
  install(Vue: App) {
    Vue.provide(key, readonly(store));
  },
};

export default storePlugin;
```

## 4. 全局引入 store

```ts {6,9}
// /src/main.ts

import { createApp } from "vue";

import App from "./App";
import store from "./store";

createApp(App)
  .use(store)
  .mount("#app");
```

## 5. 在任意子组件中使用 store

```vue {16}
// /src/components/Counter.vue

<template>
  <div>
    <p>counter view</p>
    <p>count: {{ counter.state.count }}</p>
    <button @click="counter.add">add</button>
    <button @click="counter.sub">sub</button>
  </div>
</template>

<script>
import { useStore } from "../store";
export default {
  setup() {
    const { counter } = useStore();
    return { counter };
  },
};
</script>
```
