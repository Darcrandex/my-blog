# react 使用 window 全局变量

> - 先通过`create-react-app`构建 react 项目
> - 安装`axios`
> - 使用的 IED 是 vscode

## 需求描述

业务项目中,需要给项目配置一些特殊的变量,例如:`api接口地址`,`静态资源的外网路径`,`某些外网的关联链接地址`.而这些变量可能会在打包之后修改(业务代码不变).通常由运维人员直接在打包好的代码里修改.

## 要解决的问题

- 在打包后的项目中定义配置文件,供运维人员修改
- 需要在配置文件加载后(无论是否成功),然后再挂载`app`,避免因加载延迟导致后续获取变量错误
- 使用变量的时候,可以智能提示相关的变量定义(`IDE`提示功能)

## step 1 配置文件

默认在`public`文件夹中添加`config.json`

```json
// /public/config.json

{
  "PRODUCTION_ORIGIN": "http://www.abc.com",
  "PRODUCTION_API_URL": "http://www.abc.com/test/api"
}
```

## step 2 定义获取配置的工具函数

```js
// /src/utils/app-config.js

import axios from "axios";

// 用来定义配置项的文件(放到'public'中)
const CONFIG_FILE_PATH = "/config.json";

// 默认配置
const DEFAULT_APP_CONFIG = {
  PRODUCTION_ORIGIN: "",
  PRODUCTION_API_URL: "",
};

// 注入指定的项目配置到window全局变量
async function injectAppConfig(callback) {
  // 先给window注入默认的配置
  window.AppConfig = DEFAULT_APP_CONFIG;
  try {
    // timestamp是为了防止浏览器缓存,导致修改'config.json'后没有刷新
    const { data } = await axios.get(
      process.env.PUBLIC_URL + CONFIG_FILE_PATH,
      { timestamp: Date.now() }
    );
    // 修改
    window.AppConfig = Object.assign({}, DEFAULT_APP_CONFIG, data);
  } catch (err) {
    console.error("获取 app-config 失败\n", err);
  }

  if (typeof callback === "function") {
    callback();
  }
}

export default injectAppConfig;
```

## step 3 引用注入工具函数

把原来的挂载函数使用`injectAppConfig`替换

```js
// /src/index.js
import injectAppConfig from "@/utils/app-config";

injectAppConfig(() => {
  ReactDOM.render(<App />, document.getElementById("root"));
});
```

## step 4 使用

```js
// src/App.js

function App() {
  return (
    <>
      <h1>Home Page</h1>
      <p>{window.AppConfig.PRODUCTION_ORIGIN}</p>
      <p>{window.AppConfig.PRODUCTION_API_URL}</p>
    </>
  );
}
```

## 如何让 IDE 智能提示

> 这里使用的 IDE 是 vscode

在项目的根目录添加文件夹`typings`,然后在里面再添加`global.d.ts`.

```ts
// /typings/global.d.ts

interface IAppConfig {
  PRODUCTION_ORIGIN: string;
  PRODUCTION_API_URL: string;
}

interface Window {
  AppConfig: IAppConfig;
}
```

这样就可以在写代码时获得提示:
<img :src="$withBase('/images/react-use-global-variables-001.jpg')" alt="dock">
