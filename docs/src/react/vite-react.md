# vitejs(2.x) + react

> 参考文章
>
> - [Vitejs](https://vitejs.dev/guide/)
> - [Vite 扫盲](https://juejin.cn/post/6937223515288371214#heading-1)
> - [Vite 2 + React 实践](https://juejin.cn/post/6933562433264943111)
> - [less-loader](https://www.npmjs.com/package/less-loader#additionalData)
> - [vite-plugin-style-import](https://github.com/anncwb/vite-plugin-style-import)

> 仓库地址
>
> - [github: vite-react-template](https://github.com/Darcrandex/vite-react-template)
> - [gitee: vite-react-template](https://gitee.com/darcrandex/vite-react-template)

## 当前 demo 已实现的功能

1. less + css module
2. mobx@6 + mobx@7 + mobx-hooks
3. react-router
4. antd@4, 按需加载 + 自定义样式 + 全局 less 变量
5. 集成`axios`

### 根据官方教程创建项目

```sh
yarn create @vitejs/app vite-app --template react
cd vite-app
```

### 引入 react-router

```sh
yarn add react-router-dom
```

新增`@/src/routes/index.js`

```js
import { lazy } from "react";

export default [
  // 路由配置
];
```

修改`main.js`

```js
import { BrowserRouter } from "react-router-dom";
// ...
<BrowserRouter>
  <App />
</BrowserRouter>;
```

### 引入 mobx@6

```sh
yarn add mobx@6 mobx-react@7
```

> 关于 `mobx 6.x`的用法, 具体参考[mobx-react@7.x hooks](https://darcrandex.github.io/my-blog/src/posts/mobx-hooks.html)

### 引入 less 和 antd

```sh
yarn add antd
yarn add less less-loader -D
```

修改`vite.config.js`

```js
export default {
  // ...
  css: {
    preprocessorOptions: {
      less: {
        // 基于less-loader 8.x
        // 用来允许less使用变量
        javascriptEnabled: true,

        // 在所有的'less'文件前添加一段代码(引入全局变量)
        // 具体用法请参考: https://www.npmjs.com/package/less-loader#additionalData
        additionalData: `@import '@/styles/variables.less';`,

        // 自定义antd样式
        // 由于使用了按需加载,antd官方提供的自定义样式修改方式在这里就不能用了
        // 使用less-loader提供的选项,全局修改less文件中的变量值
        // 注意:要修改的变量名会与上述'less全局变量'冲突

        // 这里只是修改了主题色, '@theme-color' 的值来源于 '@/styles/variables.less';'
        // 是为了方便后续修改, 也可以使用一般的css属性值(eg: #ff0000)
        modifyVars: { "@primary-color": "@theme-color" },
      },
    },
  },
};
```

### 引入 axios 并配置开发代理

```sh
yarn add axios
```

新增`@/utils/http.js`, 新增`.env`

修改`vite.config.js`

```js
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const proxyPrefix = env["VITE_APP_PROXY_PREFIX"];

  return {
    // ...
    server: {
      port: 1616,
      proxy: {
        // 默认的开发代理
        [proxyPrefix]: {
          target: "https://cnodejs.org/api/v1",
          changeOrigin: true,
          rewrite: (p) => p.replace(new RegExp(`\^${proxyPrefix}`), ""),
        },

        // 自定义代理(需要符合自定义代理规则,会影响'@/utils/http.js'中的'withProxy')
        // 在这里没有做校验,是为了放宽自定义的配置
        "/api-abc": {
          target: "https://cnodejs.org/api/v1",
          rewrite: (p) => p.replace(/^\/api-abc/, ""),
        },
      },
    },
  };
});
```
