# 前后端 rsa 加密

> 参考文章
>
> - [npm node-rsa](https://www.npmjs.com/package/node-rsa)
> - [npm jsencrypt](https://www.npmjs.com/package/jsencrypt)
> - [node-rsa errors when trying to decrypt message with private key](https://stackoverflow.com/questions/33837617/node-rsa-errors-when-trying-to-decrypt-message-with-private-key)
> - [nodejs RSA 与 jsencrypt 实现前端加密后端解密功能（非对称）](https://blog.csdn.net/adley_app/article/details/94384100)

## 先说需求

前端登录逻辑, 在发送用户账号和密码时, 需要对`密码`进行加密. 后端接口拿到密文后解密, 然后进行其他的业务处理.

下面分`前端`和`后端`两个部分来说明具体的流程.

## 后端(nodejs/koa2)

使用脚手架`koa-generator`或者自己创建一个`koa2`的项目即可(这里略过).

### 安装依赖:

1. `koa`
2. `koa-router` 路由
3. `koa-bodyparser` 处理 post 请求携带的参数
4. `node-rsa` node 端实现 rsa, 特点是不需要`OpenSSL`
5. `koa2-cors` 可选, 主要是为了解决跨域问题, 如果前端使用代理模式请求,可以不安装

### 添加主文件

`/index.js`

```js {24}
const Koa = require("koa");
const cors = require("koa2-cors");
const bodyParser = require("koa-bodyparser");
const KoaRouter = require("koa-router");
const NodeRSA = require("node-rsa");

// app
const app = new Koa();

// cors 前端要用 xhr 请求(axios), fetch 请求会无效
app.use(cors());

// 处理 post 参数
app.use(bodyParser());

// 添加路由
const router = new KoaRouter();

// rsa 加/解密 模块
const RSA = new NodeRSA({ b: 512 });
// 注意:
// 前端将使用'jsencrypt'作为加密工具,而这个工具的默认加密类型是'pkcs1'
// 因此这里也需要配置成一样的
RSA.setOptions({ encryptionScheme: "pkcs1" });

// 获取公钥
router.get("/api/get-publick-key", async (ctx) => {
  const publicKey = RSA.exportKey(); // 生成公钥
  ctx.body = { publicKey };
});

// 用户登录
router.post("/api/user/login", async (ctx) => {
  const { username, password } = ctx.request.body;
  // 前端传入的'password'是密文,这里进行解密
  const decryptedPassword = RSA.decrypt(password, "utf8");

  ctx.body = {
    username,
    password: decryptedPassword, // 把解密的'password'返回, 前端比对密码是否相同
  };
});

// 注册路由
app.use(router.routes());

// 启动
app.listen(8000);
```

## 前端(react)

> 这里使用了`react`框架, 也可以不使用任何框架.

1. 使用[create-react-app](https://create-react-app.dev/)创建`react`项目
2. 安装依赖: `axios`,`jsencrypt`
3. 修改`/src/App.jsx`

```jsx {7,17,22}
import React, { useCallback } from "react";
import axios from "axios";
import JSEncrypt from "jsencrypt";

// 后端接口地址
const SERVER_ORIGIN = "http://localhost:8000";
const encryptor = new JSEncrypt();

const App = () => {
  const login = useCallback(() => {
    const f = async () => {
      try {
        const res1 = await axios.get(`${SERVER_ORIGIN}/api/get-publick-key`);
        console.log("publicKey", res1.data.publicKey);

        // 设置公钥
        encryptor.setPublicKey(res1.data.publicKey);

        const res2 = await axios.post(`${SERVER_ORIGIN}/api/user/login`, {
          username: "my-name",
          // 对密码进行加密
          password: encryptor.encrypt("my-password"),
        });

        console.log("user", res2.data);
      } catch (err) {
        console.error(err);
      }
    };

    f();
  }, []);

  return (
    <>
      <h1>rsa encrypt</h1>
      <button onClick={login}>login</button>
    </>
  );
};

export default App;
```
