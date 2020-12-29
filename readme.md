# vuepress + github-page

> 参考文章
>
> - [vuepress](https://vuepress.vuejs.org/zh/guide/)
> - [vue3 文档项目](https://github.com/vuejs/docs-next)
> - [github pages](https://pages.github.com/)
> - [如何用 github page 搭建博客](https://www.zhihu.com/question/59088760)
> - [GitHub Pages + VuePress 构建静态网站](https://www.jianshu.com/p/3b96f8c948cf)
> - [nodejs 遍历文件夹，文件](https://blog.csdn.net/yayali98/article/details/49120621)

## 自动配置侧边栏导航

官方文档中的[自动生成侧栏](https://vuepress.vuejs.org/zh/theme/default-theme-config.html#%E8%87%AA%E5%8A%A8%E7%94%9F%E6%88%90%E4%BE%A7%E6%A0%8F)似乎有问题,目前还是没有成功, 只能自己写一个.
具体的内容查看`doc/.vuepress/utils.js`

## `docs/.vuepress/config.js`无法热更新

解决方案,`package.json`添加额外的运行命令

```json
"dev": "yarn docs:dev --temp .temp",
```

在`.gitignore`中添加排除文件`.temp`

## 部署

> [vuepress 部署到 github page](https://vuepress.vuejs.org/zh/guide/deploy.html#github-pages)
>
> 执行部署脚本(具体内容查看`bin`文件夹中的`.sh`文件)

```
yarn build
```

浏览器打开[https://darcrandex.github.io/my-blog](https://darcrandex.github.io/my-blog)
