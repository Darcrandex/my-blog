# mongoose

> 参考文章
>
> - [mongoosejs 官网](https://mongoosejs.com/docs/index.html)
> - [MongoDB 概念解析](https://www.runoob.com/mongodb/mongodb-databases-documents-collections.html)
> - [MongoDB 与 mongoose](https://www.cnblogs.com/web-fengmin/p/6435681.html)
> - [koa2 入门（3）mongoose 增删改查](https://www.cnblogs.com/cckui/p/10429064.html)

## 基本概念

`MongoDB`的存储模式大致上可以理解为我们前端中的`JSON`.

```json
// db
{
  // collection
  "collection-a": [
    // document
    { "field-1": "string", "field-2": 100, "field-3": true, "field-4": [] }
  ],

  "collection-b": []
}
```

`moongoose`中一个`document`的生成过程

1. Schema(模式/模型骨架) 用来定义模型
2. Model(模型) 用来管理一个集合, 应该相当于`数据表(collection/table)`
3. Entity(实体) 由`Model`创建出来的一个`实例`, 应该相当于`一条记录(document/row)`

大概过程是

```
Schema -> Model -> Entity
```

## 安装 MongoDB (windows)

## 在 koa 中使用

使用[Mongoose](https://www.npmjs.com/package/mongoose)可以让我们中`nodejs`服务中连接并操作`MongoDB`数据库.

1. 新建一个空的`koa`项目
2. 安装依赖

一个最简单的例子

```js
const Koa = require("koa");
const KoaRouter = require("koa-router");
const cors = require("koa2-cors");
const mongoose = require("mongoose");

const app = new Koa();
const router = new KoaRouter();

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("mongodb ok");
});

// 连接数据库
// 本例中的数据库名称是 'test'
mongoose.connect("mongodb://127.0.0.1:27017/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 定义 schema 和 model
const catSchema = new mongoose.Schema({ name: String });
const Cats = mongoose.model("cats", catSchema);

app.proxy = true;
app.use(cors());

router.get("/", (ctx) => {
  ctx.body = {
    msg: "hello koa",
  };
});

router.post("/cats/add", async (ctx) => {
  // 新增记录
  const cat = await Cats.create({ name: `cat ${Math.random()}` });
  ctx.body = {
    msg: "ok",
    data: cat,
  };
});

router.get("/cats", async (ctx) => {
  // 查询所有记录
  const cats = await Cats.find();
  ctx.body = {
    msg: "ok",
    data: cats,
  };
});

app.use(router.routes());

app.listen(8000);
```
