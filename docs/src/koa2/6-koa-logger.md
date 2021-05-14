# koa 使用 log4js

> 参考链接
>
> - [log4js](https://www.npmjs.com/package/log4js)

## 封装成中间件

```js
// /middleware/loggerMiddleware.js

const log4js = require("log4js");

log4js.configure({
  appenders: {
    cheese: {
      // 根据日期单独生成一个日志文件
      type: "dateFile",
      // 这个路径基于根目录
      // 最终生成的文件名格式
      filename: "logs/date",
      pattern: "yyyy-MM-dd.log",
      // 这个参数必须加
      alwaysIncludePattern: true,
    },
  },
  categories: { default: { appenders: ["cheese"], level: "all" } },
});

const logger = log4js.getLogger("cheese");

async function loggerMiddleware(ctx, next) {
  const start = Date.now();

  await next()
    .then(() => {
      const ms = Date.now() - start;
      const info = `${ctx.method} ${ctx.url} - ${ms}ms`;
      console.log(info);
      logger.info(info);
    })
    .catch((err) => {
      const info = `${ctx.method} ${ctx.url}\n\t${err.toString()}`;
      console.log(info);
      logger.error(info);
    });
}

module.exports = loggerMiddleware;
```

## 使用

```js
// app.js

const Koa = require("koa");
const logger = require("./middleware/loggerMiddleware.js");

const app = new Koa();
app.use(logger);
```
