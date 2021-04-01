# koa 使用 jwt

> 参考文章
>
> - [JSON Web Token 入门教程](http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)
> - [koa-jwt 使用详解](https://www.jianshu.com/p/794ba23e68ad)
> - [npm koa-jwt](https://www.npmjs.com/package/koa-jwt)
> - [npm jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)

## 后端

老样子, 先新建一个空的`koa`项目.然后安装依赖

1. koa
2. koa-router
3. koa-bodyparser
4. koa2-cors
5. jsonwebtoken
6. koa-jwt

直接看完整的代码

```js {20,27,38}
const Koa = require("koa");
const KoaRouter = require("koa-router");
const bodyParser = require("koa-bodyparser");
const cors = require("koa2-cors");

const jwt = require("jsonwebtoken");
const koajwt = require("koa-jwt");

const app = new Koa();
const SECRET = "your-jwt-secret"; // 秘钥

app.use(cors());
app.use(bodyParser());

const router = new KoaRouter();

router.post("/api/user/login", async (ctx) => {
  const { username } = ctx.request.body;
  // 根据用户名生成 token (其实应该还有 password, 这里忽略了)
  const token = jwt.sign({ username }, SECRET);
  // 然后返回给前端
  ctx.body = { code: 20000, msg: "login success", token };
});

router.post("/api/user/info", async (ctx) => {
  // 从 'ctx.user' 中获取内容
  ctx.body = { code: 20000, info: ctx.state.user };
});

// 自定义的权限错误处理, 当然这是特殊的业务需求
async function customAuthorizationCatcher(ctx, next) {
  try {
    await next();
  } catch (err) {
    // 由 koa-jwt 抛出的错误
    if (err.status === 401) {
      // 强制修改网络状态, 在接口中返回业务类型状态码(根据需求)
      ctx.status = 200;
      ctx.body = { code: 40100, msg: "无效 token" };
    } else {
      throw err;
    }
  }
}

app.use(customAuthorizationCatcher); // 这个中间件要放在'koa-jwt'的前面
// koa-jwt 中间件会获取前端请求中的token,进行检验
app.use(
  koajwt({
    secret: SECRET,
    // key: "user", 默认把token解析的内容保存到 'ctx.user' 中
  }).unless({ path: ["/api/user/login"] })
);
app.use(router.routes());

app.listen(8000);
```

## 前端

依然是使用`react` + `axios`

直接看组件

```jsx {17,32}
import React, { useCallback } from "react";
import axios from "axios";

// 后端接口地址
const SERVER_ORIGIN = "http://localhost:8000";

const App = () => {
  const login = useCallback(() => {
    const f = async () => {
      try {
        const res = await axios.post(`${SERVER_ORIGIN}/api/user/login`, {
          username: "my-name",
        });

        console.log("res", res.data);
        // 把 token 存起来
        window.localStorage.setItem("token", res.data.token);
      } catch (err) {
        console.error(err);
      }
    };

    f();
  }, []);

  const getInfo = useCallback(() => {
    const f = async () => {
      try {
        const token = window.localStorage.getItem("token");
        const res = await axios.post(`${SERVER_ORIGIN}/api/user/info`, null, {
          // 请求时, 在 header 中添加 token
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("info", res.data);
      } catch (err) {
        console.error(err);
      }
    };
    f();
  }, []);

  return (
    <>
      <h1>koa jwt</h1>
      <button onClick={login}>login</button>
      <button onClick={getInfo}>get user info</button>
    </>
  );
};

export default App;
```

## 坑

这里需要说明一下前端请求的坑, **为什么 `header`添加的是`Authorization`, 而且还要加`Bearer`这个单词???**

因为后端使用的是`koa-jwt`插件, 我们来看看插件的[源码](https://github.com/koajs/jwt/blob/master/lib/resolvers/auth-header.js)

```js {8,14}
// /lib/resolvers/auth-header.js

module.exports = function resolveAuthorizationHeader(ctx, opts) {
  if (!ctx.header || !ctx.header.authorization) {
    return;
  }

  const parts = ctx.header.authorization.split(" ");

  if (parts.length === 2) {
    const scheme = parts[0];
    const credentials = parts[1];

    if (/^Bearer$/i.test(scheme)) {
      return credentials;
    }
  }
  if (!opts.passthrough) {
    ctx.throw(
      401,
      'Bad Authorization header format. Format is "Authorization: Bearer <token>"'
    );
  }
};
```

1. `ctx.header.authorization` 规定了`header`使用的字段
2. `/^Bearer$/i`这个正则规定了`token`前面要添加的单词
3. `split(" ")` 规定了 `Bearer`这个单词和`token`中还必须有一个空格
