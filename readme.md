# vuepress + github-page

## 自动配置侧边栏导航

官方文档中的[自动生成侧栏](https://vuepress.vuejs.org/zh/theme/default-theme-config.html#%E8%87%AA%E5%8A%A8%E7%94%9F%E6%88%90%E4%BE%A7%E6%A0%8F)似乎有问题,目前还是没有成功, 只能自己写一个.
具体的内容查看`doc/.vuepress/utils.js`

## `docs/.vuepress/config.js`无法热更新

解决方案,`package.json`添加额外的运行命令

```json
"start": "yarn docs:dev --temp .temp",
```

## 部署

执行部署脚本

```
yarn build
```

浏览器打开`https://darcrandex.github.io/`,由于 github-page 需要等待更新,可能需要等大概 1 分钟才能看到页面.
