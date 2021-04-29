# Koa 项目打包和部署

> 前言
>
> - 框架:Koa
> - node 版本: 12.x
> - 打包工具: 1.rollup 2.pkg
> - 部署服务器: linux Centos

## Koa 部分

这个部分简单带过,不赘述.

```sh
mkdir my-koa-app
cd my-koa-app
npm init
npm i koa
mkdir src
touch ./src/app.js
```

```js
// /src/app.js

const Koa = require("koa");
const app = new Koa();

app.use(async (ctx) => {
  ctx.body = "Hello World";
});

app.listen(3000);
```

## 项目代码打包

> 第一阶段的打包, 先把业务代码转成`es5`并压缩.

这里使用到了[Rollup](https://rollupjs.org/guide/en/).

### 先安装依赖

```sh
npm i rollup rollup-plugin-delete rollup-plugin-terser @babel/core @babel/plugin-transform-runtime
@babel/preset-env @rollup/plugin-babel @rollup/plugin-commonjs @rollup/plugin-json --save-dev

npm i @babel/runtime --save
```

### 创建 打包 配置文件

```sh
touch rollup-build.js
```

```js {16}
// /rollup-build.js

const fs = require("fs");
const rollup = require("rollup");
const { babel, getBabelOutputPlugin } = require("@rollup/plugin-babel");
const del = require("rollup-plugin-delete");
const json = require("@rollup/plugin-json");
const commonjs = require("@rollup/plugin-commonjs");
const { terser } = require("rollup-plugin-terser");

// 获取根目录的'package.json'
const packageJSON = require("./package.json");
// 读取 生成模式 下需要的依赖包
const packageJSONForProduction = {
  name: packageJSON.name,
  dependencies: packageJSON.dependencies,
};

const inputOptions = {
  input: "./src/app.js",
  plugins: [
    // 打包前先清空输出文件夹
    del({ targets: "./dist/*" }),

    // babel 相关的配置, 主要是做兼容
    getBabelOutputPlugin({
      presets: [["@babel/preset-env", { targets: { node: "current" } }]],
      plugins: [["@babel/plugin-transform-runtime", { useESModules: false }]],
    }),
    babel({ babelHelpers: "bundled", exclude: "node_modules/**" }),

    // 这里是把入口文件(app.js)以外的业务代码也进行打包(require进来的文件)
    json(),
    commonjs(),

    // 代码的压缩或混淆
    terser(),
  ],
};
const outputOptions = { dir: "./dist", format: "cjs" };

async function build() {
  // create a bundle
  const bundle = await rollup.rollup(inputOptions);

  // generate code and a sourcemap
  // const { code, map } = await bundle.generate(outputOptions);

  // or write the bundle to disk
  await bundle.write(outputOptions);

  // 生成生产模式的 package.json, 在服务器上使用
  const writeStream = fs.createWriteStream("./dist/package.json");
  writeStream.write(JSON.stringify(packageJSONForProduction));
}

build();
```

### 配置命令

```json
// /package.json
{
  "scripts": {
    "dev": "node ./src/app.js",
    "build": "node ./rollup-build.js"
  }
}
```

执行`npm run build`之后, `dist`文件夹就是打包出来的文件. 里面有业务代码和`package.json`.

把`dist`文件夹上传到线上服务器, 并在服务器安装好`node`环境, 在`dist`中执行`npm i`, 安装依赖. 最后运行项目即可.

```sh
cd dist
npm i
node ./app.js
```

#### pm2 进程管理

由于直接使用`node`命令启动服务时, 一旦退出`SSL`链接就会终止服务. 因此需要使用进程守卫来保持启动的 node 服务.
这里推荐使用[pm2](https://www.npmjs.com/package/pm2).

在服务器中全局安装

```sh
npm install pm2 -g
```

然后注册并启动服务

```sh
pm2 dist/app.js --name=your-app-name

# 强制停止所有的服务
pm2 kill

# 查看服务
pm2 list
```

### 完整打包

> 第二阶段打包,这个部分可选

上述提到的打包方式, 需要在服务器上安装`node`环境, 并在项目文件夹中安装依赖.

如果服务器不想安装`node`环境的话, 则可以把整个项目打包. 即打包之后的文件中包含`业务代码`,`node内置api`,`相关的依赖包`.

> 虽然这个打包方式可以避免安装 node 环境, 但是每次打包都需要很长时间, 而且打出来的包很大. 因此不是很推荐这种打包方式.

首先安装依赖

```sh
npm i pkg -D
```

配置打包命令

> 具体配置请查看 [pkg](https://www.npmjs.com/package/pkg)

```json
{
  "scripts": {
    "pkg": "pkg ./dist/app.js --debug --targets=node12-linux-x64 --output=./pkg/wiris-node12-linux"
  }
}
```

由于另外的配置方式太麻烦, 使用简单的方法, 在命令行中配置参数即可.

第一个参数`./dist/app.js`,是业务代码的入口文件.

> 注意:这个文件是经过上述的`rollup-build.js`打包之后生成的.

然后是`--debug`,表示开启`debug`模式, 打包时可以看到具体的内容.
然后`--targets=node12-linux-x64`,表示使用`nodejs@12`的包, 并在 linux 系统上使用.
`--output=./pkg/wiris-node12-linux`是打包的输出路径, 由于 linux 系统下的包是没有后缀的, 所以`wiris-node12-linux`是一个二进制(可执行)文件.

最后, 把打出来的包文件(`wiris-node12-linux`)上传到服务器. 启动的命令是:

```sh
cd your-project-dir
./wiris-node12-linux start
```
