# 在 vue-router@4.x 中使用路由緩存

> 參考鏈接
>
> - [vue3 v-slot](https://v3.cn.vuejs.org/api/directives.html#v-slot)
> - [vue3 v-slot jsx](https://github.com/vuejs/jsx-next#slot)
> - [vue3 keep-alive](https://v3.cn.vuejs.org/api/built-in-components.html#keep-alive)

在`vue3`中寫法變了,具體請看[从 Vue2 迁移: keep-alive](https://next.router.vuejs.org/zh/guide/migration/#router-view-%E3%80%81-keep-alive-%E5%92%8C-transition). 但是這個是使用`template`的寫法, 如果使用`jsx`的話, 需要這樣寫:

```jsx
<RouterView
  v-slots={{
    default: ({ Component }: { Component: any }) => {
      return (
        <KeepAlive>
          <Component />
        </KeepAlive>
      );
    },
  }}
/>
```

然後是有條件的進行緩存. 網上很多的文章([例如這篇文章](https://zhuanlan.zhihu.com/p/35862984))都是使用`template`的模式寫的, 不適用`jsx`模式.

針對: `vue3`+`vue-router@4.x`+`jsx/tsx` 的情況, 需要這樣寫:

## 1. 首先定義路由

```ts {12}
// src/router/index.ts

import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
const routes: RouteRecordRaw[] = [
  {
    path: "/home",
    component: () => import("@/views/Home"),
    meta: { keepAlive: true },
  },
  {
    path: "/about",
    name: "the-route-should-keep-alive", // 配置一個名稱
    component: () => import("@/views/About"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

## 2. 然後定義需要緩存的頁面組件

```tsx {6}
// src/views/About/index.tsx

import { defineComponent } from "vue";

export default defineComponent({
  name: "the-route-should-keep-alive", // 給組件也配置同樣的名稱
  setup() {
    return () => (
      <div>
        <h1>About Page</h1>
        <input type="text" />
      </div>
    );
  },
});
```

## 3. 最後修改渲染`router-view`的入口文件

```tsx {25}
// src/App.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */

import { defineComponent, KeepAlive } from "vue";
import { RouterView, RouteRecordRaw } from "vue-router";

export default defineComponent({
  setup() {
    return () => (
      <>
        <RouterView
          v-slots={{
            default: ({
              Component,
              route,
            }: {
              Component: any;
              route: RouteRecordRaw;
            }) => {
              console.log("props", route);

              // 在 'include' 屬性中添加要緩存的路由的名稱
              return (
                <KeepAlive include={["the-route-should-keep-alive"]}>
                  <Component />
                </KeepAlive>
              );
            },
          }}
        />
      </>
    );
  },
});
```

以上, 三個地方都使用了`the-route-should-keep-alive`(**_必須統一_**), 這個路由就會被緩存.
